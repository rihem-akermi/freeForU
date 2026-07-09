import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatedUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {
    //injection aussi
  }

  async getAllUsers() {
    console.log('⚙️ UsersService.getAllUsers() called');
    const users = await this.usersRepository.findAll();
    return users;//table
  }

  async createUser(newUser: CreateUserDto) {
    console.log('⚙️ UsersService.createUser() called');
    return this.usersRepository.create(newUser);
  }

  async updateUser(part: UpdatedUserDto, id: number) {
    console.log('⚙️ UsersService.updateUser() called');
    return this.usersRepository.update(part, id);
  }

  async deleteUser(id: number) {
    console.log('⚙️ UsersService.deleteUser() called ');
    return this.usersRepository.delete(id);
  }
}