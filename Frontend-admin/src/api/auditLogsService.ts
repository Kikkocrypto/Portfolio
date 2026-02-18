import { adminFetch } from '@/api/authClient';
import type { AuditLogEntry, PagedAuditLogsResponse } from '@/types/auditLogs';

const MAX_ACTION_LEN = 100;
const MAX_ENTITY_LEN = 80;
const MAX_USER_LEN = 255;
const MAX_IP_LEN = 64;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function safeStr(v: unknown, maxLen: number): string {
  if (v == null) return '';
  const s = String(v);
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function isSafeAuditLogItem(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.action === 'string';
}

function parseAuditLogEntry(raw: unknown): AuditLogEntry {
  if (!isSafeAuditLogItem(raw)) {
    throw new Error('INVALID_RESPONSE');
  }
  const o = raw as Record<string, unknown>;
  const timestamp = o.timestamp != null ? String(o.timestamp) : '';
  return {
    id: String(o.id ?? ''),
    action: safeStr(o.action, MAX_ACTION_LEN),
    entity: safeStr(o.resourceType, MAX_ENTITY_LEN),
    userEmail: safeStr(o.actor, MAX_USER_LEN),
    timestamp,
    ipAddress: safeStr(o.ipAddress, MAX_IP_LEN),
  };
}

/** Forma grezza validata della risposta paginata (content ancora unknown[]). */
interface PagedAuditLogsRaw {
  content: unknown[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

function isPagedAuditLogsResponse(raw: unknown): raw is PagedAuditLogsRaw {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return Array.isArray(o.content)
    && typeof o.totalPages === 'number'
    && typeof o.totalElements === 'number'
    && typeof o.number === 'number'
    && typeof o.size === 'number'
    && typeof o.first === 'boolean'
    && typeof o.last === 'boolean';
}

function buildQueryString(params: {
  page: number;
  action?: string;
  userEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}): string {
  const search = new URLSearchParams();
  search.set('page', String(Math.max(0, Math.floor(params.page))));
  if (isNonEmptyString(params.action)) search.set('action', params.action.trim());
  if (isNonEmptyString(params.userEmail)) search.set('userEmail', params.userEmail.trim());
  if (isNonEmptyString(params.dateFrom)) search.set('dateFrom', params.dateFrom.trim());
  if (isNonEmptyString(params.dateTo)) search.set('dateTo', params.dateTo.trim());
  return search.toString();
}

/**
 * Fetches paginated audit logs. ADMIN only. Validates response; throws on invalid shape or 401/403.
 */
export async function getAuditLogs(
  params: { page: number; action?: string; userEmail?: string; dateFrom?: string; dateTo?: string },
  signal?: AbortSignal
): Promise<PagedAuditLogsResponse> {
  const qs = buildQueryString(params);
  const path = `/audit-logs?${qs}`;
  const res = await adminFetch(path, { method: 'GET', credentials: 'include', signal });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (!res.ok) throw new Error(res.status === 429 ? 'RATE_LIMIT' : 'FETCH_FAILED');

  const contentType = res.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) throw new Error('INVALID_RESPONSE');

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!isPagedAuditLogsResponse(data)) throw new Error('INVALID_RESPONSE');

  const content = (data.content as unknown[]).map((item) => parseAuditLogEntry(item));
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
