import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        const responseMessage = resp.message;
        message = typeof responseMessage === 'string' || Array.isArray(responseMessage)
          ? (responseMessage as string | string[])
          : exception.message;
        code = (resp.error as string) || exception.name;
        details = resp.details;
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      success: false,
      error: { code, message, details, statusCode: status },
    });
  }
}
