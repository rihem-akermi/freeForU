import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: "Lister toutes les catégories de métier",
    description: "Route publique listant l'ensemble des catégories disponibles.",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des catégories retournée avec succès.",
  })
  @Get()
  async getCategories() {
    return this.categoriesService.getAllCategories();
  }

  @ApiOperation({
    summary: "Créer une nouvelle catégorie",
    description: "Crée une catégorie de métier par son nom.",
  })
  @ApiResponse({
    status: 201,
    description: "Catégorie créée avec succès.",
  })
  @Post()
  async addCtagory(@Body() body: CreateCategoryDto) {
    return await this.categoriesService.addCategory(body.name);
  }

  @ApiOperation({
    summary: "Modifier une catégorie existante",
    description: "Met à jour le nom d'une catégorie identifiée par son ID.",
  })
  @ApiParam({
    name: "id",
    description: "ID de la catégorie",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Catégorie mise à jour avec succès.",
  })
  @Patch(":id")
  async updateCtagory(
    @Body() body: CreateCategoryDto,
    @Param("id", ParseIntPipe) id: number
  ) {
    return await this.categoriesService.updateCategory(id, body.name);
  }

  @ApiOperation({
    summary: "Supprimer une catégorie",
    description: "Supprime la catégorie. Échoue si des agents y sont rattachés.",
  })
  @ApiParam({
    name: "id",
    description: "ID de la catégorie",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Catégorie supprimée avec succès.",
  })
  @ApiResponse({
    status: 409,
    description: "Impossible de supprimer : liée à des agents existants.",
  })
  @Delete(":id")
  async deleteCategory(@Param("id", ParseIntPipe) id: number) {
    return await this.categoriesService.delete(id);
  }
}
