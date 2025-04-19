import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import * as winston from 'winston';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private logger: winston.Logger;
  
    constructor() {
      const transports: winston.transport[] = [];
  
      if (process.env.NODE_ENV === 'production') {
        transports.push(new winston.transports.Console());
      } else {
        transports.push(
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          })
        );
      }
  
      this.logger = winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        transports,
      });
    }
  
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const logMessage = {
        message: exception.message,
        statusCode: status,
        method: request.method,
        path: request.url,
        timestamp: new Date().toISOString(),
      };
  
      this.logger.error(logMessage);
  
      response.status(status).json(logMessage);
    }
  }
  