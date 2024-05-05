import { ITaxiTripPayload, ITopicFeedbackPayload } from './payload.interfaces';

export interface IAnalyticsRepository {
  saveTaxiTrip(data: ITaxiTripPayload): Promise<void>;
  saveTopicFeedback(data: ITopicFeedbackPayload): Promise<void>;
}
