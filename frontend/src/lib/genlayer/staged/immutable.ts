/** Capture user arguments and evidence before any async boundary. No JSON number loss. */
export function frozen<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map(v => frozen(v))) as T;
  if (value && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) throw new Error('UNSUPPORTED_MUTABLE_VALUE');
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frozen(v)]))) as T;
  }
  return value;
}
export function fingerprint(value: unknown): string {
  return JSON.stringify(value, (_, v) => v instanceof Map ? Object.fromEntries(v) : typeof v === 'bigint' ? { integer: v.toString() } : v);
}
