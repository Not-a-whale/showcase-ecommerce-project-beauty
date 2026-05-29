export enum PaymentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

// RabbitMQ event payloads
export interface OrderCreatedEvent {
  orderId: string;
  totalAmount: number;
  userId: string;
}

export interface PaymentClientSecretEvent {
  orderId: string;
  clientSecret: string;
}

export interface PaymentSucceededEvent {
  orderId: string;
}

export interface PaymentFailedEvent {
  orderId: string;
  error: string;
  canRetry: boolean;
}
