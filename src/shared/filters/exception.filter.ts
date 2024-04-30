import { Catch, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter {

  private readonly _logger: Logger;

  constructor() {
    this._logger = new Logger(ExceptionFilter.name);
  }

  catch(exception: RpcException): Observable<any> {
    this._logger.warn(exception.getError());

    return throwError(() => exception.getError());
  }

}
