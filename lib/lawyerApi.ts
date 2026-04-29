import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBadgeMap, fetchSuspendedUserIds, isServicesConfigured } from './servicesApi';

const SESSION_KEY = 'verdict_session_token';

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  return url?.replace(/\/$/, '') ?? '';
}

async function mergeBadgesAndFilterSuspended<T extends { userId?: string; badges?: string[] }>(
  items: T[],
): Promise<T[]> {
  if (!isServicesConfigured()) return items;
  const [badgeMap, suspended] = await Promise.all([fetchBadgeMap(), fetchSuspendedUserIds()]);
  const suspendedSet = new Set(suspended);
  return items
    .filter((l) => !l.userId || !suspendedSet.has(String(l.userId)))
    .map((l) => {
      const extra = l.userId ? badgeMap[String(l.userId)] : undefined;
      if (!extra?.length) return l;
      const merged = [...new Set([...(l.badges || []), ...extra])];
      return { ...l, badges: merged };
    });
}

export async function fetchLawyers(filters: { 
  practice?: string; 
  location?: string;
  userCity?: string;
  userState?: string;
} = {}): Promise<any[]> {
  const base = getBaseUrl();
  const query = new URLSearchParams();
  if (filters.practice) query.append('practice', filters.practice);
  if (filters.location) query.append('location', filters.location);
  if (filters.userCity) query.append('userCity', filters.userCity);
  if (filters.userState) query.append('userState', filters.userState);

  const res = await fetch(`${base}/api/lawyers?${query.toString()}`);
  const body = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(body.message || `Failed to fetch lawyers (${res.status})`);
  }

  const data = body.data || body;
  
  if (__DEV__) {
    console.log(`[fetchLawyers] Received ${data?.length} lawyers. First bio: ${data[0]?.bio}`);
  }
  
  const mapped = data.map((lawyer: any) => ({
    id: lawyer.id,
    userId: lawyer.userId, // Added userId
    name: lawyer.user?.name || 'Anonymous Attorney',
    practice: lawyer.practice,
    experience: lawyer.experience,
    location: lawyer.location || `${lawyer.city}, ${lawyer.state}`,
    bio: lawyer.bio || lawyer.description || '', // Check for description as well just in case
    badges: lawyer.badges || [],
    isVerified: !!lawyer.isVerified,
    image: lawyer.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.user?.name || 'A')}&background=0D8ABC&color=fff`,
    rating: lawyer.rating || 0,
    facebook: lawyer.facebook,
    instagram: lawyer.instagram,
    linkedin: lawyer.linkedin,
  }));
  return mergeBadgesAndFilterSuspended(mapped);
}

export async function fetchLawyerById(id: string): Promise<any> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/lawyers/${id}`);
  const body = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(body.message || `Failed to fetch lawyer (${res.status})`);
  }

  const lawyer = body.data || body;

  const mapped = {
    id: lawyer.id,
    userId: lawyer.userId, // Added userId
    name: lawyer.user?.name || 'Anonymous Attorney',
    practice: lawyer.practice,
    experience: lawyer.experience,
    location: lawyer.location || `${lawyer.city}, ${lawyer.state}`,
    bio: lawyer.bio || '',
    badges: lawyer.badges || [],
    isVerified: !!lawyer.isVerified,
    image: lawyer.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.user?.name || 'A')}&background=0D8ABC&color=fff`,
    rating: lawyer.rating || 0,
    facebook: lawyer.facebook,
    instagram: lawyer.instagram,
    linkedin: lawyer.linkedin,
  };
  const [merged] = await mergeBadgesAndFilterSuspended([mapped]);
  return merged;
}

export async function fetchNotifications(): Promise<any[]> {
  const base = getBaseUrl();
  const token = await AsyncStorage.getItem(SESSION_KEY);
  
  if (!token) return [];

  const res = await fetch(`${base}/api/auth/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return [];

  return body.data || body || [];
}
