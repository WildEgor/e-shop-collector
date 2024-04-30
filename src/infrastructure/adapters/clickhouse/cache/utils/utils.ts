import { setTimeout } from 'timers/promises';
import { v4 as uuidv4 } from 'uuid';

export class Utils {

  public static uuid(): string {
    return uuidv4();
  }

  public static uniqueBy<T>(arr: T[], predicate: (item: T) => any): T[] {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const cb
      = 'function' === typeof predicate ? predicate : (o: any) => o[predicate];
    const result: T[] = [];
    const map = new Map();

    // eslint-disable-next-line no-restricted-syntax
    arr.forEach(item => {
      // eslint-disable-next-line callback-return
      const key = null === item || item === undefined ? item : cb(item);

      if (!map.has(key)) {
        map.set(key, item);
        result.push(item);
      }
    });

    return result;
  }

  public static async sleep(ms: number): Promise<void> {
    await setTimeout(ms);
  }

  public static chunkList<T>(array: T[], size = 1): T[][] {
    const arrayChunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      const arrayChunk = array.slice(i, i + size);
      arrayChunks.push(arrayChunk);
    }

    return arrayChunks;
  }

}
