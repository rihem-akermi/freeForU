import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";

type Category = {
  id: number;
  name: string;
};

@Controller("categories")
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Post()
  async addCtagory(@Body() { name }: Category) {
    return await this.categoriesService.addCategory(name);
  }

  @Patch(":id")
  async updateCtagory(@Body() { name }: Category, @Param("id") id: string) {
    return await this.categoriesService.updateCategory(Number(id), name);
  }

  @Delete(":id")
  async deleteCategory(@Param("id") id: string) {
    return await this.categoriesService.delete(Number(id));
  }
}
