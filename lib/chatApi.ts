import { io, Socket } from 'socket.io-client';
import { getSessionToken, fetchCurrentUser } from './authApi';

let socket: Socket | null = null;
let socketConnectPromise: Promise<Socket> | null = null;

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  return url?.replace(/\/$/, '') ?? '';
}

function decodeJwtUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1])) as { id?: string | number };
    return payload?.id != null ? String(payload.id) : null;
  } catch {
    return null;
  }
}

/** Verdict API: `{ success, message, data }` on success; errors may include `message` or `error`. */
function throwIfApiFailed(res: Response, body: Record<string, unknown>): void {
  if (!res.ok) {
    const msg =
      (typeof body.message === 'string' && body.message) ||
      (typeof body.error === 'string' && body.error) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  if (body.success === false) {
    const msg =
      (typeof body.message === 'string' && body.message) ||
      (typeof body.error === 'string' && body.error) ||
      'Request failed';
    throw new Error(msg);
  }
}

function extractConversationArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.conversations)) return o.conversations as any[];
    if (Array.isArray(o.items)) return o.items as any[];
    if (Array.isArray(o.rows)) return o.rows as any[];
  }
  return [];
}

function peerUserIdFromRow(row: any, myId: string | null): string | undefined {
  const explicit =
    row.partnerUserId ??
    row.partnerId ??
    row.otherUserId ??
    row.peerId ??
    row.receiverId;
  if (explicit != null && String(explicit).length > 0) return String(explicit);

  const u1 =
    row.user1Id ??
    row.user1_id ??
    row.user_1_id ??
    row.participant1Id;
  const u2 =
    row.user2Id ??
    row.user2_id ??
    row.user_2_id ??
    row.participant2Id;
  if (myId && u1 && u2) {
    const s1 = String(u1);
    const s2 = String(u2);
    const me = String(myId);
    if (s1 === me) return s2;
    if (s2 === me) return s1;
  }

  if (row.partner?.id != null) return String(row.partner.id);
  if (row.user?.id != null && myId != null && String(row.user.id) !== String(myId)) {
    return String(row.user.id);
  }

  return undefined;
}

/** Socket.io with JWT in handshake `auth.token` (matches typical Express socket.io setups). */
export async function ensureChatSocket(): Promise<Socket> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) throw new Error('Not signed in');

  if (socket?.connected) return socket;
  if (socketConnectPromise) return socketConnectPromise;

  socketConnectPromise = new Promise<Socket>((resolve, reject) => {
    socket?.disconnect();
    const s = io(base, {
      auth: { token },
      reconnection: true,
      transports: ['polling', 'websocket'],
      forceNew: true,
      path: '/socket.io/',
      timeout: 20000,
    });
    const onConnect = () => {
      s.off('connect_error', onErr);
      socket = s;
      socketConnectPromise = null;
      resolve(s);
    };
    const onErr = (err: any) => {
      s.off('connect', onConnect);
      socketConnectPromise = null;
      // Silent fail to prevent metro log spam
      reject(err);
    };
    s.once('connect', onConnect);
    s.on('connect_error', onErr);
  });

  return socketConnectPromise;
}

export async function fetchMessages(receiverId: string): Promise<{ messages: any[], conversationId: string }> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) throw new Error('Not signed in');

  const res = await fetch(`${base}/api/chat/${encodeURIComponent(receiverId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  throwIfApiFailed(res, body);

  const data = body.data ?? body;

  const rawList = Array.isArray(data)
    ? data
    : (((data as Record<string, unknown>).messages as any[]) || []);
  const messages = rawList.map((msg: any) => {
    const sender = msg.senderId ?? msg.sender;
    const created = msg.createdAt ? new Date(msg.createdAt) : undefined;
    const time =
      msg.time ||
      (created
        ? created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '');
    return {
      id: msg.id ?? msg._id,
      text: msg.text,
      sender,
      time,
      createdAt: created,
      senderImage: msg.senderImage,
    };
  });

  const dataObj = Array.isArray(data) ? {} : (data as Record<string, unknown>);
  const convIdRaw =
    dataObj.conversationId ??
    (dataObj.conversation as any)?.id ??
    dataObj.chatId ??
    rawList[0]?.conversationId ??
    null;
  const convId = convIdRaw != null ? String(convIdRaw) : '';
  return { messages, conversationId: convId };
}

export async function fetchConversations(): Promise<any[]> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) throw new Error('Not signed in');

  const res = await fetch(`${base}/api/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  throwIfApiFailed(res, body);

  const rawPayload = body.data ?? body;
  const rows = extractConversationArray(rawPayload);

  let myId: string | null = null;
  try {
    const me = await fetchCurrentUser();
    myId = me?.id != null ? String(me.id) : null;
  } catch {
    myId = decodeJwtUserId(token);
  }

  const normalized = rows.map((row: any) => {
    const peer = peerUserIdFromRow(row, myId);
    const explicitConv =
      row.conversationId ?? row.conversationUuid ?? row.chatId;
    const serverPartnerId =
      row.id != null && String(row.id).length > 0 ? String(row.id) : null;
    const navId = serverPartnerId ?? peer ?? '';
    return {
      ...row,
      ...(explicitConv != null ? { conversationId: explicitConv } : {}),
      id: navId,
      name: row.name ?? row.lawyerName ?? row.partnerName ?? '',
    };
  }).filter((row: any) => {
    if (!row?.id) return false;
    if (myId && String(row.id) === String(myId)) return false;
    return true;
  });

  const dedup = new Map<string, any>();
  for (const row of normalized) {
    const k = String(row.id);
    if (!dedup.has(k)) dedup.set(k, row);
  }
  return Array.from(dedup.values());
}

export async function sendMessage(receiverId: string, text: string): Promise<any> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) throw new Error('Not signed in');

  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId, text }),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  throwIfApiFailed(res, body);

  return body.data ?? body;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) throw new Error('Not signed in');

  const res = await fetch(`${base}/api/chat/message/${encodeURIComponent(messageId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  throwIfApiFailed(res, body);
}

export async function clearConversation(receiverId: string): Promise<void> {
  const base = getBaseUrl();
  const token = await getSessionToken();
  if (!base || !token) throw new Error('Not signed in');

  const res = await fetch(`${base}/api/chat/conversation/${encodeURIComponent(receiverId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  throwIfApiFailed(res, body);
}
