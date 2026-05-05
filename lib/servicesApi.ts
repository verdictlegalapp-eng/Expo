/**
 * Optional VerdictServer URL: badges, physical verification, push registration.
 * Set EXPO_PUBLIC_SERVICES_URL to VerdictServer base URL (e.g. http://192.168.1.5:4000).
 */

function getServicesUrl(): string {
  const url = process.env.EXPO_PUBLIC_SERVICES_URL || process.env.EXPO_PUBLIC_API_URL || '';
  return url.replace(/\/$/, '');
}

export function isServicesConfigured(): boolean {
  return Boolean(getServicesUrl());
}

export type VerificationUiStatus = 'none' | 'pending' | 'approved' | 'rejected';

export async function fetchVerificationStatus(userId: number | string): Promise<{
  status: VerificationUiStatus;
  badges: string[];
}> {
  const base = getServicesUrl();
  if (!base) return { status: 'none', badges: [] };
  try {
    const res = await fetch(`${base}/api/verification/status/${encodeURIComponent(String(userId))}`);
    if (!res.ok) return { status: 'none', badges: [] };
    const body = await res.json();
    return {
      status: (body.status as VerificationUiStatus) || 'none',
      badges: Array.isArray(body.badges) ? body.badges : [],
    };
  } catch {
    return { status: 'none', badges: [] };
  }
}

export async function submitPhysicalVerificationRequest(payload: {
  userId: number | string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  barId: string;
  state: string;
  lawFirm?: string;
  notes?: string;
}): Promise<void> {
  const base = getServicesUrl();
  if (!base) {
    throw new Error('Set EXPO_PUBLIC_SERVICES_URL to submit verification requests.');
  }
  const res = await fetch(`${base}/api/verification/physical-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
}

/** userId -> badge ids granted by admin */
export async function fetchBadgeMap(): Promise<Record<string, string[]>> {
  const base = getServicesUrl();
  if (!base) return {};
  try {
    const res = await fetch(`${base}/api/public/badge-map`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export async function fetchSuspendedUserIds(): Promise<string[]> {
  const base = getServicesUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/public/suspended-ids`);
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body.ids) ? body.ids.map(String) : [];
  } catch {
    return [];
  }
}

export async function registerPushToken(
  expoPushToken: string,
  role: string,
  userId: number | string,
): Promise<void> {
  const base = getServicesUrl();
  if (!base) return;
  try {
    await fetch(`${base}/api/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: expoPushToken, role, userId }),
    });
  } catch {
    // non-fatal
  }
}

export async function removeVerification(userId: number | string): Promise<void> {
  const base = getServicesUrl();
  if (!base) return;
  const res = await fetch(`${base}/api/verification/status/${encodeURIComponent(String(userId))}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to remove verification');
  }
}
