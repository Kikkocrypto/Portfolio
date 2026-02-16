import { adminFetch } from '@/api/authClient';
import type { AdminMessage, PagedMessagesResponse } from '@/types/messages';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isSafeMessageItem(raw: unknown): raw is AdminMessage {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return (
    isNonEmptyString(o.id) &&
    typeof o.name === 'string' &&
    typeof o.email === 'string' &&
    typeof o.message === 'string' &&
    (o.receivedAt === null || typeof o.receivedAt === 'string')
  );
}

function parseMessage(raw: unknown): AdminMessage {
  if (!isSafeMessageItem(raw)) {
    throw new Error('INVALID_RESPONSE');
  }
  return {
    id: raw.id,
    name: String(raw.name),
    email: String(raw.email),
    message: String(raw.message),
    receivedAt: raw.receivedAt == null ? '' : String(raw.receivedAt),
  };
}

function isPagedResponse(raw: unknown): raw is PagedMessagesResponse {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.content)) return false;
  if (typeof o.totalPages !== 'number' || typeof o.totalElements !== 'number') return false;
  if (typeof o.number !== 'number' || typeof o.size !== 'number') return false;
  if (typeof o.first !== 'boolean' || typeof o.last !== 'boolean') return false;
  return true;
}

/**
 * Fetches paginated contact messages. Uses credentials (adminFetch sends Bearer).
 * Validates response structure; throws on invalid shape or 401/403.
 */
export async function getMessages(
  page: number,
  signal?: AbortSignal
): Promise<PagedMessagesResponse> {
  const path = `/messages?page=${Math.max(0, Math.floor(page))}`;
  const res = await adminFetch(path, { method: 'GET', credentials: 'include', signal });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (res.status === 403) {
    throw new Error('FORBIDDEN');
  }
  if (!res.ok) {
    throw new Error(res.status === 429 ? 'RATE_LIMIT' : 'FETCH_FAILED');
  }

  const contentType = res.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('INVALID_RESPONSE');
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!isPagedResponse(data)) {
    throw new Error('INVALID_RESPONSE');
  }

  const content = (data.content ?? []).map((item) => parseMessage(item));
  return {
    content,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    number: data.number,
    size: data.size,
    first: data.first,
    last: data.last,
  };
}

/**
 * Deletes a contact message by ID. 204 on success.
 * 401/403 handled via authClient; 404 or invalid response throws.
 */
export async function deleteMessage(id: string, signal?: AbortSignal): Promise<void> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('INVALID_ID');
  }
  const path = `/messages/${encodeURIComponent(id.trim())}`;
  const res = await adminFetch(path, { method: 'DELETE', credentials: 'include', signal });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (res.status === 403) {
    throw new Error('FORBIDDEN');
  }
  if (res.status === 404) {
    throw new Error('NOT_FOUND');
  }
  if (res.status !== 204) {
    throw new Error('DELETE_FAILED');
  }
}
