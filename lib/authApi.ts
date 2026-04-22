import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'verdict_session_token';

export type RegisterProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  state?: string;
  city?: string;
  specialization?: string;
  barId?: string;
};

export type VerifyResponse = {
  sessionToken: string;
  expiresIn: string;
  user: {
    id: number;
    firebaseUid: string;
    phone: string;
    email: string;
    name: string;
    role: string;
    state: string | null;
    city: string | null;
    specialization: string | null;
    barId: string | null;
  };
};

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    console.warn('[authApi] EXPO_PUBLIC_API_URL is not set');
  }
  return url?.replace(/\/$/, '') ?? '';
}

export async function verifyWithBackend(idToken: string, profile: RegisterProfile): Promise<VerifyResponse> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const res = await fetch(`${base}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, profile }),
  });

  const body = (await res.json().catch(() => ({}))) as VerifyResponse & { error?: string };

  if (!res.ok) {
    throw new Error(body.error || `Verification failed (${res.status})`);
  }

  if (!body.sessionToken) {
    throw new Error('Invalid response from server');
  }

  await AsyncStorage.setItem(SESSION_KEY, body.sessionToken);
  return body;
}

export async function getSessionToken(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

/** Loads the signed-in user from the API (requires prior verifyWithBackend). */
export async function fetchCurrentUser(): Promise<VerifyResponse['user']> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) {
    throw new Error('Not signed in or EXPO_PUBLIC_API_URL missing');
  }
  const res = await fetch(`${base}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as { user?: VerifyResponse['user']; error?: string };
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (!body.user) {
    throw new Error('Invalid response from server');
  }
  return body.user;
}
