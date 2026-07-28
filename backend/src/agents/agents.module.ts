import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { AgentsRepository } from './agents.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  imports : [AuthModule , UploadsModule],
  providers: [AgentsService,AgentsRepository],
  controllers: [AgentsController],
})
export class AgentsModule {}
