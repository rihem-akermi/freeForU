import { Body, Controller, Get, Post, Patch, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatedUserDto } from './dto/update-user.dto';

@Controller('users') 
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    console.log('🌐 GET /users');
    return this.usersService.getAllUsers();
  }

  @Post()
  async addUser(@Body() body: CreateUserDto) {
    console.log('🌐 POST /users reçu avec :', body);
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  async updateUser(@Body() body: UpdatedUserDto, @Param('id') id: string) {
    console.log('🌐 PATCH /users/' + id + ' reçu avec :', body);
    return this.usersService.updateUser(body, Number(id));
  }
    
  
  @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        console.log('🌐 DELETE /users/' + id + ' reçu');
        return this.usersService.deleteUser(Number(id)); // 👈 les params d'URL sont TOUJOURS des strings, on convertit
    }
}
