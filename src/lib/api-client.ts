export type ApiJson = Record<string, unknown>;

export async function readApiJson<T extends ApiJson = ApiJson>(response: Response): Promise<T> {
  const value = await response.json().catch(() => ({}));
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : ({} as T);
}

export function apiError(payload: ApiJson, fallback: string) {
  return typeof payload.error === "string" ? payload.error : fallback;
}
