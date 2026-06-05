import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import simpleGit from 'simple-git';
import { FindingCategory, FindingSeverity } from '@prisma/client';
import { scanSecrets } from './secret-scanner';
import { scanReadme } from './readme-scanner';
import { ProjectScanResult, ScannerFinding } from './project-scanner';
import * as os from 'os';

@Injectable()
export class ScannerService {
  async scanRepository(repoUrl: string): Promise<ProjectScanResult> {
    const tempRoot = path.join(os.tmpdir(), 'codeguard-ai-scans');
    await fs.ensureDir(tempRoot);

    const repoFolderName = `repo-${Date.now()}`;
    const clonePath = path.join(tempRoot, repoFolderName);

    try {
      await simpleGit().clone(repoUrl, clonePath, ['--depth', '1']);

      const findings: ScannerFinding[] = [];

      const secretFindings = await scanSecrets(clonePath);
      findings.push(...secretFindings);

      const readmeResult = await scanReadme(clonePath);
      findings.push(...readmeResult.findings);

      const envFindings = await this.scanEnvConfig(clonePath);
      findings.push(...envFindings);

      const deploymentFindings = await this.scanDeploymentReadiness(clonePath);
      findings.push(...deploymentFindings);

      const packageFindings = await this.scanPackageJson(clonePath);
      findings.push(...packageFindings);

      const scores = this.calculateScores(findings, readmeResult.score);
      const summary = this.generateSummary(scores, findings);

      return {
        findings,
        scores,
        summary,
      };
    } finally {
  await this.safeRemove(clonePath);
}
  }
  private async safeRemove(folderPath: string) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await fs.remove(folderPath);
      return;
    } catch (error) {
      if (attempt === 5) {
        console.warn(`Failed to remove temp folder: ${folderPath}`, error);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}

  private async scanEnvConfig(projectPath: string): Promise<ScannerFinding[]> {
    const findings: ScannerFinding[] = [];

    const envPath = path.join(projectPath, '.env');
    const envExamplePath = path.join(projectPath, '.env.example');

    const hasEnv = await fs.pathExists(envPath);
    const hasEnvExample = await fs.pathExists(envExamplePath);

    if (hasEnv) {
      findings.push({
        category: FindingCategory.ENV_CONFIG,
        severity: FindingSeverity.CRITICAL,
        title: '.env file committed',
        description:
          'A .env file exists in the repository. This may expose secrets such as API keys or database URLs.',
        filePath: '.env',
        suggestion:
          'Remove .env from the repository, add it to .gitignore, rotate exposed secrets, and use .env.example for placeholders.',
      });
    }

    if (!hasEnvExample) {
      findings.push({
        category: FindingCategory.ENV_CONFIG,
        severity: FindingSeverity.MEDIUM,
        title: '.env.example is missing',
        description:
          'The project does not include .env.example, making setup harder and less professional.',
        filePath: '.env.example',
        suggestion:
          'Create a .env.example file with placeholder values for all required environment variables.',
      });
    }

    return findings;
  }

  private async scanDeploymentReadiness(projectPath: string): Promise<ScannerFinding[]> {
    const findings: ScannerFinding[] = [];

    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml');
    const githubActionsPath = path.join(projectPath, '.github', 'workflows');

    const hasDockerfile = await fs.pathExists(dockerfilePath);
    const hasDockerCompose = await fs.pathExists(dockerComposePath);
    const hasGithubActions = await fs.pathExists(githubActionsPath);

    if (!hasDockerfile) {
      findings.push({
        category: FindingCategory.DEPLOYMENT,
        severity: FindingSeverity.LOW,
        title: 'Dockerfile is missing',
        description:
          'No Dockerfile was found. This may make production deployment less consistent.',
        filePath: 'Dockerfile',
        suggestion:
          'Add a Dockerfile so the application can be built and deployed consistently.',
      });
    }

    if (!hasDockerCompose) {
      findings.push({
        category: FindingCategory.DEPLOYMENT,
        severity: FindingSeverity.INFO,
        title: 'docker-compose.yml is missing',
        description:
          'No docker-compose.yml was found. Local development setup may be harder for databases or services.',
        filePath: 'docker-compose.yml',
        suggestion:
          'Add docker-compose.yml for local services such as PostgreSQL, Redis, or backend dependencies.',
      });
    }

    if (!hasGithubActions) {
      findings.push({
        category: FindingCategory.DEPLOYMENT,
        severity: FindingSeverity.LOW,
        title: 'GitHub Actions workflow is missing',
        description:
          'No GitHub Actions workflow was found. The project may not have automated CI checks.',
        filePath: '.github/workflows',
        suggestion:
          'Add a GitHub Actions workflow for linting, testing, and building the project.',
      });
    }

    return findings;
  }

  private async scanPackageJson(projectPath: string): Promise<ScannerFinding[]> {
    const findings: ScannerFinding[] = [];
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      return findings;
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const scripts = packageJson.scripts || {};

    if (!scripts.build) {
      findings.push({
        category: FindingCategory.DEPLOYMENT,
        severity: FindingSeverity.MEDIUM,
        title: 'Build script is missing',
        description: 'package.json does not include a build script.',
        filePath: 'package.json',
        suggestion:
          'Add a build script, for example "build": "next build" or "build": "nest build".',
      });
    }

    if (!scripts.start && !scripts['start:prod']) {
      findings.push({
        category: FindingCategory.DEPLOYMENT,
        severity: FindingSeverity.MEDIUM,
        title: 'Production start script is missing',
        description:
          'package.json does not include a clear production start script.',
        filePath: 'package.json',
        suggestion:
          'Add a production start script such as "start": "node dist/main.js".',
      });
    }

    if (!scripts.test) {
      findings.push({
        category: FindingCategory.CODE_STRUCTURE,
        severity: FindingSeverity.LOW,
        title: 'Test script is missing',
        description: 'package.json does not include a test script.',
        filePath: 'package.json',
        suggestion:
          'Add a test script and include basic unit or integration tests.',
      });
    }

    return findings;
  }

  private calculateScores(findings: ScannerFinding[], readmeScore: number) {
    const countByCategory = (category: FindingCategory) =>
      findings.filter((finding) => finding.category === category);

    const scoreFromFindings = (
      category: FindingCategory,
      startingScore = 100,
    ) => {
      const categoryFindings = countByCategory(category);

      let score = startingScore;

      for (const finding of categoryFindings) {
        if (finding.severity === FindingSeverity.CRITICAL) score -= 35;
        if (finding.severity === FindingSeverity.HIGH) score -= 25;
        if (finding.severity === FindingSeverity.MEDIUM) score -= 15;
        if (finding.severity === FindingSeverity.LOW) score -= 8;
      }

      return Math.max(score, 0);
    };

    const securityScore = scoreFromFindings(FindingCategory.SECRET_RISK);
    const envScore = scoreFromFindings(FindingCategory.ENV_CONFIG);
    const deploymentScore = scoreFromFindings(FindingCategory.DEPLOYMENT);
    const codeStructureScore = scoreFromFindings(FindingCategory.CODE_STRUCTURE);

    const overallScore = Math.round(
      (securityScore +
        readmeScore +
        envScore +
        deploymentScore +
        codeStructureScore) /
        5,
    );

    return {
      securityScore,
      readmeScore,
      envScore,
      deploymentScore,
      codeStructureScore,
      overallScore,
    };
  }

  private generateSummary(
    scores: ProjectScanResult['scores'],
    findings: ScannerFinding[],
  ) {
    const criticalCount = findings.filter(
      (finding) => finding.severity === FindingSeverity.CRITICAL,
    ).length;

    const highCount = findings.filter(
      (finding) => finding.severity === FindingSeverity.HIGH,
    ).length;

    if (criticalCount > 0) {
      return `This project has critical security risks and should not be shared publicly until secrets or sensitive files are removed. Overall score: ${scores.overallScore}/100.`;
    }

    if (highCount > 0) {
      return `This project has high-risk issues that should be fixed before using it as a portfolio project. Overall score: ${scores.overallScore}/100.`;
    }

    if (scores.overallScore >= 80) {
      return `This project looks mostly portfolio-ready, with some improvements recommended. Overall score: ${scores.overallScore}/100.`;
    }

    return `This project needs improvements in documentation, deployment, security, or structure before it is portfolio-ready. Overall score: ${scores.overallScore}/100.`;
  }
}