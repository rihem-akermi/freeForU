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
    const users = await this.usersRepository.findAll();
    return users;//table
  }

  async createUser(newUser: CreateUserDto) {
    return this.usersRepository.create(newUser);
  }

  async updateUser(part: UpdatedUserDto, id: number) {
    return this.usersRepository.update(part, id);
  }

  async deleteUser(id: number) {
    return this.usersRepository.delete(id);
  }
}