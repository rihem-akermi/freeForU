// mail-tester
import { Controller, Post , Get } from "@nestjs/common";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  testEmail() {
    return this.mailService.sendMail("akermirihem16@gmail.com", "💖", "<p>hi</p>", "rahouma") ;
  }
}