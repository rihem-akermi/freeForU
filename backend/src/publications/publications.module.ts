import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import PublicationsRepository from './publications.repository';

@Module({
  providers: [PublicationsService , PublicationsRepository],
  controllers: [PublicationsController]
})
export class PublicationsModule {}
