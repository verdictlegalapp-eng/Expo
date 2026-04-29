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
  experience?: string;
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
    image: string | null;
    role: string;
    state: string | null;
    city: string | null;
    legalNeed: string | null;
    lawyerProfile?: {
      practice: string | null;
      experience: string | null;
      bio: string | null;
      state: string | null;
      city: string | null;
      location: string | null;
      barId: string | null;
      rating: number;
    };
  };
};

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    console.warn('[authApi] EXPO_PUBLIC_API_URL is not set');
  } else {
    console.log(`[authApi] Using base URL: ${url}`);
  }
  return url?.replace(/\/$/, '') ?? '';
}

function getAuthCandidates(base: string, endpoint: 'request-otp' | 'verify-otp' | 'verify'): string[] {
  return [
    `${base}/api/auth/${endpoint}`,
    `${base}/auth/${endpoint}`,
  ];
}

async function postJsonWith404Fallback<TBody extends object, TResponse>(
  urls: string[],
  body: TBody,
): Promise<{ res: Response; parsed: TResponse & { error?: string; message?: string } }> {
  let lastRes: Response | null = null;
  let lastParsed = {} as TResponse & { error?: string; message?: string };

  for (const url of urls) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const parsed = (await res.json().catch(() => ({}))) as TResponse & {
      error?: string;
      message?: string;
    };

    lastRes = res;
    lastParsed = parsed;

    // Retry only on 404 to support deployments mounted at /auth instead of /api/auth.
    if (!(res.status === 404 && !res.ok)) {
      return { res, parsed };
    }
  }

  if (!lastRes) {
    throw new Error('Network request failed');
  }
  return { res: lastRes, parsed: lastParsed };
}

export async function requestEmailOtp(email: string): Promise<void> {
  const base = getBaseUrl();
  if (!base) throw new Error('EXPO_PUBLIC_API_URL is not configured');

  const { res, parsed: body } = await postJsonWith404Fallback<{ email: string }, { error?: string; message?: string }>(
    getAuthCandidates(base, 'request-otp'),
    { email },
  );
  if (!res.ok) {
    throw new Error(body.error || body.message || `Failed to send OTP (${res.status})`);
  }
}

export async function verifyEmailOtp(email: string, code: string, profile: RegisterProfile): Promise<VerifyResponse> {
  const base = getBaseUrl();
  if (!base) throw new Error('EXPO_PUBLIC_API_URL is not configured');

  const { res, parsed: body } = await postJsonWith404Fallback<
    { email: string; code: string; profile: RegisterProfile },
    VerifyResponse
  >(getAuthCandidates(base, 'verify-otp'), { email, code, profile });

  if (!res.ok) {
    throw new Error(body.error || body.message || `Verification failed (${res.status})`);
  }

  const data = (body as any).data || body;

  if (!data.sessionToken) {
    throw new Error('Invalid response from server');
  }

  await AsyncStorage.setItem(SESSION_KEY, data.sessionToken);
  return data as VerifyResponse;
}

export async function verifyWithBackend(idToken: string, profile: RegisterProfile): Promise<VerifyResponse> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const { res, parsed: body } = await postJsonWith404Fallback<
    { idToken: string; profile: RegisterProfile },
    VerifyResponse
  >(getAuthCandidates(base, 'verify'), { idToken, profile });

  if (!res.ok) {
    throw new Error(body.error || body.message || `Verification failed (${res.status})`);
  }

  const data = (body as any).data || body;

  if (!data.sessionToken) {
    throw new Error('Invalid response from server');
  }

  await AsyncStorage.setItem(SESSION_KEY, data.sessionToken);
  return data as VerifyResponse;
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
  const res = await fetch(`${base}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  const data = body.data || body;

  if (!data.id) {
    throw new Error('Invalid response from server');
  }
  return data;
}

export async function updateProfile(data: {
  name?: string;
  city?: string;
  state?: string;
  legalNeed?: string;
  image?: string;
  bio?: string;
  practice?: string;
  experience?: string;
}): Promise<void> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) {
    throw new Error('Not signed in or EXPO_PUBLIC_API_URL missing');
  }
  const res = await fetch(`${base}/api/auth/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(body.error || `Failed to update profile (${res.status})`);
  }
}

export async function deleteAccount(): Promise<boolean> {
  try {
    const base = getBaseUrl();
    const token = await getSessionToken();
    if (!base || !token) return false;

    const res = await fetch(`${base}/api/auth/delete-account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return res.ok;
  } catch (error) {
    console.error('deleteAccount API failed:', error);
    return false;
  }
}
