export interface ITaxiTripPayload {
  trip_id: string;
  pickup_datetime: Date;
  dropoff_datetime: Date;
  pickup_longitude?: number;
  pickup_latitude?: number;
  dropoff_longitude?: number;
  dropoff_latitude?: number;
  passenger_count: number;
  trip_distance: number;
  fare_amount: number;
  extra: number;
  tip_amount: number;
  tolls_amount: number;
  total_amount: number;
  payment_type: number;
  pickup_ntaname: string;
  dropoff_ntaname: string;
}

export interface ITopicFeedbackPayload {
  id: string;
  t_id: number;
  s_tid: number;
  s_tun?: string;
  s_uid?: string;
  u_tid: number;
  u_tun?: string;
  rating: number;
}
