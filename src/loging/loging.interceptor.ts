import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as winston from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [];

    if (process.env.NODE_ENV === 'production') {
      transports.push(new winston.transports.Console());
    } else {
      transports.push(
        new winston.transports.File({
          filename: 'logs/requests.log',
          level: 'info',
        })
      );
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const beforeReqTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

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
      })
    );
  }
}
