import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Consistent JSON shape for every API error. Logs internals server-side
 * but only surfaces the message + status to the client — avoids leaking
 * stack traces or internal error names through 500s.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ url: string; method: string }>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : 500;
    const payload = isHttp ? exception.getResponse() : { message: 'Internal server error' };

    if (!isHttp) {
      this.logger.error(`Unhandled ${req.method} ${req.url}`, exception as Error);
    }

    const body =
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>)
        : { message: payload };

    res.status(status).json({
      statusCode: status,
      path: req.url,
      ...body,
    });
  }
}
