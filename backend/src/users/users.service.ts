import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

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

  async createUser(name: string, email: string, password: string, role: string, ville: string) {
    console.log('⚙️ UsersService.createUser() called');
    // le hashage de mot de passe
    return this.usersRepository.create(name, email, password, role, ville);
  }

  async deleteUser(id: number) {
    console.log('⚙️ UsersService.deleteUser() called ');
    return this.usersRepository.delete(id);
  }
}