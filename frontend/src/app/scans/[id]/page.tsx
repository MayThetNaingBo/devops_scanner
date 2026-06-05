"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Loader2,
  Shield,
} from "lucide-react";
import { getScanById, logout, ScanFinding, ScanHistoryItem } from "@/src/lib/api";

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [scan, setScan] = useState<ScanHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const scanId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem("codeguard_token");

    if (!token) {
      localStorage.setItem("redirect_after_login", `/scans/${scanId}`);
      router.replace("/login");
      return;
    }

    loadScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  async function loadScan() {
    try {
      setLoading(true);
      setError("");

      const data = await getScanById(scanId);
      setScan(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load scan report";

      setError(message);

      if (message.toLowerCase().includes("unauthorized")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          Loading scan report...
        </div>
      </main>
    );
  }

  if (error || !scan) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.push("/")}
            className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error || "Scan report not found"}
          </div>
        </div>
      </main>
    );
  }

  const report = scan.report;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scan dashboard
        </button>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3">
                <Shield className="h-8 w-8 text-emerald-400" />
              </div>

              <div>
                <p className="mb-1 text-sm text-slate-400">Full Scan Report</p>
                <h1 className="text-3xl font-bold">
                  {scan.repository.ownerName}/{scan.repository.repoName}
                </h1>

                <a
                  href={scan.repository.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  {scan.repository.repoUrl}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-6 py-4 text-left md:text-right">
              <p className="text-sm text-slate-400">Status</p>
              <p className="font-semibold text-emerald-400">{scan.status}</p>
            </div>
          </div>

          {report ? (
            <p className="text-slate-300">{report.summary}</p>
          ) : (
            <p className="text-slate-400">
              This scan does not have a completed report yet.
            </p>
          )}
        </section>

        {report && (
          <>
            {report.aiSummary ? (
              <section className="mb-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
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
              <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-bold">AI Review</h2>
                <p className="mt-2 text-sm text-slate-400">
                  AI review is not available for this scan. Your rule-based
                  security and readiness report is still complete.
                </p>
              </section>
            )}

            <section className="mb-8 grid gap-4 md:grid-cols-5">
              <ScoreCard title="Overall" score={report.overallScore} />
              <ScoreCard title="Security" score={report.securityScore} />
              <ScoreCard title="README" score={report.readmeScore} />
              <ScoreCard title="Environment" score={report.envScore} />
              <ScoreCard title="Deployment" score={report.deploymentScore} />
            </section>

            <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
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
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-bold">Findings</h2>
                  <p className="text-sm text-slate-400">
                    {report.findings.length} issue(s) or improvement(s) found.
                  </p>
                </div>
              </div>

              {report.findings.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300">
                  No findings detected. This project looks clean.
                </div>
              ) : (
                <div className="space-y-4">
                  {report.findings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
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