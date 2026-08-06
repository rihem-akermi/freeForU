import { ConflictException, Injectable } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { Prisma } from "../../generated/prisma/client";

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  getAllCategories() {
    return this.categoriesRepository.findAll();
  }

  async addCategory(name: string) {
    const newCategory = await this.categoriesRepository.addCategory(name);
    return newCategory;
  }

  async updateCategory(id: number, name: string) {
    const updatedCategory = await this.categoriesRepository.updateCategory(
      id,
      name
    );
    return updatedCategory;
  }

  async delete(id: number) {
    try {
      return await this.categoriesRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2003", "P2014"].includes(error.code)
      ) {
        throw new ConflictException(
          "Impossible de supprimer cette catégorie : elle est liée à des agents existants."
        );
      }
      throw error;
    }
  }
}
