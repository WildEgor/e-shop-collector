import { Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectTypes } from '../../../infrastructure/types/inject';
import { ConsumerController } from '../../../shared/decorators/consumer.decorator';
import { TaxiTripPayloadDto } from '../infrastructure/dtos/taxi-trip.dto';
import { IAnalyticsRepository } from '../infrastructure/interfaces/repository.interfaces';

@ConsumerController()
export class CollectorConsumer {

  constructor(
    @Inject(InjectTypes.AnalyticsRepository)
    protected readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  @MessagePattern('taxi_analytics')
  public async collectTaxiAnalytics(@Payload() data: TaxiTripPayloadDto) {
    await this.analyticsRepository.save(data);
  }

}
