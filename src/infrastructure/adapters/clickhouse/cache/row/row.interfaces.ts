import { ChunkId, Table } from '../cache.interfaces';
import { Row } from './row';

export interface IRowProps {
  chunkId: ChunkId;
  table: Table;
  row: Row;
}
