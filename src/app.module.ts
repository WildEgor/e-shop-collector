import { Module } from '@nestjs/common';
import { ClickhouseModule } from '@adapters/clickhouse';
import { ClickhouseConfig } from '@config/clickhouse.config';
import { ConfigsModule } from '@config/configs.module';
import { CollectorModule } from '@modules/collector/collector.module';
import { MigratorModule } from '@modules/migrator/migrator.module';

@Module({
  imports: [
    ConfigsModule,
    ClickhouseModule.forRootAsync({
      imports: [ConfigsModule],
      useExisting: ClickhouseConfig,
    }),
    CollectorModule,
    MigratorModule,
  ],
})
export class AppModule {}
