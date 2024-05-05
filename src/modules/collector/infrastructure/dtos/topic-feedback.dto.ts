import { MinMaxNumber } from '@wildegor/e-shop-nodepack/modules/libs/core/decorators/number.decorator';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ITopicFeedbackPayload } from '@modules/collector/infrastructure/interfaces/payload.interfaces';

export class TopicFeedbackPayloadDto implements ITopicFeedbackPayload {

  @IsNotEmpty()
  @IsUUID(4)
    id!: string;

  @MinMaxNumber()
    t_id!: number;

  @MinMaxNumber()
    s_tid!: number;

  @IsOptional()
  @IsString()
    s_tun?: string;

  @IsOptional()
  @IsString()
    s_uid?: string;

  @MinMaxNumber()
    u_tid: number;

  @IsOptional()
  @IsString()
    u_tun?: string;

  @MinMaxNumber(1, 5)
    rating: number;

}
