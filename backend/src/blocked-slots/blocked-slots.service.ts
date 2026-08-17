import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { BlockedSlotsRepository } from "./blocked-slots.repository";
import { CreateBlockedSlotDto } from "./dto/create-blocked-slot.dto";

@Injectable()
export class BlockedSlotsService {
  constructor(private blockedSlotsRepository: BlockedSlotsRepository) {}

  async getMyBlockedSlots(agentId: number) {
    return await this.blockedSlotsRepository.findByAgentId(agentId);
  }

  async createBlockedSlot(agentId: number, dto: CreateBlockedSlotDto) {
    return await this.blockedSlotsRepository.create(agentId, dto);
  }

  async deleteMyBlockedSlot(id: number, agentId: number) {
    const slot = await this.blockedSlotsRepository.findById(id);
    if (!slot) throw new NotFoundException("Blocage introuvable");
    if (slot.agent_id !== agentId)
      throw new ForbiddenException("Ce blocage ne vous appartient pas");
    return await this.blockedSlotsRepository.delete(id);
  }

  async setDayException(agentId: number, date: string, type: "off" | "full") {
    const existing = await this.blockedSlotsRepository.findByAgentAndDate(
      agentId,
      new Date(date)
    );

    if (existing && existing.type === type) {
      await this.blockedSlotsRepository.delete(existing.id); // reclique sur le même type → annule
      return { type: null };
    }
    if (existing) {
      await this.blockedSlotsRepository.updateType(existing.id, type); // change de type
      return { type };
    }
    await this.blockedSlotsRepository.create(agentId, { date, type });
    return { type };
  }
}
