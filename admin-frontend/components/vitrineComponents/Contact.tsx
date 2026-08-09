"use client";

import { useScrollReveal } from "$/hooks/useScrollReveal";
import { useState } from "react";
import styles from "./Contact.module.css";
import { addContact } from "@/lib/api/contacts";

export default function Contact() {
  const { ref, isVisible } = useScrollReveal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const contactData = {
      name,
      email,
      message,
    };

    const isCreated = await addContact(contactData);
    console.log("is the contact created", isCreated);

    setName("");
    setEmail("");
    setMessage("");
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
  }

  return (
    <section
      id="contact"
      ref={ref}
      className={`${styles.contactSection} ${isVisible ? styles.visible : ""}`}
    >
      <div className="vitrine-container">
        <div className={styles.headerText}>
          <div className="section-badge">RESTONS EN CONTACT</div>
          <h2 className={styles.heading}>Une question ou un projet ?</h2>
          <p className={styles.subtitle}>
            Écrivez-nous directement, notre équipe vous répond dans les plus brefs délais 📩
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.infoCard}>
            <div>
              <h3 className={styles.infoTitle}>Informations de Contact</h3>
              <p className={styles.infoDesc}>
                Besoin d'assistance avec votre compte ou d'informations sur nos services d'artisans et professionnels libéraux ?
              </p>

              <div className={styles.contactDetailsList}>
                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}>✉️</div>
                  <div>
                    <p className={styles.detailLabel}>Email support</p>
                    <p className={styles.detailValue}>contact@freeforu.tn</p>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}>📞</div>
                  <div>
                    <p className={styles.detailLabel}>Téléphone</p>
                    <p className={styles.detailValue}>+216 71 000 000</p>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}>📍</div>
                  <div>
                    <p className={styles.detailLabel}>Adresse</p>
                    <p className={styles.detailValue}>Tunis, Tunisie</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.75)" }}>
                ⚡ Horaires de support : Lun - Sam | 08:00 - 19:00
              </p>
            </div>
          </div>

          <div className={styles.formCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom & Prénom</label>
                <input
                  type="text"
                  value={name}
                  placeholder="Ex: Youssef Ben Ali"
                  onChange={handleNameChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Adresse Email</label>
                <input
                  type="email"
                  value={email}
                  placeholder="Ex: youssef@example.com"
                  onChange={handleEmailChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Votre Message</label>
                <textarea
                  placeholder="Expliquez-nous votre besoin ou votre question..."
                  value={message}
                  rows={5}
                  onChange={handleTextChange}
                  className={styles.textarea}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Envoyer le message ✉️
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}