import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatedUserDto, UpdateMyProfileDto } from "./dto/update-user.dto";

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.users.findMany();
  }

  async create(newUser: CreateUserDto) {
    return this.prisma.users.create({
      data: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        ville: newUser.ville,
      },
    });
  }

  async update(part: UpdatedUserDto, id: number) {
    return this.prisma.users.update({
      where: {
        id,
      },
      data: part,
    });
  }

  async updateProfile(
    id: number,
    data: UpdateMyProfileDto & { photo_url?: string }
  ) {
    return this.prisma.users.update({
      where: { id },
      data,
    });
  }

  async findById(id: number) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  async delete(id: number) {
    return this.prisma.users.delete({
      where: {
        id,
      },
    });
  }

  async searchClients(name: string) {
    return this.prisma.users.findMany({
      where: {
        role: "CLIENT",
        name: {
          startsWith: name,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
        name: true,
        phone: true,
        ville: true,
        email: true,
      },

      orderBy: {
        name: "asc",
      },

      take: 10,
    });
  }
}
