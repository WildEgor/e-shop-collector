import ss from 'sqlstring';
import {
  IClickhouseOptimizedJSONInsertFormat,
  TJSONFormatRow,
} from '../clickhouse.interfaces';
import { ClickhouseInsertError } from '../errors/clickhouse-insert.error';
import { ClickhouseCommonUtils } from './common.utils';

export class ClickhouseFormatUtils {

  public static jsonRowsToInsertFormat(
    rows: TJSONFormatRow[],
  ): IClickhouseOptimizedJSONInsertFormat {
    const keys = Object.keys(rows[0]);
    const values = rows.map(row =>
      keys.map(key =>
        ClickhouseFormatUtils.getSimpleValidatedValue(key, row[key]),
      ),
    );
    return {
      keys,
      values,
    };
  }

  public static jsonInsertFormatToSqlValues({
    values: valuesList,
  }: IClickhouseOptimizedJSONInsertFormat): string {
    return valuesList.map(rowValues => `(${rowValues.join(',')})`).join(',');
  }

  public static getSimpleValidatedValue(
    key: string,
    value: unknown | undefined,
  ): string | number {
    const specialOps = new Set('generateUUIDv4()');

    /**
     * Check if column value not exists
     */
    if (value === undefined) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new ClickhouseInsertError(
        `Cannot find value of column and has not default ${value}`,
      );
    }

    /**
     * is Array
     */
    if (Array.isArray(value)) {
      return `[${value
        .map(ClickhouseFormatUtils.getSimpleValidatedValue)
        .join(',')}]`;
    }

    /**
     * is Map
     */
    if (ClickhouseCommonUtils.isObject(value)) {
      const mapValues = Object.entries(value).map(([mapKey, mapValue]) => [
        ss.escape(mapKey),
        ss.escape(mapValue),
      ]);

      return `map(${mapValues.join(',')})`;
    }

    /**
     * is Number
     */
    if ('number' === typeof value) {
      return value;
    }

    if ('string' === typeof value && specialOps.has(value)) {
      return value as string;
    }

    /**
     * is String
     */
    if ('string' === typeof value) {
      return ss.escape(value);
    }

    /**
     * is Null
     */
    if (ClickhouseCommonUtils.isNull(value)) {
      return ss.escape('NULL');
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new ClickhouseInsertError(
      `Unknown type of key-value [${key}:${value}]`,
    );
  }

}
