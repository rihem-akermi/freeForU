import { Controller, Post, Body, BadRequestException, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response ,Request} from 'express';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    if(!body.email || !body.password){
      console.log("❌ no body in the request")
      throw new BadRequestException("❌ no mail or no password in the request")
    }
    else {
      const user = await this.authService.validateLogin(body.email, body.password);
      const tokens = this.authService.generateTokens(user.id , user.role)

      res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 min en millisecondes
      sameSite: 'lax',//?
    });

      res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      sameSite: 'lax',
    });

      console.log('🍪 Cookies httpOnly posés');

      return {user} 
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  console.log('🌐 POST /auth/refresh reçu');
  const refreshToken = req.cookies?.['refreshToken']; // 👈 depuis le cookie, plus le body

  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token manquant');
  }

  const { accessToken } = await this.authService.refreshAccessToken(refreshToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
    sameSite: 'lax',
  });

  console.log('🍪 Nouveau cookie accessToken posé');
  return { message: 'Token renouvelé' }; // 👈 plus besoin de renvoyer le token dans le body
}
  
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    console.log('🌐 POST /auth/logout reçu');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    console.log('🍪 Cookies supprimés');
    return { message: 'Déconnexion réussie' };
  }

}