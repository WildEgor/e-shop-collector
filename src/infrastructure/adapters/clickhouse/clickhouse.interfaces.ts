import { ModuleMetadata, Type } from '@nestjs/common';
import { ICacheOptions } from './cache/cache.interfaces';
import { IClickhouseConnectionOptions, IClickhouseSettings } from './client';

export interface IClickhouseLogger {
  log(...args: unknown[]): unknown;

  debug(...args: unknown[]): unknown;

  warn(...args: unknown[]): unknown;

  error(...args: unknown[]): unknown;
}

export interface IClickhouseModuleOptions {
  connection: IClickhouseConnectionOptions;
  settings: IClickhouseSettings;
  cache: ICacheOptions;
}

export interface IClickhouseOptionsFactory {
  createClickhouseOptions():
  | Promise<IClickhouseModuleOptions>
  | IClickhouseModuleOptions;
}

export interface IClickhouseAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting: Type<IClickhouseOptionsFactory>;
}
