// mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient, BrevoError } from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private brevo: BrevoClient;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail = process.env.MAIL_FROM_BY_BREVO!;
  private readonly fromName = 'FreeForU';

  constructor() {
    this.brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY!,
      timeoutInSeconds: 30,
      maxRetries: 3,
    });
  }

  async sendMail(to: string, subject: string, htmlContent: string, toName?: string) {
    try {
      const result = await this.brevo.transactionalEmails.sendTransacEmail({
        subject,
        htmlContent,
        sender: { name: this.fromName, email: this.fromEmail },
        to: [{ email: to, name: toName ?? to }],
      });
      this.logger.log(`✅ Email envoyé à ${to} — sujet : "${subject}" — Message ID: ${result.messageId}`);
      return result;
    } catch (error) {
      if (error instanceof BrevoError) {
        this.logger.error(`❌ Échec envoi email à ${to} (Brevo) — ${error.message}`);
      } else {
        this.logger.error(`❌ Échec envoi email à ${to}`, error);
      }
    }
  }

  // ─── CLIENT : réservation confirmée par l'agent ─────────────────────────
  async sendReservationConfirmed(to: string, data: {
    clientName: string;
    agentName: string;
    serviceNom: string | null;
    dateReservation: string;
    heureReservation: string | null;
  }) {
    const subject = `✅ Votre réservation est confirmée — ${data.serviceNom ?? 'Demande personnalisée'}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #0B162C;">Bonjour ${data.clientName} 👋</h2>
        <p>Votre réservation a été <strong>confirmée</strong> par ${data.agentName}.</p>
        <div style="background: #f5f4f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Service :</strong> ${data.serviceNom ?? 'Demande personnalisée'}</p>
          <p style="margin: 4px 0;"><strong>Date :</strong> ${data.dateReservation}</p>
          ${data.heureReservation ? `<p style="margin: 4px 0;"><strong>Heure :</strong> ${data.heureReservation}</p>` : ''}
        </div>
        <p style="color: #666;">Soyez ponctuel(le) et bonne prestation !</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FreeForU — Plateforme de réservation d'agents</p>
      </div>
    `;
    return this.sendMail(to, subject, html, data.clientName);
  }

  // ─── CLIENT : réservation rejetée par l'agent ───────────────────────────
  async sendReservationRejected(to: string, data: {
    clientName: string;
    agentName: string;
    serviceNom: string | null;
    dateReservation: string;
  }) {
    const subject = `❌ Votre demande de réservation a été refusée`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #0B162C;">Bonjour ${data.clientName},</h2>
        <p>Malheureusement, votre demande de réservation auprès de <strong>${data.agentName}</strong> a été <strong>refusée</strong>.</p>
        <div style="background: #f5f4f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Service demandé :</strong> ${data.serviceNom ?? 'Demande personnalisée'}</p>
          <p style="margin: 4px 0;"><strong>Date :</strong> ${data.dateReservation}</p>
        </div>
        <p>Vous pouvez faire une nouvelle demande auprès d'un autre agent disponible sur FreeForU.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FreeForU — Plateforme de réservation d'agents</p>
      </div>
    `;
    return this.sendMail(to, subject, html, data.clientName);
  }

  // ─── CLIENT + AGENT : rappel 24h avant le RDV ───────────────────────────
  async sendReminder24h(to: string, data: {
    name: string;
    role: 'client' | 'agent';
    otherPartyName: string;
    serviceNom: string | null;
    dateReservation: string;
    heureReservation: string | null;
  }) {
    const subject = `🔔 Rappel — Votre RDV est demain`;
    const roleLabel = data.role === 'client' ? 'prestation' : 'intervention';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #0B162C;">Bonjour ${data.name} 👋</h2>
        <p>Vous avez une <strong>${roleLabel}</strong> prévue <strong>demain</strong> avec ${data.otherPartyName}.</p>
        <div style="background: #f5f4f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Service :</strong> ${data.serviceNom ?? 'Demande personnalisée'}</p>
          <p style="margin: 4px 0;"><strong>Date :</strong> ${data.dateReservation}</p>
          ${data.heureReservation ? `<p style="margin: 4px 0;"><strong>Heure :</strong> ${data.heureReservation}</p>` : ''}
        </div>
        <p style="color: #666;">Pensez à préparer tout ce qu'il faut à l'avance 💼</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FreeForU — Plateforme de réservation d'agents</p>
      </div>
    `;
    return this.sendMail(to, subject, html, data.name);
  }

  // ─── AGENT : nouvelle réservation reçue ─────────────────────────────────
  async sendNewReservationToAgent(to: string, data: {
    agentName: string;
    clientName: string;
    serviceNom: string | null;
    customRequest: string | null;
    dateReservation: string;
    heureReservation: string | null;
    heureFinReservation: string | null;
  }) {
    const subject = `📬 Nouvelle demande de réservation reçue`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #0B162C;">Bonjour ${data.agentName} 👋</h2>
        <p>Vous avez reçu une <strong>nouvelle demande de réservation</strong> de la part de <strong>${data.clientName}</strong>.</p>
        <div style="background: #f5f4f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Service :</strong> ${data.serviceNom ?? 'Demande personnalisée'}</p>
          ${data.customRequest ? `<p style="margin: 4px 0;"><strong>Détails :</strong> ${data.customRequest}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Date souhaitée :</strong> ${data.dateReservation}</p>
          ${data.heureReservation ? `<p style="margin: 4px 0;"><strong>Heure de début :</strong> ${data.heureReservation}</p>` : ''}
          ${data.heureFinReservation ? `<p style="margin: 4px 0;"><strong>Heure de fin :</strong> ${data.heureFinReservation}</p>` : ''}
        </div>
        <p>Connectez-vous à votre espace pour <strong>confirmer ou rejeter</strong> cette demande.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FreeForU — Plateforme de réservation d'agents</p>
      </div>
    `;
    return this.sendMail(to, subject, html, data.agentName);
  }

  // ─── AGENT : réservation annulée par le client ──────────────────────────
  async sendReservationCancelledToAgent(to: string, data: {
    agentName: string;
    clientName: string;
    serviceNom: string | null;
    dateReservation: string;
    heureReservation: string | null;
  }) {
    const subject = `🚫 Réservation annulée par le client`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #0B162C;">Bonjour ${data.agentName},</h2>
        <p><strong>${data.clientName}</strong> a <strong>annulé</strong> sa réservation.</p>
        <div style="background: #f5f4f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Service :</strong> ${data.serviceNom ?? 'Demande personnalisée'}</p>
          <p style="margin: 4px 0;"><strong>Date :</strong> ${data.dateReservation}</p>
          ${data.heureReservation ? `<p style="margin: 4px 0;"><strong>Heure :</strong> ${data.heureReservation}</p>` : ''}
        </div>
        <p style="color: #666;">Ce créneau est maintenant libéré dans votre agenda.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FreeForU — Plateforme de réservation d'agents</p>
      </div>
    `;
    return this.sendMail(to, subject, html, data.agentName);
  }

  // ─── AGENT : publication supprimée par l'admin ──────────────────────────
  async sendPublicationRemovedToAgent(to: string, data: {
    agentName: string;
    publicationTitre: string;
  }) {
    const subject = `⚠️ Votre publication a été retirée`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #0B162C;">Bonjour ${data.agentName},</h2>
        <p>Votre publication <strong>"${data.publicationTitre}"</strong> a été <strong>retirée</strong> de la plateforme par l'équipe FreeForU.</p>
        <p>Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FreeForU — Plateforme de réservation d'agents</p>
      </div>
    `;
    return this.sendMail(to, subject, html, data.agentName);
  }
}