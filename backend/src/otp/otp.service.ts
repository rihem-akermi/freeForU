import { BadRequestException, Injectable } from "@nestjs/common";
import { OtpRepository } from "./otp.repository";
import * as crypto from "crypto";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class OtpService {
  constructor(private otpRepository: OtpRepository) {}

  private generateCode(): string {
    const code = crypto.randomInt(0, 1_000_000); // 0 to 999999
    return code.toString().padStart(6, "0"); // always 6 digits '000001'
  }

  // sha256 // sha512 // sha1
  private hashCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
  }

  // requesting a code
  async haveOtp(
    target_table: "USER" | "AGENT",
    target_id: number,
    purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ): Promise<string> {
    const lastOtp = await this.otpRepository.findLatestByTarget(
      target_table,
      target_id,
      purpose
    );

    if (lastOtp) {
      const secondsSinceLast =
        (Date.now() - lastOtp.created_at.getTime()) / 1000;
      if (secondsSinceLast < 30) {
        throw new BadRequestException(
          `Veuillez patienter ${Math.ceil(30 - secondsSinceLast)} secondes avant de redemander un code`
        );
      }
    }

    // 1. Invalidate any old pending OTP for this same target+purpose
    const existing = await this.otpRepository.findLatestPending(
      target_table,
      target_id,
      purpose
    );
    if (existing) {
      await this.otpRepository.markInvalidated(existing.id);
    }

    // 2. Generate + hash the new code
    const code = this.generateCode();
    const code_hash = this.hashCode(code);

    // 3. Save the new row
    const expires_at = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    await this.otpRepository.create({
      target_table,
      target_id,
      purpose,
      code_hash,
      expires_at,
    });

    console.log(`✅ OTP créé pour ${target_table} #${target_id} (${purpose})`);

    // 4. Return the RAW code so we send it via Brevo
    return code;
  }

  async verifyCode(
    target_table: "USER" | "AGENT",
    target_id: number,
    purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
    submittedCode: string
  ): Promise<boolean> {
    const otp = await this.otpRepository.findLatestPending(
      target_table,
      target_id,
      purpose
    );

    if (!otp) {
      throw new BadRequestException("Aucun code de vérification en attente");
    }

    if (otp.expires_at < new Date()) {
      await this.otpRepository.markExpired(otp.id);
      throw new BadRequestException("Code expiré, veuillez en redemander un");
    }

    if (otp.attempts >= 3) {
      await this.otpRepository.markInvalidated(otp.id);
      throw new BadRequestException("Nombre maximum de tentatives atteint");
    }

    const submittedHash = this.hashCode(submittedCode);

    if (submittedHash !== otp.code_hash) {
      await this.otpRepository.incrementAttempts(otp.id);
      throw new BadRequestException(`Code incorrect `);
    }

    await this.otpRepository.markConsumed(otp.id);
    console.log(
      `✅ OTP vérifié avec succès pour ${target_table} #${target_id}`
    );
    return true;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sweepExpiredOtps() {
    const result = await this.otpRepository.expireOldPending();
    if (result.count > 0) {
      console.log(`🧹 ${result.count} OTP(s) expiré(s) nettoyé(s)`);
    }
  }
}
