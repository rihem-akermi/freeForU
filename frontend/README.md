# 🎛️ Admin Dashboard — Front seul (mock data)

## 🚀 Pour démarrer

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000 → clique sur "Aller au Dashboard Admin".

## 🗂️ Ce que tu as dans les mains

```
app/
  page.tsx                     → page d'accueil (juste un bouton)
  dashboard/admin/
    layout.tsx                 → sidebar + structure commune
    page.tsx                   → vue d'ensemble (3 chiffres clés)
    users/page.tsx             → liste des utilisateurs (avec suppression)
    agents/page.tsx            → liste des agents
    reservations/page.tsx      → liste des réservations
components/
  Sidebar.tsx                  → menu de navigation
  UsersTable.tsx                → tableau interactif (bouton Supprimer)
lib/
  mockData.ts                  → 🎭 FAUSSES données (à remplacer plus tard)
  api.ts                       → 🔌 LE FICHIER LE PLUS IMPORTANT
```

## 🔌 Comment brancher le vrai backend NestJS plus tard

Tu n'as qu'UN SEUL fichier à modifier : `lib/api.ts`.

Chaque fonction (`getUsers`, `deleteUser`, `getAgents`...) contient déjà le code
`fetch()` réel, mais en commentaire. Le jour où ton backend NestJS tourne :

1. Crée un fichier `.env.local` à la racine avec :
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
2. Dans `lib/api.ts`, pour chaque fonction : décommente le bloc `fetch(...)`
   et supprime la ligne qui retourne le mock (ex: `return mockUsers;`).
3. C'est tout. Tes pages (`users/page.tsx`, etc.) n'ont RIEN à changer,
   elles appellent déjà `getUsers()` — elles ne savent même pas si la donnée
   vient d'un mock ou d'une vraie base de données. C'est ça, le but de ce
   fichier "passerelle" : isoler le reste de l'app de la source des données.

## 🧠 Pourquoi cette organisation ?

- **`mockData.ts`** = données bidon pour construire l'UI sans backend
- **`api.ts`** = le seul endroit qui "parle" au backend (aujourd'hui simulé,
  demain réel)
- **Pages** = affichent juste ce que `api.ts` leur donne, sans savoir d'où
  ça vient

Cette séparation s'appelle une "couche d'abstraction" — un concept que tu
retrouveras partout en développement : on cache les détails techniques
derrière une interface simple.
