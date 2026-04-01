import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable, throwError, catchError } from 'rxjs';

@Injectable()
export class UtilsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((response) => {
        const responseTime = `${Date.now() - startTime}ms`;
        if (
          response &&
          typeof response === 'object' &&
          ('data' in response || 'message' in response)
        ) {
          return {
            statusCode: res.statusCode,
            success: true,
            message: response.message ?? null,
            meta: response.meta,
            data: response.data,
            responseTime,
          };
        }

        return {
          statusCode: res.statusCode,
          success: true,
          message: response.meta ?? `Request successfully completed`,
          meta: response.data,
          data: response,
          responseTime,
        };
      }),

      catchError((error) => throwError(() => error)),
    );
  }
}
