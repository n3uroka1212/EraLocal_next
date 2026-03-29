# EraLocal

SaaS de commerce local permettant aux commercants et artisans de gerer leur stock, catalogue, commandes click & collect, et presence en ligne. Les consommateurs decouvrent les commerces de proximite, consultent les catalogues et commandent en ligne.

## Stack technique

| Couche        | Technologie                              |
| ------------- | ---------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Actions)  |
| UI            | React 19, Tailwind CSS 4                 |
| Langage       | TypeScript 5                             |
| Base de donnees | PostgreSQL 15+                         |
| ORM           | Prisma 7 (driver adapter `pg`)           |
| Auth          | Sessions cookie + TOTP 2FA (`otpauth`)   |
| Paiement      | Stripe Connect (click & collect)         |
| Cartographie  | Leaflet / React-Leaflet                  |
| Tests unitaires | Vitest + Testing Library               |
| Tests E2E     | Playwright                               |
| Linting       | ESLint 9, Prettier                       |
| Deploiement   | Docker (standalone) ou Vercel            |

## Pre-requis

- **Node.js** >= 20
- **PostgreSQL** >= 15
- **pnpm** (recommande) ou npm

## Installation

```bash
# Cloner le depot
git clone <repo-url>
cd eralocal

# Installer les dependances
pnpm install

# Copier et configurer les variables d'environnement
cp .env.example .env

# Generer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Alimenter la base avec des donnees de test
npx prisma db seed

# Lancer le serveur de developpement
pnpm dev
```

## Variables d'environnement

Creer un fichier `.env` a la racine du projet :

```env
# Base de donnees
DATABASE_URL="postgresql://user:password@localhost:5432/eralocal?schema=public"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Session
SESSION_SECRET="une-cle-secrete-longue-et-aleatoire"

# Upload d'images (optionnel, S3 ou local)
UPLOAD_PROVIDER="local"
# S3_BUCKET="eralocal-uploads"
# S3_REGION="eu-west-3"
# S3_ACCESS_KEY_ID="..."
# S3_SECRET_ACCESS_KEY="..."
```

## Scripts disponibles

| Commande          | Description                                |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Serveur de developpement (port 3000)       |
| `pnpm build`      | Build de production                        |
| `pnpm start`      | Lancer le build de production              |
| `pnpm test`       | Tests unitaires (Vitest)                   |
| `pnpm test:watch` | Tests en mode watch                        |
| `pnpm lint`       | Linter ESLint                              |
| `pnpm format`     | Formatter avec Prettier                    |
| `npx prisma migrate deploy` | Appliquer les migrations          |
| `npx prisma db seed`        | Seed de la base                   |
| `npx tsx scripts/migrate-data.ts` | Migration SQLite vers PostgreSQL |
| `npx playwright test`       | Tests E2E (Playwright)            |

## Structure du projet

```
eralocal/
  prisma/
    schema.prisma          # Schema de la base de donnees
    migrations/            # Migrations Prisma
    seed.ts                # Donnees de test
  scripts/
    migrate-data.ts        # Migration SQLite -> PostgreSQL
  src/
    app/                   # App Router Next.js
      (public)/            # Pages publiques (consommateurs)
      (merchant)/          # Dashboard commercant
      admin/               # Dashboard administrateur
      api/                 # Routes API (health, webhooks, etc.)
    lib/
      auth/                # Authentification et sessions
      db/                  # Client Prisma
      stripe/              # Integration Stripe
      validations/         # Schemas Zod
      logger.ts            # Logger structure JSON
      env.ts               # Variables d'environnement typees
    generated/
      prisma/              # Client Prisma genere
  e2e/                     # Tests end-to-end Playwright
  public/                  # Assets statiques
  Dockerfile               # Image Docker multi-stage
  docker-compose.yml       # Orchestration locale
  playwright.config.ts     # Configuration Playwright
  vitest.config.ts         # Configuration Vitest
```

## Deploiement

### Docker

```bash
# Build
docker build -t eralocal .

# Lancer avec docker-compose (inclut PostgreSQL)
docker compose up -d
```

Le `Dockerfile` utilise un build multi-stage (deps -> build -> runner) avec le mode `standalone` de Next.js. Le healthcheck est integre (`/api/health`).

### Vercel

1. Connecter le depot Git a Vercel.
2. Configurer les variables d'environnement dans les parametres du projet.
3. Le build et le deploiement sont automatiques a chaque push.

Note : en mode Vercel, le `output: "standalone"` est ignore automatiquement.

## Migration depuis le legacy (SQLite vers PostgreSQL)

L'application originale utilisait SQLite. Pour migrer les donnees :

1. Exporter les donnees SQLite au format JSON :
   ```bash
   # Avec sqlite3 ou un script custom
   sqlite3 legacy.db .dump > dump.sql
   # Ou generer un JSON par table (format attendu par le script)
   ```

2. Le fichier JSON doit avoir la structure suivante :
   ```json
   {
     "admins": [...],
     "shops": [...],
     "employees": [...],
     "clients": [...],
     "products": [...],
     "catalog_products": [...],
     "catalog_variants": [...],
     "orders": [...],
     "order_items": [...],
     "shop_events": [...],
     "shop_activities": [...],
     "activity_folders": [...],
     "client_favorites": [...],
     "client_notifications": [...],
     "stock_pings": [...],
     "shop_photos": [...],
     "analytics_events": [...],
     "city_accounts": [...],
     "city_points": [...]
   }
   ```

3. Lancer la migration :
   ```bash
   npx tsx scripts/migrate-data.ts sqlite-dump.json
   ```

Le script effectue les transformations suivantes :
- `INTEGER 0/1` vers `BOOLEAN`
- `TEXT` vers `ENUM` (avec validation)
- Dates textuelles vers `ISO 8601` / `DateTime`
- Validation des champs JSON (`opening_hours`, `social_media`, `images`)
- Verification d'integrite (comptage par table avant/apres)

## Conformite RGPD

EraLocal respecte le Reglement General sur la Protection des Donnees :

- **Minimisation des donnees** : seules les donnees necessaires au fonctionnement du service sont collectees.
- **Droit d'acces** : les utilisateurs (commercants et clients) peuvent consulter l'ensemble de leurs donnees personnelles depuis leur compte.
- **Droit de suppression** : suppression du compte et des donnees associees sur demande. Les relations en cascade (`onDelete: Cascade`) garantissent la suppression complete.
- **Droit de portabilite** : export des donnees au format JSON disponible.
- **Consentement** : les cookies non essentiels necessitent un consentement explicite.
- **Chiffrement** : mots de passe haches avec bcrypt, connexions HTTPS en production.
- **Journalisation** : les acces aux donnees sont traces via le logger structure (`src/lib/logger.ts`).
- **Sous-traitants** : Stripe pour le paiement (conforme RGPD), hebergement au sein de l'UE recommande.
- **DPO** : pour toute question relative aux donnees personnelles, contacter le responsable du traitement a l'adresse indiquee dans les CGU.

## Licence

Projet prive. Tous droits reserves.
