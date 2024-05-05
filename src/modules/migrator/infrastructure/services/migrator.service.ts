import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectClickhouseClient } from '@adapters/clickhouse';
import { ClickhouseClient } from '@adapters/clickhouse/client';

@Injectable()
export class MigratorService implements OnApplicationBootstrap {

  private readonly _logger: Logger;

  constructor(
    @InjectClickhouseClient()
    protected readonly client: ClickhouseClient,
  ) {
    this._logger = new Logger(MigratorService.name);
  }

  public async onApplicationBootstrap(): Promise<void> {
    this._logger.verbose('Run migrations...');

    const scriptsPath = path.join(process.cwd(), 'scripts');

    this._logger.debug(scriptsPath)

    const scripts = await fs.readdir(scriptsPath, {
      withFileTypes: true,
    });

    for (const script of scripts) {
      const file = await fs.readFile(path.join(scriptsPath, script.name));
      const data = file.toString('utf-8');

      if (!path.extname(script.name).includes('.sql')) {
        this._logger.warn(
          `Skip file ${script.name} cause wrong extension. Only .sql`,
        );
        continue;
      }

      this._logger.verbose(`Run ${script.name}...`);

      await this.client.query<void>(data, {
        noFormat: true,
      });

      this._logger.verbose(`Complete ${script.name}`);
    }

    this._logger.verbose('Migrations done!');
  }

}
