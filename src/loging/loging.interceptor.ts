import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import * as path from 'path';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as winston from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: winston.Logger;

  constructor() {
    const logFilePath = path.join('logs', 'requests.log');
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.File({ filename: logFilePath })],
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const beforeReqTime = Date.now();
    const method = context.switchToHttp().getRequest().method;
    const url = context.switchToHttp().getRequest().url;

    return next.handle().pipe(
      tap(() => {
        const afterReqTime = Date.now();
        const logMessage = {
          method,
          url,
          responseTime: `${afterReqTime - beforeReqTime}ms`,
          timestamp: new Date().toISOString(),
        };

        this.logger.info(logMessage);
      }),
    );
  }
}