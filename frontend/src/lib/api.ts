const API_URL = "http://localhost:3000";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ScanFinding = {
  id: string;
  category: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  filePath?: string | null;
  lineNumber?: number | null;
  suggestion: string;
};

export type ScanReportResponse = {
  scanJobId: string;
  repository: {
    id: string;
    repoUrl: string;
    repoName: string | null;
    ownerName: string | null;
  };
  report: {
  id: string;
  overallScore: number;
  securityScore: number;
  readmeScore: number;
  envScore: number;
  deploymentScore: number;
  codeStructureScore: number;
  summary: string;
  findings: ScanFinding[];
  aiSummary: {
    id: string;
    model: string;
    promptVersion: string;
    projectSummary: string;
    securityReview: string;
    readmeReview: string;
    codeStructureReview: string;
    portfolioFeedback: string;
    fixPriority: string;
    createdAt: string;
  } | null;
};
};

export type ScanHistoryItem = {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  repository: {
    id: string;
    repoUrl: string;
    repoName: string | null;
    ownerName: string | null;
  };
  report: ScanReportResponse["report"] | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("codeguard_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let message = "Something went wrong. Please try again.";

    try {
      const json = JSON.parse(text);

      message = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || json.error || message;
    } catch {
      // Do not show raw HTML errors from Next.js or server pages
      message = "Unable to connect to the server. Please check that the backend is running.";
    }

    throw new Error(message);
  }

  return res.json();
}
export async function signup(data: {
  name: string;
  email: string;
  password: string;
}) {
  return request<{ message: string; email: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyEmail(data: { email: string; code: string }) {
  return request<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resendVerification(email: string) {
  return request<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getMe() {
  return request<AuthUser>("/auth/me");
}

export async function createScan(repoUrl: string): Promise<ScanReportResponse> {
  return request<ScanReportResponse>("/scans", {
    method: "POST",
    body: JSON.stringify({ repoUrl }),
  });
}

export async function getMyScans(): Promise<ScanHistoryItem[]> {
  return request<ScanHistoryItem[]>("/scans");
}

export function saveAuth(accessToken: string, user: AuthUser) {
  localStorage.setItem("codeguard_token", accessToken);
  localStorage.setItem("codeguard_user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("codeguard_token");
  localStorage.removeItem("codeguard_user");
  window.location.href = "/login";
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("codeguard_user");
  return user ? JSON.parse(user) : null;
}
export async function getScanById(id: string): Promise<ScanHistoryItem> {
  return request<ScanHistoryItem>(`/scans/${id}`);
}