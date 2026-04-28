import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'verdict_session_token';

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  return url?.replace(/\/$/, '') ?? '';
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
  
  return data.map((lawyer: any) => ({
    id: lawyer.id,
    userId: lawyer.userId, // Added userId
    name: lawyer.user?.name || 'Anonymous Attorney',
    practice: lawyer.practice,
    experience: lawyer.experience,
    location: lawyer.location || `${lawyer.city}, ${lawyer.state}`,
    bio: lawyer.bio || lawyer.description || '', // Check for description as well just in case
    badges: lawyer.badges || [],
    image: lawyer.user?.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
    rating: lawyer.rating || 0,
  }));
}

export async function fetchLawyerById(id: string): Promise<any> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/lawyers/${id}`);
  const body = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(body.message || `Failed to fetch lawyer (${res.status})`);
  }

  const lawyer = body.data || body;
  
  return {
    id: lawyer.id,
    userId: lawyer.userId, // Added userId
    name: lawyer.user?.name || 'Anonymous Attorney',
    practice: lawyer.practice,
    experience: lawyer.experience,
    location: lawyer.location || `${lawyer.city}, ${lawyer.state}`,
    bio: lawyer.bio || '',
    badges: lawyer.badges || [],
    image: lawyer.user?.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
    rating: lawyer.rating || 0,
  };
}
