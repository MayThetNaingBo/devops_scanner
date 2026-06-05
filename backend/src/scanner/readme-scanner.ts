import * as path from 'path';
import * as fs from 'fs-extra';
import { FindingCategory, FindingSeverity } from '@prisma/client';
import { ScannerFinding } from './project-scanner';

export async function scanReadme(projectPath: string): Promise<{
  findings: ScannerFinding[];
  score: number;
}> {
  const findings: ScannerFinding[] = [];
  const readmePath = path.join(projectPath, 'README.md');

  if (!(await fs.pathExists(readmePath))) {
    return {
      score: 0,
      findings: [
        {
          category: FindingCategory.README,
          severity: FindingSeverity.HIGH,
          title: 'README.md is missing',
          description:
            'The project does not have a README.md file. Employers and users may not know how to run or understand the project.',
          filePath: 'README.md',
          suggestion:
            'Add a README.md with project overview, features, tech stack, setup steps, environment variables, screenshots, and deployment link.',
        },
      ],
    };
  }

  const content = await fs.readFile(readmePath, 'utf8');
  const lower = content.toLowerCase();

  const checks = [
    {
      name: 'Project description',
      passed:
        lower.includes('description') ||
        lower.includes('overview') ||
        content.length > 300,
      suggestion: 'Add a clear project description or overview section.',
    },
    {
      name: 'Features section',
      passed: lower.includes('feature'),
      suggestion: 'Add a features section that lists the main functionality.',
    },
    {
      name: 'Tech stack section',
      passed:
        lower.includes('tech stack') ||
        lower.includes('technology') ||
        lower.includes('built with'),
      suggestion: 'Add a tech stack section listing frontend, backend, database, and tools.',
    },
    {
      name: 'Installation steps',
      passed:
        lower.includes('install') ||
        lower.includes('npm install') ||
        lower.includes('setup'),
      suggestion: 'Add installation/setup steps.',
    },
    {
      name: 'Run commands',
      passed:
        lower.includes('npm run') ||
        lower.includes('yarn') ||
        lower.includes('pnpm'),
      suggestion: 'Add commands for running the project locally.',
    },
    {
      name: 'Environment variables',
      passed:
        lower.includes('.env') ||
        lower.includes('environment variable') ||
        lower.includes('env variable'),
      suggestion: 'Explain required environment variables and provide .env.example.',
    },
    {
      name: 'Screenshots or demo',
      passed:
        lower.includes('screenshot') ||
        lower.includes('demo') ||
        lower.includes('deployment') ||
        lower.includes('live'),
      suggestion: 'Add screenshots, demo GIF, or deployed live link.',
    },
  ];

  const failedChecks = checks.filter((check) => !check.passed);

  for (const failed of failedChecks) {
    findings.push({
      category: FindingCategory.README,
      severity: FindingSeverity.MEDIUM,
      title: `README missing: ${failed.name}`,
      description: `The README does not clearly include "${failed.name}".`,
      filePath: 'README.md',
      suggestion: failed.suggestion,
    });
  }

  const score = Math.round(((checks.length - failedChecks.length) / checks.length) * 100);

  return {
    score,
    findings,
  };
}