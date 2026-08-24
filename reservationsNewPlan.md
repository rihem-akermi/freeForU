# FreeForU — Plan de refonte du flow de disponibilité/réservation

> Ce plan **remplace** certaines décisions du plan précédent (`freeforu-plan-reservations.md`), notamment :
> - Le système de créneaux (`available_hours`) prédéfinis → supprimé, remplacé par des horaires hebdo fixes
> - Le blocage par heure précise → supprimé, blocage par jour entier uniquement
> - L'absence d'auto-rejet (Phase 3 de l'ancien plan) → **inversée** : auto-rejet des `en_attente` chevauchantes à la confirmation

---

## Phase A — Corrections isolées (rapides, indépendantes du reste)

- [ ] **FE** (`lib/api/interceptor.ts`) : corriger `window.location.href` appelé côté serveur → garder avec `typeof window !== "undefined"`, sinon utiliser `redirect()` de Next.js dans les Server Components
- [ ] **R/S** (`reviews.repository.ts` / `reviews.service.ts`) : `findByAgentId()` doit inclure le nom du client (`include: { users: { select: { name: true } } }`)
- [ ] **FE** (`AvisTab` dans le profil agent) : afficher `review.users.name` au lieu d'un avis anonyme

---

## Phase B — Horaires hebdomadaires fixes de l'agent (fondation de tout le reste)

- [ ] **BD** : nouveau modèle (ou adaptation de `agent_working_hours` existant) — un enregistrement par jour de la semaine (0-6), par agent : `agent_id`, `jour_semaine`, `heure_debut`, `heure_fin`, `ferme Boolean` (pour "Sunday Closed")
- [ ] **R/S/C** : endpoints pour que l'agent lise/mette à jour ses 7 lignes d'un coup (GET/PUT `/working-hours/me`)
- [ ] **FE** : section dans "Mes infos" (espace agent) — 7 lignes (Lundi → Dimanche), toggle "Fermé" + inputs heure début/fin par jour
- [ ] **FE** : affichage lecture seule de ces horaires côté client (le bloc "dispo until 8:00 PM" + liste des 7 jours que tu as décrit)

⚠️ J'ai besoin de voir ton module `availability` actuel (déjà existant d'après tes screenshots) pour savoir si `agent_working_hours` existe déjà en base ou si je dois le créer de zéro.

---

## Phase C — Simplifier le blocage (jour entier uniquement)

- [ ] **BD** : `agent_blocked_slots` — retirer les champs d'heure précise (`start_time`/`end_time`) s'ils existent, ne garder qu'une date (jour bloqué)
- [ ] **R/S/C** : simplifier `createBlockedSlot` (juste `date` + `reason` optionnel, plus de type "full"/"partial")
- [ ] **FE** (`AgentDayModal.tsx`) : simplifier l'onglet "Bloquer" — un seul bouton "Bloquer ce jour" / "Débloquer ce jour", plus de choix de type

---

## Phase D — Recalcul de la disponibilité (remplace le système de créneaux)

- [ ] **S** (`availability.service.ts`) : la disponibilité d'un jour = horaire hebdo du jour de la semaine correspondant (Phase B) **moins** exception ponctuelle (Phase C, jour bloqué). Fini le calcul créneau par créneau.
- [ ] **S** : `getMonthCalendar` retourne, par jour, juste : ouvert (avec horaires) ou fermé — plus de notion de "orange = partiel"
- [ ] **FE** (`DayAvailabilityModal.tsx`) : à réécrire complètement — n'affiche plus une liste d'heures cliquables, affiche juste les horaires d'ouverture du jour + bouton "Faire une demande" qui ouvre `ReservationForm`

---

## Phase E — Couleurs calendrier CLIENT (personnel, jour uniquement)

- [ ] **S** : nouvel endpoint qui calcule, pour le calendrier client, les couleurs **basées sur les réservations de CE client uniquement** avec l'agent concerné
- [ ] **FE** (`AvailabilityCalendar.tsx`, mode client) : 4 couleurs (neutre / gris fermé / jaune / violet / bleu), priorité `jaune > violet > bleu > neutre`, rejetée/annulée → neutre (jamais rouge sur le calendrier)

---

## Phase F — Couleurs calendrier AGENT (agrégé tous clients, jour uniquement)

- [ ] **S** : endpoint équivalent côté agent — statut agrégé de la journée toutes réservations confondues
- [ ] **FE** (`AvailabilityCalendar.tsx`, mode agent) : 5 couleurs (neutre / rouge fermé-cliquable / jaune / violet / bleu-jugement-manuel), priorité `jaune > bleu > violet > rouge > neutre`
- [ ] **FE** (`AgentDayModal.tsx`) : au clic sur un jour → liste triée par heure de toutes les réservations (comme déjà fait), pas de formulaire

---

## Phase G — `ReservationForm` : refonte complète (corrige aussi le bug d'ouverture)

- [ ] **FE** : corriger le bug où le formulaire ne s'ouvre pas au clic sur un jour
- [ ] **FE** : relation XOR — soit un service est déjà choisi (`AgentServicesTab` → "Réserver") et son nom/prix s'affichent en lecture seule, soit le client arrive directement par "Disponibilités" et un champ `custom_request` libre apparaît à la place
- [ ] **FE** : heure de début et heure de fin **tapées librement** par le client (pas de créneaux à cliquer)
- [ ] **C/DTO** : le payload doit accepter soit `serviceId`, soit `customRequest`, mais pas obligatoirement les deux — ajuster la validation (actuellement `customRequest` était obligatoire dans `BaseReservationDto`, à revoir)

---

## Phase H — Auto-rejet des chevauchements (backend, confirmé avec toi)

- [ ] **S** (`reservations.service.ts`, `updateAgentStatus`) : quand une réservation passe à `confirmee`, chercher toutes les `en_attente` du même agent/jour dont la plage horaire chevauche, et les passer automatiquement à `rejetee`
- [ ] **R** : nouvelle méthode `findOverlappingPending(agentId, date, heureDebut, heureFin, excludeId)`

---

## Phase I — Tables : couleur de ligne complète + archivées

- [ ] **FE** (`ReservationsTable.tsx`, page agent, `MesReservationsPage`) : toute la ligne (fond) prend la couleur du statut, pas juste un badge — jaune/violet/bleu/rouge (rejetée+annulée, texte différencié)
- [ ] **FE** : afficher aussi les réservations `archived` (avec indication visuelle "archivée", probablement dans une vue séparée ou un filtre)

---

## Phase J — Passage cohérent sur `UIComponents.tsx`

- [ ] Revoir tous les fichiers touchés dans les phases précédentes pour utiliser systématiquement `Button`, `Input`, `Select`, `Textarea`, `Card`, `Badge` au lieu de balises HTML brutes — à faire en dernier, une fois la logique stabilisée, pour ne pas styliser deux fois la même chose
