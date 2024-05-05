import { TopicFeedbackPayloadDto } from '@modules/collector/infrastructure/dtos/topic-feedback.dto';
import { Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumerController } from '@shared/decorators/consumer.decorator';
import { DatabaseTables } from '@src/infrastructure/types/constants';
import { InjectTypes } from '@src/infrastructure/types/inject';
import { TaxiTripPayloadDto } from '../infrastructure/dtos/taxi-trip.dto';
import { IAnalyticsRepository } from '../infrastructure/interfaces/repository.interfaces';

@ConsumerController()
export class CollectorConsumer {

  constructor(
    @Inject(InjectTypes.AnalyticsRepository)
    protected readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  @MessagePattern(DatabaseTables.TAXI_TRIPS)
  public async collectTaxiAnalytics(@Payload() data: TaxiTripPayloadDto) {
    await this.analyticsRepository.saveTaxiTrip(data);
  }

  @MessagePattern(DatabaseTables.TOPIC_FEEDBACKS)
  public async collectTopicsAnalytics(@Payload() data: TopicFeedbackPayloadDto) {
    await this.analyticsRepository.saveTopicFeedback(data);
  }

}
