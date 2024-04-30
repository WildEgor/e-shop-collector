import { Module } from '@nestjs/common';
import { InjectTypes } from '../../infrastructure/types/inject';
import { CollectorConsumer } from './application/collector.consumer';
import { AnalyticsRepository } from './infrastructure/repositories/analytics.repository';

@Module({
  controllers: [CollectorConsumer],
  providers: [
    {
      provide: InjectTypes.AnalyticsRepository,
      useClass: AnalyticsRepository,
    },
  ],
})
export class CollectorModule {}
