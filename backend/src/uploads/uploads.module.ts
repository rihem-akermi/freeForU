// src/uploads/uploads.module.ts
import { Module } from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { CloudinaryProvider } from "./cloudinary.provider";

@Module({
  providers: [CloudinaryProvider, UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}