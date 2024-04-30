import { Injectable } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { RmqOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';
import { ConfiguratorService, InjectConfigurator } from '@wildegor/e-shop-nodepack/modules/libs/configurator';

@Injectable()
export class ConsumerConfig {

  public readonly options: RmqOptions;

  constructor(
    @InjectConfigurator() protected readonly configurator: ConfiguratorService,
  ) {
    const urls = configurator.getString('AMQP_URI').split(',');
    const queue = configurator.getString('CONSUMER_QUEUE');

    this.options = {
      transport: Transport.RMQ,
      options: {
        urls: urls,
        queue: queue,
        queueOptions: {
          durable: true,
        },
      },
    };
  }

}
