import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  // ─── Admin ──────────────────────────────────
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin_Dev_2026!";
  const adminHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@eralocal.fr" },
    update: {},
    create: {
      email: "admin@eralocal.fr",
      passwordHash: adminHash,
      name: "Admin EraLocal",
    },
  });

  // ─── Shops ──────────────────────────────────
  const shopPassword = await bcrypt.hash("Shop_Dev_2026!", SALT_ROUNDS);

  const shop1 = await prisma.shop.upsert({
    where: { email: "boulangerie@demo.eralocal.fr" },
    update: {},
    create: {
      name: "Boulangerie du Marche",
      email: "boulangerie@demo.eralocal.fr",
      passwordHash: shopPassword,
      slug: "boulangerie-du-marche",
      verificationStatus: "verified",
      verificationDate: new Date(),
      address: "12 Place du Marche",
      city: "Lyon",
      postalCode: "69001",
      phone: "04 72 00 00 01",
      latitude: 45.764,
      longitude: 4.8357,
      description: "Boulangerie artisanale depuis 1985",
      category: "Boulangerie",
      businessType: "commercant",
      planType: "premium",
      planExpires: new Date("2027-01-01"),
      onboardingComplete: true,
      clickCollectEnabled: true,
      ccPrepTime: 30,
      ccInstructions: "Retrait au comptoir",
      ccMinOrder: 5.0,
      siret: "12345678901234",
      siretVerified: true,
      openingHours: {
        lundi: { open: "07:00", close: "19:00" },
        mardi: { open: "07:00", close: "19:00" },
        mercredi: { open: "07:00", close: "19:00" },
        jeudi: { open: "07:00", close: "19:00" },
        vendredi: { open: "07:00", close: "19:00" },
        samedi: { open: "07:00", close: "13:00" },
        dimanche: null,
      },
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { email: "fromagerie@demo.eralocal.fr" },
    update: {},
    create: {
      name: "Fromagerie Tradition",
      email: "fromagerie@demo.eralocal.fr",
      passwordHash: shopPassword,
      slug: "fromagerie-tradition",
      verificationStatus: "verified",
      verificationDate: new Date(),
      address: "8 Rue des Fromagers",
      city: "Lyon",
      postalCode: "69002",
      phone: "04 72 00 00 02",
      latitude: 45.757,
      longitude: 4.832,
      description: "Fromages de producteurs locaux",
      category: "Fromagerie",
      businessType: "commercant",
      planType: "premium",
      planExpires: new Date("2027-06-01"),
      onboardingComplete: true,
      siret: "98765432109876",
      siretVerified: true,
    },
  });

  const shop3 = await prisma.shop.upsert({
    where: { email: "librairie@demo.eralocal.fr" },
    update: {},
    create: {
      name: "Librairie Les Pages",
      email: "librairie@demo.eralocal.fr",
      passwordHash: shopPassword,
      slug: "librairie-les-pages",
      verificationStatus: "verified",
      verificationDate: new Date(),
      address: "22 Rue de la Republique",
      city: "Lyon",
      postalCode: "69001",
      phone: "04 72 00 00 03",
      latitude: 45.765,
      longitude: 4.836,
      description: "Librairie independante",
      category: "Librairie",
      businessType: "commercant",
      planType: "free",
      onboardingComplete: true,
    },
  });

  // ─── Employees ──────────────────────────────
  const employeePassword = await bcrypt.hash("Employee_Dev_2026!", SALT_ROUNDS);

  await prisma.employee.upsert({
    where: { id: 1 },
    update: {},
    create: {
      shopId: shop1.id,
      name: "Marie Dupont",
      email: "marie@demo.eralocal.fr",
      passwordHash: employeePassword,
      role: "manager",
      permStockView: true,
      permStockEdit: true,
      permScanFacture: true,
      permShopEdit: true,
      permEmployeesManage: true,
    },
  });

  // ─── Products (stock) ───────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: {
        shopId: shop1.id,
        name: "Farine T65 Bio",
        quantity: 50,
        unit: "kg",
        price: 2.5,
        category: "Matieres premieres",
        minStock: 10,
      },
    }),
    prisma.product.create({
      data: {
        shopId: shop1.id,
        name: "Beurre AOP",
        quantity: 20,
        unit: "kg",
        price: 8.0,
        category: "Matieres premieres",
        minStock: 5,
      },
    }),
    prisma.product.create({
      data: {
        shopId: shop1.id,
        name: "Oeufs Bio",
        quantity: 200,
        unit: "piece",
        price: 0.4,
        category: "Matieres premieres",
        minStock: 50,
      },
    }),
    prisma.product.create({
      data: {
        shopId: shop2.id,
        name: "Comte 12 mois",
        quantity: 15,
        unit: "kg",
        price: 22.0,
        category: "Fromages",
        minStock: 3,
      },
    }),
    prisma.product.create({
      data: {
        shopId: shop2.id,
        name: "Reblochon fermier",
        quantity: 30,
        unit: "piece",
        price: 8.5,
        category: "Fromages",
        minStock: 5,
      },
    }),
  ]);

  // ─── Catalog Products ───────────────────────
  const catalogProducts = await Promise.all([
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Baguette tradition",
        description: "Baguette artisanale facon tradition",
        price: 1.3,
        category: "Pains",
        available: true,
        sortOrder: 1,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Pain de campagne",
        description: "Pain au levain naturel",
        price: 4.5,
        priceUnit: "piece",
        category: "Pains",
        available: true,
        sortOrder: 2,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Croissant pur beurre",
        description: "Croissant feuillete au beurre AOP",
        price: 1.2,
        category: "Viennoiseries",
        available: true,
        sortOrder: 3,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Pain au chocolat",
        price: 1.3,
        category: "Viennoiseries",
        available: true,
        sortOrder: 4,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop2.id,
        name: "Plateau decouverte",
        description: "Selection de 5 fromages de saison",
        price: 25.0,
        category: "Plateaux",
        available: true,
        sortOrder: 1,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop2.id,
        name: "Comte AOP 12 mois",
        price: 22.0,
        priceUnit: "kg",
        category: "Fromages",
        available: true,
        sortOrder: 2,
        linkedProductId: products[3].id,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop2.id,
        name: "Reblochon fermier",
        price: 8.5,
        priceUnit: "piece",
        category: "Fromages",
        available: true,
        sortOrder: 3,
        linkedProductId: products[4].id,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Tarte aux fruits",
        description: "Tarte de saison 6 parts",
        price: 18.0,
        category: "Patisseries",
        available: true,
        sortOrder: 5,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Fougasse aux olives",
        price: 3.5,
        category: "Pains",
        available: true,
        sortOrder: 6,
      },
    }),
    prisma.catalogProduct.create({
      data: {
        shopId: shop1.id,
        name: "Eclair au cafe",
        description: "Eclair garni de creme au cafe",
        price: 3.8,
        category: "Patisseries",
        available: false,
        sortOrder: 7,
      },
    }),
  ]);

  // ─── Clients ────────────────────────────────
  const clientPassword = await bcrypt.hash("Client_Dev_2026!", SALT_ROUNDS);

  const client1 = await prisma.client.upsert({
    where: { email: "jean@demo.eralocal.fr" },
    update: {},
    create: {
      email: "jean@demo.eralocal.fr",
      passwordHash: clientPassword,
      name: "Jean Martin",
      phone: "06 12 34 56 78",
      city: "Lyon",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: "sophie@demo.eralocal.fr" },
    update: {},
    create: {
      email: "sophie@demo.eralocal.fr",
      passwordHash: clientPassword,
      name: "Sophie Durand",
      phone: "06 98 76 54 32",
      city: "Lyon",
    },
  });

  // ─── Orders ─────────────────────────────────
  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-001",
      shopId: shop1.id,
      clientId: client1.id,
      status: "collected",
      subtotal: 8.1,
      platformFee: 0.4,
      total: 8.5,
      paymentStatus: "succeeded",
      clientName: "Jean Martin",
      clientEmail: "jean@demo.eralocal.fr",
      pickupTime: new Date("2026-03-27T10:00:00"),
      collectedAt: new Date("2026-03-27T10:15:00"),
      items: {
        create: [
          {
            catalogProductId: catalogProducts[0].id,
            productName: "Baguette tradition",
            quantity: 3,
            unitPrice: 1.3,
            totalPrice: 3.9,
          },
          {
            catalogProductId: catalogProducts[2].id,
            productName: "Croissant pur beurre",
            quantity: 2,
            unitPrice: 1.2,
            totalPrice: 2.4,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-002",
      shopId: shop1.id,
      clientId: client2.id,
      status: "preparing",
      subtotal: 18.0,
      platformFee: 0.9,
      total: 18.9,
      paymentStatus: "succeeded",
      clientName: "Sophie Durand",
      clientEmail: "sophie@demo.eralocal.fr",
      pickupTime: new Date("2026-03-28T14:00:00"),
      items: {
        create: [
          {
            catalogProductId: catalogProducts[7].id,
            productName: "Tarte aux fruits",
            quantity: 1,
            unitPrice: 18.0,
            totalPrice: 18.0,
          },
        ],
      },
    },
  });

  // ─── Events ─────────────────────────────────
  await Promise.all([
    prisma.shopEvent.create({
      data: {
        shopId: shop1.id,
        title: "Atelier pain au levain",
        description: "Apprenez a faire votre pain au levain naturel",
        eventType: "atelier",
        eventDate: new Date("2026-04-15"),
        eventTime: "14:00",
        endTime: "17:00",
        address: "12 Place du Marche, Lyon",
        active: true,
      },
    }),
    prisma.shopEvent.create({
      data: {
        shopId: shop2.id,
        title: "Degustation de fromages de printemps",
        description: "Decouvrez notre selection de fromages de saison",
        eventType: "degustation",
        eventDate: new Date("2026-04-10"),
        eventTime: "18:00",
        endTime: "20:00",
        address: "8 Rue des Fromagers, Lyon",
        active: true,
      },
    }),
    prisma.shopEvent.create({
      data: {
        shopId: shop3.id,
        title: "Rencontre avec l'auteur",
        description: "Seance de dedicace et discussion",
        eventType: "rencontre",
        eventDate: new Date("2026-04-20"),
        eventTime: "17:00",
        endTime: "19:00",
        address: "22 Rue de la Republique, Lyon",
        active: true,
      },
    }),
  ]);

  // ─── Activities ─────────────────────────────
  const folder = await prisma.activityFolder.create({
    data: {
      shopId: shop1.id,
      name: "Ateliers",
      code: "ateliers",
      description: "Nos ateliers de boulangerie",
    },
  });

  await Promise.all([
    prisma.shopActivity.create({
      data: {
        shopId: shop1.id,
        name: "Cours de boulangerie",
        description: "Initiez-vous aux techniques de boulangerie artisanale",
        category: "Ateliers",
        address: "12 Place du Marche, Lyon",
        latitude: 45.764,
        longitude: 4.8357,
        priceInfo: "45 EUR / personne",
        duration: "3h",
        folderId: folder.id,
        active: true,
      },
    }),
    prisma.shopActivity.create({
      data: {
        shopId: shop2.id,
        name: "Visite de cave d'affinage",
        description: "Decouvrez le processus d'affinage de nos fromages",
        category: "Visites",
        address: "8 Rue des Fromagers, Lyon",
        latitude: 45.757,
        longitude: 4.832,
        priceInfo: "Gratuit",
        duration: "1h30",
        active: true,
      },
    }),
  ]);

  // ─── Favorites ──────────────────────────────
  await Promise.all([
    prisma.clientFavorite.create({
      data: { clientId: client1.id, itemType: "shop", itemId: shop1.id },
    }),
    prisma.clientFavorite.create({
      data: { clientId: client1.id, itemType: "product", itemId: catalogProducts[0].id },
    }),
    prisma.clientFavorite.create({
      data: { clientId: client2.id, itemType: "shop", itemId: shop2.id },
    }),
  ]);

  // ─── City ───────────────────────────────────
  const cityPassword = await bcrypt.hash("City_Dev_2026!", SALT_ROUNDS);

  const city = await prisma.cityAccount.upsert({
    where: { email: "lyon@demo.eralocal.fr" },
    update: {},
    create: {
      name: "Lyon",
      email: "lyon@demo.eralocal.fr",
      passwordHash: cityPassword,
      contactName: "Service Commerce",
      phone: "04 72 10 30 30",
      department: "Rhone",
      region: "Auvergne-Rhone-Alpes",
      description: "Capitale de la gastronomie francaise",
      slogan: "Lyon, ville gourmande",
    },
  });

  await Promise.all([
    prisma.cityPoint.create({
      data: {
        cityId: city.id,
        name: "Les Halles de Lyon Paul Bocuse",
        description: "Marche couvert emblematique de la gastronomie lyonnaise",
        address: "102 Cours Lafayette, 69003 Lyon",
        category: "Marche",
        latitude: 45.7605,
        longitude: 4.8566,
        sortOrder: 1,
      },
    }),
    prisma.cityPoint.create({
      data: {
        cityId: city.id,
        name: "Marche Saint-Antoine",
        description: "Marche en plein air le long de la Saone",
        history: "Marche historique datant du XVIe siecle",
        address: "Quai Saint-Antoine, 69002 Lyon",
        category: "Marche",
        latitude: 45.7616,
        longitude: 4.8316,
        sortOrder: 2,
      },
    }),
    prisma.cityPoint.create({
      data: {
        cityId: city.id,
        name: "Place Bellecour",
        description: "Plus grande place pietonne d'Europe",
        address: "Place Bellecour, 69002 Lyon",
        category: "Place",
        latitude: 45.7578,
        longitude: 4.8322,
        sortOrder: 3,
      },
    }),
  ]);

  console.log("Seed complete:", {
    admin: admin.email,
    shops: [shop1.slug, shop2.slug, shop3.slug],
    products: products.length,
    catalogProducts: catalogProducts.length,
    clients: [client1.email, client2.email],
    city: city.name,
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
