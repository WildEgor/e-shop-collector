import { Chunk } from '../chunk/chunk';
import { Row } from '../row/row';

export type TOperationId = string;

export type TChunkCache = {
  ref: Chunk;
  operations: Record<TOperationId, Row[]>;
};

export interface IFsWatcherOptions extends IDataWatcherOptions {
  disk: {
    outputDirectory: string;
  };
}

export interface IDiskLoad extends ILoad {
  chunkRef: Chunk;
}

export interface ILoad {
  loadedRows: Row[];
}

export interface ISave {
  chunkRef: Chunk;
  insertRows: Row[];
}

export interface IDataWatcherOptions {
  chunkSize: number;
}
