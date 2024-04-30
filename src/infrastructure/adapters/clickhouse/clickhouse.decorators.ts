import { Inject } from '@nestjs/common';
import { ClickhouseConstants } from './clickhouse.constants';

export const InjectClickhouseClient = (): ReturnType<typeof Inject> =>
  Inject(ClickhouseConstants.client);

export const InjectClickhouseResolver = (): ReturnType<typeof Inject> =>
  Inject(ClickhouseConstants.resolver);
