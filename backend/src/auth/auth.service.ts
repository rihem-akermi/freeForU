import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,) {}

  async validateLogin(email: string, password: string) {

    const userResult = await this.authRepository.findUserByEmail(email)

    // if exists in uers
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const passwordMatches = await bcrypt.compare(password, user.password); // since it's hashed , sens unique
      if (!passwordMatches) {
        console.log('❌ Mot de passe incorrect pour :', email);
        throw new UnauthorizedException('Email ou mot de passe incorrect');
        //devient une http response 401 Unauthorized
        /*
        {
          "message": "Email ou mot de passe incorrect",
          "error": "Unauthorized",
          "statusCode": 401
        }
        */
      }
      console.log('✅ Login réussi (users) :', email, '- rôle :', user.role);
      const { password: _, ...safeUser } = user; // on retire le password de la réponse
      return safeUser;
    }

    // chercher dans agents
        const agentResult = await this.authRepository.findAgentByEmail(email)

    if (agentResult.rows.length > 0) {
      const agent = agentResult.rows[0];
      const passwordMatches = await bcrypt.compare(password, agent.password);
      if (!passwordMatches) {
        console.log('❌ Mot de passe incorrect pour :', email);
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }
      console.log('✅ Login réussi (agents) :', email, '- rôle :', agent.role);
      const { password: _, ...safeAgent } = agent;
      return safeAgent;
    }

    // 3️⃣ Trouvé nulle part
    console.log('❌ Aucun compte pour :', email);
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  generateTokens(userId : number , role: string){
    console.log("generation des tokens")
    
    const payload = {
      sub : userId ,
      role
    } //convention JWT pour "subject"

    const accessToken = this.jwtService.sign(
      payload,{
        secret : process.env.JWT_ACCESS_SECRET ,
        expiresIn : "15m"})

    const refreshToken = this.jwtService.sign(
      payload,{
        secret : process.env.JWT_REFRESH_SECRET ,
        expiresIn : "7d"
      })

    console.log('✅ Tokens générés');
    return { accessToken, refreshToken };
    
  }
}