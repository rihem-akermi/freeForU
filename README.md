# 🚀 FreeForU — Plateforme de Réservation de Prestations de Services

<p align="center">
  <strong>Mise en relation directe entre clients et prestataires de services indépendants avec gestion dynamique des disponibilités et réservation en temps réel.</strong>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,nodejs,nestjs,postgres,prisma,redis,cloudinary" alt="Tech Stack Icons" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis_Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

---

## 📑 Table des Matières

- [1. Aperçu du Projet](#1-aperçu-du-projet)
- [2. Fonctionnalités Principales](#2-fonctionnalités-principales)
- [3. Tech Stack](#3-stack-technique)
- [4. Architecture Globale](#4-architecture-globale)
  - [4.1. Mise en Cache Redis (Catalogue Public)](#mise-en-cache-redis-catalogue-public)
- [5. Cycle de Vie des Réservations](#5-cycle-de-vie-des-réservations)
- [6. Calendrier & Gestion des Disponibilités](#6-calendrier--gestion-des-disponibilités)
- [7. Système de Notifications Email](#7-système-de-notifications-email)
- [8. Gestion des Fichiers & Uploads](#8-gestion-des-fichiers--uploads)
- [9. Authentification & Sécurité](#9-authentification--sécurité)
  - [Proxy inverse Next.js](#proxy-inverse-nextjs)
  - [9.1. Système OTP (Vérification & Réinitialisation)](#système-otp-vérification-demail--réinitialisation-de-mot-de-passe)
- [10. Assistant IA FreeForU](#10-assistant-ia-freeforu)
- [11. Base de Données & Modélisation](#11-base-de-données--modélisation)
- [12. Documentation API & Swagger](#12-documentation-api--swagger)
- [13. Structure du Projet](#13-structure-du-projet)
- [14. Installation & Configuration Locale](#14-installation--configuration-locale)
- [15. Variables d'Environnement](#15-variables-denvironnement)
- [16. Choix Techniques & Rationale](#16-choix-techniques--rationale)
- [17. Captures d'Écran](#17-captures-décran)
- [18. Perspectives d'Évolution](#18-perspectives-dévolution)

---

## 1. Aperçu du Projet

**FreeForU** est une plateforme web moderne permettant à des clients de découvrir des prestataires indépendants qualifiés (**Agents**), de consulter leur portfolio de réalisations, leurs tarifs et leurs avis vérifiés, puis de réserver des créneaux d'intervention en toute transparence.

### 🎯 Problématiques résolues

- **Gestion des disponibilités en temps réel** : Résolution des conflits de réservation et synchronisation des plannings hebdomadaires et des jours d'indisponibilité.
- **Sécurisation des échanges et des réservations** : Double validation des interventions terminées, alertes automatiques et gestion des délais d'annulation (règle des 24h).
- **Visibilité pour les artisans/professionnels** : Vitrine personnalisée, portfolio de publications avec modération et gestion de prestations personnalisées ou tarifées.
- **Accompagnement et contrôle de la plateforme** : Vérification des adresses email par OTP, assistant IA, modération des contenus et gestion centralisée des contacts.

### 👥 Rôles Utilisateurs

1. **Client (`CLIENT`)** : Recherche des professionnels par nom ou catégorie, consulte les calendriers de disponibilité, soumet des demandes (service au forfait ou besoin sur-mesure), gère ses rendez-vous et dépose des avis.
2. **Agent (`AGENT`)** : Configure ses horaires de travail hebdomadaires et jours de repos/congés, gère son catalogue de services et son portfolio, accepte/refuse les demandes de rendez-vous et confirme la fin des prestations.
3. **Administrateur (`ADMIN`)** : Supervise la plateforme, gère les utilisateurs et les agents, modère les publications (validation/rejet) et administre le référentiel des catégories.

---

## 2. Fonctionnalités Principales

### 👤 Espace Client

- **Catalogue & Recherche** : Consultation paginée du catalogue avec filtrage par catégorie de métier, navigation précédente/suivante et recherche par nom.
- **Consultation de Profil & Portfolio** : Accès aux détails du profil, bio, zone d'intervention, mode de déplacement (`se_deplace`, `recoit`, `les_deux`), avis clients et galerie de travaux réalisés.
- **Réservation Flexible** : Choix entre un service prédéfini au catalogue (avec tarif et durée) ou formulation d'une demande personnalisée (`custom_request`).
- **Calendrier Visuel Interactif** : Visualisation en direct des statuts de chaque jour (créneaux ouverts, fermés, demandes en attente, confirmées ou terminées).
- **Gestion des Rendez-vous & Annulation** : Suivi des réservations et annulation autonome possible jusqu'à 24h avant le début de la prestation.
- **Évaluation & Avis** : Notation (1 à 5 étoiles) et commentaire après réalisation conjointe de la prestation.
- **Assistance IA** : Génération de contenu pour les profils, services et publications, avec validation par l'utilisateur avant utilisation.

### 🛠️ Espace Agent (Prestataire)

- **Gestion du Planning Hebdomadaire** : Configuration des plages horaires de travail par jour de la semaine (`start_time`, `end_time`, `is_working`).
- **Créneaux & Jours Bloqués** : Déclaration de jours de repos ponctuels (`off`) ou de journées complètes indisponibles (`full`).
- **Traitement des Demandes** : Acceptation ou refus des réservations reçues. L'acceptation d'un créneau rejette automatiquement les demandes concurrentes sur le même créneau.
- **Gestion des Services** : Création, modification et suppression des offres de prestations (prix fixe ou sur devis).
- **Portfolio de Publications** : Ajout de réalisations avec photographies stockées sur Cloudinary (soumises à modération).
- **Profil professionnel enrichi** : Gestion de la zone d'intervention, du mode de déplacement, de l'expérience, des liens sociaux et des justificatifs de vérification.
- **Double Clôture de Prestation** : Validation de la réalisation pour marquer la réservation comme `terminee`.

### 🛡️ Espace Administration

- **Modération des Publications** : Validation ou rejet des publications soumises par les prestataires avant diffusion publique, avec notification automatique en cas de retrait.
- **Gestion des Utilisateurs & Agents** : Création manuelle, mise à jour des coordonnées et suppression de comptes.
- **Gestion des Catégories** : Administration des catégories de métiers disponibles sur la plateforme.
- **Pilotage Global des Réservations** : Visualisation transversale et création directe de réservations.
- **Gestion des Contacts** : Consultation et suppression des messages envoyés depuis le formulaire de contact.

---

## 3. Stack Technique

| Technologie                      | Emplacement           | Rôle & Utilité                                                                                                                |
| :------------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Next.js (v16 App Router)**     | Frontend (`frontend`) | Framework React pour le rendu hybride, le routage moderne et les composants clients/serveurs.                                 |
| **React 19 & TypeScript**        | Frontend              | Bibliothèque UI déclarative et typage statique strict.                                                                        |
| **Tailwind CSS (v4)**            | Frontend              | Framework CSS utilitaire pour des interfaces modernes et réactives.                                                           |
| **Axios & js-cookie**            | Frontend              | Client HTTP configuré avec intercepteur pour la gestion des cookies JWT et le rafraîchissement automatique de session.        |
| **NestJS (v11)**                 | Backend (`backend`)   | Framework Node.js modulaire, typé et scalable basé sur Express.                                                               |
| **Prisma ORM (v7)**              | Backend               | Gestion du schéma de base de données, migrations et client de requêtes typées PostgreSQL.                                     |
| **PostgreSQL**                   | Base de données       | Système de gestion de base de données relationnelle robuste avec contraintes d'intégrité et types temporels (`DATE`, `TIME`). |
| **Redis (`ioredis`)**            | Cache en mémoire      | Cache haute performance (*Cache-Aside*) pour optimiser la consultation paginée des agents et soulager PostgreSQL.             |
| **JWT (`@nestjs/jwt`) & bcrypt** | Backend               | Chiffrement des mots de passe et sécurisation des routes par tokens d'accès et de rafraîchissement via cookies `httpOnly`.    |
| **Brevo (`@getbrevo/brevo`)**    | Backend               | Service d'envoi d'emails transactionnels (notifications et rappels de rendez-vous).                                           |
| **Cloudinary & Multer**          | Backend               | Téléversement direct en flux mémoire (`Buffer` / `streamifier`) et hébergement optimisé des médias.                           |
| **NestJS Schedule (Cron)**       | Backend               | Tâches d'arrière-plan : expiration et archivage des réservations toutes les heures, rappels de rendez-vous toutes les heures et purge OTP chaque minute. |
| **Groq, Google Gemini & Zod**    | Backend (`ai`)        | Génération de contenu, assistant conversationnel, embeddings sémantiques et validation des sorties structurées.              |
| **NestJS Config & Throttler**    | Backend               | Chargement du fichier `.env` et limitation des requêtes sur le module IA.                                                   |
| **Swagger / OpenAPI**            | Backend               | Documentation interactive et test des endpoints de l'API REST via `/api/docs`.                                                |

---

## 4. Architecture Globale

Le projet repose sur un frontend Next.js découplé d'une API REST NestJS. Dans le navigateur, Axios envoie les appels vers le chemin `/api` du frontend ; la règle de réécriture Next.js les transmet au backend. Les pages qui chargent leurs données côté serveur appellent directement l'API NestJS. L'authentification utilise des cookies `httpOnly`.

```mermaid
flowchart TD
    subgraph Frontend["🖥️ Frontend (Next.js 16)"]
        UI["Composants React / Pages App Router"]
        AxiosClient["Client Axios + Response Interceptor"]
        UI --> AxiosClient
    end

    subgraph Backend["⚙️ Backend (NestJS 11)"]
        Guard["AuthGuard & RolesGuard"]
        Controller["NestJS Controllers"]
        Service["Services Métier"]
        RedisServ["RedisService (Cache-Aside)"]
        Repo["Repositories Dédiés"]
        CronTask["ScheduleModule (Tâches Cron)"]

        AxiosClient -->|"/api via rewrite + cookies"| Guard
        Guard --> Controller
        Controller --> Service
        CronTask -.->|"Tâches planifiées dans le backend"| Service
        Service -->|"1. Vérification Cache HIT/MISS"| RedisServ
        Service -->|"2. Requête en cas de MISS"| Repo
    end

    subgraph Data["💾 Persistance & Cache"]
        Redis[(Redis Cache)]
        Prisma["Prisma ORM Client"]
        Postgres[(PostgreSQL DB)]
        RedisServ --> Redis
        Repo --> Prisma
        Prisma -->|"Connexion PostgreSQL"| Postgres
    end

    subgraph External["🌐 Services Tiers"]
        BrevoAPI["Brevo Transactional API"]
        CloudinaryAPI["Cloudinary CDN"]
        Service -->|"Envoi d'emails"| BrevoAPI
        Service -->|"Upload buffer (Stream)"| CloudinaryAPI
    end

    subgraph AI["🤖 Services IA"]
        AiService["AiService (RAG, tool calling, embeddings)"]
        GroqAPI["Groq Cloud API"]
        GeminiAPI["Google Gemini API"]
        AiService --> GroqAPI
        AiService --> GeminiAPI
    end

    style Frontend fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af
    style Backend fill:#fdf2f8,stroke:#ec4899,stroke-width:2px,color:#9d174d
    style Data fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#166534
    style External fill:#fefce8,stroke:#eab308,stroke-width:2px,color:#854d0e

    style UI fill:#ffffff,stroke:#3b82f6,color:#1e3a8a
    style AxiosClient fill:#ffffff,stroke:#3b82f6,color:#1e3a8a
    style Guard fill:#ffffff,stroke:#ec4899,color:#831843
    style Controller fill:#ffffff,stroke:#ec4899,color:#831843
    style Service fill:#ffffff,stroke:#ec4899,color:#831843
    style RedisServ fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b
    style Repo fill:#ffffff,stroke:#ec4899,color:#831843
    style CronTask fill:#ffffff,stroke:#a855f7,color:#6b21a8
    style Redis fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b
    style Prisma fill:#ffffff,stroke:#22c55e,color:#14532d
    style Postgres fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    style BrevoAPI fill:#ffffff,stroke:#eab308,color:#713f12
    style CloudinaryAPI fill:#ffffff,stroke:#6366f1,color:#3730a3
    style AI fill:#f5f3ff,stroke:#8b5cf6,stroke-width:2px,color:#5b21b6
    style AiService fill:#ffffff,stroke:#8b5cf6,color:#5b21b6
    style GroqAPI fill:#ffffff,stroke:#8b5cf6,color:#5b21b6
    style GeminiAPI fill:#ffffff,stroke:#8b5cf6,color:#5b21b6
```

### Mise en Cache Redis (Catalogue Public)

La consultation du catalogue d'agents (`GET /agents`) intègre une couche de cache en mémoire Redis pour optimiser les performances de lecture :

- **Stratégie Cache-Aside** : Le serveur interroge Redis en priorité (*Cache HIT*) ; en cas d'absence (*Cache MISS*), les données sont récupérées depuis PostgreSQL puis stockées dans Redis.
- **Clés de cache granulaires** : Les clés dépendent de la catégorie, de la ville et de la pagination :
  `agents:category:{categoryId|all}:ville:{ville|all}:page:{page}:limit:{limit}`
- **Durée de rétention (TTL)** : Les réponses complètes paginées `{ data, meta }` sont conservées pendant **5 minutes (300 secondes)**.
- **Gestion de la fraîcheur** : La synchronisation repose sur l'expiration automatique (TTL) sans invalidation active lors des mutations.
- **Comportement si Redis est indisponible** : Les méthodes `get` et `set` de `RedisService` journalisent les erreurs ; `get` renvoie un cache miss. Le catalogue public poursuit alors sa lecture depuis PostgreSQL. Les autres fonctions qui dépendent de Redis, comme la mémoire de conversation, n'ont pas ce même mécanisme de repli garanti.
- **Mémoire IA** : Redis conserve temporairement l'historique des conversations et le référentiel des catégories utilisé par l'assistant.

---

## 5. Cycle de Vie des Réservations

Les réservations suivent un cycle d'état strict géré dans la table `reservations`.

```mermaid
stateDiagram-v2
    [*] --> en_attente: Le client soumet une réservation

    en_attente --> confirmee: L'agent accepte la demande
    en_attente --> rejetee: L'agent refuse la demande
    en_attente --> rejetee: Rejet auto (conflit de créneau validé)
    en_attente --> expiree: Cron horaire (date/heure dépassée sans réponse)
    en_attente --> annulee: Le client annule (> 24h avant RDV)

    confirmee --> annulee: Le client annule (> 24h avant RDV)

    state confirmee {
        [*] --> EnAttenteValidation
        EnAttenteValidation --> AgentValide: Agent confirme l'exécution
        EnAttenteValidation --> ClientValide: Client confirme l'exécution
        AgentValide --> Termine: Client confirme aussi
        ClientValide --> Termine: Agent confirme aussi
    }

    confirmee --> terminee: Validation conjointe (agent_confirmed & client_confirmed)

    terminee --> [*]: Déblocage du dépôt d'avis (Reviews)
    rejetee --> [*]
    annulee --> [*]
    expiree --> [*]
```

### Détail des statuts :

- `en_attente` : Demande créée par le client, en attente de réponse de l'artisan/agent.
- `confirmee` : Réservation acceptée par l'agent.
- `rejetee` : Demande refusée explicitement par l'agent ou rejetée automatiquement car un autre créneau en conflit a été validé.
- `annulee` : Réservation annulée par le client (autorisé uniquement si le délai avant l'intervention est strictement supérieur à 24 heures).
- `expiree` : Demande restée en attente alors que la date/heure de prestation est passée (traitée par tâche Cron horaire).
- `terminee` : Prestation effectuée et validée conjointement par les deux parties (`agent_confirmed = true` et `client_confirmed = true`).

Les tâches d'expiration et d'archivage sont exécutées toutes les heures. Les réservations en attente dont l'horaire est passé sont marquées expirées ; les réservations rejetées, annulées ou expirées sont archivées après une heure. Lorsqu'une réservation confirmée occupe un créneau, les demandes en attente qui se chevauchent pour le même agent sont automatiquement rejetées. Les informations du service choisi (nom et prix au moment de la réservation) sont également conservées dans la réservation.

---

## 6. Calendrier & Gestion des Disponibilités

Le moteur de calcul des disponibilités (`AvailabilityService`) consolide trois sources de données pour alimenter le calendrier interactif :

1. **Horaires réguliers (`agent_working_hours`)** : Définit les jours ouvrés de la semaine (`day_of_week` de 0 à 6) et les plages `start_time` / `end_time`.
2. **Exceptions de planning (`agent_blocked_slots`)** : Jours marqués comme indisponibles (`off`) ou journées complètes (`full`).
3. **Réservations actives (`reservations`)** : Analyse des rendez-vous existants sur la période demandée.

Les calendriers exposent aussi le détail d'une journée (`ouvert`, `ferme` ou `sans_info`). Côté client, un jour passé sans réservation est affiché comme fermé ; côté agent, les statuts distinguent les demandes en attente, les réservations, les exceptions `full` et les jours `off`.

```mermaid
flowchart TD
    Req["Frontend demande le calendrier du mois (Année/Mois)"] --> Service["AvailabilityService.getClientMonthCalendar() / getAgentMonthCalendar()"]

    subgraph DataFetch["📥 Récupération Parallèle (Promise.all)"]
        WH["WorkingHoursRepository (Jours & Horaires d'ouverture)"]
        BS["BlockedSlotsRepository (Jours bloqués off/full)"]
        Res["ReservationsRepository (Réservations sur le mois)"]
    end

    Service --> WH
    Service --> BS
    Service --> Res

    WH --> Engine["⚙️ Moteur d'Agrégation & Priorité"]
    BS --> Engine
    Res --> Engine

    subgraph Calculation["🎨 Logique de Couleur & Statut"]
        direction TB
        C1["Client : Jaune (en attente) > Violet (confirmée) > Bleu (terminée) > Gris (fermé) > Neutre (ouvert)"]
        C2["Agent : Jaune (en attente) > Bleu (exception full) > Violet (réservé) > Rouge (fermé/off) > Neutre"]
    end

    Engine --> Calculation
    Calculation --> Resp["📤 Réponse JSON structurée { date, status }"]

    style Req fill:#eff6ff,stroke:#3b82f6,color:#1e40af
    style Service fill:#fdf2f8,stroke:#ec4899,color:#9d174d
    style DataFetch fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#166534
    style WH fill:#ffffff,stroke:#22c55e,color:#14532d
    style BS fill:#ffffff,stroke:#22c55e,color:#14532d
    style Res fill:#ffffff,stroke:#22c55e,color:#14532d
    style Engine fill:#fefce8,stroke:#eab308,stroke-width:2px,color:#854d0e
    style Calculation fill:#f5f3ff,stroke:#8b5cf6,stroke-width:2px,color:#5b21b6
    style C1 fill:#ffffff,stroke:#8b5cf6,color:#4c1d95
    style C2 fill:#ffffff,stroke:#8b5cf6,color:#4c1d95
    style Resp fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#065f46
```

---

## 7. Système de Notifications Email

FreeForU intègre le SDK officiel **Brevo** (`@getbrevo/brevo`) pour distribuer les emails transactionnels en temps réel et lors de l'exécution de tâches planifiées.

```mermaid
sequenceDiagram
    autonumber
    participant App as FreeForU (Reservations / Admin)
    participant Mail as MailService
    participant Brevo as Brevo API (Transactional)
    participant User as Destinataire (Client / Agent)

    App->>Mail: Déclenchement de l'événement (ex: confirmation)
    Mail->>Brevo: transactionalEmails.sendTransacEmail(payload HTML)
    Brevo-->>Mail: Confirmation d'envoi (Message ID)
    Brevo->>User: Réception de l'email formaté
```

### Événements de notification implémentés :

- 📬 **Nouvelle réservation reçue** : Envoyé à l'agent avec les détails du client, le service demandé ou la description personnalisée, ainsi que la plage horaire.
- ✅ **Réservation confirmée** : Notifie le client que l'agent a accepté sa demande.
- ❌ **Réservation rejetée** : Informe le client du refus avec invitation à sélectionner un autre artisan disponible.
- 🚫 **Réservation annulée par le client** : Notifie l'agent de la libération du créneau horaire.
- 🔔 **Rappel de rendez-vous** : Tâche planifiée toutes les heures qui recherche les réservations confirmées dans la fenêtre des prochaines 24 heures et envoie un rappel au client et à l'agent, une seule fois par réservation.
- 🔐 **Codes de vérification OTP** : Envoi immédiat du code à 6 chiffres pour la validation d'inscription (`EMAIL_VERIFICATION`) ou la réinitialisation de mot de passe (`PASSWORD_RESET`).
- ⚠️ **Publication retirée** : Informe l'agent lorsque sa réalisation est dépubliée par un administrateur.

Le service Brevo utilise un délai d'attente de 30 secondes et jusqu'à trois tentatives pour les appels au fournisseur. Les erreurs d'envoi sont journalisées côté backend.

---

## 8. Gestion des Fichiers & Uploads

Le téléversement de photographies (avatars de profil et portfolio de réalisations) s'effectue sans stockage persistant sur le disque local du serveur grâce au streaming direct vers Cloudinary. Les fichiers sont reçus en mémoire avec Multer puis envoyés vers les dossiers Cloudinary correspondant à leur usage.

```mermaid
flowchart LR
    Client["📱 Client / Frontend (FormData)"] -->|"POST multipart/form-data"| Interceptor["FileInterceptor (Multer)"]
    Interceptor -->|"Fichier en mémoire (file.buffer)"| UploadService["UploadsService"]
    UploadService -->|"Streamifier (pipe)"| CloudinarySDK["Cloudinary upload_stream"]
    CloudinarySDK -->|"Stockage média"| CDN["☁️ Cloudinary CDN"]
    CDN -->|"secure_url"| UploadService
    UploadService -->|"Enregistrement URL"| PrismaDB[(💾 PostgreSQL)]

    style Client fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af
    style Interceptor fill:#fdf2f8,stroke:#ec4899,color:#9d174d
    style UploadService fill:#fdf2f8,stroke:#ec4899,stroke-width:2px,color:#9d174d
    style CloudinarySDK fill:#fefce8,stroke:#eab308,color:#854d0e
    style CDN fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#3730a3
    style PrismaDB fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#166534
```

---

## 9. Authentification & Sécurité

L'authentification utilise deux tokens JWT transmis par **cookies `httpOnly`**. Les requêtes API sont validées avec l'access token, tandis que les sessions de refresh sont suivies côté backend pour permettre la rotation et la révocation :

- **`accessToken`** : Validité courte (15 minutes). Protège les routes de l'API.
- **`refreshToken`** : Validité longue (7 jours). Utilisé exclusivement sur `/auth/refresh` ; chaque rafraîchissement le remplace par un nouveau token.

Les refresh tokens sont stockés en base uniquement sous forme de hash. Leur rotation invalide l'ancien token, et la déconnexion révoque le refresh token de la session.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Navigateur
    participant Axios as Axios (baseURL /api)
    participant Next as Réécriture Next.js
    participant Backend as NestJS Backend
    participant DB as PostgreSQL

    UI->>Axios: POST /auth/login { email, password }
    Axios->>Next: POST /api/auth/login
    Next->>Backend: Réécriture vers /auth/login
    Backend->>DB: Recherche du compte + bcrypt.compare()
    Backend-->>Next: 201 Created + Set-Cookie
    Next-->>Axios: Réponse + Set-Cookie
    Axios-->>UI: Réponse de connexion

    UI->>Axios: GET /agents/me
    Axios->>Next: GET /api/agents/me + cookies
    Next->>Backend: Réécriture vers /agents/me + cookies
    Backend->>DB: Authentification et lecture des données
    Backend-->>Next: 200 OK
    Next-->>Axios: 200 OK
    Axios-->>UI: Données

    Note over UI,Backend: Renouvellement après une réponse 401
    Backend-->>Axios: 401 Unauthorized
    Axios->>Next: POST /api/auth/refresh + refreshToken
    Next->>Backend: Réécriture vers /auth/refresh
    Backend->>DB: Vérifie et renouvelle la session
    Backend-->>Next: 201 Created + nouveaux cookies
    Next-->>Axios: Réponse + Set-Cookie
    Axios->>Next: Rejeu de la requête initiale via /api
    Next->>Backend: Réécriture de la requête
    Backend-->>Next: Réponse API
    Next-->>Axios: Réponse API
    Axios-->>UI: Résultat après renouvellement
```

### Réécriture API et requêtes serveur Next.js

Dans le navigateur, Axios utilise le chemin relatif `/api`. La règle de réécriture de `frontend/next.config.ts` transmet les appels `/api/...` au backend NestJS défini par `BACKEND_URL`. Les pages qui chargent des données côté serveur utilisent `frontend/lib/api/server.ts` pour appeler directement le backend et lui transmettre les cookies de la requête entrante. `frontend/proxy.ts` protège les pages `/admin`, `/agent` et `/client` : il accepte un access token présent ou tente de renouveler la session avec le refresh token avant de laisser accéder à la page.

Les cookies `accessToken` et `refreshToken` restent `httpOnly` : JavaScript ne peut pas les lire. Le navigateur les envoie aux requêtes du domaine frontend et la réécriture `/api` transmet les cookies au backend ainsi que ses réponses `Set-Cookie`. Les cookies ne définissent pas de `Domain`, et le frontend et le backend de production utilisent des domaines Render distincts ; le navigateur accède donc au backend via la réécriture du frontend.

Configurez `BACKEND_URL` dans l'environnement du service frontend (en production : `https://freeforu.onrender.com`). Cette variable sert à la réécriture, au contrôle de session dans `proxy.ts` et aux appels côté serveur. Les appels effectués dans le navigateur continuent d'utiliser `/api`.

### Gardes & Rôles

- `AuthGuard` : Extrait et vérifie la signature et l'expiration du cookie `accessToken`.
- `RolesGuard` : Inspecte les métadonnées décorées via `@Roles('CLIENT' | 'AGENT' | 'ADMIN')` et restreint l'accès aux utilisateurs autorisés.
- **CORS** : Le backend autorise l'origine exacte définie par `FRONTEND_URL` avec `credentials: true`. Définissez cette variable sur `http://localhost:3000` en développement et sur le domaine frontend Render en production. Les appels du navigateur passent par la réécriture `/api` du frontend.

### Système OTP (Vérification d'Email & Réinitialisation de Mot de Passe)

FreeForU intègre un système robuste et unifié de vérification par code OTP (*One-Time Password*) à 6 chiffres pour sécuriser deux actions critiques :
1. **La validation d'adresse email** à l'inscription (`purpose: EMAIL_VERIFICATION`).
2. **La réinitialisation de mot de passe oublié** (`purpose: PASSWORD_RESET`).

Cette solution a été développée sur-mesure avec NestJS et Brevo (`MailService.sendOtpEmail()` générique adaptant l'objet et le modèle d'email selon le motif).

Les comptes clients (`users`) et prestataires (`agents`) disposant d'espaces d'identifiants indépendants, tous les codes OTP sont centralisés dans la table dédiée `otp_verifications` (`target_table`, `target_id`, `purpose`).

#### 🔄 Flux Métier

#### 1. Inscription & Vérification d'Email
```mermaid
sequenceDiagram
    autonumber
    participant User as Utilisateur (Client / Agent)
    participant UI as Frontend (/verify-email)
    participant API as Backend (Auth / OtpService)
    participant Mail as Brevo MailService
    participant DB as PostgreSQL (otp_verifications)

    User->>API: Inscription (POST /auth/signup)
    API->>DB: Création du compte (email_verified_at = null)
    API->>DB: Génération & stockage hashé de l'OTP (SHA-256)
    API->>Mail: Envoi du code à 6 chiffres par email
    API-->>UI: Compte créé & redirection vers /verify-email?email=...
    User->>UI: Saisie du code à 6 chiffres
    UI->>API: POST /auth/verify-email { email, code }
    API->>DB: Contrôle du hash, expiration & nombre d'essais
    API->>DB: Mise à jour email_verified_at & marquage CONSUMED
    API-->>UI: 200 OK (Email vérifié avec succès)
```

#### 2. Réinitialisation de Mot de Passe Oublié
```mermaid
sequenceDiagram
    autonumber
    participant User as Utilisateur (Client / Agent)
    participant UI as Frontend (/reset-password)
    participant API as Backend (Auth / OtpService)
    participant Mail as Brevo MailService
    participant DB as PostgreSQL (users / agents / otp_verifications)

    User->>API: POST /auth/forgot-password { email }
    Note over API: Réponse générique (Anti-énumération)
    API->>DB: Recherche du compte & génération OTP
    API->>Mail: Envoi de l'email de réinitialisation avec code OTP
    API-->>UI: Message générique & redirection vers /reset-password?email=...
    User->>UI: Saisie du code OTP, nouveau mot de passe et confirmation
    UI->>API: POST /auth/reset-password { email, code, newPassword }
    API->>DB: Validation du code OTP (OtpService.verifyCode)
    API->>DB: Hachage bcrypt & mise à jour du mot de passe (updateUserPassword / updateAgentPassword)
    API-->>UI: 200 OK (Mot de passe réinitialisé avec succès)
```

#### 🔌 Endpoints Publics

Ces routes sont publiques car elles interviennent avant ou en dehors de la session authentifiée :

##### 1. `POST /auth/verify-email`
Valide le code OTP saisi par l'utilisateur et active l'adresse email du compte (`email_verified_at`).

- **Requête :**
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Réponse (`200 OK`) :**
  ```json
  {
    "message": "Email vérifié avec succès"
  }
  ```

##### 2. `POST /auth/resend-otp`
Génère et expédie un nouveau code de vérification par email, en invalidant l'ancien code en cours. Accepte l'objectif (`purpose`) souhaité.

- **Requête :**
  ```json
  {
    "email": "user@example.com",
    "purpose": "EMAIL_VERIFICATION" // ou "PASSWORD_RESET"
  }
  ```
- **Réponse (`200 OK`) :**
  ```json
  {
    "message": "Nouveau code envoyé"
  }
  ```

##### 3. `POST /auth/forgot-password`
Initie la demande de réinitialisation en envoyant un code OTP par email si le compte existe.

- **Requête :**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Réponse (`200 OK`) :**
  ```json
  {
    "message": "Si ce compte existe, un code a été envoyé"
  }
  ```
  *(Message générique neutre évitant la fuite d'informations sur l'existence d'une adresse email).*

##### 4. `POST /auth/reset-password`
Opération atomique combinée : valide le code OTP fourni et applique immédiatement le nouveau mot de passe haché avec `bcrypt`. Si le code est invalide, expiré ou si les tentatives sont épuisées, le mot de passe reste inchangé.

- **Requête :**
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "newPassword": "MonNouveauMotDePasse123!"
  }
  ```
- **Réponse (`200 OK`) :**
  ```json
  {
    "message": "Mot de passe réinitialisé avec succès"
  }
  ```

#### 🛡️ Mesures de Sécurité

- **Hachage cryptographique SHA-256** : Le code à 6 chiffres (généré via Node.js `crypto.randomInt`) n'est jamais stocké en clair ; seul son hash SHA-256 est persisté en base de données.
- **Hachage des mots de passe** : Les mots de passe des utilisateurs et des agents sont hachés avec `bcrypt`.
- **Expiration stricte (2 minutes)** : Tout code OTP expire après 120 secondes (`expires_at`).
- **Limitation des tentatives (3 essais max)** : Après 3 échecs de validation, le code est immédiatement invalidé (`INVALIDATED`) pour bloquer les attaques par force brute.
- **Délai d'attente / Cooldown (30 secondes)** : Un intervalle minimum de 30 secondes entre deux demandes de renvoi est contrôlé directement dans la logique métier (`OtpService`).
- **Révocation des anciens codes** : L'émission d'un nouvel OTP invalide automatiquement tout code `PENDING` préexistant pour le même compte et motif.
- **Protection anti-énumération de comptes** : L'endpoint `/auth/forgot-password` retourne systématiquement un message neutre pour empêcher la détection d'adresses enregistrées.
- **Mise à jour atomique du mot de passe** : Le mot de passe n'est haché et sauvegardé qu'après validation stricte et consommation du code OTP.
- **Purge automatique par Cron** : Une tâche planifiée chaque minute (`sweepExpiredOtps`) bascule les codes obsolètes au statut `EXPIRED` pour préserver l'intégrité des données (la sécurité reste autonome en vérifiant `expires_at` à chaque requête).

---

## 10. Assistant IA FreeForU

FreeForU intègre des fonctionnalités d'intelligence artificielle pour accompagner les **Agents** dans la présentation de leurs services et les **Clients / Visiteurs** dans leur recherche et leur parcours de réservation.

### Capacités principales

- **Assistance rédactionnelle pour les Agents** : génération et reformulation de biographies professionnelles, de fiches de prestations et de publications de portfolio à partir de descriptions brutes.
- **Assistant conversationnel pour les Clients et Visiteurs** : le widget `AssistantWidget` répond aux questions sur les règles de la plateforme grâce au contexte de politique intégré au backend. Pour les clients authentifiés, il peut rechercher des prestataires, comparer des tarifs et demander l'annulation d'une réservation via les outils métier disponibles. Il est masqué pour les Agents et les Administrateurs.
- **Recherche sémantique de prestations** : les embeddings Google Gemini permettent de retrouver des services pertinents même lorsque les termes employés diffèrent de leur intitulé exact.

### Intégration dans la plateforme

Le module IA est intégré au backend NestJS et réutilise les services métier existants pour les agents, les prestations et les réservations. **Groq Cloud** assure la génération de texte et le *tool calling*, **Google Gemini** les embeddings, **Redis** la mémoire conversationnelle et le cache des catégories, et **Zod** la validation des sorties structurées. La politique utilisée par l'assistant est définie statiquement dans `backend/src/ai/knowledge/freeforu-policy.ts` et insérée dans son instruction système ; les embeddings des services sont calculés à partir de leur nom et de leur description et stockés dans la colonne `services.embedding` de PostgreSQL. La recherche calcule la similarité cosinus côté application, sans base vectorielle séparée.

Les gardes NestJS contrôlent l'accès aux fonctionnalités : les visiteurs non connectés peuvent consulter les connaissances générales de la plateforme, les clients authentifiés peuvent utiliser les outils autorisés et la génération de contenu est réservée aux Agents. Les règles d'autorisation et de réservation restent appliquées par les services métier.

Les routes IA sont regroupées sous `/ai` : `POST /ai/ask`, `/ai/generate-bio`, `/ai/generate-service-infos`, `/ai/generate-publication-infos`, `/ai/assistant` et `/ai/search-services`. L'assistant ne transmet aucun outil aux visiteurs anonymes ; pour un client connecté, ses outils permettent la recherche d'agents, la comparaison des tarifs et la demande d'annulation d'une réservation. Pour les flux détaillés, la configuration, la sécurité et l'évaluation, consulter la [documentation technique complète de l'IA](docs/AI.md).

---

## 11. Base de Données & Modélisation

Schéma relationnel géré avec Prisma ORM sous PostgreSQL.

```mermaid
erDiagram
    users ||--o{ reservations : "effectue"
    users ||--o{ reviews : "rédige"
    agents ||--o{ reservations : "reçoit"
    agents ||--o{ reviews : "reçoit"
    agents ||--o{ publications : "publie"
    agents ||--o{ services : "propose"
    agents ||--o{ agent_working_hours : "définit"
    agents ||--o{ agent_blocked_slots : "bloque"
    categories ||--o{ agents : "catégorise"
    services ||--o{ reservations : "concerne"
    reservations ||--o| reviews : "génère"

    users {
        int id PK
        string name
        string email UK
        string password
        string role
        string ville
        string phone
        string photo_url
        datetime created_at
        datetime email_verified_at
    }

    agents {
        int id PK
        string name
        string email
        string phone
        string password
        string role
        int category_id FK "Indexé (idx_agents_category_id)"
        string ville
        string zone
        string service_mode
        string verification_status
        string photo_url
        string bio
        int age
        string sexe
        int experience_years
        json social_links
        string id_card_url
        string work_certificate_url
        datetime email_verified_at
    }

    reservations {
        int id PK
        int client_id FK
        int agent_id FK
        int service_id FK
        date date_reservation
        time heure_reservation
        time heure_fin_reservation
        string status
        string custom_request
        boolean agent_confirmed
        boolean client_confirmed
        boolean reminder_sent
        boolean archived
        string service_nom
        float service_prix
        datetime created_at
        datetime updated_at
    }

    services {
        int id PK
        int agent_id FK
        string nom
        string type_prix
        float prix
        string description
        int duree_estimee
        datetime created_at
        json embedding
    }

    agent_working_hours {
        int id PK
        int agent_id FK
        int day_of_week
        time start_time
        time end_time
        boolean is_working
    }

    agent_blocked_slots {
        int id PK
        int agent_id FK
        date date
        string type
        string reason
    }

    publications {
        int id PK
        int agent_id FK
        string titre
        string description
        string photo_url
        string status
        int likes_count
        int saved_count
        datetime created_at
    }

    reviews {
        int id PK
        int reservation_id FK,UK
        int agent_id FK
        int client_id FK
        int rating
        string comment
    }

    categories {
        int id PK
        string name UK
    }

    contacts {
        int idcontact PK
        string name
        string email
        string message
        datetime created_at
    }

    otp_verifications {
        int id PK
        string target_table
        int target_id
        string purpose
        string code_hash
        string status
        datetime expires_at
        int attempts
        datetime consumed_at
        datetime invalidated_at
        datetime created_at
    }
```

---

## 12. Documentation API & Swagger

Le backend embarque une documentation interactive conforme à OpenAPI via `@nestjs/swagger`.

- **URL de l'interface Swagger** : `http://localhost:3001/api/docs`
- **Authentification intégrée** : Compatible avec l'authentification par cookie `accessToken`.
- **Modules documentés** :
  - `Auth` : Inscription, connexion, validation OTP email, réinitialisation de mot de passe, rafraîchissement de token, profil session et déconnexion.
  - `Agents` : Recherche publique, catalogue public paginé (paramètres `page`, `limit` max 20, `category_id` retournant `{ data, meta }`), profils détaillés, mise à jour portfolio et CRUD d'administration.
  - `Users` : Gestion des profils clients.
  - `Reservations` : Création client/admin, workflow d'acceptation, annulation et clôture.
  - `Availability` : Calcul des calendriers agents et clients.
  - `WorkingHours` & `BlockedSlots` : Gestion des plages de travail et des congés.
  - `Publications` : Gestion des réalisations et modération administrateur.
  - `Services` : CRUD des prestations proposées par les artisans.
  - `Reviews` : Dépôt et consultation des avis notés.
  - `Categories` & `Contacts` : Référentiels métiers et formulaires de contact.
  - `AI` : Assistant conversationnel, génération de contenu pour les Agents et recherche sémantique sous le préfixe `/ai`.

Les principales familles de routes sont `auth`, `agents`, `users`, `reservations`, `availability`, `working-hours`, `blocked-slots`, `services`, `publications`, `reviews`, `categories`, `contacts` et `ai`. Les droits sont appliqués au niveau des contrôleurs avec `AuthGuard`, `RolesGuard` ou `OptionalAuthGuard` selon le cas.

---

## 13. Structure du Projet

```text
freeForU/
├── frontend/            # Application Frontend Next.js (App Router)
│   ├── app/                   # Routes Next.js (admin, agent, client, auth: login, signup, verify-email, forgot-password, reset-password)
│   ├── components/            # Composants UI modulaires et modales
│   │   ├── assistant/          # Widget conversationnel IA
│   │   ├── vitrineComponents/  # Composants de la vitrine publique
│   │   ├── AiRawInputModal.tsx # Saisie libre pour les suggestions IA
│   │   └── AiSuggestionModal.tsx # Résultat IA éditable avant utilisation
│   ├── lib/                   # Utilitaires & configuration client
│   │   ├── api/               # Modules d'appels API typés (Axios)
│   │   │   ├── ai.ts          # Appels de l'assistant et de génération IA
│   │   │   └── interceptor.ts # Client Axios avec gestion automatique du refresh token
│   │   └── data.ts            # Interfaces TypeScript et modèles de données
│   ├── context/               # Contexte d'authentification côté client
│   ├── public/                # Ressources statiques et médias
│   ├── proxy.ts               # Protection des pages admin, agent et client / renouvellement de session
│   └── next.config.ts         # Réécriture des requêtes /api vers le backend
│
├── backend/                   # API Backend NestJS
│   ├── prisma/                # Schéma et migrations Prisma
│   │   └── schema.prisma      # Définition des entités PostgreSQL
│   ├── src/                   # Code source de l'application
│   │   ├── ai/                # Module IA (RAG, outils métier et embeddings)
│   │   │   ├── dto/        # DTOs des prompts et recherches IA
│   │   │   ├── knowledge/  # Référentiel métier utilisé par le RAG
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.module.ts
│   │   │   └── ai.service.ts
│   │   ├── agents/            # Module de gestion des prestataires
│   │   ├── auth/              # Module d'authentification (JWT, Guards, Decorators)
│   │   ├── availability/      # Moteur de calcul des disponibilités & calendriers
│   │   ├── blocked-slots/     # Gestion des exceptions et jours d'indisponibilité
│   │   ├── categories/        # Référentiel des catégories de métiers
│   │   ├── common/            # Utilitaires transversaux (formatage dates/heures)
│   │   ├── contacts/          # Gestion des messages de contact
│   │   ├── mail/              # Service d'envoi d'emails transactionnels (Brevo)
│   │   ├── otp/               # Module de gestion, hashage et validation des codes OTP
│   │   ├── prisma/            # Service d'instanciation de la base de données
│   │   ├── publications/      # Gestion du portfolio et modération admin
│   │   ├── redis/             # Module Redis (cache en mémoire, stratégie Cache-Aside avec ioredis)
│   │   ├── reservations/      # Logique de réservation, workflow et tâches Cron
│   │   ├── reviews/           # Gestion des avis et notations
│   │   ├── services/          # Catalogue de prestations des agents
│   │   ├── uploads/           # Intégration Cloudinary pour le téléversement
│   │   ├── users/             # Gestion des comptes clients et administrateurs
│   │   ├── working-hours/     # Horaires de travail hebdomadaires
│   │   ├── app.module.ts      # Module racine de l'application
│   │   └── main.ts            # Point d'entrée NestJS (CORS, Pipes, Swagger)
│   ├── scripts/               # Évaluation IA, embeddings et maintenance ponctuelle
│   └── test/                  # Tests unitaires et d'intégration Jest
│
└── README.md                  # Documentation globale du projet
```

---

## 14. Installation & Configuration Locale

### Prérequis

- **Node.js** (version compatible avec les versions courantes de Next.js 16 et NestJS 11 ; Node.js 20+)
- **PostgreSQL** (en local ou distant)
- **Redis** (requis par le catalogue mis en cache et la mémoire conversationnelle ; URI fournie via `REDIS_URL`)
- Gestionnaire de paquets **npm**

---

### 1. Installation du Backend

```bash
# Se placer dans le répertoire backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer le fichier .env (voir section 15)

# Synchroniser le schéma Prisma avec votre base PostgreSQL
npx prisma db push
# Générer le client Prisma (utile après une modification du schéma)
npx prisma generate

# Lancer le serveur backend en mode développement
npm run start:dev
```

> Le backend démarre sur `http://localhost:3001` et Swagger est accessible sur `http://localhost:3001/api/docs`.

Pour valider le backend sans mode watch : `npm run build`, `npm test` ou `npm run test:e2e` selon le niveau de vérification souhaité.

---

### 2. Installation du Frontend

```bash
# Ouvrir un second terminal et se placer dans frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement Next.js
npm run dev
```

> L'application frontend est accessible sur `http://localhost:3000`.

Une version de production peut être vérifiée avec `npm run build`, puis lancée avec `npm run start`.

---

## 15. Variables d'Environnement

Créez un fichier `.env` à la racine du dossier `backend/` avec les variables suivantes :

| Variable                | Service | Description                                                          | Exemple / Format                                     |
| Variable | Service | Description | Exemple / Format |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | Chaîne de connexion PostgreSQL (Neon en production). | `postgresql://user:password@host/db?sslmode=require` |
| `REDIS_URL` | Backend | URI de connexion Redis (obligatoire pour les fonctionnalités Redis utilisées). | `redis://default:token@host:6379` |
| `FRONTEND_URL` | Backend | Origine frontend autorisée par CORS. | `http://localhost:3000` |
| `BACKEND_URL` | Frontend | URL absolue du backend pour les réécritures, le proxy de session et les appels serveur. | `http://localhost:3001` |
| `JWT_ACCESS_SECRET` | Backend | Clé de signature des tokens d'accès (15 min). | Secret aléatoire |
| `JWT_REFRESH_SECRET` | Backend | Clé de signature des tokens de rafraîchissement (7 jours). | Secret aléatoire |
| `CLOUDINARY_CLOUD_NAME` | Backend | Nom du compte Cloudinary pour les médias. | `votre_cloud_name` |
| `CLOUDINARY_API_KEY` | Backend | Clé d'API Cloudinary. | Valeur fournie par Cloudinary |
| `CLOUDINARY_API_SECRET` | Backend | Secret d'API Cloudinary. | Secret fourni par Cloudinary |
| `BREVO_API_KEY` | Backend | Clé d'API pour l'envoi des emails transactionnels. | `xkeysib-...` |
| `MAIL_FROM_BY_BREVO` | Backend | Adresse expéditeur validée dans Brevo. | `contact@votre-domaine.com` |
| `GROQ_API_KEY` | Backend | Clé d'accès Groq pour la génération de texte et le *tool calling*. | `gsk_...` |
| `GROQ_MODEL_NAME` | Backend | Modèle Groq utilisé (facultatif, valeur par défaut dans le code : `openai/gpt-oss-120b`). | Nom de modèle Groq |
| `GOOGLE_AI_API_KEY` | Backend | Clé Google AI utilisée pour les embeddings Gemini. | Clé API Google AI |

Les variables listées sont celles lues directement par le code de l'application. Configurez `BACKEND_URL` dans le service frontend et les autres variables dans le backend. En production, `BACKEND_URL` vaut `https://freeforu.onrender.com`, `FRONTEND_URL` vaut `https://freeforu-n1u7.onrender.com`, et `DATABASE_URL` pointe vers Neon PostgreSQL. Gardez les secrets uniquement dans l'environnement de déploiement ou dans des fichiers `.env` non suivis par Git. Les variables Redis séparées `REDIS_HOST`, `REDIS_PORT` et `REDIS_PASSWORD` ne sont pas utilisées par le constructeur Redis actif ; celui-ci lit `REDIS_URL`.

### Déploiement en production

- **Frontend (Render)** : [https://freeforu-n1u7.onrender.com](https://freeforu-n1u7.onrender.com)
- **Backend API (Render)** : [https://freeforu.onrender.com](https://freeforu.onrender.com)
- **Base de données** : PostgreSQL hébergé sur Neon.
- **Documentation API** : `https://freeforu.onrender.com/api/docs`.

---

## 16. Choix Techniques & Rationale

- 🏗️ **NestJS** : Fournit une architecture d'entreprise modulaire et structurée (Controllers, Services, Repositories, DTOs et Pipes de validation) facilitant l'isolation du domaine métier et la maintenabilité à long terme.
- 🗄️ **Prisma & PostgreSQL** : Prisma garantit une sécurité de type de bout en bout (Type-Safe queries) avec PostgreSQL, simplifiant la manipulation des types SQL précis tels que `DATE` et `TIME(6)` indispensables pour un calendrier de réservation.
- ⚡ **Pagination & Cache-Aside Redis (Catalogue des Agents)** :
  - 📄 *Pagination native SQL* : La route publique `GET /agents` implémente `GetPublicAgentsDto` (`page`, `limit` plafonné à 20, `category_id`) avec `skip`/`take` et tri déterministe (`orderBy: { id: 'asc' }`) directement dans PostgreSQL, indexé sur `category_id`.
  - 🧠 *Stratégie Cache-Aside* : La réponse complète `{ data, meta }` est mise en cache dans Redis sous la clé `agents:category:{categoryId|all}:ville:{ville|all}:page:{page}:limit:{limit}` pour une durée (TTL) de 5 minutes (300 secondes).
  - 🛡️ *Repli du catalogue* : Si la lecture Redis échoue, le service traite la requête comme un cache miss et lit les agents depuis PostgreSQL. Les erreurs d'écriture Redis sont journalisées et n'annulent pas la réponse du catalogue ; cette tolérance n'est pas un repli général garanti pour les autres fonctions Redis.
  - ⚖️ *Compromis assumés* : La fraîcheur repose sur l'expiration TTL (sans invalidation active à ce stade), et la pagination limite l'impact du calcul des notes agrégées au strict nombre d'agents affichés par page.
- 📬 **Brevo** : Sélectionné pour sa fiabilité dans la distribution d'emails transactionnels, son SDK TypeScript officiel et sa gestion robuste des templates transactionnels.
- ☁️ **Cloudinary** : Permet de décharger le serveur backend de la gestion du système de fichiers en offrant un CDN global, une transformation d'image à la volée et une sécurisation des médias.
- 🔄 **Axios avec Intercepteurs de Réponse** : Permet de gérer le cycle de vie du rafraîchissement des tokens de manière transparente pour l'utilisateur sans exposer les JWT dans le LocalStorage.
- ⏰ **NestJS Schedule (@Cron)** : Automatise les règles de gestion temporelle dans le backend. Les réservations en attente expirées et les réservations rejetées, annulées ou expirées à archiver sont traitées toutes les heures ; les rappels recherchent également toutes les heures les rendez-vous confirmés dans la fenêtre des prochaines 24 heures. Le module OTP purge chaque minute les codes expirés.
- 🤖 **Module IA séparé** : Le découpage contrôleur/service/DTO, la validation Zod et les gardes NestJS permettent de réutiliser les services métier sans contourner leurs règles d'autorisation.

---

## 17. Captures d'Écran

### 🖥️ Vitrine & Espace Client

<!-- Ajouter ici une capture de la page d'accueil, de la recherche d'agents ou du catalogue des prestations. -->

### 📅 Calendrier & Prise de Rendez-vous

<!-- Ajouter ici une capture du calendrier des disponibilités ou de la modal de réservation. -->

### 🛠️ Espace Prestataire (Agent)

<!-- Ajouter ici une capture du tableau de bord agent et de la gestion des services. -->

### 🛡️ Panneau d'Administration

<!-- Ajouter ici une capture de la modération ou de la supervision des utilisateurs. -->

---

## 18. Perspectives d'Évolution

_Fonctionnalités futures envisagées pour enrichir la plateforme :_

- 💳 **Passerelle de Paiement Intégrée** : Intégration d'un système d'acompte ou de paiement en ligne (ex: Stripe, Konnect ou Flouci) lors de la confirmation d'une réservation.
- 💬 **Messagerie Instantanée en Temps Réel** : Intégration de WebSockets (Socket.io / NestJS Gateways) pour permettre un chat direct entre le client et l'artisan avant intervention.
- 📍 **Géolocalisation & Carte Interactive** : Recherche visuelle des artisans sur une carte avec calcul de distance et de rayon de déplacement.
- 📱 **Notifications SMS / WhatsApp** : Alertes instantanées par SMS pour les confirmations et rappels d'urgence.
- 📊 **Statistiques & Tableau de Bord Financier pour Agents** : Graphiques de revenus mensuels, taux d'occupation et métriques de performance.

---

<p align="center">
  Développé avec passion pour simplifier la réservation de services indépendants.
</p>
