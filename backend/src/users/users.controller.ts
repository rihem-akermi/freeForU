import { Body, Controller, Get, Post, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatedUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

import { Query } from '@nestjs/common';

@Controller('users') 
export class UsersController {
  constructor(private usersService: UsersService) {}

 
  @Get()
  async getUsers() {
    //pas de guard, accessible librement pour l'instant
    return this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard,RolesGuard)
  @Roles("ADMIN")
  @Post()
  async addUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @UseGuards(AuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async updateUser(@Body() body: UpdatedUserDto, @Param('id') id: string) {
    console.log('🌐 PATCH /users/' + id + ' reçu avec :', body);
    return this.usersService.updateUser(body, Number(id));
  }
    
  
  @UseGuards(AuthGuard,RolesGuard)
  @Roles("ADMIN")
  @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(Number(id)); 
    }


  @Get('search')
  async searchClients(@Query('name') name: string) {

  return this.usersService.searchClients(name);

}
}
