import { Catch, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter {

  private readonly _logger: Logger;

  constructor() {
    this._logger = new Logger(ExceptionFilter.name);
  }

  catch(exception: unknown): Observable<never> {

    if (exception instanceof Error) {
      this._logger.error(exception.message);
      this._logger.error(exception.stack);
    }

    if (exception instanceof RpcException) {
      this._logger.error(exception.getError());
      return throwError(() => exception.getError());
    }

    return throwError(() => new Error('rpc error'));
  }

}
