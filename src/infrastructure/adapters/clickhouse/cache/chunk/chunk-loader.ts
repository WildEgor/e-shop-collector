import { Row } from '../row/row';
import { Chunk } from './chunk';

export class ChunkLoader {

  public readonly chunk: Chunk;

  constructor(chunk: Chunk) {
    this.chunk = chunk;
  }

  public async loadRows(): Promise<Row[]> {
    const rows = await this.chunk.loadRows();
    return rows;
  }

}
