import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { fakerFR as faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function seedClients() {
  console.log("\n👥 Generating clients...");

  const cities = [
    "Sousse",
    "Tunis",
    "Monastir",
    "Sfax",
    "Mahdia",
    "Nabeul",
    "Hammamet",
    "Kairouan",
  ];

  // One shared password for all demo clients
  const hashedPassword = await bcrypt.hash("name123", 10);

  const clients = Array.from({ length: 8 }, (_, index) => ({
    name: faker.person.fullName(),

    // Stable emails prevent duplicates when rerunning the seed
    email: `client${String(index + 1).padStart(2, "0")}@gmail.com`,

    password: hashedPassword,

    ville: cities[index],

    phone: `+216 ${faker.helpers.arrayElement(["2", "4", "5", "9"])}${faker.string.numeric(7)}`,

    email_verified_at: new Date(),
  }));

  const result = await prisma.users.createMany({
    data: clients,
    skipDuplicates: true,
  });

  console.log(`✅ ${result.count} new clients inserted.`);
}

async function seedAgents() {
  console.log("\n👨‍🔧 Generating agents...");

  const categories = await prisma.categories.findMany();

  if (categories.length === 0) {
    throw new Error("No categories available for agents!");
  }

  const cities = [
    "Sousse",
    "Tunis",
    "Monastir",
    "Sfax",
    "Mahdia",
    "Nabeul",
    "Hammamet",
    "Kairouan",
    "Gabès",
    "Bizerte",
    "Medenine",
    "Ariana",
  ];

  const hashedPassword = await bcrypt.hash("name123", 10);

  const agents = Array.from({ length: 12 }, (_, index) => {
    const city = cities[index];

    const category = faker.helpers.arrayElement(categories);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      name: `${firstName} ${lastName}`,
      email: `agent${String(index + 1).padStart(2, "0")}@gmail.com`,
      password: hashedPassword,
      phone: `+216 ${faker.helpers.arrayElement(["2", "4", "5", "9"])}${faker.string.numeric(7)}`,

      ville: city,
      zone: city,

      category_id: category.id,

      bio: faker.lorem.paragraph(),

      age: faker.number.int({ min: 22, max: 55 }),

      sexe: faker.helpers.arrayElement(["Homme", "Femme"]),

      experience_years: faker.number.int({ min: 1, max: 25 }),

      social_links: {
        facebook: `https://facebook.com/${faker.internet.username()}`,
        instagram: `https://instagram.com/${faker.internet.username()}`,
      },
    };
  });

  let created = 0;
  let skipped = 0;
  for (const agent of agents) {
    const existing = await prisma.agents.findFirst({ where: { email: agent.email } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.agents.create({ data: agent });
    created++;
  }

  console.log(`✅ ${created} new agents inserted; ${skipped} existing agents skipped.`);
}

async function seedServices() {
  console.log("\n🛠️ Generating services...");

  const agentEmails = Array.from(
    { length: 12 },
    (_, i) => `agent${String(i + 1).padStart(2, "0")}@gmail.com`
  );

  const agents = await prisma.agents.findMany({
    where: {
      email: { in: agentEmails },
    },
    include: {
      categories: true,
      services: true,
    },
  });

  const serviceCatalog: Record<string, string[]> = {
    "Électricien": [
      "Installation électrique",
      "Réparation de panne",
      "Installation de luminaires",
      "Maintenance électrique",
    ],
    "Coiffeur": [
      "Coupe de cheveux",
      "Brushing",
      "Coloration",
      "Soin capillaire",
    ],
    "Plombier": [
      "Réparation de fuite",
      "Installation de robinetterie",
      "Débouchage de canalisation",
      "Installation sanitaire",
    ],
    "Peintre": [
      "Peinture intérieure",
      "Peinture extérieure",
      "Décoration murale",
    ],
    "Jardinier": [
      "Entretien de jardin",
      "Taille des arbres",
      "Aménagement paysager",
    ],
    "Photographie": [
      "Séance photo portrait",
      "Photographie événementielle",
      "Shooting professionnel",
    ],
    "Informatique": [
      "Réparation ordinateur",
      "Installation de logiciels",
      "Maintenance informatique",
    ],
    "Mécanicien": [
      "Diagnostic automobile",
      "Vidange",
      "Réparation mécanique",
    ],
  };

  let totalCreated = 0;

  for (const agent of agents) {
    // Avoid duplicating services when rerunning the seed
    if (agent.services.length > 0) {
      console.log(`⏭️ Services already exist for ${agent.name}`);
      continue;
    }

    const categoryName = agent.categories?.name ?? "";

    const availableServices = serviceCatalog[categoryName] ?? [
      `Service professionnel de ${categoryName.toLowerCase()}`,
      `Consultation en ${categoryName.toLowerCase()}`,
      `Prestation spécialisée en ${categoryName.toLowerCase()}`,
    ];

    const selectedServices = faker.helpers
      .shuffle(availableServices)
      .slice(0, faker.number.int({ min: 2, max: 3 }));

    const services = selectedServices.map((nom) => ({
      agent_id: agent.id,
      nom,
      description: faker.lorem.sentence(),
      type_prix: "fixe",
      prix: faker.number.int({ min: 30, max: 250 }),
      duree_estimee: faker.helpers.arrayElement([
        30, 45, 60, 90, 120,
      ]),
    }));

    const result = await prisma.services.createMany({
      data: services,
    });

    totalCreated += result.count;
  }

  console.log(`✅ ${totalCreated} services created.`);
}

function createTime(hour: number, minute = 0): Date {
  const date = new Date();
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}


async function seedWorkingHours() {
  console.log("\n🕒 Generating working hours...");

  const agentEmails = Array.from(
    { length: 12 },
    (_, i) => `agent${String(i + 1).padStart(2, "0")}@gmail.com`
  );

  const agents = await prisma.agents.findMany({
    where: {
      email: { in: agentEmails },
    },
    include: {
      agent_working_hours: true,
    },
  });

  let totalCreated = 0;

  for (const agent of agents) {
    if (agent.agent_working_hours.length > 0) {
      console.log(`⏭️ Working hours already exist for ${agent.name}`);
      continue;
    }

    const workingHours = Array.from({ length: 7 }, (_, day) => {
      const isWorking = day !== 0; // Sunday is off

      const startHour = faker.number.int({ min: 8, max: 9 });
      const endHour = faker.number.int({ min: 16, max: 18 });

      return {
        agent_id: agent.id,
        day_of_week: day,
        is_working: isWorking,
        start_time: isWorking ? createTime(startHour) : null,
        end_time: isWorking ? createTime(endHour) : null,
      };
    });

    const result = await prisma.agent_working_hours.createMany({
      data: workingHours,
    });

    totalCreated += result.count;
  }

  console.log(`✅ ${totalCreated} working-hour records created.`);
}


async function seedReservations() {
  console.log("\n📅 Generating reservations...");

  const clients = await prisma.users.findMany({
    where: {
      email: {
        in: Array.from(
          { length: 8 },
          (_, i) => `client${String(i + 1).padStart(2, "0")}@gmail.com`
        ),
      },
    },
    orderBy: { email: "asc" },
  });

  const agents = await prisma.agents.findMany({
    where: {
      email: {
        in: Array.from(
          { length: 12 },
          (_, i) => `agent${String(i + 1).padStart(2, "0")}@gmail.com`
        ),
      },
    },
    include: { services: true },
    orderBy: { email: "asc" },
  });

  const availableAgents = agents.filter(
    (agent) => agent.services.length > 0
  );

  if (clients.length === 0 || availableAgents.length === 0) {
    throw new Error("Clients, agents, or agent services are missing.");
  }

  let totalCreated = 0;

  for (let i = 0; i < clients.length; i++) {
    for (let j = 0; j < 2; j++) {
      const client = clients[i];
      const agent = availableAgents[(i * 2 + j) % availableAgents.length];

      const service = agent.services[
        faker.number.int({ min: 0, max: agent.services.length - 1 })
      ];

      // First reservation: completed, in the past.
      // Second reservation: different status.
      const status = j === 0
        ? "terminee"
        : ["confirmee", "en_attente", "annulee"][i % 3];

      const date = new Date();
      const daysOffset = j === 0
        ? -(i + 3)
        : status === "annulee"
          ? -(i + 1)
          : i + 2;

      date.setDate(date.getDate() + daysOffset);
      date.setHours(0, 0, 0, 0);

      const hour = j === 0 ? 10 : 14;
      const reservationTime = createTime(hour);

      // Avoid creating the same reservation again if the seed is rerun.
      const existing = await prisma.reservations.findFirst({
        where: {
          client_id: client.id,
          agent_id: agent.id,
          date_reservation: date,
          heure_reservation: reservationTime,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.reservations.create({
        data: {
          client_id: client.id,
          agent_id: agent.id,
          service_id: service.id,
          service_nom: service.nom,
          service_prix: service.prix,
          date_reservation: date,
          heure_reservation: reservationTime,
          status,
          agent_confirmed: status === "terminee" || status === "confirmee",
          client_confirmed: status === "terminee",
          custom_request: faker.helpers.maybe(
            () => faker.lorem.sentence(),
            { probability: 0.4 }
          ),
        },
      });

      totalCreated++;
    }
  }

  console.log(`✅ ${totalCreated} reservations created.`);
}

const agentEmailList = () => Array.from({ length: 12 }, (_, i) => `agent${String(i + 1).padStart(2, "0")}@gmail.com`);
const clientEmailList = () => Array.from({ length: 8 }, (_, i) => `client${String(i + 1).padStart(2, "0")}@gmail.com`);

async function uploadRemoteImage(url: string, folder: string, publicId: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed (${response.status}) for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const result = await cloudinary.uploader.upload(`data:${response.headers.get("content-type") ?? "image/jpeg"};base64,${bytes.toString("base64")}`, {
    folder,
    public_id: publicId,
    overwrite: false,
    resource_type: "image",
  });
  return result.secure_url;
}

function configureCloudinary(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn("⚠️ Cloudinary credentials are missing; image uploads will be skipped.");
    return false;
  }
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET });
  return true;
}

async function seedAgentPhotos() {
  console.log("\n🖼️ Uploading demo agent profile photos...");
  const agents = await prisma.agents.findMany({ where: { email: { in: agentEmailList() } }, orderBy: { email: "asc" } });
  if (!agents.length) { console.warn("⚠️ No demo agents found; skipping profile photos."); return; }
  if (!configureCloudinary()) return;
  let uploaded = 0, reused = 0, failed = 0;
  let knownPublicIds = new Set<string>();
  try {
    const existingAssets = await cloudinary.api.resources_by_asset_folder("freeforu/agents", { max_results: 500 });
    knownPublicIds = new Set<string>(existingAssets.resources.map((resource: { public_id: string }) => resource.public_id));
  } catch (error) {
    const details = error as { http_code?: number; error?: { http_code?: number; message?: string } };
    const status = details.http_code ?? details.error?.http_code;
    const message = details.error?.message ?? "";
    if (status !== 404 || !message.toLowerCase().includes("folder doesn't exist")) {
      throw error;
    }
    console.log("ℹ️ Cloudinary agent folder does not exist yet; it will be created by the first upload.");
  }
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    if (agent.photo_url?.startsWith("https://res.cloudinary.com/")) { reused++; continue; }
    const stable = agent.email.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const publicId = `agent-${stable}`;
    // Pravatar's stable seed gives every demo account a distinct portrait.
    try {
      let photoUrl: string;
      if (knownPublicIds.has(`freeforu/agents/${publicId}`)) {
        photoUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/freeforu/agents/${publicId}`;
      } else {
        photoUrl = await uploadRemoteImage(`https://i.pravatar.cc/600?u=${encodeURIComponent(agent.email)}`, "freeforu/agents", publicId);
      }
      await prisma.agents.update({ where: { id: agent.id }, data: { photo_url: photoUrl } });
      uploaded++;
    } catch (error) { failed++; console.error(`❌ Profile photo failed for ${agent.email}:`, error); }
  }
  console.log(`✅ ${uploaded} profile photos uploaded; ${reused} existing URLs reused; ${failed} failed.`);
}

async function seedReviews() {
  console.log("\n⭐ Generating reviews for completed reservations...");
  const reservations = await prisma.reservations.findMany({ where: { status: "terminee" }, include: { reviews: true, services: true } });
  const comments = [
    "Travail soigné et résultat impeccable, je recommande vivement.",
    "Très professionnel et ponctuel. La prestation correspond parfaitement à mes attentes.",
    "Excellent service, bonnes explications et finitions de qualité.",
    "Intervention efficace et personne très agréable. Je referai appel à ses services.",
    "Prestation sérieuse, réalisée avec beaucoup de soin.",
    "Très satisfaite du résultat, tout s'est déroulé comme prévu.",
    "Bon rapport qualité-prix et travail propre. Merci encore !",
    "Service rapide et professionnel, je conseille sans hésiter.",
  ];
  let created = 0, skipped = 0;
  for (const reservation of reservations) {
    if (reservation.reviews) { skipped++; continue; }
    await prisma.reviews.create({ data: {
      agent_id: reservation.agent_id,
      client_id: reservation.client_id,
      reservation_id: reservation.id,
      rating: faker.helpers.weightedArrayElement([{ weight: 1, value: 3 }, { weight: 3, value: 4 }, { weight: 6, value: 5 }]),
      comment: `${reservation.services?.nom ? `${reservation.services.nom} : ` : ""}${faker.helpers.arrayElement(comments)}`,
    } });
    created++;
  }
  console.log(`✅ ${created} reviews created; ${skipped} existing reviews skipped. ${reservations.length} completed reservations found.`);
}

async function seedPublications() {
  console.log("\n📰 Generating agent publications...");
  const agents = await prisma.agents.findMany({ where: { email: { in: agentEmailList() } }, include: { categories: true, services: true, publications: true }, orderBy: { email: "asc" } });
  if (!agents.length) { console.warn("⚠️ No demo agents found; skipping publications."); return; }
  const hasCloudinary = configureCloudinary();
  const images = [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
  ];
  let created = 0, skipped = 0, uploadsFailed = 0;
  for (const agent of agents) {
    const desired = faker.number.int({ min: 1, max: 2 });
    if (agent.publications.length >= desired) { skipped += agent.publications.length; continue; }
    const category = agent.categories?.name ?? "services";
    const service = agent.services[0]?.nom ?? `prestation de ${category.toLowerCase()}`;
    for (let n = agent.publications.length; n < desired; n++) {
      const title = faker.helpers.arrayElement([`Un chantier réussi : ${service}`, `Notre savoir-faire en ${category.toLowerCase()}`, `Conseils et réalisation autour de ${service}`]);
      const existing = await prisma.publications.findFirst({ where: { agent_id: agent.id, titre: title } });
      if (existing) { skipped++; continue; }
      let photoUrl: string | null = null;
      if (hasCloudinary) {
        const publicId = `${agent.email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-publication-${n + 1}`;
        try {
          const asset = await cloudinary.api.resource(`freeforu/publications/${publicId}`);
          photoUrl = asset.secure_url;
        }
        catch {
          try { photoUrl = await uploadRemoteImage(images[(agent.id + n) % images.length], "freeforu/publications", publicId); }
          catch (error) { uploadsFailed++; console.error(`❌ Publication image failed for ${agent.email} (${title}):`, error); }
        }
      }
      await prisma.publications.create({ data: {
        agent_id: agent.id, titre: title,
        description: `${title}. ${faker.helpers.arrayElement(["Une intervention réalisée avec soin et des matériaux adaptés.", "Chaque étape a été préparée pour garantir une finition durable et propre.", "Je privilégie l'écoute, la qualité du travail et le respect des délais."])}`,
        photo_url: photoUrl,
        status: faker.helpers.weightedArrayElement([{ weight: 6, value: "approuvee" }, { weight: 3, value: "en_attente" }, { weight: 1, value: "rejetee" }]),
        likes_count: faker.number.int({ min: 0, max: 48 }), saved_count: faker.number.int({ min: 0, max: 20 }),
      } });
      created++;
    }
  }
  console.log(`✅ ${created} publications created; ${skipped} skipped; ${uploadsFailed} image uploads failed.`);
}

async function seedBlockedSlots() {
  console.log("\n🚫 Generating future blocked days...");
  const agents = await prisma.agents.findMany({ where: { email: { in: agentEmailList() } }, include: { agent_blocked_slots: true }, orderBy: { email: "asc" } });
  if (!agents.length) { console.warn("⚠️ No demo agents found; skipping blocked days."); return; }
  const reasons = ["Congé personnel", "Indisponibilité", "Formation professionnelle", "Déplacement"];
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  let created = 0, skipped = 0;
  for (const agent of agents) {
    const wanted = faker.number.int({ min: 1, max: 3 });
    const existingDates = new Set(agent.agent_blocked_slots.map((slot) => slot.date.toISOString().slice(0, 10)));
    let made = 0;
    for (let offset = 7 + agent.id % 5; made < wanted && offset < 120; offset += 1 + (agent.id % 3)) {
      const date = new Date(today); date.setUTCDate(date.getUTCDate() + offset);
      const key = date.toISOString().slice(0, 10);
      if (existingDates.has(key)) { skipped++; continue; }
      await prisma.agent_blocked_slots.create({ data: { agent_id: agent.id, date, reason: faker.helpers.arrayElement(reasons), type: faker.helpers.arrayElement(["off", "full"]) } });
      existingDates.add(key); made++; created++;
    }
  }
  console.log(`✅ ${created} blocked days created; ${skipped} existing dates skipped.`);
}

async function seedContacts() {
  console.log("\n✉️ Generating demo contact messages...");
  const contacts = [
    { name: "Amel Ben Salem", email: "amel.demo@example.com", message: "Je souhaite en savoir plus sur les services disponibles dans ma région." },
    { name: "Youssef Trabelsi", email: "youssef.demo@example.com", message: "Comment puis-je modifier une réservation déjà confirmée ?" },
    { name: "Sarra Gharbi", email: "sarra.demo@example.com", message: "Je voudrais proposer mes services sur la plateforme." },
  ];
  let created = 0, skipped = 0;
  for (const contact of contacts) {
    const existing = await prisma.contacts.findFirst({ where: { email: contact.email, message: contact.message } });
    if (existing) { skipped++; continue; }
    await prisma.contacts.create({ data: contact }); created++;
  }
  console.log(`✅ ${created} contact messages created; ${skipped} existing messages skipped.`);
}




async function main() {
  console.log("🌱 Starting FreeForU seed...");

  faker.seed(20261124);
  await seedClients();
  await seedAgents();
  await seedAgentPhotos();
  await seedServices();
  await seedWorkingHours();
  await seedReservations();
  await seedReviews();
  await seedPublications();
  await seedBlockedSlots();
  await seedContacts();
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
