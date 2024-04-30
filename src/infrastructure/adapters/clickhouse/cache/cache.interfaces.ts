import { IClickhouseLogger } from '../clickhouse.interfaces';

export type ChunkId = string;
export type Table = string;
export type InsertRow = Record<string, unknown>;

export interface ICacheOptions {
  chunkLifeMs: number;
  chunkSize: number;
  checkIntervalMs: number;
  dataWatcher: 'disk';
  disk?: {
    outputDirectory: string;
  };
  enableDebug?: boolean;
  logger?: IClickhouseLogger;
}
