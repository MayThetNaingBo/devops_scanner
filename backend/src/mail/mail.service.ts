import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is missing');
    }

    this.resend = new Resend(apiKey);
  }

  async sendVerificationCode(email: string, code: string) {
    await this.resend.emails.send({
      from:
        this.configService.get<string>('MAIL_FROM') ||
        'CodeGuard AI <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your CodeGuard AI account',
      html: `
        <h2>Verify your email</h2>
        <p>Your CodeGuard AI verification code is:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    });
  }

  async sendScanReportEmail(params: {
    email: string;
    repoName: string;
    repoUrl: string;
    scanJobId: string;
    overallScore: number;
    summary: string;
    findingsCount: number;
  }) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3001';

    const reportPath = `/scans/${params.scanJobId}`;
    const reportUrl = `${frontendUrl}/login?redirect=${encodeURIComponent(
      reportPath,
    )}`;

    await this.resend.emails.send({
      from:
        this.configService.get<string>('MAIL_FROM') ||
        'CodeGuard AI <onboarding@resend.dev>',
      to: params.email,
      subject: `CodeGuard AI scan result: ${params.repoName}`,
      html: `
        <h2>CodeGuard AI Scan Completed</h2>

        <p><strong>Repository:</strong> ${params.repoName}</p>
        <p><strong>URL:</strong> <a href="${params.repoUrl}">${params.repoUrl}</a></p>
        <p><strong>Overall Score:</strong> ${params.overallScore}/100</p>

        <p>${params.summary}</p>

        <p><strong>Total Findings:</strong> ${params.findingsCount}</p>

        <p>
          <a 
            href="${reportUrl}"
            style="
              color: #059669;
              font-weight: 600;
              text-decoration: underline;
            "
          >
            Log in to CodeGuard AI to view your full report.
          </a>
        </p>
      `,
    });
  }
}