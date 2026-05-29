export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface OffsetPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorParams {
  cursor?: string;
  limit?: number;
}

export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

// Notification types (for wishlist feature)
export enum NotificationType {
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  ORDER_STATUS = 'ORDER_STATUS',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface HealthCheckResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}


