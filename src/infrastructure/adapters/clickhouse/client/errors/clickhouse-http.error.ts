/**
 * ClickhouseHttpError is a custom error for handling Axios Crashes or Clickhouse bad responses
 */
// eslint-disable-next-line max-classes-per-file
export class ClickhouseHttpError extends Error {

  status: number;
  statusText: string;
  headers: Record<any, any>;

  /**
   * Create ClickhouseHttpError instance
   *
   * @param error ErrorOptions
   */
  constructor(error: {
    status: number;
    statusText: string;
    message?: string;
    headers: any;
  }) {
    super(error.message);
    this.status = error.status;
    this.statusText = error.statusText;
    this.headers = error.headers;
  }

}

/**
 * HttpClickhouseAxiosError custom HTTP error for Axios client
 */
export class HttpClickhouseAxiosError extends ClickhouseHttpError {}
