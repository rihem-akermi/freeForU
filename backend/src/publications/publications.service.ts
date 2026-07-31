// publications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PublicationsRepository } from "./publications.repository";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { UpdatedPublicationDto } from "./dto/update-publication.dto";
import { UploadsService } from "src/uploads/uploads.service";

@Injectable()
export class PublicationsService {
  constructor(
    private publicationsRepository: PublicationsRepository,
    private uploadsService: UploadsService
  ) {}

  async getAgentPortfolio(agentId: number) {
    return await this.publicationsRepository.findApprovedByAgentId(agentId);
  }

  async getMyPublications(agentId: number) {
    return await this.publicationsRepository.findAllByAgentId(agentId);
  }

  async getAllForModeration() {
    return await this.publicationsRepository.findAll();
  }

  async createPublication(
    dto: CreatePublicationDto,
    agentId: number,
    file: Express.Multer.File
  ) {
    const photoUrl = await this.uploadsService.uploadImage(file, "publications");
    return await this.publicationsRepository.create(
      { ...dto, photo_url: photoUrl },
      agentId
    );
  }

  async updateMyPublication(
  dto: UpdatedPublicationDto,
  id: number,
  agentId: number,
  file?: Express.Multer.File
) {
  await this.checkOwnership(id, agentId);

  let photoUrl: string | undefined;
  if (file) {
    photoUrl = await this.uploadsService.uploadImage(file, "publications");
  }

  return await this.publicationsRepository.update(
    { ...dto, ...(photoUrl && { photo_url: photoUrl }) },
    id
  );
}

  async deleteMyPublication(id: number, agentId: number) {
    await this.checkOwnership(id, agentId);
    return await this.publicationsRepository.delete(id);
  }

  async updateStatus(id: number, status: string) {
    const publication = await this.publicationsRepository.findById(id);
    if (!publication) {
      throw new NotFoundException("Publication introuvable");
    }
    return await this.publicationsRepository.updateStatus(id, status);
  }

  private async checkOwnership(id: number, agentId: number) {
    const publication = await this.publicationsRepository.findById(id);
    if (!publication) {
      throw new NotFoundException("Publication introuvable");
    }
    if (publication.agent_id !== agentId) {
      throw new ForbiddenException("Cette publication ne vous appartient pas");
    }
  }
}
