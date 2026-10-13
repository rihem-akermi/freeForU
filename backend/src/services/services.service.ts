import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ServicesRepository } from "./services.repository";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { AiService } from "src/ai/ai.service";

@Injectable()
export class ServicesService {
  constructor(
    private servicesRepository: ServicesRepository,
    private aiService: AiService
  ) {}

  async getServicesByAgent(agentId: number) {
    return this.servicesRepository.findByAgentId(agentId);
  }

  async getMyServices(agentId: number) {
    return this.servicesRepository.findByAgentId(agentId);
  }

  async createService(agentId: number, dto: CreateServiceDto) {
    const embedding = await this.aiService.embedText(
      `${dto.nom}. ${dto.description ?? ""}`,
      "RETRIEVAL_DOCUMENT"
    );
    return this.servicesRepository.create(agentId, dto, embedding);
  }

  async updateService(id: number, agentId: number, dto: UpdateServiceDto) {
    const service = await this.servicesRepository.findById(id);
    if (!service) throw new NotFoundException("Service introuvable");
    if (service.agent_id !== agentId)
      throw new ForbiddenException("Ce service ne vous appartient pas");

    // On ne recalcule l'embedding QUE si le texte change (pas pour un simple changement de prix)
    let embedding: number[] | undefined;
    if (dto.nom !== undefined || dto.description !== undefined) {
      const nom = dto.nom ?? service.nom;
      const description = dto.description ?? service.description ?? "";
      embedding = await this.aiService.embedText(
        `${nom}. ${description}`,
        "RETRIEVAL_DOCUMENT"
      );
    }

    return this.servicesRepository.update(id, dto, embedding);
  }

  async deleteService(id: number, agentId: number) {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundException("Service introuvable");
    }
    if (service.agent_id !== agentId) {
      throw new ForbiddenException("Ce service ne vous appartient pas");
    }

    return this.servicesRepository.delete(id);
  }
}
