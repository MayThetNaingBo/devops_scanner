import * as path from 'path';
import * as fs from 'fs-extra';
import { FindingCategory, FindingSeverity } from '@prisma/client';
import { ScannerFinding } from './project-scanner';

const SECRET_PATTERNS = [
  {
    name: 'Possible AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/,
    severity: FindingSeverity.CRITICAL,
  },
  {
    name: 'Possible Stripe Secret Key',
    regex: /sk_live_[0-9a-zA-Z]+/,
    severity: FindingSeverity.CRITICAL,
  },
  {
    name: 'Possible JWT Secret',
    regex: /JWT_SECRET\s*=\s*.+/i,
    severity: FindingSeverity.HIGH,
  },
  {
    name: 'Possible Database URL',
    regex: /(DATABASE_URL|MONGO_URI|POSTGRES_URL)\s*=\s*.+/i,
    severity: FindingSeverity.HIGH,
  },
  {
    name: 'Possible Private Key',
    regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    severity: FindingSeverity.CRITICAL,
  },
];

const DANGEROUS_FILE_NAMES = [
  '.env',
  'serviceAccountKey.json',
  'firebase-adminsdk.json',
  'google-credentials.json',
];

const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.vercel',
];

function shouldIgnore(filePath: string) {
  return IGNORE_DIRS.some((dir) => filePath.includes(`${path.sep}${dir}${path.sep}`));
}

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (shouldIgnore(fullPath)) {
        return [];
      }

      if (entry.isDirectory()) {
        return getAllFiles(fullPath);
      }

      return [fullPath];
    }),
  );

  return files.flat();
}

export async function scanSecrets(projectPath: string): Promise<ScannerFinding[]> {
  const findings: ScannerFinding[] = [];
  const files = await getAllFiles(projectPath);

  for (const file of files) {
    const relativePath = path.relative(projectPath, file);
    const fileName = path.basename(file);

    if (DANGEROUS_FILE_NAMES.includes(fileName)) {
      findings.push({
        category: FindingCategory.SECRET_RISK,
        severity: FindingSeverity.CRITICAL,
        title: `Sensitive file committed: ${fileName}`,
        description: `The file "${relativePath}" may contain private credentials or environment secrets.`,
        filePath: relativePath,
        suggestion:
          'Remove this file from the repository, rotate exposed credentials, add it to .gitignore, and use environment variables instead.',
      });
    }

    const stat = await fs.stat(file);

    if (stat.size > 500_000) {
      continue;
    }

    let content = '';

    try {
      content = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            category: FindingCategory.SECRET_RISK,
            severity: pattern.severity,
            title: pattern.name,
            description: `A possible secret was detected in "${relativePath}".`,
            filePath: relativePath,
            lineNumber: index + 1,
            suggestion:
              'Move secrets into environment variables, rotate the exposed key, and remove it from Git history.',
          });
        }
      }
    });
  }

  return findings;
}