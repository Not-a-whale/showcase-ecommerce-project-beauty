import { Injectable } from '@nestjs/common';
import { HealthCheckResponse } from '@ecommerce/shared-types';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }
}
