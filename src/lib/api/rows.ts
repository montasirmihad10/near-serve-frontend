/** Unwrap common NearServe list payloads: { data: { result } } | { data: [] } | [] */
export function unwrapList<T = Record<string, unknown>>(
  response: unknown,
): T[] {
  if (!response) return [];
  const root = response as {
    data?: { result?: unknown } | unknown;
    result?: unknown;
  };
  const data = root.data !== undefined ? root.data : response;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { result?: unknown }).result)) {
    return (data as { result: T[] }).result;
  }
  if (Array.isArray(root.result)) return root.result as T[];
  return [];
}

export function unwrapOne<T = Record<string, unknown>>(
  response: unknown,
): T | null {
  if (!response) return null;
  const root = response as { data?: T };
  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return root.data;
  }
  if (typeof response === "object" && !Array.isArray(response)) {
    return response as T;
  }
  return null;
}
