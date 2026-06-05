import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FindingSeverity } from '@prisma/client';

type AiFindingInput = {
  category: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  filePath?: string | null;
  suggestion: string;
};

type GenerateAiReportInput = {
  repoName: string;
  repoUrl: string;
  scores: {
    overallScore: number;
    securityScore: number;
    readmeScore: number;
    envScore: number;
    deploymentScore: number;
    codeStructureScore: number;
  };
  findings: AiFindingInput[];
};

export type AiReportOutput = {
  projectSummary: string;
  securityReview: string;
  readmeReview: string;
  codeStructureReview: string;
  portfolioFeedback: string;
  fixPriority: string;
};

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  async generateAiReport(
    input: GenerateAiReportInput,
  ): Promise<AiReportOutput | null> {
    const aiEnabled = this.configService.get<string>('AI_ENABLED') === 'true';
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!aiEnabled || !apiKey) {
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = this.buildPrompt(input);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return this.safeParseAiJson(text);
    } catch (error) {
      console.error('AI report generation failed:', error);
      return null;
    }
  }

  private buildPrompt(input: GenerateAiReportInput) {
    const safeFindings = input.findings.slice(0, 30).map((finding) => ({
      category: finding.category,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      filePath: finding.filePath,
      suggestion: finding.suggestion,
    }));

    return `
You are CodeGuard AI, a DevSecOps and portfolio project reviewer.

Your job:
Analyze the scan result and generate professional feedback for a junior developer's portfolio project.

Important rules:
- Do not invent issues that are not supported by the findings.
- Do not claim you reviewed full source code.
- Base your review only on the scores and findings provided.
- Be clear, practical, and helpful.
- Keep each section concise but meaningful.
- Return valid JSON only.
- No markdown code fences.

Repository:
${input.repoName}
${input.repoUrl}

Scores:
overallScore: ${input.scores.overallScore}
securityScore: ${input.scores.securityScore}
readmeScore: ${input.scores.readmeScore}
envScore: ${input.scores.envScore}
deploymentScore: ${input.scores.deploymentScore}
codeStructureScore: ${input.scores.codeStructureScore}

Findings:
${JSON.stringify(safeFindings, null, 2)}

Return JSON with exactly these keys:
{
  "projectSummary": "short professional summary of the project readiness",
  "securityReview": "security-focused review based on findings",
  "readmeReview": "README and documentation review",
  "codeStructureReview": "code structure and engineering quality review",
  "portfolioFeedback": "job-hunting portfolio feedback",
  "fixPriority": "ordered priority of what to fix first as one plain text string, not an array"
}
`;
  }

  private safeParseAiJson(text: string): AiReportOutput | null {
    try {
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        projectSummary:
          parsed.projectSummary || 'AI project summary was not available.',
        securityReview:
          parsed.securityReview || 'AI security review was not available.',
        readmeReview:
          parsed.readmeReview || 'AI README review was not available.',
        codeStructureReview:
          parsed.codeStructureReview ||
          'AI code structure review was not available.',
        portfolioFeedback:
          parsed.portfolioFeedback ||
          'AI portfolio feedback was not available.',
        fixPriority: Array.isArray(parsed.fixPriority)
  ? parsed.fixPriority.join('\n')
  : parsed.fixPriority || 'AI fix priority was not available.',
      };
    } catch (error) {
      console.error('Failed to parse AI JSON:', text);
      return null;
    }
  }
}