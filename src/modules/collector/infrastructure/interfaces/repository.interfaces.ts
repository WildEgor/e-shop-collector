import { ITaxiTripPayload } from './payload.interfaces';

export interface IAnalyticsRepository {
  save(data: ITaxiTripPayload): Promise<void>;
}
