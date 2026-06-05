import { FindingCategory, FindingSeverity } from '@prisma/client';

export type ScannerFinding = {
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  suggestion: string;
};

export type ProjectScanResult = {
  findings: ScannerFinding[];
  scores: {
    securityScore: number;
    readmeScore: number;
    envScore: number;
    deploymentScore: number;
    codeStructureScore: number;
    overallScore: number;
  };
  summary: string;
};