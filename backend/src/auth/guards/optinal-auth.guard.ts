import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.["accessToken"];

    if (!token) {
      return true; // 🔑 pas de token = visiteur anonyme, on LAISSE PASSER (pas d'erreur)
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = payload; // connecté → on peuple req.user normalement
    } catch (error) {
      // token invalide/expiré → on ignore silencieusement, traité comme anonyme
      // (PAS de throw ici, contrairement à AuthGuard — c'est toute la différence)
    }

    return true; // toujours true : ce guard ne bloque JAMAIS la requête
  }
}
