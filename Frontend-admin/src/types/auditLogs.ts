/**
 * Single audit log entry from GET /api/admin/audit-logs.
 * Backend: id, actor, action, resourceType, resourceId, details, ipAddress, userAgent, timestamp.
 * Frontend maps: userEmail = actor, entity = resourceType.
 */
export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  userEmail: string;
  timestamp: string;
  ipAddress: string;
}

/**
 * Paginated response from GET /api/admin/audit-logs.
 */
export interface PagedAuditLogsResponse {
  content: AuditLogEntry[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * Query params for listing audit logs (filters + pagination).
 */
export interface AuditLogsQuery {
  page: number;
  action?: string;
  userEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}
