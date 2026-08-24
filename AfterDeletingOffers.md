# FreeForU — Architecture fonctionnelle et technique (backend + frontend)

> Document unique de référence pour comprendre **les fichiers**, **leurs relations**, **les endpoints**, **les rôles**, et la propagation des modifications (avec un focus détaillé sur la partie calendrier/disponibilités).

---

## 1) Vue d’ensemble

Le projet est organisé en 2 applications principales :

- `backend/` : API NestJS + Prisma (PostgreSQL)
- `admin-frontend/` : Next.js (App Router), UI admin/agent/client

Architecture logique côté backend :

- `Controller` → reçoit HTTP, applique guards/rôles
- `Service` → logique métier
- `Repository` → accès DB (Prisma)

Architecture logique côté frontend :

- `app/**/page.tsx` → pages par rôle
- `components/**` → composants UI métiers
- `lib/api/*.ts` → couche d’accès API (axios + interceptor)

---

## 2) Modules backend actifs

`backend/src/app.module.ts` importe les modules suivants :

- `AuthModule`
- `UsersModule`
- `AgentsModule`
- `ReservationsModule`
- `CategoriesModule`
- `PublicationsModule`
- `ReviewsModule`
- `WorkingHoursModule`
- `BlockedSlotsModule`
- `AvailabilityModule`
- `ContactsModule`
- `UploadsModule`
- `PrismaModule`, `DatabaseModule`

Cela couvre les ressources métier principales : utilisateurs, agents, réservations, offre/publication, agenda/disponibilité, contacts, avis.

---

## 3) Authentification, autorisation, rôles

## 3.1 Auth

Fichiers clés :

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/guards/auth.guard.ts`
- `backend/src/auth/guards/roles.guard.ts`
- `backend/src/auth/decorators/roles.decorator.ts`

Endpoints auth principaux :

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/signup`
- `POST /auth/logout`
- `GET /auth/me` (protégé)

Les cookies `accessToken` + `refreshToken` sont utilisés (httpOnly).

## 3.2 Rôles

Rôles actifs dans le code :

- `ADMIN`
- `AGENT`
- `CLIENT`

Le contrôle d’accès est appliqué via `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(...)`.

---

## 4) Cartographie ressources ↔ fichiers ↔ endpoints

## 4.1 Users

**Backend**

- Controller : `backend/src/users/users.controller.ts`
- Service : `backend/src/users/users.service.ts`
- Repository : `backend/src/users/users.repository.ts`

**Endpoints**

- `GET /users` (non protégé actuellement)
- `GET /users/me` (`CLIENT`)
- `POST /users` (`ADMIN`)
- `PATCH /users/me` (`CLIENT`, photo)
- `PATCH /users/:id` (`ADMIN`)
- `DELETE /users/:id` (`ADMIN`)
- `GET /users/search?name=...`

**Notes métier importantes**

- Suppression utilisateur : convertit erreurs Prisma FK (`P2003`, `P2014`) en `409 Conflict` avec message clair.

---

## 4.2 Agents

**Backend**

- Controller : `backend/src/agents/agents.controller.ts`
- Service : `backend/src/agents/agents.service.ts`
- Repository : `backend/src/agents/agents.repository.ts`

**Endpoints**

- `GET /agents` — **public**, liste tous les agents (filtre optionnel `?category_id=`), utilisée pour la grille de la page d'accueil client (`app/client/page.tsx`) depuis la suppression d'Offers. Chaque agent retourné inclut `rating_average`/`rating_count`, calculés à la volée via `AgentsRepository.getRatingSummary()` (agrégat Prisma sur `reviews`, une requête par agent — acceptable au volume actuel du projet, à optimiser en requête groupée si le nombre d'agents grandit significativement)
- `GET /agents/:id`
- `GET /agents/me` (`AGENT`)
- `POST /agents` (`ADMIN`)
- `PATCH /agents/me` (`AGENT`, photo)
- `PATCH /agents/:id` (`ADMIN`)
- `DELETE /agents/:id` (`ADMIN`)
- `GET /agents/search?name=...`

**Notes métier importantes**

- Création agent force `role: "AGENT"` côté repository.
- Suppression agent : FK Prisma convertie en `409 Conflict` avec message métier.

---

## 4.3 Categories

**Backend**

- Controller : `backend/src/categories/categories.controller.ts`
- Service : `backend/src/categories/categories.service.ts`
- Repository : `backend/src/categories/categories.repository.ts`

**Endpoints**

- `GET /categories`
- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

**Notes métier importantes**

- Suppression catégorie : FK Prisma convertie en `409 Conflict`.

---

## 4.4 Reservations

**Backend**

- Controller : `backend/src/reservations/reservations.controller.ts`
- Service : `backend/src/reservations/reservations.service.ts`
- Repository : `backend/src/reservations/reservations.repository.ts`

**Endpoints**

- `GET /reservations` (liste globale)
- `GET /reservations/me` (`CLIENT`)
- `GET /reservations/agent/me` (`AGENT`) — liste complète des réservations reçues par l'agent
- `GET /reservations/agent/me/day?date=YYYY-MM-DD` (`AGENT`)
- `POST /reservations` (`ADMIN`) — création avec `clientId`, `agentId`, `dateReservation`, `heureReservation`, `customRequest` (obligatoire)
- `POST /reservations/me` (`CLIENT`) — création client
- `PATCH /reservations/:id/agent-status` (`AGENT`) — l'agent fait passer une réservation `en_attente` à `confirmee` ou `annulee`
- `PATCH /reservations/:id/confirm-completion` (`AGENT` ou `CLIENT`)
- `PATCH /reservations/:id` (`ADMIN`)
- `DELETE /reservations/:id` (`ADMIN`)

**Notes métier importantes**

- **⚠️ Refactor majeur** : le concept `Offer` a été entièrement supprimé du projet (voir §4.8, retiré). `customRequest` est désormais **obligatoire** (`@MinLength(5)`) sur toute création de réservation — `offer_id` n'existe plus en DB ni dans le type `Reservation`. `validateOfferOrCustomRequest()` a été supprimée du service (plus nécessaire, la validation XOR n'a plus de sens sans offre).
- Gestion de conflit de créneau (`findConflict`) avant création.
- **Cycle de vie du statut** (3 étapes distinctes, chacune avec son propriétaire) :
  1. `en_attente` — statut par défaut à la création (client)
  2. `confirmee` / `annulee` — décidé par l'**agent** via `agent-status` (`UpdateAgentStatusDto`, `@IsIn(["confirmee", "annulee"])`) ; ownership vérifié (`reservation.agent_id === req.user.sub`) ; refusé si le statut n'est pas déjà `en_attente` (`409 Conflict`, "déjà traitée")
  3. `terminee` — nécessite la confirmation des **2 parties** (`agent_confirmed` + `client_confirmed`) via `confirm-completion`, jamais atteignable directement. **Les deux boutons sont maintenant implémentés** : côté agent dans `agent/reservations/page.tsx`, côté client dans `client/reservations/page.tsx` — avant l'ajout du bouton client, aucune réservation ne pouvait jamais atteindre `terminee` (bug bloquant corrigé).
- Le passage direct à `terminee` via `agent-status` est volontairement interdit (anti-fraude : empêche l'agent de clôturer unilatéralement et de débloquer un avis avant réalisation effective du service).

---

## 4.5 Working Hours (hebdomadaire)

**Backend**

- Controller : `backend/src/working-hours/working-hours.controller.ts`
- Service : `backend/src/working-hours/working-hours.service.ts`
- Repository : `backend/src/working-hours/working-hours.repository.ts`

**Endpoints**

- `GET /working-hours/me?week_start=YYYY-MM-DD` (`AGENT`)
- `PUT /working-hours/me` (`AGENT`) — upsert jour semaine
- `DELETE /working-hours/me/:dayOfWeek?week_start=...` (`AGENT`)
- `GET /working-hours/agent/:agentId?week_start=...` (public)

**Notes**

- Validation de cohérence horaire côté service (`start_time < end_time`).
- Les horaires sont gérés **par semaine** (pas un template global unique).

---

## 4.6 Blocked Slots (blocages ponctuels)

**Backend**

- Controller : `backend/src/blocked-slots/blocked-slots.controller.ts`
- Service : `backend/src/blocked-slots/blocked-slots.service.ts`
- Repository : `backend/src/blocked-slots/blocked-slots.repository.ts`

**Endpoints**

- `GET /blocked-slots/me` (`AGENT`)
- `POST /blocked-slots` (`AGENT`)
- `DELETE /blocked-slots/:id` (`AGENT`)

**Notes**

- Un blocage `start_time = null` représente une journée complète bloquée.
- Ownership vérifié avant suppression (`slot.agent_id === req.user.sub`).

---

## 4.7 Availability (calculée)

**Backend**

- Controller : `backend/src/availability/availability.controller.ts`
- Service : `backend/src/availability/availability.service.ts`

**Endpoints**

- `GET /availability/agent/:agentId?year=YYYY&month=M` (calendrier mensuel)
- `GET /availability/agent/:agentId/day?date=YYYY-MM-DD` (détail journalier)

**Statuts renvoyés**

- `vert`
- `orange`
- `rouge`
- `sans_info`

---

## 4.8 Offers — ❌ SUPPRIMÉ

Le concept `Offer` a été **entièrement retiré du projet** (refactor majeur, voir §4.4 pour l'impact sur `reservations`). Supprimé :
- Table `offers` (DB) + colonne `reservations.offer_id` + FK associée
- `model offers` et relation `agents.offers[]` dans `schema.prisma`
- Module backend complet (`src/offers/`)
- `lib/api/offers.ts` (frontend)
- Page `app/agent/offers/page.tsx` + lien Sidebar agent correspondant
- Onglet "Offres" dans `admin/moderation/page.tsx`
- Combo de sélection d'offre dans `ReservationForm.tsx` (client) et `ReservationsTable.tsx` (admin) — remplacés par un champ `customRequest` texte libre, désormais obligatoire

**Remplacement côté page d'accueil client** : au lieu d'une grille d'offres, `app/client/page.tsx` affiche désormais une **grille de profils agents** — voir §4.2 (nouvelle route `GET /agents` publique, avec note moyenne calculée à la volée via `getRatingSummary()`).

---

## 4.9 Publications

**Backend**

- Controller : `backend/src/publications/publications.controller.ts`
- Service : `backend/src/publications/publications.service.ts`
- Repository : `backend/src/publications/publications.repository.ts`

**Endpoints**

- Agent : `GET /publications/me`, `POST /publications`, `PATCH /publications/:id`, `DELETE /publications/:id`
- Admin : `GET /publications/admin` (retourne uniquement `status: "en_attente"` via `findPending()`), `PATCH /publications/:id/status`
- Public : `GET /publications/agent/:agentId`

**Notes métier importantes**

- **Bug corrigé** : `GET /publications/admin` appelait à l'origine `findAll()` (repository), qui retournait **toutes** les publications sans filtre de statut — après approbation/rejet, la publication réapparaissait dans la liste "en attente" au rechargement, donnant l'impression que l'action n'avait pas persisté (alors que l'`UPDATE` fonctionnait bien). Fix : nouvelle méthode `findPending()` avec `where: { status: "en_attente" }`, branchée sur `getPendingPublications()` (service) et la route `admin` (controller). `findAll()` reste disponible dans le repository pour un usage futur (vue admin "toutes publications, tous statuts"), mais n'est plus utilisée par la route de modération.

---

## 4.10 Reviews

**Backend**

- Controller : `backend/src/reviews/reviews.controller.ts`
- Service : `backend/src/reviews/reviews.service.ts`
- Repository : `backend/src/reviews/reviews.repository.ts`

**Endpoints**

- `POST /reviews` (`CLIENT`)
- `GET /reviews/agent/:agentId`
- `GET /reviews/agent/:agentId/summary`

**Règles**

- Réservation doit appartenir au client et être `terminee`.
- Un seul avis par réservation.

---

## 4.11 Contacts

**Backend**

- Controller : `backend/src/contacts/contacts.controller.ts`
- Service : `backend/src/contacts/contacts.service.ts`
- Repository : `backend/src/contacts/contacts.repository.ts`

**Endpoints**

- `POST /contacts` (public)
- `GET /contacts`
- `DELETE /contacts/:id` (`ADMIN`)

---

## 5) Frontend : ressources API et zones fonctionnelles

Dossier API frontend : `admin-frontend/lib/api/`

- `auth.ts`
- `users.ts`
- `agents.ts`
- `categories.ts`
- `reservations.ts`
- `publications.ts`
- `reviews.ts`
- `working-hours.ts`
- `blocked-slots.ts`
- `availability.ts`
- `contacts.ts`
- `signup.ts`
- `interceptor.ts` (axios, cookies/token flow)

### Zones par rôle

**ADMIN**

- Pages :
  - `app/admin/users/page.tsx`
  - `app/admin/agents/page.tsx`
  - `app/admin/categories/page.tsx`
  - `app/admin/reservations/page.tsx`
  - `app/admin/contacts/page.tsx`
- Composants clés :
  - `UsersTable.tsx`, `AgentsTable.tsx`, `CategoriesTable.tsx`, `ReservationsTable.tsx`, `ContactsTable.tsx`

**AGENT**

- Pages :
  - `app/agent/disponibilites/page.tsx`
  - `app/agent/publications/page.tsx`
  - `app/agent/infos/page.tsx`
- Composants clés :
  - `AvailabilityCalendar.tsx` (mode agent)
  - `AgentDayModal.tsx`

**CLIENT**

- Pages :
  - `app/client/agent/[id]/page.tsx` (profil agent + disponibilités)
  - `app/client/reservations/page.tsx` — inclut le bouton "Confirmer la fin de la prestation" (`confirmMyReservationCompletion`), affiché uniquement si `status === "confirmee"` et `!client_confirmed`
  - `app/client/infos/page.tsx`
- Composants clés :
  - `AvailabilityCalendar.tsx` (mode client)
  - `DayAvailabilityModal.tsx`
  - `ReservationForm.tsx`

---

## 6) Opérations principales par rôle

| Rôle     | Peut faire                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`  | CRUD users/agents/categories/réservations, modération publications, gestion avis, suppression contacts               |
| `AGENT`  | Gérer profil, publications, horaires hebdo, blocages ponctuels, consulter/réagir aux réservations du jour, confirmer/annuler une demande de réservation (`agent-status`), confirmer sa part de fin de prestation |
| `CLIENT` | Voir agent/publications/avis, réserver créneau, consulter ses réservations, confirmer fin de prestation (`confirmMyReservationCompletion`), déposer avis |

---

## 7) Focus détaillé — Partie calendrier (la plus complexe)

## 7.1 Fichiers impliqués

### Backend (source de vérité)

- `backend/src/availability/availability.service.ts`
- `backend/src/working-hours/working-hours.repository.ts`
- `backend/src/blocked-slots/blocked-slots.repository.ts`
- `backend/src/reservations/reservations.repository.ts`

### Frontend (rendu & interactions)

- `admin-frontend/components/AvailabilityCalendar.tsx`
- `admin-frontend/components/AgentDayModal.tsx`
- `admin-frontend/components/DayAvailabilityModal.tsx`
- `admin-frontend/app/agent/disponibilites/page.tsx`
- `admin-frontend/app/client/agent/[id]/page.tsx`
- `admin-frontend/lib/api/availability.ts`
- `admin-frontend/lib/api/working-hours.ts`
- `admin-frontend/lib/api/blocked-slots.ts`

## 7.2 Calcul du statut d’un jour (backend)

Dans `AvailabilityService` :

1. Cherche l’horaire hebdo correspondant au `day_of_week` **et** à la `week_start` de la date.
2. Si aucun horaire : `sans_info`.
3. Si `is_working = false` : `rouge`.
4. Sinon, construit les créneaux théoriques (`generateSlots`).
5. Retire les heures bloquées (blocages partiels + full day).
6. Retire les heures réservées (hors `annulee`).
7. Déduit :
   - `vert` : tous créneaux encore libres
   - `orange` : partiellement libre
   - `rouge` : plus de créneaux libres

⚠️ Important : `rouge` est **surutilisé** pour 2 causes différentes :

- indisponible volontaire (agent non travaillant / full-day block)
- journée pleine (créneaux épuisés)

## 7.3 Rendu par mode (frontend)

Dans `AvailabilityCalendar.tsx`, prop `mode` :

- `mode="agent"` : `rouge` affiché gris (`indisponible`)
- `mode="client"` : `rouge` affiché rouge (`complet` + tooltip)
- `vert`/`orange` : cliquables
- `rouge`/`sans_info` : non cliquables (`disabled`)

## 7.4 Pourquoi une action calendrier peut sembler “en retard”

Cas réel traité : suppression d’un blocage dans `Mes blocages ponctuels`.

La vue concernée combine :

- état local `blockedSlots`
- composant calendrier qui re-fetch le mois
- fermeture de modale et transitions React

Si le refresh est déclenché trop tôt, on peut voir un état gris/disabled persistant quelques ms.

Solution appliquée côté page agent :

- supprimer le blocage
- mettre à jour localement la liste
- déclencher `setTimeout(() => refreshCalendar(), 100)`
- relancer `loadBlockedSlots()`

Même stratégie appliquée lors de `onBlockAdded` depuis `AgentDayModal`.

---

## 8) Relations entre composants (flow simplifié)

```mermaid
flowchart TD
  A[AgentDisponibilitesPage] --> B[AvailabilityCalendar mode=agent]
  A --> C[AgentDayModal]
  A --> D[Working hours form]
  A --> E[Blocked slots list]

  B -->|GET month| F[/availability/agent/:id?year&month]
  C -->|GET day| G[/availability/agent/:id/day?date]
  C -->|GET reservations day| H[/reservations/agent/me/day?date]
  C -->|POST block| I[/blocked-slots]
  E -->|DELETE block| J[/blocked-slots/:id]
  D -->|PUT week rows| K[/working-hours/me]

  F --> L[AvailabilityService]
  G --> L
  L --> M[WorkingHoursRepository]
  L --> N[BlockedSlotsRepository]
  L --> O[ReservationsRepository]
```

---

## 9) Comment les modifications se propagent entre couches

## 9.1 Pattern général

1. **UI** (page/composant) déclenche action.
2. **`lib/api/*.ts`** appelle endpoint.
3. **Controller** route + auth/roles.
4. **Service** applique règles métier/validation.
5. **Repository** écrit/lit DB.
6. Réponse API revient en UI.
7. UI met à jour état local + éventuellement re-fetch d’une vue calculée (calendrier).

## 9.2 Exemple concret (réservation admin)

- `ReservationsTable.tsx` appelle `addReservation(...)`
- `lib/api/reservations.ts` → `POST /reservations`
- `ReservationsController.addReservation` → `createReservationByAdmin(...)`
- `ReservationsService` valide + vérifie conflits
- `reservationsRepository.create(...)` persiste date/heure/offre/demande

---

## 10) Conventions et décisions déjà en place

- Suppressions sensibles (`users`, `agents`, `categories`) : erreurs Prisma FK transformées en messages métier `409`.
- Formulaires admin users/agents : rôle implicite par contexte (pas de sélection libre pour promouvoir admin).
- Calendrier : séparation visuelle `mode agent` vs `mode client` sans modifier backend (`rouge` unique interprété différemment en UI).

---

## 11) Endpoints utiles (résumé ultra rapide)

- Auth : `/auth/*`
- Users : `/users`, `/users/me`, `/users/search`
- Agents : `/agents`, `/agents/me`, `/agents/search`
- Categories : `/categories`
- Reservations : `/reservations`, `/reservations/me`, `/reservations/agent/me`, `/reservations/agent/me/day`, `/reservations/:id/agent-status`, `/reservations/:id/confirm-completion`
- Working hours : `/working-hours/me`, `/working-hours/agent/:agentId`
- Blocked slots : `/blocked-slots/me`, `/blocked-slots`
- Availability : `/availability/agent/:agentId`, `/availability/agent/:agentId/day`
- Publications : `/publications/me`, `/publications/admin` (uniquement `en_attente`, corrigé — voir §12), `/publications/agent/:agentId`
- Reviews : `/reviews`, `/reviews/agent/:agentId`, `/reviews/agent/:agentId/summary`
- Contacts : `/contacts`

---

## 12) Points d’attention / amélioration future

1. **`rouge` ambigu** côté backend (bloqué vs complet) :
   - Option future : enrichir payload avec `reason` (`blocked|full`).
2. Certaines routes (ex: `GET /users`, `categories CRUD`) semblent moins protégées que d’autres.
3. Unifier progressivement les classes Tailwind arbitraires (`text-[var(...)]` vs `text-(--...)`) pour réduire warnings.
4. Nettoyer méthodes legacy non utilisées (`createByClient` si plus appelée).

---

## 13) Où commencer quand on debug

- Bug de clic/calendrier :
  - `AvailabilityCalendar.tsx` (mode + disabled)
  - `availability.service.ts` (statut calculé)
- Bug de créneaux :
  - `working-hours.service.ts`, `blocked-slots.repository.ts`, `reservations.repository.ts`
- Bug de permissions :
  - `roles.guard.ts` + décorateurs `@Roles(...)`
- Bug de payload création réservation :
  - `lib/api/reservations.ts` ↔ `reservations.controller.ts` ↔ `reservations.service.ts`

---

### Fin du document

Si tu veux, je peux te générer une **version 2** de ce même fichier avec :

- une matrice endpoint complète (méthode + body + réponse + rôle)
- un diagramme par ressource (Users/Agents/Reservations/Availability)
- une check-list de tests manuels par rôle (ADMIN/AGENT/CLIENT).
