import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  private createTransporter() {
  const port = Number(this.configService.get<string>('SMTP_PORT'));
  const secure =
    this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

  return nodemailer.createTransport({
    host: this.configService.get<string>('SMTP_HOST'),
    port,
    secure,
    auth: {
      user: this.configService.get<string>('SMTP_USER'),
      pass: this.configService.get<string>('SMTP_PASS'),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

  async sendVerificationCode(email: string, code: string) {
    const transporter = this.createTransporter();

    await transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
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
    const transporter = this.createTransporter();

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const reportPath = `/scans/${params.scanJobId}`;
const reportUrl = `${frontendUrl}/login?redirect=${encodeURIComponent(reportPath)}`;

    await transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
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