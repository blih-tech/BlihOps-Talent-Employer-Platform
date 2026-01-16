import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'BlihOps Talent & Employer Platform API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}





