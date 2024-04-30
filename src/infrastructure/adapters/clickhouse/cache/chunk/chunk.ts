import { Row } from '../row/row';
import { Utils } from '../utils/utils';
import { DataWatcher } from '../watchers/abstract';
import {
  IChunkData,
  IChunkOptions,
  IScratchChunkOptions,
} from './chunk.interfaces';

/**
 * @description TODO
 */
export class Chunk {

  private readonly _dataWatcher: DataWatcher;
  private readonly _chunk: IChunkData;
  private _isBlocked: boolean;
  private _isConsistent: boolean;
  private _isForceReady: boolean;

  constructor(options: IChunkOptions) {
    this._dataWatcher = options.dataWatcher;
    this._chunk = options.chunk;
    this._isBlocked = false;
    this._isConsistent = true;
    this._isForceReady = false;
  }

  /**
   * @description TODO
   */
  public static create(options: IChunkOptions): Chunk {
    return new Chunk(options);
  }

  public static createScratchChunk(options: IScratchChunkOptions): Chunk {
    const currentTimestamp = Date.now();

    return new Chunk({
      ...options,
      chunk: {
        id: `${options.chunk.table}_${currentTimestamp}_${Utils.uuid()}`,
        size: 0,
        table: options.chunk.table,
        expiredAt: currentTimestamp + (options.chunk.liveAtLeastMs || 0),
      },
    });
  }

  public get id(): string {
    return this._chunk.id;
  }

  public get table(): string {
    return this._chunk.table;
  }

  public get size(): number {
    return this._chunk.size;
  }

  public set size(value: number) {
    this._chunk.size = value;
  }

  public get expiredAt(): number {
    return this._chunk.expiredAt;
  }

  public isExpired(): boolean {
    return Date.now() >= this._chunk.expiredAt;
  }

  public isConsistent(): boolean {
    return this._isConsistent;
  }

  public isUnblocked(): boolean {
    return !this._isBlocked;
  }

  public isReady(): boolean {
    return this._isForceReady || this.isExpired() || this.isOverfilled;
  }

  public block(): void {
    this._isBlocked = true;
  }

  public unblock(): void {
    this._isBlocked = false;
  }

  public setConsistency(state: boolean): void {
    this._isConsistent = state;
  }

  public setReady(): void {
    this._isForceReady = true;
  }

  public async loadRows(): Promise<Row[]> {
    const data = await this._dataWatcher.load(this.id);
    return data.loadedRows;
  }

  public async resolve(): Promise<void> {
    await this._dataWatcher.cleanup(this.id);
  }

  public get isOverfilled(): boolean {
    // eslint-disable-next-line no-underscore-dangle
    return (
      this._dataWatcher.countRows(this.id)
      >= this._dataWatcher._options.chunkSize
    );
  }

}
