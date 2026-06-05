import { Injectable, NotFoundException } from '@nestjs/common';
import { ScanStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScannerService } from '../scanner/scanner.service';
import { CreateScanDto } from './dto/create-scan.dto';

type CurrentUser = {
  id: string;
  email: string;
  role: string;
};

@Injectable()
export class ScansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scannerService: ScannerService,
    private readonly mailService: MailService,
    private readonly aiService: AiService,
  ) {}

  async createScan(dto: CreateScanDto, user: CurrentUser) {
    const repoInfo = this.extractGitHubRepoInfo(dto.repoUrl);

    const repository = await this.prisma.repository.create({
      data: {
        userId: user.id,
        repoUrl: dto.repoUrl,
        repoName: repoInfo.repoName,
        ownerName: repoInfo.ownerName,
      },
    });

    const scanJob = await this.prisma.scanJob.create({
      data: {
        userId: user.id,
        repositoryId: repository.id,
        status: ScanStatus.RUNNING,
        startedAt: new Date(),
      },
      include: {
        repository: true,
      },
    });

    try {
      const result = await this.scannerService.scanRepository(dto.repoUrl);

      const report = await this.prisma.scanReport.create({
        data: {
          scanJobId: scanJob.id,
          overallScore: result.scores.overallScore,
          securityScore: result.scores.securityScore,
          readmeScore: result.scores.readmeScore,
          envScore: result.scores.envScore,
          deploymentScore: result.scores.deploymentScore,
          codeStructureScore: result.scores.codeStructureScore,
          summary: result.summary,
          findings: {
            create: result.findings.map((finding) => ({
              category: finding.category,
              severity: finding.severity,
              title: finding.title,
              description: finding.description,
              filePath: finding.filePath,
              lineNumber: finding.lineNumber,
              suggestion: finding.suggestion,
            })),
          },
        },
        include: {
          findings: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          aiSummary: true,
        },
      });

   const aiUsage = await this.canUseAiReview(user);

if (aiUsage.allowed) {
  const aiModel = 'gemini-2.5-flash';

  const aiReport = await this.aiService.generateAiReport({
    repoName: repository.repoName ?? 'GitHub Repository',
    repoUrl: repository.repoUrl,
    scores: {
      overallScore: report.overallScore,
      securityScore: report.securityScore,
      readmeScore: report.readmeScore,
      envScore: report.envScore,
      deploymentScore: report.deploymentScore,
      codeStructureScore: report.codeStructureScore,
    },
    findings: report.findings.map((finding) => ({
      category: finding.category,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      filePath: finding.filePath,
      suggestion: finding.suggestion,
    })),
  });

  if (aiReport) {
    await this.prisma.aiReportSummary.create({
      data: {
        scanReportId: report.id,
        model: aiModel,
        promptVersion: 'v1',
        projectSummary: aiReport.projectSummary,
        securityReview: aiReport.securityReview,
        readmeReview: aiReport.readmeReview,
        codeStructureReview: aiReport.codeStructureReview,
        portfolioFeedback: aiReport.portfolioFeedback,
        fixPriority: aiReport.fixPriority,
      },
    });

    await this.recordAiUsage(user.id, aiModel);
  }
}

      const finalReport = await this.prisma.scanReport.findUnique({
        where: {
          id: report.id,
        },
        include: {
          findings: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          aiSummary: true,
        },
      });

      await this.prisma.scanJob.update({
        where: {
          id: scanJob.id,
        },
        data: {
          status: ScanStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await this.mailService.sendScanReportEmail({
        email: user.email,
        repoName: repository.repoName ?? 'GitHub Repository',
        repoUrl: repository.repoUrl,
        scanJobId: scanJob.id,
        overallScore: finalReport?.overallScore ?? report.overallScore,
        summary: finalReport?.summary ?? report.summary,
        findingsCount: finalReport?.findings.length ?? report.findings.length,
      });

      return {
        scanJobId: scanJob.id,
        repository,
        report: finalReport,
      };
    } catch (error) {
      await this.prisma.scanJob.update({
        where: {
          id: scanJob.id,
        },
        data: {
          status: ScanStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown scan error',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  async getMyScans(userId: string) {
    return this.prisma.scanJob.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        repository: true,
        report: {
          include: {
            findings: true,
            aiSummary: true,
          },
        },
      },
    });
  }

  async getMyScanById(id: string, userId: string) {
    const scan = await this.prisma.scanJob.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        repository: true,
        report: {
          include: {
            findings: {
              orderBy: {
                createdAt: 'asc',
              },
            },
            aiSummary: true,
          },
        },
      },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    return scan;
  }
private getMonthlyAiLimit(role: string) {
  if (role === 'ADMIN') {
    return Number(process.env.ADMIN_MONTHLY_AI_LIMIT || 100);
  }

  return Number(process.env.USER_MONTHLY_AI_LIMIT || 3);
}

private getMonthStartDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

private async canUseAiReview(user: CurrentUser) {
  const limit = this.getMonthlyAiLimit(user.role);

  const usedCount = await this.prisma.aiUsageLog.count({
    where: {
      userId: user.id,
      feature: 'AI_SCAN_REVIEW',
      createdAt: {
        gte: this.getMonthStartDate(),
      },
    },
  });

  return {
    allowed: usedCount < limit,
    usedCount,
    limit,
  };
}

private async recordAiUsage(userId: string, model: string) {
  await this.prisma.aiUsageLog.create({
    data: {
      userId,
      feature: 'AI_SCAN_REVIEW',
      model,
    },
  });
}
  private extractGitHubRepoInfo(repoUrl: string) {
    const cleaned = repoUrl.replace(/\/$/, '');
    const parts = cleaned.split('/');

    return {
      ownerName: parts[parts.length - 2],
      repoName: parts[parts.length - 1],
    };
  }
}