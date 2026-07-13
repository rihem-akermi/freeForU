import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    //Get the current HTTP request.
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['accessToken'] //depuis le cookie, plus le header Authorization

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }


    try {
        //verifie payload + signature + expiration +secret 
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request.user = payload; 
      return true; 
    } catch (error) {
      console.log('❌ Token invalide ou expiré');
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}