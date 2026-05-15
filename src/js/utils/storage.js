const RECORD_KEY = 'hamster-run-records-v1';

export function readRecords() {
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRecord(levelId, score) {
  const records = readRecords();
  const previous = records[levelId] || 0;
  const next = Math.max(previous, Math.floor(score));
  records[levelId] = next;
  localStorage.setItem(RECORD_KEY, JSON.stringify(records));
  return { previous, next, improved: next > previous };
}
