// Small RFC4122 v4-ish generator so the client can pre-assign a log's id for
// optimistic updates (the same id then arrives via the realtime insert event,
// so it can be deduped instead of appended twice).
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
