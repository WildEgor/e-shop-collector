import * as fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ChunkId } from '../cache.interfaces';
import { ChunkRegistry } from '../chunk-registry';
import { Chunk } from '../chunk/chunk';
import { IChunkMetadata } from '../chunk/chunk.interfaces';
import { DataWatcher } from './abstract';
import {
  IDiskLoad,
  IFsWatcherOptions,
  ISave,
  TChunkCache,
} from './watchers.interfaces';

export class DiskWatcher extends DataWatcher<
ISave,
IDiskLoad,
IFsWatcherOptions
> {

  readonly _registry: ChunkRegistry;
  readonly _options: IFsWatcherOptions;
  readonly _chunks: Map<ChunkId, TChunkCache>;

  constructor(registry: ChunkRegistry, options: IFsWatcherOptions) {
    super(options);
    this._registry = registry;
    this._options = options;
    /**
     * Runtime cache storage
     */
    this._chunks = new Map<ChunkId, TChunkCache>();
  }

  public async save(op: ISave): Promise<void> {
    if (!op.insertRows.length) {
      return;
    }

    if (!this.isWriteable()) {
      await this.toBeUnblocked();
    }

    const operationId = uuidv4();

    op.chunkRef.setConsistency(false);

    const cachedChunk = this._chunks.get(op.chunkRef.id);
    if (!cachedChunk) {
      this._chunks.set(op.chunkRef.id, {
        ref: op.chunkRef,
        operations: {},
      });
    }
    if (cachedChunk) {
      cachedChunk.operations[operationId] = op.insertRows;
      this._chunks.set(op.chunkRef.id, cachedChunk);
    }

    // Make dir for restore cache if not exists
    try {
      await fs.stat(this._options.disk.outputDirectory);
    }
    catch (e) {
      await fs.mkdir(this._options.disk.outputDirectory);
    }

    const chunkFilename = `${op.chunkRef.id}.txt`;
    const chunkPathname = path.resolve(
      this._options.disk.outputDirectory,
      chunkFilename,
    );

    try {
      await fs.stat(chunkPathname);
    }
    catch (e) {
      const metadata = {
        table: op.chunkRef.table,
        expiresAt: op.chunkRef.expiredAt,
      };
      await fs.writeFile(chunkPathname, `${JSON.stringify(metadata)}\n`);
    }

    /**
     * Need some kind of schema to optimize
     */
    const storeData = op.insertRows
      .map(row => JSON.stringify(row))
      .join('\n')
      .concat('\n');

    await fs.appendFile(chunkPathname, storeData);

    this._registry.increaseSize(op.chunkRef.id, op.insertRows.length);
    op.chunkRef.setConsistency(true);

    if (cachedChunk) {
      delete cachedChunk.operations[operationId];
      this._chunks.set(op.chunkRef.id, cachedChunk);
    }
  }

  public async load(chunkId: string): Promise<IDiskLoad> {
    const chunkFilename = `${chunkId}.txt`;
    const chunkPathname = path.resolve(
      this._options.disk.outputDirectory,
      chunkFilename,
    );

    const data = await fs.readFile(chunkPathname, { encoding: 'utf8' });

    const [strMetadata, ...strRows] = data.trim().split('\n');

    const metadata: IChunkMetadata = JSON.parse(strMetadata);
    const rows: Record<string, unknown>[] = [];

    for (const row of strRows) {
      rows.push(JSON.parse(row));
    }

    const chunk = new Chunk({
      dataWatcher: this,
      chunk: {
        id: chunkId,
        table: metadata.table,
        expiredAt: metadata.expiredAt,
        size: rows.length,
      },
    });

    return {
      chunkRef: chunk,
      loadedRows: rows,
    };
  }

  public backupRuntimeCache(): void {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const [chunkId, chunkCache] of this._chunks.entries()) {
      const chunkDirectoryExists = fsSync.existsSync(
        this._options.disk.outputDirectory,
      );
      if (!chunkDirectoryExists) {
        fsSync.mkdirSync(this._options.disk.outputDirectory);
      }

      const chunkFilename = `${chunkId}.txt`;
      const chunkPathname = path.resolve(
        this._options.disk.outputDirectory,
        chunkFilename,
      );
      const chunk = chunkCache.ref;

      const chunkExists = fsSync.existsSync(chunkPathname);
      if (!chunkExists && chunk) {
        const metadata = {
          table: chunk.table,
          expiresAt: chunk.expiredAt,
        };
        fsSync.writeFileSync(chunkPathname, `${JSON.stringify(metadata)}\n`);
      }

      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const operationId in chunkCache.operations) {
        const runtimeRows = chunkCache.operations[operationId];

        /**
         * Need some kind of schema to optimize
         */
        const storeData = runtimeRows
          .map(row => JSON.stringify(row))
          .join('\n')
          .concat('\n');

        fsSync.appendFileSync(chunkPathname, storeData);

        chunkCache.ref.setConsistency(true);
        delete chunkCache.operations[operationId];
        this._chunks.set(chunkId, chunkCache);

        console.log(
          `[DiskWatcher] Successfully backed up operation ${operationId} of chunk ${chunkId} with ${runtimeRows.length} rows`,
        );
      }
    }
  }

  public async restore(): Promise<void> {
    try {
      await fs.stat(this._options.disk.outputDirectory);
    }
    catch (e) {
      return;
    }

    const files = await fs.readdir(this._options.disk.outputDirectory);

    for (const filename of files) {
      const isChunkFile = filename.includes('.txt');
      if (!isChunkFile) {
        continue;
      }

      const chunkId = filename.split('.txt').join('');

      const loaded = await this.load(chunkId);

      this._registry.register(loaded.chunkRef);
    }
  }

  public async cleanup(chunkId: string): Promise<void> {
    const chunkFilename = `${chunkId}.txt`;
    const chunkPathname = path.resolve(
      this._options.disk.outputDirectory,
      chunkFilename,
    );
    this._chunks.delete(chunkId);
    await fs.unlink(chunkPathname);
  }

  public countRows(chunkId: string): number {
    return this._registry.getOne(chunkId).size;
  }

}
