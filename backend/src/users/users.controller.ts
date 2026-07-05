import { Body, Controller, Get ,Post , Delete , Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users') // 👈 préfixe de route : tout ici commence par /users
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    console.log('🌐 GET /users');
    return this.usersService.getAllUsers();
  }

  @Post()
  async addUser(@Body() body :{name: string;email: string;password: string;role: string; ville: string})
    {
    console.log('🌐 POST /users reçu avec :', body);
    return this.usersService.createUser(body.name, body.email, body.password, body.role, body.ville);
    }
  
  @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        console.log('🌐 DELETE /users/' + id + ' reçu');
        return this.usersService.deleteUser(Number(id)); // 👈 les params d'URL sont TOUJOURS des strings, on convertit
    }
}
