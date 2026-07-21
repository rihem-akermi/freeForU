import { Injectable } from '@nestjs/common';
import PublicationsRepository from './publications.repository';
import PublicationDTO from './dto/publications.dto';

@Injectable()
export class PublicationsService {
    constructor(private publicationsRepository : PublicationsRepository){}


    async getMyPublication(id : number ){
        return await this.publicationsRepository.getMyPublications(id)
    }

    async createPub(pub : PublicationDTO ,id : number ){
        return await this.publicationsRepository.createPublication(pub,id)
    }
}
