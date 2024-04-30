import * as EventEmitter from 'node:events';
import { ChunkId } from '../cache.interfaces';
import { WatcherEvents } from './watchers.constants';
import { IDataWatcherOptions, ILoad, ISave } from './watchers.interfaces';

export abstract class DataWatcher<
  TS extends ISave = ISave,
  TL extends ILoad = ILoad,
  TO extends IDataWatcherOptions = IDataWatcherOptions,
> {

  private readonly _emitter: EventEmitter;
  public readonly _options: TO;
  private _writeable: boolean;

  constructor(options: TO) {
    this._writeable = true;

    this._emitter = new EventEmitter();
    this._options = options;

    this._emitter.on(WatcherEvents.Block, () => this.setWriteable(false));
    this._emitter.on(WatcherEvents.Unblock, () => this.setWriteable(true));
  }

  public setWriteable(state: boolean): void {
    this._writeable = state;
  }

  public isWriteable(): boolean {
    return this._writeable;
  }

  // eslint-disable-next-line require-await
  public async toBeUnblocked(): Promise<void> {
    const fn = (resolve: (...args: any[]) => void): EventEmitter =>
      this._emitter.on(WatcherEvents.Unblock, resolve);

    // eslint-disable-next-line no-promise-executor-return
    return new Promise<void>(resolve => fn(resolve));
  }

  public abstract save(storeContract: TS): Promise<void>;

  public abstract load(chunkId: ChunkId): Promise<TL>;

  public abstract backupRuntimeCache(): void;

  public abstract restore(): Promise<void>;

  public abstract cleanup(chunkId: ChunkId): Promise<void>;

  public abstract countRows(chunkId: ChunkId): number;

}
