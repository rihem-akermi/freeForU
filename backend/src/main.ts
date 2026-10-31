import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";

import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // fabrique les constructeurs des objets
  app.use(cookieParser());

  // frontend allowed ports/urls
  const frontendUrl = process.env.FRONTEND_URL ; //deployed ||local

  if (!frontendUrl){
    console.log("No frontendUrl ❌")
  }
  else{
    app.enableCors({
    origin: frontendUrl, // seul ton frontend Next.js a le droit d'appeler ce backend
    credentials: true, //autorise l'envoi/réception de cookies entre les deux domaines
  });
  console.log("🔓🔓 CORS activé pour https://freeforu-n1u7.onrender.com 🔓🔓");
  }
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("FreeForU API")
    .setDescription("API de la plateforme de réservation d'agents")
    .setVersion("1.0")
    .addCookieAuth("accessToken") // ← ton système d'auth par cookie p
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT) || 3001; // production || local

  await app.listen(port);
  console.log("✅✅ Backend started on http://localhost:3001 ✅✅");
  //port different de next.js : 3000
  // onmoduleInit() declenche par app.init() declenché par app.listen(port)
}

bootstrap();
