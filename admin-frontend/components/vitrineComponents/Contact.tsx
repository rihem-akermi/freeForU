"use client";
import { useScrollReveal } from "$/hooks/useScrollReveal";
import { useState } from "react";
import styles from "./Contact.module.css";
import { addContact } from "@/lib/api/contacts";


export default function Contact() {
  const { ref, isVisible } = useScrollReveal();
  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [message ,setMessage] = useState("")
  const [allData , setAllData] = useState({
    name,
    email,
    message
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const contactData = {
      name,
      email,
      message
    };

  const isCreated = await addContact(contactData);

  console.log("is the contact created", isCreated);

  setName("");
  setEmail("");
  setMessage("");
}

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>){
    setName(e.target.value)
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>){
    setEmail(e.target.value)
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>){
    setMessage(e.target.value)
  }

  return (
    <section
      id = "contact"
      ref={ref}
      className={`${styles.contact} ${isVisible ? styles.visible : ""}`}
    >
      <h2>Contactez-nous</h2>
      <p>Une question ? Écrivez-nous, on vous répond rapidement 📩</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input 
          type="text" 
          value={name}
          placeholder="Votre nom et prenom" 
          onChange={(e)=>handleNameChange(e)}
          required />
        <input 
          type="email" 
          value={email}
          placeholder="Votre email" 
          onChange={(e)=>handleEmailChange(e)}
          required />
        <textarea 
          placeholder="Votre message" 
          value={message}
          rows={4} 
          onChange={(e)=>handleTextChange(e)}
          required />
        <button type="submit">Envoyer</button>
      </form>
    </section>
  );
}