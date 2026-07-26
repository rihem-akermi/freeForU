import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.categories.findMany({
      orderBy: {
        id: "asc",
      },
    });

    //nom AS name
    return categories.map(category => ({
      id: category.id,
      name: category.nom,
    }));

  }

  async addCategory(name: string) {
    const category = await this.prisma.categories.create({
      data: {
        nom: name,
      },
    });

    return {
      id: category.id,
      name: category.nom,
    };
  }

  async updateCategory(id: number, name: string) {
    const category = await this.prisma.categories.update({
      where: {
        id,
      },
      data: {
        nom: name,
      },
    });

    return {
      id: category.id,
      name: category.nom,
    };
  }

  async delete(id: number) {
    return this.prisma.categories.delete({
      where: {
        id,
      },
    });
  }
}