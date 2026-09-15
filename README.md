# 🚀 FreeForU — Plateforme de Réservation de Prestations de Services

<p align="center">
  <strong>Mise en relation directe entre clients et prestataires de services indépendants avec gestion dynamique des disponibilités et réservation en temps réel.</strong>
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
  - [9.1. Système OTP (Vérification & Réinitialisation)](#système-otp-vérification-demail--réinitialisation-de-mot-de-passe)
- [10. Base de Données & Modélisation](#10-base-de-données--modélisation)
- [11. Documentation API & Swagger](#11-documentation-api--swagger)
- [12. Structure du Projet](#12-structure-du-projet)
- [13. Installation & Configuration Locale](#13-installation--configuration-locale)
- [14. Variables d'Environnement](#14-variables-denvironnement)
- [15. Choix Techniques & Rationale](#15-choix-techniques--rationale)
- [16. Captures d'Écran](#16-captures-décran)
- [17. Perspectives d'Évolution](#17-perspectives-dévolution)

---

## 1. Aperçu du Projet

**FreeForU** est une plateforme web moderne permettant à des clients de découvrir des prestataires indépendants qualifiés (**Agents**), de consulter leur portfolio de réalisations, leurs tarifs et leurs avis vérifiés, puis de réserver des créneaux d'intervention en toute transparence.

### 🎯 Problématiques résolues

- **Gestion des disponibilités en temps réel** : Résolution des conflits de réservation et synchronisation des plannings hebdomadaires et des jours d'indisponibilité.
- **Sécurisation des échanges et des réservations** : Double validation des interventions terminées, alertes automatiques et gestion des délais d'annulation (règle des 24h).
- **Visibilité pour les artisans/professionnels** : Vitrine personnalisée, portfolio de publications avec modération et gestion de prestations personnalisées ou tarifées.

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

### 🛠️ Espace Agent (Prestataire)

- **Gestion du Planning Hebdomadaire** : Configuration des plages horaires de travail par jour de la semaine (`start_time`, `end_time`, `is_working`).
- **Créneaux & Jours Bloqués** : Déclaration de jours de repos ponctuels (`off`) ou de journées complètes indisponibles (`full`).
- **Traitement des Demandes** : Acceptation ou refus des réservations reçues. L'acceptation d'un créneau rejette automatiquement les demandes concurrentes sur le même créneau.
- **Gestion des Services** : Création, modification et suppression des offres de prestations (prix fixe ou sur devis).
- **Portfolio de Publications** : Ajout de réalisations avec photographies stockées sur Cloudinary (soumises à modération).
- **Double Clôture de Prestation** : Validation de la réalisation pour marquer la réservation comme `terminee`.

### 🛡️ Espace Administration

- **Modération des Publications** : Validation ou rejet des publications soumises par les prestataires avant diffusion publique, avec notification automatique en cas de retrait.
- **Gestion des Utilisateurs & Agents** : Création manuelle, mise à jour des coordonnées et suppression de comptes.
- **Gestion des Catégories** : Administration des catégories de métiers disponibles sur la plateforme.
- **Pilotage Global des Réservations** : Visualisation transversale et création directe de réservations.

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
| **NestJS Schedule (Cron)**       | Backend               | Tâches d'arrière-plan automatisées (archivage, expiration des réservations et rappels 24h).                                   |
| **Swagger / OpenAPI**            | Backend               | Documentation interactive et test des endpoints de l'API REST via `/api/docs`.                                                |

---

## 4. Architecture Globale

Le projet repose sur une architecture découplée frontend/backend communicant via une API REST sécurisée par cookies `httpOnly`.

```mermaid
flowchart TD
    subgraph Frontend["Frontend (Next.js 16)"]
        UI["Composants React / Pages App Router"]
        AxiosClient["Client Axios + Response Interceptor"]
        UI --> AxiosClient
    end

    subgraph Backend["Backend (NestJS 11)"]
        Guard["AuthGuard & RolesGuard"]
        Controller["NestJS Controllers"]
        Service["Services Métier"]
        RedisServ["RedisService (Cache-Aside)"]
        Repo["Repositories Dédiés"]
        CronTask["ScheduleModule (Tâches Cron)"]

        AxiosClient -->|"HTTP Requests + Cookies"| Guard
        Guard --> Controller
        Controller --> Service
        CronTask -.-> Service
        Service -->|"1. Vérification Cache HIT/MISS"| RedisServ
        Service -->|"2. Requête en cas de MISS"| Repo
    end

    subgraph Data["Persistance & Cache"]
        Redis[(Redis Cache)]
        Prisma["Prisma ORM Client"]
        Postgres[(PostgreSQL DB)]
        RedisServ --> Redis
        Repo --> Prisma
        Prisma --> Postgres
    end

    subgraph External["Services Tiers"]
        BrevoAPI["Brevo Transactional API"]
        CloudinaryAPI["Cloudinary CDN"]
        Service -->|"Envoi d'emails"| BrevoAPI
        Service -->|"Upload buffer (Stream)"| CloudinaryAPI
    end
```

### Mise en Cache Redis (Catalogue Public)

La consultation du catalogue d'agents (`GET /agents`) intègre une couche de cache en mémoire Redis pour optimiser les performances de lecture :

- **Stratégie Cache-Aside** : Le serveur interroge Redis en priorité (*Cache HIT*) ; en cas d'absence (*Cache MISS*), les données sont récupérées depuis PostgreSQL puis stockées dans Redis.
- **Clés de cache granulaires** : Les clés dépendent du filtre de catégorie et de la pagination :
  `agents:category:{categoryId|all}:page:{page}:limit:{limit}`
- **Durée de rétention (TTL)** : Les réponses complètes paginées `{ data, meta }` sont conservées pendant **5 minutes (300 secondes)**.
- **Gestion de la fraîcheur** : La synchronisation repose sur l'expiration automatique (TTL) sans invalidation active lors des mutations.
- **Résilience (*Graceful Fallback*)** : En cas d'erreur ou d'indisponibilité de Redis, la requête bascule automatiquement et de manière transparente sur PostgreSQL.

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

---

## 6. Calendrier & Gestion des Disponibilités

Le moteur de calcul des disponibilités (`AvailabilityService`) consolide trois sources de données pour alimenter le calendrier interactif :

1. **Horaires réguliers (`agent_working_hours`)** : Définit les jours ouvrés de la semaine (`day_of_week` de 0 à 6) et les plages `start_time` / `end_time`.
2. **Exceptions de planning (`agent_blocked_slots`)** : Jours marqués comme indisponibles (`off`) ou journées complètes (`full`).
3. **Réservations actives (`reservations`)** : Analyse des rendez-vous existants sur la période demandée.

```mermaid
flowchart TD
    Req["Frontend demande le calendrier du mois (Année/Mois)"] --> Service["AvailabilityService.getClientMonthCalendar() / getAgentMonthCalendar()"]

    subgraph DataFetch["Récupération Parallèle (Promise.all)"]
        WH["WorkingHoursRepository (Jours & Horaires d'ouverture)"]
        BS["BlockedSlotsRepository (Jours bloqués off/full)"]
        Res["ReservationsRepository (Réservations sur le mois)"]
    end

    Service --> WH
    Service --> BS
    Service --> Res

    WH --> Engine["Moteur d'Agrégation & Priorité"]
    BS --> Engine
    Res --> Engine

    subgraph Calculation["Logique de Couleur & Statut"]
        direction TB
        C1["Client : Jaune (en attente) > Violet (confirmée) > Bleu (terminée) > Gris (fermé) > Neutre (ouvert)"]
        C2["Agent : Jaune (en attente) > Bleu (exception full) > Violet (réservé) > Rouge (fermé/off) > Neutre"]
    end

    Engine --> Calculation
    Calculation --> Resp["Réponse JSON structurée { date, status }"]
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
- 🔔 **Rappel 24h avant le rendez-vous** : Cron quotidien (`09:00 AM`) qui envoie un rappel simultané au client et à l'agent pour leur intervention du lendemain.
- 🔐 **Codes de vérification OTP** : Envoi immédiat du code à 6 chiffres pour la validation d'inscription (`EMAIL_VERIFICATION`) ou la réinitialisation de mot de passe (`PASSWORD_RESET`).
- ⚠️ **Publication retirée** : Informe l'agent lorsque sa réalisation est dépubliée par un administrateur.

---

## 8. Gestion des Fichiers & Uploads

Le téléversement de photographies (avatars de profil, portfolio de réalisations) s'effectue sans stockage persistant sur le disque local du serveur grâce au streaming direct vers Cloudinary.

```mermaid
flowchart LR
    Client["Client / Frontend (FormData)"] -->|"POST multipart/form-data"| Interceptor["FileInterceptor (Multer)"]
    Interceptor -->|"Fichier en mémoire (file.buffer)"| UploadService["UploadsService"]
    UploadService -->|"Streamifier (pipe)"| CloudinarySDK["Cloudinary upload_stream"]
    CloudinarySDK -->|"Stockage média"| CDN["Cloudinary CDN"]
    CDN -->|"secure_url"| UploadService
    UploadService -->|"Enregistrement URL"| PrismaDB[(PostgreSQL)]
```

---

## 9. Authentification & Sécurité

L'authentification est totalement stateless côté backend et sécurisée via deux tokens JWT transmis par **cookies `httpOnly`** :

- **`accessToken`** : Validité courte (15 minutes). Protège les routes de l'API.
- **`refreshToken`** : Validité longue (7 jours). Utilisé exclusivement sur `/auth/refresh` pour régénérer un nouvel `accessToken`.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Client Web
    participant Axios as Intercepteur Axios
    participant Backend as NestJS Backend (AuthGuard)
    participant DB as PostgreSQL

    UI->>Backend: POST /auth/login { email, password }
    Backend->>DB: Recherche utilisateur/agent + bcrypt.compare()
    Backend-->>UI: 201 Created + Set-Cookie: accessToken, refreshToken (httpOnly)

    Note over UI,Backend: Requêtes API normales
    UI->>Backend: GET /agents/me (Cookie accessToken envoyé automatiquement)
    Backend-->>UI: 200 OK (Données)

    Note over UI,Backend: Expiration du token d'accès
    UI->>Backend: GET /reservations/me (Token expiré)
    Backend-->>Axios: 401 Unauthorized
    Axios->>Backend: POST /auth/refresh (Cookie refreshToken)
    Backend-->>Axios: 201 Created + Nouveau Cookie accessToken
    Axios->>Backend: Rejeu transparent de la requête initiale
    Backend-->>UI: 200 OK
```

### Gardes & Rôles

- `AuthGuard` : Extrait et vérifie la signature et l'expiration du cookie `accessToken`.
- `RolesGuard` : Inspecte les métadonnées décorées via `@Roles('CLIENT' | 'AGENT' | 'ADMIN')` et restreint l'accès aux utilisateurs autorisés.

### Système OTP (Vérification d'Email & Réinitialisation de Mot de Passe)

FreeForU intègre un système robuste et unifié de vérification par code OTP (*One-Time Password*) à 6 chiffres pour sécuriser deux actions critiques :
1. **La validation d'adresse email** à l'inscription (`purpose: EMAIL_VERIFICATION`).
2. **La réinitialisation de mot de passe oublié** (`purpose: PASSWORD_RESET`).

Cette solution a été développée sur-mesure avec NestJS et Brevo (`MailService.sendOtpEmail()` générique adaptant l'objet et le modèle d'email selon le motif).

Les comptes clients (`users`) et prestataires (`agents`) disposant d'espaces d'identifiants indépendants, tous les codes OTP sont centralisés dans la table dédiée `otp_verifications` (`target_table`, `target_id`, `purpose`).

#### 🔄 Flux Métier

##### 1. Inscription & Vérification d'Email
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

##### 2. Réinitialisation de Mot de Passe Oublié
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
- **Expiration stricte (2 minutes)** : Tout code OTP expire après 120 secondes (`expires_at`).
- **Limitation des tentatives (3 essais max)** : Après 3 échecs de validation, le code est immédiatement invalidé (`INVALIDATED`) pour bloquer les attaques par force brute.
- **Délai d'attente / Cooldown (30 secondes)** : Un intervalle minimum de 30 secondes entre deux demandes de renvoi est contrôlé directement dans la logique métier (`OtpService`).
- **Révocation des anciens codes** : L'émission d'un nouvel OTP invalide automatiquement tout code `PENDING` préexistant pour le même compte et motif.
- **Protection anti-énumération de comptes** : L'endpoint `/auth/forgot-password` retourne systématiquement un message neutre pour empêcher la détection d'adresses enregistrées.
- **Mise à jour atomique du mot de passe** : Le mot de passe n'est haché et sauvegardé qu'après validation stricte et consommation du code OTP.
- **Purge automatique par Cron** : Une tâche planifiée chaque minute (`sweepExpiredOtps`) bascule les codes obsolètes au statut `EXPIRED` pour préserver l'intégrité des données (la sécurité reste autonome en vérifiant `expires_at` à chaque requête).

---

## 10. Base de Données & Modélisation

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
    }

    services {
        int id PK
        int agent_id FK
        string nom
        string type_prix
        float prix
        int duree_estimee
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
```

---

## 11. Documentation API & Swagger

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

---

## 12. Structure du Projet

```text
freeForU/
├── frontend/            # Application Frontend Next.js (App Router)
│   ├── app/                   # Routes Next.js (admin, agent, client, auth: login, signup, verify-email, forgot-password, reset-password)
│   ├── components/            # Composants UI modulaires et modales
│   ├── lib/                   # Utilitaires & configuration client
│   │   ├── api/               # Modules d'appels API typés (Axios)
│   │   │   └── interceptor.ts # Client Axios avec gestion automatique du refresh token
│   │   └── data.ts            # Interfaces TypeScript et modèles de données
│   ├── public/                # Ressources statiques et médias
│   └── middleware.ts          # Middleware d'authentification et de redirection Next.js
│
├── backend/                   # API Backend NestJS
│   ├── prisma/                # Schéma et migrations Prisma
│   │   └── schema.prisma      # Définition des entités PostgreSQL
│   ├── src/                   # Code source de l'application
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
│   └── test/                  # Tests unitaires et d'intégration Jest
│
├── usefulCommands.md          # Guide de référence des commandes fréquentes
└── README.md                  # Documentation globale du projet
```

---

## 13. Installation & Configuration Locale

### Prérequis

- **Node.js** (v20+ recommandé)
- **PostgreSQL** (en local ou distant)
- **Redis** (serveur local ou hébergement managé type Upstash)
- Gestionnaire de paquets **npm**

---

### 1. Installation du Backend

```bash
# Se placer dans le répertoire backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env # ou créer le fichier .env (voir section 14)

# Synchroniser le schéma Prisma avec votre base PostgreSQL
npx prisma db push
# ou générer le client Prisma
npx prisma generate

# Lancer le serveur backend en mode développement
npm run start:dev
```

> Le backend démarre sur `http://localhost:3001` et Swagger est accessible sur `http://localhost:3001/api/docs`.

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

---

## 14. Variables d'Environnement

Créez un fichier `.env` à la racine du dossier `backend/` avec les variables suivantes :

| Variable                | Description                                                          | Exemple / Format                                     |
| :---------------------- | :------------------------------------------------------------------- | :--------------------------------------------------- |
| `DATABASE_URL`          | Chaîne de connexion PostgreSQL                                       | `postgresql://user:password@localhost:5432/freeforu` |
| `REDIS_URL`             | URL de connexion Redis complète (Upstash ou cloud managé)            | `redis://default:token@host:6379`                    |
| `REDIS_HOST`            | Hôte du serveur Redis local (si `REDIS_URL` n'est pas défini)        | `localhost`                                          |
| `REDIS_PORT`            | Port d'écoute Redis local                                            | `6379`                                               |
| `REDIS_PASSWORD`        | Mot de passe Redis (optionnel pour Redis local)                      | `votre_mot_de_passe_redis`                           |
| `JWT_ACCESS_SECRET`     | Clé secrète pour signer les Access Tokens (15 min)                   | `votre_cle_secrete_jwt_access`                       |
| `JWT_REFRESH_SECRET`    | Clé secrète pour signer les Refresh Tokens (7 jours)                 | `votre_cle_secrete_jwt_refresh`                      |
| `CLOUDINARY_CLOUD_NAME` | Nom du compte Cloudinary pour le stockage des photos                 | `votre_cloud_name`                                   |
| `CLOUDINARY_API_KEY`    | Clé d'API publique Cloudinary                                        | `123456789012345`                                    |
| `CLOUDINARY_API_SECRET` | Clé secrète d'API Cloudinary                                         | `votre_api_secret_cloudinary`                        |
| `BREVO_API_KEY`         | Clé d'API pour le service d'emails Brevo                             | `xkeysib-...`                                        |
| `MAIL_FROM_BY_BREVO`    | Adresse email d'expéditeur validée dans Brevo                        | `contact@votre-domaine.com`                          |

---

## 15. Choix Techniques & Rationale

- 🏗️ **NestJS** : Fournit une architecture d'entreprise modulaire et structurée (Controllers, Services, Repositories, DTOs et Pipes de validation) facilitant l'isolation du domaine métier et la maintenabilité à long terme.
- 🗄️ **Prisma & PostgreSQL** : Prisma garantit une sécurité de type de bout en bout (Type-Safe queries) avec PostgreSQL, simplifiant la manipulation des types SQL précis tels que `DATE` et `TIME(6)` indispensables pour un calendrier de réservation.
- ⚡ **Pagination & Cache-Aside Redis (Catalogue des Agents)** :
  - 📄 *Pagination native SQL* : La route publique `GET /agents` implémente `GetPublicAgentsDto` (`page`, `limit` plafonné à 20, `category_id`) avec `skip`/`take` et tri déterministe (`orderBy: { id: 'asc' }`) directement dans PostgreSQL, indexé sur `category_id`.
  - 🧠 *Stratégie Cache-Aside* : La réponse complète `{ data, meta }` est mise en cache dans Redis sous la clé `agents:category:{categoryId|all}:page:{page}:limit:{limit}` pour une durée (TTL) de 5 minutes (300 secondes).
  - 🛡️ *Résilience (Graceful Fallback)* : En cas d'erreur ou d'indisponibilité de Redis, l'application bascule automatiquement sur PostgreSQL sans interruption de service.
  - ⚖️ *Compromis assumés* : La fraîcheur repose sur l'expiration TTL (sans invalidation active à ce stade), et la pagination limite l'impact du calcul des notes agrégées au strict nombre d'agents affichés par page.
- 📬 **Brevo** : Sélectionné pour sa fiabilité dans la distribution d'emails transactionnels, son SDK TypeScript officiel et sa gestion robuste des templates transactionnels.
- ☁️ **Cloudinary** : Permet de décharger le serveur backend de la gestion du système de fichiers en offrant un CDN global, une transformation d'image à la volée et une sécurisation des médias.
- 🔄 **Axios avec Intercepteurs de Réponse** : Permet de gérer le cycle de vie du rafraîchissement des tokens de manière transparente pour l'utilisateur sans exposer les JWT dans le LocalStorage.
- ⏰ **NestJS Schedule (@Cron)** : Automatise sans infrastructure externe complexe les règles de gestion temporelle (expiration des demandes non traitées, archivage et rappels automatiques 24h avant RDV).

---

## 16. Captures d'Écran

### 🖥️ Vitrine & Espace Client

<!-- Add screenshot here: Page d'accueil, recherche d'agents et catalogue des prestations -->

### 📅 Calendrier & Prise de Rendez-vous

<!-- Add screenshot here: Modal de réservation et calendrier interactif des disponibilités -->

### 🛠️ Espace Prestataire (Agent)

<!-- Add screenshot here: Tableau de bord agent, gestion des demandes et configuration des horaires -->

### 🛡️ Panneau d'Administration

<!-- Add screenshot here: Modération des publications et supervision des utilisateurs -->

---

## 17. Perspectives d'Évolution

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
