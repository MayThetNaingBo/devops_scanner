"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  History,
  Loader2,
  LogOut,
  Shield,
} from "lucide-react";
import {
  createScan,
  getStoredUser,
  logout,
  ScanFinding,
  ScanReportResponse,
} from "../lib/api";

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState<ScanReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"USER" | "ADMIN">("USER");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const token = localStorage.getItem("codeguard_token");

    if (!user || !token) {
      router.replace("/login");
      return;
    }

    setUserName(user.name || user.email);
    setUserRole(user.role === "ADMIN" ? "ADMIN" : "USER");
    setAuthChecking(false);
  }, []);

  async function handleScan() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await createScan(repoUrl);
      setResult(data);
      setRepoUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          Checking login...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">CodeGuard AI</h1>
              <p className="text-slate-400">
                Welcome, {userName}. Scan your GitHub projects securely.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                router.push("/history");
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              <History className="h-4 w-4" />
              Scan History
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <h2 className="mb-2 text-2xl font-bold">Scan a repository</h2>

          <p className="mb-6 text-slate-400">
            Paste a public GitHub repository URL. The report will also be sent
            to your verified email.
          </p>

          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <h3 className="mb-2 font-semibold text-emerald-300">
              Your monthly usage
            </h3>

            <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-slate-400">Rule-based scans</p>
                <p className="mt-1 text-lg font-bold text-white">Unlimited</p>
                <p className="mt-1 text-xs text-slate-500">
                  Security, README, environment, deployment, and score checks.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-slate-400">AI reviews</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {userRole === "ADMIN" ? "100" : "3"} / month
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  AI summary, security review, README review, and portfolio
                  feedback.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-slate-400">Account type</p>
                <p className="mt-1 text-lg font-bold text-white">{userRole}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {userRole === "ADMIN"
                    ? "Admin accounts receive a higher AI review limit."
                    : "Normal accounts can still run unlimited rule-based scans."}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              If your AI review limit is reached, your scan will still complete
              with the normal rule-based report.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />

            <button
              onClick={handleScan}
              disabled={loading || !repoUrl.trim()}
              className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Scanning...
                </span>
              ) : (
                "Scan Repository"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        {result && <ReportView result={result} />}
      </div>
    </main>
  );
}

function ReportView({ result }: { result: ScanReportResponse }) {
  const report = result.report;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="mb-2 text-sm text-slate-400">
          {result.repository.ownerName}/{result.repository.repoName}
        </p>

        <h2 className="mb-3 text-2xl font-bold">Latest Scan Report</h2>

        <p className="text-slate-300">{report.summary}</p>

        <button
          onClick={() => {
            window.location.href = `/scans/${result.scanJobId}`;
          }}
          className="mt-5 rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
        >
          Open Full Report
        </button>
      </div>

      {report.aiSummary ? (
        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              AI Review
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              AI-Powered Project Analysis
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Generated by {report.aiSummary.model}
            </p>
          </div>

          <div className="space-y-5">
            <AiReviewBlock
              title="Project Summary"
              content={report.aiSummary.projectSummary}
            />

            <AiReviewBlock
              title="Security Review"
              content={report.aiSummary.securityReview}
            />

            <AiReviewBlock
              title="README Review"
              content={report.aiSummary.readmeReview}
            />

            <AiReviewBlock
              title="Code Structure Review"
              content={report.aiSummary.codeStructureReview}
            />

            <AiReviewBlock
              title="Portfolio Feedback"
              content={report.aiSummary.portfolioFeedback}
            />

            <AiReviewBlock
              title="Fix Priority"
              content={report.aiSummary.fixPriority}
            />
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">AI Review</h2>

          <p className="mt-2 text-sm text-slate-400">
            AI review is not available for this scan. Your rule-based security
            and readiness report is still complete.
          </p>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <ScoreCard title="Overall" score={report.overallScore} />
        <ScoreCard title="Security" score={report.securityScore} />
        <ScoreCard title="README" score={report.readmeScore} />
        <ScoreCard title="Environment" score={report.envScore} />
        <ScoreCard title="Deployment" score={report.deploymentScore} />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-2xl font-bold">Score Breakdown</h2>

        <div className="space-y-4">
          <ScoreBar label="Security" score={report.securityScore} />
          <ScoreBar label="README" score={report.readmeScore} />
          <ScoreBar label="Environment" score={report.envScore} />
          <ScoreBar label="Deployment" score={report.deploymentScore} />
          <ScoreBar
            label="Code Structure"
            score={report.codeStructureScore}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Findings</h3>

        {report.findings.length === 0 ? (
          <p className="text-slate-400">No findings detected.</p>
        ) : (
          <div className="space-y-4">
            {report.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AiReviewBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <h3 className="mb-2 font-semibold text-emerald-300">{title}</h3>

      <p className="whitespace-pre-line text-sm leading-6 text-slate-300">
        {content}
      </p>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <p className="mb-2 text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-white">{score}</p>
      <p className="text-sm text-slate-500">/100</p>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-emerald-400">{score}/100</span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-emerald-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: ScanFinding }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {finding.category}
        </span>

        {finding.filePath && (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-500">
            {finding.filePath}
            {finding.lineNumber ? `:${finding.lineNumber}` : ""}
          </span>
        )}
      </div>

      <h3 className="mb-2 text-lg font-semibold">{finding.title}</h3>

      <p className="mb-4 text-sm leading-6 text-slate-400">
        {finding.description}
      </p>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Suggested Fix
        </p>

        <p className="text-sm leading-6 text-emerald-200">
          {finding.suggestion}
        </p>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const isGood = severity === "INFO" || severity === "LOW";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        isGood
          ? "bg-blue-500/10 text-blue-300"
          : "bg-orange-500/10 text-orange-300"
      }`}
    >
      {isGood ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {severity}
    </span>
  );
}