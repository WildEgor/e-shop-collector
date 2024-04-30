import { Global, Module } from '@nestjs/common';
import { ConfiguratorModule } from '@wildegor/e-shop-nodepack/modules/libs/configurator/configurator.module';
import { AppConfig } from './app.config';
import { ClickhouseConfig } from './clickhouse.config';
import { ConsumerConfig } from './consumer.config';

@Global()
@Module({
  imports: [
    ConfiguratorModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),
  ],
  providers: [AppConfig, ClickhouseConfig, ConsumerConfig],
  exports: [AppConfig, ClickhouseConfig, ConsumerConfig],
})
export class ConfigsModule {}
