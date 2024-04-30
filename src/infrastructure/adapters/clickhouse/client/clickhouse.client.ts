import {
  IClickhouseClientProps,
  IClickhouseQueryOptions,
  IClickhouseSettings,
  TJSONFormatRow,
} from './clickhouse.interfaces';
import { ClickhouseHttpClient } from './http/http.client';
import { IClickhouseHttpClientResponse } from './http/http.interfaces';
import { ClickhouseFormatUtils } from './utils/format.utils';

export class ClickhouseClient {

  private readonly _httpClient: ClickhouseHttpClient;
  private readonly _opts: IClickhouseSettings;

  constructor(props: IClickhouseClientProps) {
    this._opts = props.clickhouseSettings;

    this._httpClient = new ClickhouseHttpClient({
      connectionOptions: props.connectionSettings,
      clickhouseSettings: props.clickhouseSettings.settings,
    });
  }

  /**
   * Make insert query
   * Auto validating data
   *
   * @param {string} table table name
   * @param {TJSONFormatRow} rows insert rows in JSON format
   * @param {IClickhouseQueryOptions} options insert options
   *
   * @returns {Promise<number>} insert count
   */
  public async insert(
    table: string,
    rows: TJSONFormatRow[],
    options: IClickhouseQueryOptions = {},
  ): Promise<number> {
    if (0 === rows.length) {
      return 0;
    }
    const jsonInsertFormat = ClickhouseFormatUtils.jsonRowsToInsertFormat(rows);

    const sql = `INSERT INTO ${table} (${jsonInsertFormat.keys.join(
      ',',
    )}) VALUES`;

    const data
      = ClickhouseFormatUtils.jsonInsertFormatToSqlValues(jsonInsertFormat);

    await this._httpClient.request({
      params: { query: sql },
      data,
      queryOptions: options,
    });

    return rows.length;
  }

  /**
   * Select query for getting results
   * There is no anu wrapper for response. So, you can do what you want with response
   *
   * @param {string} query WITH now() as time SELECT time;
   * @param {IClickhouseQueryOptions} options select options
   *
   * @returns {Promise<IClickhouseHttpClientResponse>}
   */
  public async query<T>(
    query: string,
    options: IClickhouseQueryOptions = {},
  ): Promise<IClickhouseHttpClientResponse<T>> {
    const { noFormat = false, format = this._opts.defaultFormat } = options;

    let sql = query;
    if (!noFormat) {
      sql += ` FORMAT ${format}`;
    }

    const response = await this._httpClient.request<T>({ data: sql.trim() });

    return response;
  }

}
