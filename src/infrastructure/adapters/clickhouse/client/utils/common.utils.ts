export class ClickhouseCommonUtils {

  public static isObject(value: unknown): value is Record<string, unknown> {
    return 'object' === typeof value && !Array.isArray(value) && value !== null;
  }

  public static isNull(value: unknown): value is null {
    return null === value;
  }

}
