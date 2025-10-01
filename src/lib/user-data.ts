export type UserAnalysisRecord = {
  id: string;
  fileName: string;
  date: string; // ISO
  chartType: string;
  status: "completed" | "processing";
  insights: number;
};

const PREFIX = "excellytics_data_";

function keyFor(email: string): string {
  return PREFIX + email.toLowerCase();
}

export function listHistory(email: string): UserAnalysisRecord[] {
  const raw = localStorage.getItem(keyFor(email));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.history) ? parsed.history : [];
  } catch {
    return [];
  }
}

export function addHistory(email: string, record: UserAnalysisRecord): void {
  const k = keyFor(email);
  const current = listHistory(email);
  const next = [record, ...current].slice(0, 200);
  localStorage.setItem(k, JSON.stringify({ history: next }));
}

export function clearHistory(email: string): void {
  localStorage.removeItem(keyFor(email));
}
