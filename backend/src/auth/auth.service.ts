import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";
import { JwtService } from "@nestjs/jwt";

import { OtpService } from "../otp/otp.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailService: MailService
  ) {}

  async validateLogin(email: string, password: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedException("Email ou mot de passe incorrect");
      }

      const { password: _, ...safeUser } = user;
      return safeUser;
    }

    const agent = await this.authRepository.findAgentByEmail(email);

    if (agent) {
      const passwordMatches = await bcrypt.compare(password, agent.password);

      if (!passwordMatches) {
        throw new UnauthorizedException("Email ou mot de passe incorrect");
      }

      const { password: _, ...safeAgent } = agent;
      return safeAgent;
    }

    throw new UnauthorizedException("Email ou mot de passe incorrect");
  }

  generateTokens(userId: number, role: string) {
    console.log("generation des tokens");

    const payload = {
      sub: userId,
      role,
    }; //convention JWT pour "subject"

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "15m",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });

    console.log("✅ Tokens générés");
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    console.log("🔄 AuthService.refreshAccessToken() appelé");

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET, // 👈 le BON secret, celui du refresh
      });

      console.log("✅ Refresh token valide, payload :", payload);

      // 👇 on génère UNIQUEMENT un nouvel access token, pas un nouveau refresh
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, role: payload.role },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: "15m" }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      console.log("❌ Refresh token invalide ou expiré");
      throw new UnauthorizedException(
        "Session expirée, veuillez vous reconnecter"
      );
    }
  }
  // click signup-btn
  async signup(data: {
    name: string;
    email: string;
    password: string;
    ville: string;
    phone: string;
    role: "CLIENT" | "AGENT";
    category_id?: number;
  }) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    const existingAgent = await this.authRepository.findAgentByEmail(
      data.email
    );

    if (existingUser || existingAgent) {
      throw new ConflictException("Cet email est déjà utilisé");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let created;
    if (data.role === "AGENT") {
      if (!data.category_id) {
        throw new ConflictException("La catégorie est requise pour un agent"); //409
      }
      created = await this.authRepository.createAgent({
        ...data,
        password: hashedPassword,
        category_id: data.category_id,
      });
    } else {
      created = await this.authRepository.createUser({
        ...data,
        password: hashedPassword,
      });
    }

    const code = await this.otpService.haveOtp(
      data.role === "AGENT" ? "AGENT" : "USER",
      created.id,
      "EMAIL_VERIFICATION"
    );

    await this.mailService.sendOtpEmail(
      created.email,
      code,
      "EMAIL_VERIFICATION",
      created.name
    );
    console.log("📧 OTP de vérification envoyé à :", created.email);

    console.log(
      "✅ Compte créé avec succès mais ⚠️ en train d'être verfié avec l'OTP ⚠️ :",
      created.id
    );
    const { password: _, ...safeCreated } = created;
    return safeCreated; //has the email in it rahouma
  }

  // click verify-btn
  async verifyEmail(email: string, code: string) {
    const user = await this.authRepository.findUserByEmail(email);
    const target = user ?? (await this.authRepository.findAgentByEmail(email));

    if (!target) {
      throw new UnauthorizedException("Compte introuvable");
    }

    const target_table = user ? "USER" : "AGENT";

    await this.otpService.verifyCode(
      target_table,
      target.id,
      "EMAIL_VERIFICATION",
      code
    );

    if (user) {
      await this.authRepository.markUserEmailVerified(target.id);
    } else {
      await this.authRepository.markAgentEmailVerified(target.id);
    }

    console.log(`✅ Email vérifié pour ${target_table} #${target.id}`);
    return { message: "Email vérifié avec succès" };
  }

  //click resend-btn
  async resendOtp(
    email: string,
    purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ) {
    const user = await this.authRepository.findUserByEmail(email);
    const target = user ?? (await this.authRepository.findAgentByEmail(email));

    if (!target) {
      throw new UnauthorizedException("Compte introuvable");
    }

    if (purpose === "EMAIL_VERIFICATION" && target.email_verified_at) {
      throw new ConflictException("Cet email est déjà vérifié");
    }

    const target_table = user ? "USER" : "AGENT";

    const code = await this.otpService.haveOtp(
      target_table,
      target.id,
      purpose
    );
    await this.mailService.sendOtpEmail(
      target.email,
      code,
      purpose,
      target.name
    );
    console.log(
      `📧 OTP renvoyé (${purpose}) pour ${target_table} #${target.id}`
    );
    return { message: "Nouveau code envoyé" };
  }

  async forgotPassword(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    const target = user ?? (await this.authRepository.findAgentByEmail(email));

    if (!target) {
      // Deliberately vague — don't reveal whether an email exists in the system
      return { message: "Si ce compte existe, un code a été envoyé" };
    }

    const target_table = user ? "USER" : "AGENT";
    const code = await this.otpService.haveOtp(
      target_table,
      target.id,
      "PASSWORD_RESET"
    );
    await this.mailService.sendOtpEmail(
      target.email,
      code,
      "PASSWORD_RESET",
      target.name
    );

    console.log(
      `📧 Code de réinitialisation envoyé pour ${target_table} #${target.id}`
    );
    return { message: "Si ce compte existe, un code a été envoyé" };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.authRepository.findUserByEmail(email);
    const target = user ?? (await this.authRepository.findAgentByEmail(email));

    if (!target) {
      throw new UnauthorizedException("Compte introuvable");
    }

    const target_table = user ? "USER" : "AGENT";
    await this.otpService.verifyCode(
      target_table,
      target.id,
      "PASSWORD_RESET",
      code
    );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (user) {
      await this.authRepository.updateUserPassword(target.id, hashedPassword);
    } else {
      await this.authRepository.updateAgentPassword(target.id, hashedPassword);
    }

    console.log(
      `✅ Mot de passe réinitialisé pour ${target_table} #${target.id}`
    );
    return { message: "Mot de passe réinitialisé avec succès" };
  }
}
