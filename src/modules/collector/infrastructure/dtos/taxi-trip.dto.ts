import { MinMaxNumber } from '@wildegor/e-shop-nodepack/modules/libs/core/decorators/number.decorator';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaxiTripPaymentTypes } from '@src/infrastructure/types/constants';
import { ITaxiTripPayload } from '../interfaces/payload.interfaces';

export class TaxiTripPayloadDto implements ITaxiTripPayload {

  @IsNotEmpty()
  @IsString()
  public trip_id!: string;

  @IsNotEmpty()
  @IsString()
  public dropoff_ntaname!: string;

  @MinMaxNumber(0.0)
  public extra!: number;

  @MinMaxNumber(0.0)
  public fare_amount!: number;

  @MinMaxNumber(1)
  public passenger_count!: number;

  @IsEnum(TaxiTripPaymentTypes)
  public payment_type!: number;

  @IsNotEmpty()
  @IsString()
  public pickup_ntaname!: string;

  @MinMaxNumber(0.0)
  public tip_amount!: number;

  @MinMaxNumber(0.0)
  public tolls_amount!: number;

  @MinMaxNumber(0.0)
  public total_amount!: number;

  @MinMaxNumber(0.0)
  public trip_distance!: number;

  @IsNotEmpty()
  // @IsISO8601()
  @Transform(({ value }) => new Date(value))
  public pickup_datetime!: Date;

  @IsNotEmpty()
  // @IsISO8601()
  @Transform(({ value }) => new Date(value))
  public dropoff_datetime!: Date;

  @IsOptional()
  @MinMaxNumber(-180.0, 180.0)
  public dropoff_latitude?: number;

  @IsOptional()
  @MinMaxNumber(-90.0, 90.0)
  public dropoff_longitude?: number;

  @IsOptional()
  @MinMaxNumber(-180.0, 180.0)
  public pickup_latitude?: number;

  @IsOptional()
  @MinMaxNumber(-90.0, 90.0)
  public pickup_longitude?: number;

}
