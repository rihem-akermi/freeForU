# FreeForU — Plan des modifications système de réservation

> Organisé par phase, chaque changement précise la couche concernée : **BD** (schema.prisma) → **R** (Repository) → **S** (Service) → **C** (Controller/DTO) → **FE** (Frontend)

---

## Phase 0 — Concevoir le système "Services" (nouveau, n'existe pas encore)

Avant toute chose, il faut décider comment un agent propose ses services. Concept simple, décidé le [clarification reçue] :
- **nom**
- **description courte**
- **prix** (fixe ou "à partir de")
- **durée** — champ optionnel, renseigné surtout pour les services qui durent plus d'1h et qui sont communs/récurrents (réservés par plusieurs clients différents). L'agent la fixe manuellement selon son expérience, ce n'est pas calculé automatiquement.

- [ ] **BD** : créer un nouveau modèle `services` (ex: `id`, `agent_id`, `nom`, `description`, `type_prix` [`fixe`/`a_partir_de`], `prix`, `duree_estimee Int?` en minutes, optionnel) lié à `agents`
- [ ] **BD** : sur `reservations`, ajouter `service_id Int?` (référence) + des champs "figés" au moment de la résa : `service_nom String`, `service_prix String` (on fige le nom/prix au moment de la création, même si l'agent change son prix après — sinon une résa passée changerait de prix rétroactivement)
- [ ] **R** : nouveau `services.repository.ts` (CRUD basique : findByAgentId, create, update, delete)
- [ ] **S** : nouveau `services.service.ts`
- [ ] **C** : nouveau `services.controller.ts` + `services.module.ts` + DTOs (`create-service.dto.ts`, `update-service.dto.ts`)
- [ ] **FE** : formulaire agent pour créer/éditer ses services (nouveau composant, ex: `ServicesTable.tsx` ou similaire dans admin-frontend, ou côté espace agent si séparé)
- [ ] **FE** : onglet "Services" sur la page profil agent (client-facing, cartes nom/prix/durée) — *à faire dans le frontend client, que je n'ai pas encore vu*

⚠️ Cette phase doit être validée avant la Phase 1, car elle change la structure de `reservations`.

---

## Phase 1 — Corriger le schéma de base `reservations`

- [ ] **BD** : supprimer `@@unique([agent_id, date_reservation, heure_reservation])` — cette contrainte empêche plusieurs `en_attente` sur le même horaire, ce qui va à l'encontre du principe du nouveau système
- [ ] **BD** : ajouter `heure_fin_reservation DateTime? @db.Time(6)` (le client propose une plage, pas juste une heure de début)
- [ ] **BD** : ajouter `archived Boolean @default(false)` (pour le soft-delete)
- [ ] **BD** : migration Prisma après ces changements (`prisma migrate dev`)

---

## Phase 2 — Retirer la logique de blocage à la création

- [ ] **R** (`reservations.repository.ts`) : supprimer `findConflict()`
- [ ] **S** (`reservations.service.ts`) : supprimer `checkReservationConflict()` et son appel dans `createMyReservation()` et `createReservationByAdmin()` — la création ne doit jamais être bloquée par un horaire déjà pris
- [ ] **R** : nettoyer `createByAdmin()` qui semble être du code mort (le service utilise `create()` à la place) — à confirmer avec toi si elle sert vraiment quelque part

---

## Phase 3 — Compléter le modèle de statuts

- [ ] **C** (`update-agent-status.dto.ts`) : changer `@IsIn(["confirmee", "annulee"])` → `@IsIn(["confirmee", "rejetee"])` (l'agent rejette, il n'annule pas — `annulee` est réservé au client)
- [ ] **S** (`reservations.service.ts`) : mettre à jour `VALID_STATUSES` pour inclure `rejetee` et `expiree` : `["en_attente", "confirmee", "terminee", "rejetee", "annulee", "expiree"]`
- [ ] **S** : `updateAgentStatus()` — renommer en interne le typage `"confirmee" | "rejetee"` au lieu de `"confirmee" | "annulee"`

---

## Phase 4 — Annulation côté client (guard 24h)

- [ ] **C** : nouveau DTO si besoin (ou réutiliser un patch simple)
- [ ] **S** : nouvelle méthode `cancelByClient(reservationId, clientId)` — vérifie que la résa appartient au client, vérifie le statut (`en_attente` ou `confirmee` uniquement), vérifie qu'on est à plus de 24h de `date_reservation` + `heure_reservation`, sinon `BadRequestException`
- [ ] **C** (`reservations.controller.ts`) : nouvelle route `@Patch(":id/cancel")` avec `@Roles("CLIENT")`
- [ ] **FE** : bouton "Annuler" côté client sur sa réservation (désactivé/masqué si <24h)

---

## Phase 5 — Expiration automatique (Cron job)

- [ ] **S** : `npm install @nestjs/schedule` si pas déjà fait
- [ ] **C** (`app.module.ts` ou module racine) : importer `ScheduleModule.forRoot()`
- [ ] **S** (`reservations.service.ts`) : méthode `@Cron(CronExpression.EVERY_HOUR) handleExpiredReservations()` — trouve les `en_    attente` dont la date/heure est passée, les passe à `expiree`
- [ ] **R** : nouvelle méthode `findExpiredPending()` (statut `en_attente` + date/heure < maintenant)

---

## Phase 6 — Soft-delete / archivage

- [ ] **S** : logique d'archivage (peut être ajoutée au même Cron ou un Cron séparé) — `archived = true` 1h après passage à `rejetee` ou `annulee`
- [ ] **R** : toutes les méthodes de lecture (`findAll`, `findByClientId`, `findByAgentId`, `findByAgentAndDate`, `getAgentDayReservations`) doivent filtrer `archived: false` par défaut pour les vues actives

---

## Phase 7 — Frontend : calendriers et tables (couleurs)

- [ ] **FE** (`AvailabilityCalendar.tsx`, `AgentDayModal.tsx`, `DayAvailabilityModal.tsx`) : mettre à jour la logique de couleurs calendrier agent (neutre / rouge-off / jaune / violet / bleu) — *sans le mot "rouge" à l'écran si tu préfères, juste dans le code ça reste une classe CSS*
- [ ] **FE** (`ReservationForm.tsx`) : ajouter le champ heure de fin + sélection du service (dépend de la Phase 0)
- [ ] **FE** (`ReservationsTable.tsx`) : ajouter la distinction visuelle `rejetee` vs `annulee` (actuellement le DTO ne distinguait pas les deux)
- [ ] **FE** (`lib/api/reservations.ts`) : mettre à jour les types/payloads (heureFin, serviceId, nouvelle route cancel)
- [ ] **FE** : calendrier + formulaire côté **client** et **espace agent** (pas encore vus dans les screenshots — à envoyer si séparés de admin-frontend)

---

## Phase 8 — Post-completion review flow

- [ ] Le modèle `reviews` existe déjà et est lié à `reservation_id` (unique) — bonne nouvelle, la base est prête
- [ ] **C** : nouvel endpoint pour créer une review, avec vérification que `reservation.status === "terminee"` et que le client correspond
- [ ] **FE** : formulaire de review débloqué uniquement quand la résa est `terminee`

---

## Phase 9 — Chat WebSocket (plus tard, branché à la demande)

- [ ] À activer quand on aura besoin de négocier l'horaire ou le prix dans le flow (probablement lors des Phases 2 ou 4)
- [ ] Pas de travail à faire maintenant, juste garder la piste NestJS + WebSocket en tête

---

## Point à trancher avec toi avant de commencer

- Confirmer la structure exacte du modèle `services` (Phase 0) : un service a-t-il une seule photo/description comme une `publication`, ou c'est complètement séparé des publications ?
