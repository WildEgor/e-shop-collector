import { DynamicModule, FactoryProvider, Global, Module } from '@nestjs/common';
import { ChunkResolver } from './cache';
import { ClickhouseConstants } from './clickhouse.constants';
import {
  IClickhouseAsyncOptions,
  IClickhouseModuleOptions,
  IClickhouseOptionsFactory,
} from './clickhouse.interfaces';
import { ClickhouseClient } from './client';

@Global()
@Module({
  imports: [],
})
export class ClickhouseModule {

  public static forRootAsync(
    asyncOptions: IClickhouseAsyncOptions,
  ): DynamicModule {
    const ClickhouseOptionsProvider: FactoryProvider<IClickhouseModuleOptions>
      = {
        provide: ClickhouseConstants.options,
        useFactory: async(factory: IClickhouseOptionsFactory) => {
          const options = await factory.createClickhouseOptions();
          return options;
        },
        inject: [asyncOptions.useExisting],
      };

    const ClickhouseClientProvider: FactoryProvider<ClickhouseClient> = {
      provide: ClickhouseConstants.client,
      useFactory: (opts: IClickhouseModuleOptions) => {
        const client = new ClickhouseClient({
          clickhouseSettings: opts.settings,
          connectionSettings: opts.connection,
        });

        return client;
      },
      inject: [ClickhouseConstants.options],
    };

    const ClickhouseResolverProvider: FactoryProvider<ChunkResolver> = {
      provide: ClickhouseConstants.resolver,
      useFactory: (opts: IClickhouseModuleOptions) => {
        const resolver = new ChunkResolver(opts.cache);
        return resolver;
      },
      inject: [ClickhouseConstants.options],
    };

    const dynamicModule: DynamicModule = {
      module: ClickhouseModule,
      imports: asyncOptions.imports,
      providers: [
        ClickhouseOptionsProvider,
        ClickhouseClientProvider,
        ClickhouseResolverProvider,
      ],
      exports: [
        ClickhouseOptionsProvider,
        ClickhouseClientProvider,
        ClickhouseResolverProvider,
      ],
    };

    return dynamicModule;
  }

}
