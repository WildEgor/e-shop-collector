export interface IClickhouseConnectionOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
  ca?: Buffer;
}

export interface IClickhouseSettings {
  settings?: Record<string, unknown>;
  defaultFormat: 'JSON' | 'CSV' | 'TSV' | string;
}

export interface IClickhouseClientProps {
  connectionSettings: IClickhouseConnectionOptions;
  clickhouseSettings: IClickhouseSettings;
}

export type TClickhouseMap = Record<string | number, string | number>;

export type TJSONFormatRow = Record<string, string | number | TClickhouseMap>;

export interface IClickhouseOptimizedJSONInsertFormat {
  keys: string[];
  values: (string | number)[][];
}

export interface IClickhouseQueryOptions extends Record<any, any> {
  format?: 'JSON' | 'CSV' | 'TSV' | string;
  noFormat?: boolean;
}
