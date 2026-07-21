import { Injectable } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  getAllCategories() {
    return this.categoriesRepository.findAll();
  }

  async addCategory(name: string) {
    const newCategory = await this.categoriesRepository.addCategory(name)
    return newCategory
  }

  async updateCategory(id: number, name: string) {
   const updatedCategory = await this.categoriesRepository.updateCategory(id,name)
    return updatedCategory
  }

  async delete(id: number) {
    return await this.categoriesRepository.delete(id)
  }
}
