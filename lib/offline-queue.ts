const QUEUE_KEY = "tally:offline-logs";

export type QueuedLog = {
  memberId: string;
  challengeId: string;
  amount: number;
  note: string | null;
  proofPath: string | null;
  queuedAt: string;
};

export function queueLog(entry: QueuedLog) {
  if (typeof localStorage === "undefined") return;
  const q = getQueue();
  q.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function getQueue(): QueuedLog[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedLog[];
  } catch {
    return [];
  }
}

export function clearQueue() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

export function removeFromQueue(index: number) {
  const q = getQueue();
  q.splice(index, 1);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}
