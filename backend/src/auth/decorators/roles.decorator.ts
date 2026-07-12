import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles); 

//...roles: string[] means : Accept any number of roles.


//on ajoute une etiquette : 
//@Roles('ADMIN') 
//"cette route nécessite le rôle ADMIN".
// va agir RolesGuard apres 