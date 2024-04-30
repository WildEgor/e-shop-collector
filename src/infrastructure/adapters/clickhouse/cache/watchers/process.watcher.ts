import { ChunkId } from '../cache.interfaces';
import { ChunkRegistry } from '../chunk-registry';
import { IRowProps } from '../row/row.interfaces';
import { DataWatcher } from './abstract';
import { IDataWatcherOptions, ILoad, ISave } from './watchers.interfaces';

export class ProcessWatcher extends DataWatcher {

  readonly _registry: ChunkRegistry;
  readonly _chunkRows: Record<ChunkId, IRowProps[]>;

  constructor(registry: ChunkRegistry, options: IDataWatcherOptions) {
    super(options);

    this._chunkRows = {};
    this._registry = registry;
  }

  public async save(op: ISave): Promise<void> {
    if (!this._registry.getOne(op.chunkRef.id)) {
      this._registry.register(op.chunkRef);
    }

    if (!this.isWriteable()) {
      await this.toBeUnblocked();
    }

    if (!this._chunkRows[op.chunkRef.id]) {
      this._chunkRows[op.chunkRef.id] = [];
    }

    this._chunkRows[op.chunkRef.id].push(
      ...op.insertRows.map(row => ({
        chunkId: op.chunkRef.id,
        table: op.chunkRef.table,
        row,
      })),
    );

    this._registry.increaseSize(op.chunkRef.id, op.insertRows.length);
  }

  // eslint-disable-next-line require-await
  public async load(chunkId: ChunkId): Promise<ILoad> {
    const loadedRows = this._chunkRows[chunkId] ?? [];

    return {
      loadedRows,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,no-empty-function
  public async cleanup(): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function,no-empty-function
  public backupRuntimeCache(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/explicit-function-return-type,no-empty-function
  public async restore() {}

  public countRows(chunkId: ChunkId): number {
    return this._registry.getOne(chunkId).size;
  }

}
