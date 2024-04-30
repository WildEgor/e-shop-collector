import { Module } from '@nestjs/common';
import { MigratorService } from './infrastructure/services/migrator.service';

@Module({
  providers: [MigratorService],
})
export class MigratorModule {}
