import { ChunkId, Table } from './cache.interfaces';
import { Chunk } from './chunk/chunk';
import { IChunkState, IRegistryState } from './chunk/chunk.interfaces';

/**
 * InMemoryPool is a subset of ChunkPool abstraction
 * This pool saves rows in chunks that are stored in process memory
 *
 * @warning storing data in process memory can lead you to LOSS OF CONSISTANCE
 * but instead of this disadvantage you gain the cheapest and the most simple way to work
 * with clickhouse
 *
 * Data loss can only occur in two cases:
 * 1. When OS sends to a process SIGKILL code which is killing your process without grace
 * 2. When some piece of data contains anomalies such as `undefined` etc
 */
export class ChunkRegistry {

  private readonly _registry: IRegistryState;

  /**
   * Create InMemoryPool instance
   */
  constructor() {
    this._registry = {
      tableChunk: {},
      chunkTable: {},
      chunks: {},
    };
  }

  public increaseSize(id: ChunkId, delta: number): void {
    this._registry.chunks[id].size += delta;
    this._registry.chunks[id].ref.size += delta;
  }

  public decreaseSize(id: ChunkId, delta: number): void {
    this._registry.chunks[id].size -= delta;
    this._registry.chunks[id].ref.size -= delta;
  }

  public register(chunk: Chunk): void {
    this._registry.chunkTable[chunk.id] = chunk.table;
    this._registry.tableChunk[chunk.table] = chunk.id;

    this._registry.chunks[chunk.id] = {
      ref: chunk,
      expiredAt: chunk.expiredAt,
      size: chunk.size,
    };
  }

  public unregister(id: ChunkId): void {
    if (this._registry.chunks[id]) {
      const table = this._registry.chunkTable[id];

      delete this._registry.tableChunk[table];
      delete this._registry.chunkTable[id];
      delete this._registry.chunks[id];
    }
  }

  public getOne(id: ChunkId): IChunkState {
    return this._registry.chunks[id];
  }

  public getAll(): IChunkState[] {
    return Object.values(this._registry.chunks);
  }

  public isEmpty(): boolean {
    return 0 === Object.keys(this._registry.chunks).length;
  }

  public getTables(): Table[] {
    return Object.keys(this._registry.tableChunk);
  }

  public getChunks(): ChunkId[] {
    return Object.keys(this._registry.chunks);
  }

}
