import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { OffersRepository } from "./offers.repository";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdatedOfferDto } from "./dto/update-offer.dto";
import { UploadsService } from "src/uploads/uploads.service";

@Injectable()
export class OffersService {
  constructor(
    private offersRepository: OffersRepository,
    private uploadsService: UploadsService
  ) {}

  async getPublicOffers() {
    return await this.offersRepository.findAllApprovedActive();
  }

  async getMyOffers(agentId: number) {
    return await this.offersRepository.findByAgentId(agentId);
  }

  async getOfferById(id: number) {
    const offer = await this.offersRepository.findById(id);
    if (!offer) {
      throw new NotFoundException("Offre introuvable");
    }
    // TODO: décider si une offre non approuvée/inactive doit être visible via id direct
    // parce que j'ai pas trouvé son utilité
    return offer;
  }

  async createOffer(
    offer: CreateOfferDto,
    agentId: number,
    file?: Express.Multer.File
  ) {
    let coverImage: string | undefined;

    if (file) {
      coverImage = await this.uploadsService.uploadImage(file, "offers");
    }

    return await this.offersRepository.createOffer(
      { ...offer, ...(coverImage && { cover_image: coverImage }) },
      agentId
    );
  }

  async updateMyOffer(
    offer: UpdatedOfferDto,
    id: number,
    agentId: number,
    file?: Express.Multer.File
  ) {
    await this.checkOwnership(id, agentId);

    let coverImage: string | undefined;
    if (file) {
      coverImage = await this.uploadsService.uploadImage(file, "offers");
    }

    return await this.offersRepository.updateOffer(
      { ...offer, ...(coverImage && { cover_image: coverImage }) },
      id
    );
  }

  async updateOfferStatus(id: number, status: string) {
    const offer = await this.offersRepository.findById(id);
    if (!offer) {
      throw new NotFoundException("Offre introuvable");
    }
    return await this.offersRepository.updateStatus(id, status);
  }

  async deleteMyOffer(id: number, agentId: number) {
    await this.checkOwnership(id, agentId);
    return await this.offersRepository.deleteOffer(id);
  }

  private async checkOwnership(offerId: number, agentId: number) {
    const offer = await this.offersRepository.findById(offerId);
    if (!offer) {
      throw new NotFoundException("Offre introuvable Pour Tous Le Monde");
    }
    if (offer.agent_id !== agentId) {
      throw new ForbiddenException("👿 Cette offre ne vous appartient pas");
    }
  }
}
