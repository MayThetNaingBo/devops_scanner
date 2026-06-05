"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  History,
  Loader2,
} from "lucide-react";
import { getMyScans, logout, ScanHistoryItem } from "@/src/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("codeguard_token");

    if (!token) {
      localStorage.setItem("redirect_after_login", "/history");
      router.replace("/login");
      return;
    }

    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyScans();
      setHistory(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load scan history";

      setError(message);

      if (message.toLowerCase().includes("unauthorized")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleScan(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          Loading scan history...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => {
            router.push("/");
          }}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scan dashboard
        </button>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3">
              <History className="h-8 w-8 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Scan History</h1>
              <p className="mt-1 text-slate-400">
                View your previous scans and expand each report summary.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-slate-400">No scan history yet.</p>
          </section>
        ) : (
          <section className="space-y-4">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              const report = item.report;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900"
                >
                  <button
                    onClick={() => toggleScan(item.id)}
                    className="flex w-full flex-col justify-between gap-4 p-6 text-left transition hover:bg-slate-800/40 md:flex-row md:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-emerald-400">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          {item.repository.ownerName}/{item.repository.repoName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.repository.repoUrl}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Scanned on {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <StatusBadge status={item.status} />

                      {report && (
                        <p className="mt-2 text-2xl font-bold text-emerald-400">
                          {report.overallScore}/100
                        </p>
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-800 p-6">
                      {!report ? (
                        <p className="text-sm text-slate-400">
                          This scan does not have a completed report yet.
                        </p>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h2 className="mb-2 text-xl font-bold">
                              Report Summary
                            </h2>
                            <p className="text-sm leading-6 text-slate-300">
                              {report.summary}
                            </p>
                          </div>

                          {report.aiSummary ? (
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                                AI Review
                              </p>
                              <h3 className="mt-1 text-lg font-bold">
                                {report.aiSummary.projectSummary}
                              </h3>
                              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                                {report.aiSummary.portfolioFeedback}
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                              <h3 className="font-semibold">AI Review</h3>
                              <p className="mt-2 text-sm text-slate-400">
                                AI review is not available for this scan. The
                                rule-based report is still complete.
                              </p>
                            </div>
                          )}

                          <div className="grid gap-4 md:grid-cols-5">
                            <ScoreCard title="Overall" score={report.overallScore} />
                            <ScoreCard title="Security" score={report.securityScore} />
                            <ScoreCard title="README" score={report.readmeScore} />
                            <ScoreCard title="Environment" score={report.envScore} />
                            <ScoreCard
                              title="Deployment"
                              score={report.deploymentScore}
                            />
                          </div>

                          <div>
                            <h3 className="mb-3 font-semibold">
                              Findings Preview
                            </h3>

                            {report.findings.length === 0 ? (
                              <p className="text-sm text-slate-400">
                                No findings detected.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {report.findings.slice(0, 3).map((finding) => (
                                  <div
                                    key={finding.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                                  >
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                      <SeverityBadge
                                        severity={finding.severity}
                                      />
                                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                        {finding.category}
                                      </span>
                                    </div>

                                    <p className="font-semibold">
                                      {finding.title}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                      {finding.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {report.findings.length > 3 && (
                              <p className="mt-3 text-xs text-slate-500">
                                Showing first 3 findings. Open the full report
                                to view all findings.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() => {
                                router.push(`/scans/${item.id}`);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
                            >
                              Open Full Report
                              <ExternalLink className="h-4 w-4" />
                            </button>

                            <a
                              href={item.repository.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
                            >
                              Open GitHub Repo
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-bold">{score}</p>
      <p className="text-xs text-slate-500">/100</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
      {status}
    </span>
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