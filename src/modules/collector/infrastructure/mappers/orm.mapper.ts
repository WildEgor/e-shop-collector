import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { ITaxiTripOrm, ITopicFeedbackOrm } from '../interfaces/orm.interfaces';
import { ITaxiTripPayload, ITopicFeedbackPayload } from '../interfaces/payload.interfaces';

export class OrmMapper {

  public static fromTopicPayloadToOrm(data: ITopicFeedbackPayload): ITopicFeedbackOrm  {
    const model: ITopicFeedbackOrm = {
      id: data.id ?? uuidv4(),
      t_id: data.t_id,
      s_tid: data.s_tid,
      s_tun: data.s_tun,
      s_uid: data.s_uid,
      u_tid: data.u_tid,
      u_tun: data.u_tun,
      rating: data.rating,
    }

    return model
  }

  public static fromTaxiPayloadToOrm(data: ITaxiTripPayload): ITaxiTripOrm {
    const model: ITaxiTripOrm = {
      trip_id: data.trip_id,
      pickup_datetime: DateTime.fromJSDate(data.pickup_datetime).toFormat(
        'yyyy-MM-dd HH:mm:ss',
      ),
      dropoff_datetime: DateTime.fromJSDate(data.dropoff_datetime).toFormat(
        'yyyy-MM-dd HH:mm:ss',
      ),
      pickup_longitude: data.pickup_longitude || 0,
      pickup_latitude: data.pickup_longitude || 0,
      dropoff_longitude: data.dropoff_longitude || 0,
      dropoff_latitude: data.dropoff_latitude || 0,
      passenger_count: data.passenger_count,
      trip_distance: data.trip_distance,
      fare_amount: data.fare_amount,
      extra: data.extra,
      tip_amount: data.tip_amount,
      tolls_amount: data.tolls_amount,
      total_amount: data.total_amount,
      payment_type: data.payment_type,
      pickup_ntaname: data.pickup_ntaname,
      dropoff_ntaname: data.dropoff_ntaname,
    };

    return model;
  }

}
