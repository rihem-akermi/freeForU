import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.categories.findMany({
      orderBy: {
        id: "asc",
      },
    });

  

  }

  async addCategory(name: string) {
  return this.prisma.categories.create({
    data: {
      name,
    },
  });
}

 async updateCategory(id: number, name: string) {
  return this.prisma.categories.update({
    where: { id },
    data: {
      name,
    },
  });
}
  async delete(id: number) {
    return this.prisma.categories.delete({
      where: {
        id,
      },
    });
  }
}