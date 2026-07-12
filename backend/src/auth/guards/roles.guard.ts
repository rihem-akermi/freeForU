import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // reflector l'outil qui va "relire" l'étiquette posée par @Roles(...) (via SetMetadata)
    //context.getHandler la fonction du controller qu'on est en train d'appeler
    //Reflector reads that metadata.
      const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    )

    console.log('👑 RolesGuard : rôles requis =', requiredRoles);

    if (!requiredRoles) {
      console.log('✅ Pas de restriction de rôle sur cette route');
      return true; // pas de @Roles(...) posé = accessible à tout connecté
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // vient de AuthGuard, exécuté juste avant

    //AuthGuard puis RolesGuard

    const isAutorisé = requiredRoles.includes(user.role);
    console.log(isAutorisé ? '✅ Rôle autorisé' : '❌ Rôle refusé', '- user role :', user.role);

    return isAutorisé;
  }
}