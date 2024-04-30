import https from 'https';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ClickhouseHttpError } from '../errors/clickhouse-http.error';
import {
  IClickhouseHttpClientProps,
  IClickhouseHttpClientRequest,
  IClickhouseHttpClientResponse,
} from './http.interfaces';

/**
 * ClickhouseHttpClient wraps Axios and provides transparent data transferring between your code and clickhouse server
 * It uses HTTP/1 protocol
 */
export class ClickhouseHttpClient {

  private readonly _axiosInstance = axios;
  private readonly _host: string;
  private readonly _port: number;
  private readonly _user: string;
  private readonly _password: string;
  private readonly _dbName: string;
  private readonly _ca?: Buffer;

  /**
   * https://clickhouse.com/docs/en/operations/settings/settings/
   */
  private readonly _clickhouseSettings: Record<string, unknown>;

  /**
   * Create HttpClient instance
   *
   * @param {IClickhouseHttpClientProps} options
   */
  constructor({
    connectionOptions,
    clickhouseSettings = {},
  }: IClickhouseHttpClientProps) {
    this._host = connectionOptions.host;
    this._port = connectionOptions.port;
    this._user = connectionOptions.user;
    this._password = connectionOptions.password;
    this._dbName = connectionOptions.dbName;
    this._ca = connectionOptions.ca;

    this._clickhouseSettings = clickhouseSettings;
  }

  /**
   * Make full axios request and get full Clickhouse HTTP response
   *
   * @param {IClickhouseHttpClientRequest} config request config
   * @returns {Promise<IClickhouseHttpClientResponse>}
   */
  public async request<T>({
    params,
    data = '',
    queryOptions = {},
  }: IClickhouseHttpClientRequest): Promise<IClickhouseHttpClientResponse<T>> {
    const config: AxiosRequestConfig = {
      maxBodyLength: Infinity,
      method: 'POST',
      url: `http://${this._host}:${this._port}`,
      params: new URLSearchParams({
        ...(Boolean(params.query) && { query: params!.query }),
        user: this._user,
        password: this._password,
        database: this._dbName,
        ...this._clickhouseSettings,
        ...queryOptions,
      } as unknown as Record<string, any>),
      data,
    };

    if (this._ca) {
      config.httpsAgent = new https.Agent({ ca: this._ca });
    }

    const response = await this._axiosInstance
      .request(config)
      .catch((error: AxiosError) => {
        throw new ClickhouseHttpError({
          message: error.response?.data as string,
          status: error.response?.status as number,
          statusText: error.response?.statusText as string,
          headers: error.response?.headers,
        });
      });

    return {
      headers: response.headers,
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

}
