import { ChunkId, Table } from '../cache.interfaces';
import { DataWatcher } from '../watchers/abstract';
import { Chunk } from './chunk';
import { ChunkLoader } from './chunk-loader';

/**
 * @description TODO
 */
export interface IChunkData {
  id: ChunkId;
  size: number;
  table: Table;
  expiredAt: number;
}

/**
 * @description TODO
 */
export interface IChunkMetadata {
  table: string;
  expiredAt: number;
}

/**
 * @description TODO
 */
export interface IScratchChunkData {
  table: Table;
  liveAtLeastMs: number;
}

/**
 * @description TODO
 */
export interface IScratchChunkOptions {
  dataWatcher: DataWatcher;
  chunk: IScratchChunkData;
}

/**
 * @description TODO
 */
export interface IChunkOptions {
  dataWatcher: DataWatcher;
  chunk: IChunkData;
}

/**
 * @description TODO
 */
export interface IChunkState {
  ref: Chunk;
  size: number;
  expiredAt: number;
}

/**
 * @description TODO
 */
export interface IRegistryState {
  chunkTable: Record<string, string>;
  tableChunk: Record<string, string>;
  chunks: Record<ChunkId, IChunkState>;
}

/**
 * @description TODO
 */
export type TOnResolved = (chunk: ChunkLoader) => void;

/**
 * @description TODO
 */
export type TOnResolvedAsync = (chunk: ChunkLoader) => Promise<void>;
