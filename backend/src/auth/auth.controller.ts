import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { Response, Request } from "express";
import { AuthGuard } from "./guards/auth.guard";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: "Connexion utilisateur ou agent",
    description:
      "Valide les identifiants et pose les cookies httpOnly `accessToken` et `refreshToken`.",
  })
  @ApiResponse({
    status: 201,
    description: "Authentification réussie, cookies posés et profil utilisateur retourné.",
  })
  @ApiResponse({
    status: 400,
    description: "Email ou mot de passe manquant dans le corps de la requête.",
  })
  @ApiResponse({
    status: 401,
    description: "Identifiants incorrects.",
  })
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!body.email || !body.password) {
      console.log("❌ no body in the request");
      throw new BadRequestException("❌ no mail or no password in the request");
    } else {
      const user = await this.authService.validateLogin(
        body.email,
        body.password
      );
      const tokens = this.authService.generateTokens(user.id, user.role);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 min en millisecondes
        sameSite: "lax", //?
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        sameSite: "lax",
      });

      console.log("🍪 Cookies httpOnly posés");

      return { user };
    }
  }

  @ApiCookieAuth("refreshToken")
  @ApiOperation({
    summary: "Rafraîchir l’access token",
    description:
      "Lit le cookie `refreshToken` pour générer et poser un nouveau cookie `accessToken`.",
  })
  @ApiResponse({
    status: 201,
    description: "Access token renouvelé avec succès.",
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token manquant, invalide ou expiré.",
  })
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    console.log("🌐 POST /auth/refresh reçu");
    const refreshToken = req.cookies?.["refreshToken"]; // 👈 depuis le cookie, plus le body

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token manquant");
    }

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "lax",
    });

    console.log("🍪 Nouveau cookie accessToken posé");
    return { message: "Token renouvelé" }; // 👈 plus besoin de renvoyer le token dans le body
  }

  @ApiOperation({
    summary: "Inscription d’un client ou d’un agent",
    description:
      "Crée un nouveau compte selon le rôle (`CLIENT` ou `AGENT`). Pour un agent, `category_id` est obligatoire.",
  })
  @ApiResponse({
    status: 201,
    description: "Compte créé avec succès.",
  })
  @ApiResponse({
    status: 409,
    description: "Email déjà existant ou catégorie manquante pour un agent.",
  })
  @Post("signup")
  async signup(
    @Body()
    body: SignupDto
  ) {
    const created = await this.authService.signup(body);
    return { message: "Compte créé avec succès", user: created };
  }

  @ApiOperation({
    summary: "Déconnexion",
    description: "Supprime les cookies httpOnly `accessToken` et `refreshToken`.",
  })
  @ApiResponse({
    status: 201,
    description: "Déconnexion réussie et cookies supprimés.",
  })
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    console.log("🌐 POST /auth/logout reçu");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    console.log("🍪 Cookies supprimés");
    return { message: "Déconnexion réussie" };
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Récupérer la session courante de l’utilisateur connecté",
    description: "Accessible avec un cookie `accessToken` valide.",
  })
  @ApiResponse({
    status: 200,
    description: "Identifiant et rôle de l'utilisateur connecté.",
  })
  @ApiResponse({
    status: 401,
    description: "Non authentifié ou token invalide.",
  })
  @UseGuards(AuthGuard)
  @Get("me")
  async getMe(@Req() req: Request & { user: { sub: number; role: string } }) {
    return { id: req.user.sub, role: req.user.role };
  }
}
