import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import PublicationDTO from './dto/publications.dto';

@Controller('publications')
export class PublicationsController {
    constructor(private publicationsService :PublicationsService ) {}

@Get('me')
async getMyPublications(@Req() req) {
    return await this.publicationsService.getMyPublication(req.user.sub)
}

@Post('me')
async createPub(@Body() body : PublicationDTO , @Req() req){
    return await this.publicationsService.createPub(body, req.user.sub)
}


}
