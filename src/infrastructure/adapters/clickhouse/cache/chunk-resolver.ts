import { E_CODES } from './cache.constants';
import { ICacheOptions, InsertRow } from './cache.interfaces';
import { ChunkRegistry } from './chunk-registry';
import { Chunk } from './chunk/chunk';
import { ChunkLoader } from './chunk/chunk-loader';
import { TOnResolved, TOnResolvedAsync } from './chunk/chunk.interfaces';
import { Queue } from './queue/queue';
import { Utils } from './utils/utils';
import { DataWatcher } from './watchers/abstract';
import { DiskWatcher } from './watchers/disk.watcher';

/**
 * ChunkResolver is the central element of the application,
 * which implements all the logic of working with the caching process
 * and provides an API for interacting "outside"
 */
export class ChunkResolver {

  private readonly _dataWatcher: DataWatcher;
  private readonly _registry: ChunkRegistry;
  private readonly _options: ICacheOptions;
  private readonly _handlers: Map<string, TOnResolved | TOnResolvedAsync>;
  private _toResolveQueue: Queue<Chunk>;
  private _watchingToResolveQueueEnabled: boolean;
  private _watchingEnabled: boolean;
  private _commandStop: boolean;
  private readonly _isLogging: boolean;
  private readonly _debugMode: boolean;

  /**
   * Create ChunkResolver instance
   *
   * @param {ResolverOptions} options
   */
  constructor(options: ICacheOptions) {
    /**
     * Data watcher is "the hands" off the package
     * It allows to this class to interact with stored data (memory, disk or cloud)
     */
    this._options = options;
    this._watchingToResolveQueueEnabled = false;
    this._watchingEnabled = false;
    this._commandStop = false;
    this._handlers = new Map<string, TOnResolved | TOnResolvedAsync>();
    /**
     * There is defined a queue to proceed chunks consistently
     */
    this._toResolveQueue = new Queue<Chunk>();
    /**
     * Registry is a brain of the package
     * It stores metadata and relations and shares it to every part of system
     */
    this._registry = new ChunkRegistry();
    /**
     * Choose available Watcher (now only disk)
     */
    // eslint-disable-next-line default-case
    switch (options.dataWatcher) {
      case 'disk':
        if (!options.disk) {
          throw new Error(E_CODES.E_CONFIG_PARAM_REQUIRED);
        }
        this._dataWatcher = new DiskWatcher(this._registry, {
          disk: options.disk,
          chunkSize: options.chunkSize,
        });
        break;
    }
    /**
     * Enable debug mode if it is defined
     */
    this._debugMode = !!this._options.enableDebug;
    /**
     * Enable logging if logger is defined
     */
    this._isLogging = !!this._options.logger;
    /**
     * On init we have to restore already existing data from watcher
     * and start pending
     */
    this._dataWatcher.restore().then(() => new Promise(resolve => setTimeout(resolve, 5000))).then(async() => {
      if (this._isLogging) {
        this._options.logger.log('Restore data from watcher');
      }
      await this._startWatching();
    });
    /**
     * Enable graceful shutdown
     */
    this._setupShutdownHandler();
  }

  /**
   * Pass your data in this method to store it
   *
   * It registers data in the system registry and saves it though the chosen data watcher
   *
   * @warning This method does not guarantee the validation of the transmitted data,
   * which may subsequently affect the outcome of inserting a chunk into the DBMS.
   * Be confident to validate it itself
   *
   * @param {Table} tableName table name
   * @param {InsertRow[]} rows list of rows
   * @returns
   */
  public async cache(tableName: string, rows: InsertRow[]): Promise<void> {
    const chunkedRowsList = Utils.chunkList(rows, this._options.chunkSize);

    if (this._isLogging && this._debugMode) {
      this._options.logger.debug(`Cache ${tableName} rows ${rows.length}`);
      this._options.logger.debug(JSON.stringify(rows));
    }

    for (const chunkedRows of chunkedRowsList) {
      while (chunkedRows.length) {
        let chunk: Chunk | undefined = this._registry
          .getAll()
          .find(state => state.ref.size < this._options.chunkSize)?.ref;

        if (!chunk) {
          chunk = Chunk.createScratchChunk({
            dataWatcher: this._dataWatcher,
            chunk: {
              table: tableName,
              liveAtLeastMs: this._options.chunkLifeMs,
            },
          });
          this._registry.register(chunk);
        }

        const sizeToSave = Math.abs(this._options.chunkSize - chunk.size);
        const rowsToSave = chunkedRows.splice(0, sizeToSave);

        await this._dataWatcher.save({
          chunkRef: chunk,
          insertRows: rowsToSave,
        });
      }
    }

    await this._startWatching();
  }

  /**
   * It registers a handler for resolved chunks
   * Pass @sync or @async callback and use it to save data to your DBMS
   */
  public onResolved(onResolved: TOnResolved | TOnResolvedAsync): void {
    this._handlers.set(Utils.uuid(), onResolved);
  }

  // eslint-disable-next-line require-await
  private _setupShutdownHandler(): void {
    const handleSignal = (signal: NodeJS.Signals): void => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const signalHandler: NodeJS.BeforeExitListener = (code: number) => {
        if (this._isLogging) {
          this._options.logger.warn(
            `Initialize chunks backup due to received ${signal} signal ${code}`,
          );
        }
        // set pending off
        this._commandStop = true;
        // Synchronously backup runtime data
        this._dataWatcher.backupRuntimeCache();
        process.exit(0);
      };

      process.on(signal, signalHandler);
    };

    handleSignal('SIGTERM');
    handleSignal('SIGINT');
  }

  /**
   * Service method to start pending
   */
  private async _startWatching(): Promise<void> {
    if (this._isLogging && this._debugMode) {
      this._options.logger.debug('Start watching');
    }

    await this._startWatchingRegistry();
    await this._startWatchingToResolveQueue();
  }

  /**
   * A method to start a loop to check there are chunks in our registry
   */
  private async _startWatchingRegistry(): Promise<void> {
    if (this._isLogging && this._debugMode) {
      this._options.logger.debug('Start watching registry');
    }

    if (!this._watchingEnabled) {
      this._watchingEnabled = true;
      await this._watchRegistry();
    }
  }

  /**
   * It searches in a loop for come chunks which are ready to be resolved
   * The chunk is considered to be resolved if:
   * - it is expired by the time
   * - it has reached the size limit
   * - it is consistent (i.e it has no running async operations currently)
   *
   * When the chunk matches conditions,
   * the system removes it from registry and puts to a resolve queue
   */
  private async _watchRegistry(): Promise<void> {
    while (!this._registry.isEmpty() && !this._commandStop) {
      const snapshot = this._registry.getAll();

      if (!snapshot.length) {
        continue;
      }

      for (const state of snapshot) {
        const isReady = state.ref.isReady();
        const isConsistent = state.ref.isConsistent();
        const canBlock = isReady;
        const canResolve = isConsistent && isReady;

        if (canBlock) {
          state.ref.block();
        }

        // Add chunk to queue
        if (canResolve) {
          if (this._isLogging && this._debugMode) {
            this._options.logger.debug('Restore data from watcher');
          }

          this._registry.unregister(state.ref.id);
          this._toResolveQueue.enqueue(state.ref);
          this._startWatchingToResolveQueue().then().catch();
        }

        // Sleep before next iteration
        await Utils.sleep(this._options.checkIntervalMs);
      }
    }

    this._watchingEnabled = false;
  }

  /**
   * A method to start a loop to pass chunks outside and resolve
   */
  private async _startWatchingToResolveQueue(): Promise<void> {
    if (this._isLogging && this._debugMode) {
      this._options.logger.debug('Start watching resolve queue');
    }

    if (!this._watchingToResolveQueueEnabled) {
      this._watchingToResolveQueueEnabled = true;
      await this._watchToResolveQueue();
    }
  }

  /**
   * It handles chunks in a loop, one by one from queue
   * To pass chunk outside and then resolves it
   *
   * Resolve is a required process to clenup chunk data from storage (process memory, disk space or cloud)
   */
  private async _watchToResolveQueue(): Promise<void> {
    while (!this._toResolveQueue.isEmpty() && !this._commandStop) {
      const chunk = this._toResolveQueue.dequeue();
      if (!chunk) {
        continue;
      }

      if (!this._handlers.size) {
        /**
         * there is no any handler to pass rows
         * stop next steps to avoid data lose
         */
        throw new Error(E_CODES.E_NO_HANDLER);
      }

      const handlers = Array.from(this._handlers.entries());

      // return to queue if chunk has inconsistent state
      if (!chunk.isConsistent()) {
        this._toResolveQueue.enqueue(chunk);
        continue;
      }

      while (!chunk.isConsistent()) {
        continue;
      }

      if (this._isLogging && this._debugMode) {
        this._options.logger.debug(
          `Resolve chunk id ${chunk.id} for table ${chunk.table}`,
        );
      }

      /**
       * Invoke chunk to all registered handlers
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const handlerPromises = handlers.map(([_handlerId, handlerFunction]) => {
        /**
         * Convert sync callback to a Promise
         */
        if ('AsyncFunction' === handlerFunction.constructor.name) {
          return (handlerFunction as TOnResolved)(new ChunkLoader(chunk));
        }

        return new Promise<ReturnType<TOnResolved>>(resolve => {
          resolve((handlerFunction as TOnResolved)(new ChunkLoader(chunk)));
        });
      });

      await Promise.allSettled(handlerPromises).finally(async() => {
        await chunk.resolve();
      });
    }

    this._watchingToResolveQueueEnabled = false;
  }

}
