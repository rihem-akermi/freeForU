import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OtpRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    target_table: string;
    target_id: number;
    purpose: string;
    code_hash: string;
    expires_at: Date;
  }) {
    return this.prisma.otp_verifications.create({
      data,
    });
  }

  //Find "pending" → "INVALIDATED" → create new OTP.
  async findLatestPending(
    target_table: string,
    target_id: number,
    purpose: string
  ) {
    return this.prisma.otp_verifications.findFirst({
      where: {
        target_table,
        target_id,
        purpose,
        status: "PENDING",
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
  // so ONLY otp code is pending mode / attempts limits is reached 
  async markInvalidated(id: number) {
    return this.prisma.otp_verifications.update({
      where: { id },
      data: {
        status: "INVALIDATED",
        invalidated_at: new Date(),
      },
    });
  }

  //Used after a successful verify.
  async markConsumed(id: number) {
    return this.prisma.otp_verifications.update({
      where: { id },
      data: {
        status: "CONSUMED",
        consumed_at: new Date(),
      },
    });
  }

  //After expired_at > now()
  async markExpired(id: number) {
    return this.prisma.otp_verifications.update({
      where: { id },
      data: {
        status: "EXPIRED",
      },
    });
  }

  async incrementAttempts(id: number) {
    return this.prisma.otp_verifications.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
      },
    });
  }

  // cooldown : to send less resend mails /min
  async findLatestByTarget(target_table: string, target_id: number, purpose: string) {
  return this.prisma.otp_verifications.findFirst({
    where: { target_table, target_id, purpose },
    orderBy: { created_at: 'desc' },
  });
}

async expireOldPending() {
  return this.prisma.otp_verifications.updateMany({
    where: {
      status: 'PENDING',
      expires_at: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
}

}
