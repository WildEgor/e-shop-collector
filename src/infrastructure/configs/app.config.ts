import { Injectable } from '@nestjs/common';
import { ConfiguratorService, InjectConfigurator } from '@wildegor/e-shop-nodepack/modules/libs/configurator';

@Injectable()
export class AppConfig {

  public readonly name: string;
  public readonly port: number;
  public readonly isProduction: boolean;

  constructor(
    @InjectConfigurator() protected readonly configurator: ConfiguratorService,
  ) {
    this.name = configurator.getString('APP_NAME');
    this.port = configurator.getNumber('APP_PORT');
    this.isProduction = configurator.getString('APP_MODE') !== 'develop';
  }

}
