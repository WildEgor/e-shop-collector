import { AxiosResponse } from 'axios';
import {
  IClickhouseConnectionOptions,
  IClickhouseQueryOptions,
} from '../clickhouse.interfaces';

export interface IClickhouseRequestParams {
  query: string;
}

export interface IClickhouseHttpClientProps {
  connectionOptions: IClickhouseConnectionOptions;
  clickhouseSettings?: Record<string, unknown>;
}

export interface IClickhouseHttpClientRequest {
  params?: IClickhouseRequestParams;
  data: string;
  queryOptions?: IClickhouseQueryOptions;
}

export interface IClickhouseHttpClientResponse<T> {
  headers: Record<string, unknown>;
  status: AxiosResponse['status'];
  statusText: AxiosResponse['statusText'];
  data: {
    rows: number;
    rows_before_limit_at_least?: number;
    meta: { name: string; type: string }[];
    data: T[];
    statistics: {
      elapsed: number;
      rows_read: number;
      bytes_read: number;
    };
  };
}
