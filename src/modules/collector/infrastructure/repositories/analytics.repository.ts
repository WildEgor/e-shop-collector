import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import {
  InjectClickhouseClient,
  InjectClickhouseResolver,
} from '@adapters/clickhouse';
import { ChunkResolver } from '@adapters/clickhouse/cache';
import { InsertRow } from '@adapters/clickhouse/cache/cache.interfaces';
import {
  ClickhouseClient,
  TJSONFormatRow,
} from '@adapters/clickhouse/client';
import { DatabaseTables } from '@src/infrastructure/types/constants';
import { ITaxiTripPayload, ITopicFeedbackPayload } from '../interfaces/payload.interfaces';
import { IAnalyticsRepository } from '../interfaces/repository.interfaces';
import { OrmMapper } from '../mappers/orm.mapper';

@Injectable()
export class AnalyticsRepository
implements IAnalyticsRepository, OnModuleInit {

  private readonly _logger: Logger;

  constructor(
    @InjectClickhouseClient()
    protected readonly client: ClickhouseClient,
    @InjectClickhouseResolver()
    protected readonly resolver: ChunkResolver,
  ) {
    this._logger = new Logger(AnalyticsRepository.name);
  }

  public onModuleInit(): void {
    // eslint-disable-next-line consistent-return
    this.resolver.onResolved(async chunkLoader => {
      const jsonRows = await chunkLoader.loadRows();
      try {
        this._logger.debug(`Inserting ${jsonRows.length} rows into ${chunkLoader.chunk.table}`);
        await this.client.insert(
          chunkLoader.chunk.table,
          jsonRows as TJSONFormatRow[],
        );
      }
      catch (e) {
        this._logger.error(
          `Error inserting rows into ${chunkLoader.chunk.table}`,
          e,
        );
        return this.resolver.cache(
          chunkLoader.chunk.table,
          jsonRows as InsertRow[],
        );
      }
    });
  }

  public async saveTaxiTrip(data: ITaxiTripPayload): Promise<void> {
    const ormModel = OrmMapper.fromTaxiPayloadToOrm(data);
    await this.resolver.cache(DatabaseTables.TAXI_TRIPS, [
      ormModel as unknown as InsertRow,
    ]);
  }

  public async saveTopicFeedback(data: ITopicFeedbackPayload): Promise<void> {
    const ormModel = OrmMapper.fromTopicPayloadToOrm(data);
    await this.resolver.cache(DatabaseTables.TOPIC_FEEDBACKS, [
      ormModel as unknown as InsertRow,
    ]);
  }

}
