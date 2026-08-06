import { ConflictException, Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatedUserDto, UpdateMyProfileDto } from "./dto/update-user.dto";
import { UploadsService } from "src/uploads/uploads.service";
import { Prisma } from "../../generated/prisma/client";

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private uploadsService: UploadsService
  ) {}

  async getAllUsers() {
    const users = await this.usersRepository.findAll();
    return users; //table
  }

  async createUser(newUser: CreateUserDto) {
    return this.usersRepository.create(newUser);
  }

  async updateUser(part: UpdatedUserDto, id: number) {
    return this.usersRepository.update(part, id);
  }

  async updateMyProfile(
    id: number,
    data: UpdateMyProfileDto,
    file?: Express.Multer.File
  ) {
    let photoUrl: string | undefined;

    if (file) {
      photoUrl = await this.uploadsService.uploadImage(file, "users");
    }

    return await this.usersRepository.updateProfile(id, {
      ...data,
      ...(photoUrl && { photo_url: photoUrl }),
    });
  }

  async getMyProfile(id: number) {
    return await this.usersRepository.findById(id);
  }

  async deleteUser(id: number) {
    try {
      return await this.usersRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2003", "P2014"].includes(error.code)
      ) {
        throw new ConflictException(
          "Impossible de supprimer cet utilisateur : il possède des réservations ou avis existants."
        );
      }
      throw error;
    }
  }

  async searchClients(name: string) {
    return await this.usersRepository.searchClients(name);
  }
}
