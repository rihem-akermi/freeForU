import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatedUserDto, UpdateMyProfileDto } from "./dto/update-user.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Consulter mon profil client (Client connecté)",
    description: "Retourne les informations du compte du client authentifié.",
  })
  @ApiResponse({ status: 200, description: "Profil client retourné avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Get("me")
  async getMyProfile(@Req() req) {
    return this.usersService.getMyProfile(req.user.sub);
  }

  @ApiOperation({
    summary: "Lister tous les utilisateurs",
    description: "Retourne l'ensemble des utilisateurs enregistrés.",
  })
  @ApiResponse({ status: 200, description: "Liste des utilisateurs." })
  @Get()
  async getUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Créer un utilisateur (Admin)",
    description: "Permet aux administrateurs de créer un utilisateur manuellement.",
  })
  @ApiResponse({ status: 201, description: "Utilisateur créé avec succès." })
  @ApiResponse({ status: 400, description: "Données utilisateur invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async addUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Mettre à jour mon profil client avec photo (Client connecté)",
    description: "Permet au client connecté de modifier ses informations et photo de profil.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Amira Mansour" },
        email: { type: "string", example: "amira@example.com" },
        phone: { type: "string", example: "21698765432" },
        ville: { type: "string", example: "Sousse" },
        photo: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Profil client mis à jour avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Patch("me")
  @UseInterceptors(FileInterceptor("photo"))
  async updateMyProfile(
    @Req() req,
    @Body() body: UpdateMyProfileDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.updateMyProfile(req.user.sub, body, file);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Modifier un utilisateur par son ID (Admin)",
    description: "Permet aux administrateurs de mettre à jour le compte d'un utilisateur.",
  })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", example: 1 })
  @ApiResponse({ status: 200, description: "Utilisateur mis à jour avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id")
  async updateUser(
    @Body() body: UpdatedUserDto,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.usersService.updateUser(body, id);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Supprimer un utilisateur (Admin)",
    description: "Supprime définitivement un utilisateur de la plateforme.",
  })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", example: 1 })
  @ApiResponse({ status: 200, description: "Utilisateur supprimé avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async deleteUser(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @ApiOperation({
    summary: "Rechercher des clients par nom",
    description: "Recherche les clients correspondants au nom fourni.",
  })
  @ApiQuery({ name: "name", description: "Nom du client recherché", example: "Amira" })
  @ApiResponse({ status: 200, description: "Résultats de recherche des clients." })
  @Get("search")
  async searchClients(@Query("name") name: string) {
    return this.usersService.searchClients(name);
  }
}
