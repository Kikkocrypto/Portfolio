/**
 * Single contact message from GET /api/admin/messages (or by id).
 * receivedAt is ISO string from backend Instant.
 */
export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string;
}

/**
 * Paginated response from GET /api/admin/messages?page=...
 */
export interface PagedMessagesResponse {
  content: AdminMessage[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
