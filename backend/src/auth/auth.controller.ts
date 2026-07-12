import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string }
  ) {
    if(!body.email || !body.password){
      console.log("❌ no body in the request")
      throw new BadRequestException("❌ no body in the request")
    }
    else {
      const user = await this.authService.validateLogin(body.email, body.password);
      const tokens = this.authService.generateTokens(user.id , user.role)
      return {
        user , 
        ...tokens,
      } 
    }
  }
}