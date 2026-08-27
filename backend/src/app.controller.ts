import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Vérification de l’état de l’application',
    description: 'Retourne un message de salutation confirmant que le serveur fonctionne.',
  })
  @ApiResponse({
    status: 200,
    description: 'Serveur opérationnel.',
    type: String,
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
