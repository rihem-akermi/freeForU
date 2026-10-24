// mail-tester
import { Controller, Post } from "@nestjs/common";
import { MailService } from "./mail.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Mail")
@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({
    summary: "Envoyer un email de test (Utilitaire)",
    description:
      "Route utilitaire pour tester le bon fonctionnement du service d'envoi d'emails via Brevo.",
  })
  @ApiResponse({
    status: 201,
    description: "Email de test envoyé avec succès.",
  })
  @Post()
  testEmail() {
    return this.mailService.sendMail(
      "akermirihem16@gmail.com",
      "💖",
      "<p>hi</p>",
      "rahouma"
    );
  }
}
