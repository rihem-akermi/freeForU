-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "agents" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "ville" VARCHAR(255),
    "role" VARCHAR(20) NOT NULL DEFAULT 'AGENT',
    "email" VARCHAR(255) NOT NULL,
    "category_id" INTEGER,
    "photo_url" VARCHAR(255),
    "bio" TEXT,
    "zone" VARCHAR(150),
    "service_mode" VARCHAR(20),
    "age" INTEGER,
    "sexe" VARCHAR(10),
    "experience_years" INTEGER,
    "social_links" JSONB,
    "id_card_url" VARCHAR(255),
    "work_certificate_url" VARCHAR(255),
    "verification_status" VARCHAR(20) DEFAULT 'non_verifie',
    "email_verified_at" TIMESTAMP(6),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "idcontact" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("idcontact")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "photo_url" VARCHAR(255),
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) DEFAULT 'en_attente',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "titre" VARCHAR(150),
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "saved_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "date_reservation" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'en_attente',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "agent_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "client_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "heure_reservation" TIME(6) NOT NULL,
    "custom_request" TEXT,
    "heure_fin_reservation" TIME(6),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "service_id" INTEGER,
    "service_nom" VARCHAR(150),
    "service_prix" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(6),
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ville" VARCHAR(100),
    "phone" VARCHAR(20),
    "photo_url" VARCHAR(255),
    "email_verified_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_working_hours" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "is_working" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "agent_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_blocked_slots" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "reason" VARCHAR(255),
    "type" VARCHAR(10) NOT NULL DEFAULT 'off',

    CONSTRAINT "agent_blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "nom" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "type_prix" VARCHAR(20) NOT NULL DEFAULT 'fixe',
    "prix" DOUBLE PRECISION NOT NULL,
    "duree_estimee" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "embedding" JSONB,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" SERIAL NOT NULL,
    "target_table" VARCHAR(20) NOT NULL,
    "target_id" INTEGER NOT NULL,
    "purpose" VARCHAR(30) NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(6) NOT NULL,
    "consumed_at" TIMESTAMP(6),
    "invalidated_at" TIMESTAMP(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_agents_category_id" ON "agents"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nom_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reservation_id_key" ON "reviews"("reservation_id");

-- CreateIndex
CREATE INDEX "idx_reviews_agent_id" ON "reviews"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_working_hours_agent_id_day_of_week_key" ON "agent_working_hours"("agent_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "agent_blocked_slots_agent_id_date_key" ON "agent_blocked_slots"("agent_id", "date");

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agent_working_hours" ADD CONSTRAINT "agent_working_hours_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agent_blocked_slots" ADD CONSTRAINT "agent_blocked_slots_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;


-- 11 constaints : Preserve CHECK constraints from the original local database

ALTER TABLE "agents"
ADD CONSTRAINT "agents_service_mode_check"
CHECK ("service_mode" IN ('se_deplace', 'recoit', 'les_deux'));

ALTER TABLE "agents"
ADD CONSTRAINT "agents_verification_status_check"
CHECK ("verification_status" IN ('non_verifie', 'en_attente', 'verifie', 'rejete'));

ALTER TABLE "reservations"
ADD CONSTRAINT "status_valide"
CHECK ("status" IN ('en_attente', 'confirmee', 'terminee', 'annulee', 'rejetee', 'expiree'));

ALTER TABLE "publications"
ADD CONSTRAINT "publications_status_check"
CHECK ("status" IN ('en_attente', 'approuvee', 'rejetee'));

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_rating_check"
CHECK ("rating" >= 1 AND "rating" <= 5);

ALTER TABLE "agent_working_hours"
ADD CONSTRAINT "agent_working_hours_day_of_week_check"
CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6);

ALTER TABLE "otp_verifications"
ADD CONSTRAINT "otp_attempts_check"
CHECK ("attempts" >= 0);

ALTER TABLE "otp_verifications"
ADD CONSTRAINT "otp_expiration_check"
CHECK ("expires_at" > "created_at");

ALTER TABLE "otp_verifications"
ADD CONSTRAINT "otp_purpose_check"
CHECK ("purpose" IN ('EMAIL_VERIFICATION', 'PASSWORD_RESET'));

ALTER TABLE "otp_verifications"
ADD CONSTRAINT "otp_status_check"
CHECK ("status" IN ('PENDING', 'CONSUMED', 'EXPIRED', 'INVALIDATED'));

ALTER TABLE "otp_verifications"
ADD CONSTRAINT "otp_target_table_check"
CHECK ("target_table" IN ('USER', 'AGENT'));

