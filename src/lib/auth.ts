export type User = {
  id: string;
  role: 'admin' | 'manager' | 'viewer';
  restaurantGroupId?: string;
  locations?: string[];
};

// Very small mock auth helper: reads `x-user` header JSON (for local/dev only)
export function getUserFromHeader(headers: Headers): User | null {
  const raw = headers.get('x-user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed as User;
  } catch {
    return null;
  }
}
