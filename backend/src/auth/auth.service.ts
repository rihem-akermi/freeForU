import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService
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

    console.log("✅ Compte créé avec succès :", created.id);
    const { password: _, ...safeCreated } = created;
    return safeCreated;
  }
}
