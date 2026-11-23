import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: {
        email,
      },
    });
  }

  async findAgentByEmail(email: string) {
    return this.prisma.agents.findFirst({
      where: {
        email,
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    ville: string;
    phone: string;
  }) {
    return this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "CLIENT",
        ville: data.ville,
        phone: data.phone,
      },
    });
  }

  async createAgent(data: {
    name: string;
    email: string;
    password: string;
    ville: string;
    phone: string;
    category_id: number;
  }) {
    return this.prisma.agents.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        ville: data.ville,
        password: data.password,
        category_id: data.category_id,
        role: "AGENT",
      },
    });
  }

  async markUserEmailVerified(id: number) {
    return this.prisma.users.update({
      where: { id },
      data: { email_verified_at: new Date() },
    });
  }

  async markAgentEmailVerified(id: number) {
    return this.prisma.agents.update({
      where: { id },
      data: { email_verified_at: new Date() },
    });
  }

  async updateUserPassword(id: number, password: string) {
    return this.prisma.users.update({ where: { id }, data: { password } });
  }

  async updateAgentPassword(id: number, password: string) {
    return this.prisma.agents.update({ where: { id }, data: { password } });
  }

  async createRefreshSession(refreshTokenHash: string, expiresAt: Date) {
    await this.prisma.auth_sessions.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
    return this.prisma.auth_sessions.create({
      data: { refresh_token_hash: refreshTokenHash, expires_at: expiresAt },
    });
  }

  async rotateRefreshSession(
    currentTokenHash: string,
    nextTokenHash: string,
    expiresAt: Date,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.auth_sessions.deleteMany({
        where: { expires_at: { lt: new Date() } },
      });

      const revoked = await transaction.auth_sessions.updateMany({
        where: {
          refresh_token_hash: currentTokenHash,
          revoked_at: null,
          expires_at: { gt: new Date() },
        },
        data: { revoked_at: new Date() },
      });

      if (revoked.count !== 1) return false;

      await transaction.auth_sessions.create({
        data: { refresh_token_hash: nextTokenHash, expires_at: expiresAt },
      });
      return true;
    });
  }

  async revokeRefreshSession(refreshTokenHash: string) {
    await this.prisma.auth_sessions.updateMany({
      where: { refresh_token_hash: refreshTokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }
}
