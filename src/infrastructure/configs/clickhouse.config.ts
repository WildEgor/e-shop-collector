import { Injectable, Logger } from '@nestjs/common';
import {
  IClickhouseModuleOptions,
  IClickhouseOptionsFactory,
} from '@adapters/clickhouse';
import { ICacheOptions } from '@adapters/clickhouse/cache/cache.interfaces';
import {
  IClickhouseConnectionOptions,
  IClickhouseSettings,
} from '@adapters/clickhouse/client';
import { ConfiguratorService, InjectConfigurator } from '@wildegor/e-shop-nodepack/modules/libs/configurator';

@Injectable()
export class ClickhouseConfig implements IClickhouseOptionsFactory {

  private readonly _connection: IClickhouseConnectionOptions;
  private readonly _settings: IClickhouseSettings;
  private readonly _cache: ICacheOptions;

  constructor(
    @InjectConfigurator() protected readonly configurator: ConfiguratorService,
  ) {
    this._connection = {
      host: configurator.getString('CLICKHOUSE_HOST'),
      port: configurator.getNumber('CLICKHOUSE_PORT'),
      user: configurator.getString('CLICKHOUSE_USER'),
      password: configurator.getRaw<string>('CLICKHOUSE_PASS') || '',
      dbName: configurator.getString('CLICKHOUSE_DB'),
    };

    this._settings = {
      defaultFormat: 'JSON',
    };

    this._cache = {
      chunkLifeMs: 1000,
      chunkSize: 100,
      checkIntervalMs: 5000,
      dataWatcher: 'disk',
      disk: {
        outputDirectory: 'ch_cache',
      },
      enableDebug: true,
      logger: new Logger('ClickhouseModule'),
    };
  }

  public createClickhouseOptions(): IClickhouseModuleOptions {
    return {
      connection: this._connection,
      settings: this._settings,
      cache: this._cache,
    };
  }

}
