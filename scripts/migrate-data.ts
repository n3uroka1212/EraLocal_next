/**
 * SQLite to PostgreSQL Migration Script
 *
 * Reads a JSON dump exported from the legacy SQLite database and imports
 * all records into the new PostgreSQL database via Prisma.
 *
 * Usage:
 *   npx tsx scripts/migrate-data.ts [path-to-sqlite-dump.json]
 *
 * The JSON dump must contain top-level keys matching table names, each
 * holding an array of row objects with the original SQLite column names.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ─── Transformation Helpers ──────────────────────────

function toBoolean(val: number | null | undefined): boolean {
  return val === 1;
}

function toEnum<T extends string>(val: string | null | undefined, valid: T[]): T | null {
  if (val == null) return null;
  const normalized = val.trim().toLowerCase();
  const match = valid.find((v) => v.toLowerCase() === normalized);
  return match ?? null;
}

function toDate(val: string | number | null | undefined): Date | null {
  if (val == null) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function toDateRequired(val: string | number | null | undefined, fallback?: Date): Date {
  const d = toDate(val);
  return d ?? fallback ?? new Date();
}

function validateJson(val: string | object | null | undefined): object | null {
  if (val == null) return null;
  if (typeof val === "object") return val;
  try {
    const parsed = JSON.parse(val);
    return typeof parsed === "object" ? parsed : null;
  } catch {
    console.warn(`  [warn] Invalid JSON value, skipping: ${String(val).slice(0, 80)}`);
    return null;
  }
}

function toFloat(val: unknown): number | null {
  if (val == null) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toInt(val: unknown): number | null {
  if (val == null) return null;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? null : n;
}

// ─── Table Migrations ────────────────────────────────

async function migrateAdmins(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating admins: ${data.length} rows...`);

  for (const row of data) {
    await prisma.admin.upsert({
      where: { email: row.email },
      update: {},
      create: {
        email: row.email,
        passwordHash: row.password_hash ?? row.passwordHash,
        name: row.name ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  admins done.`);
}

async function migrateShops(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating shops: ${data.length} rows...`);

  const validVerificationStatuses = ["pending", "verified", "rejected"] as const;
  const validPlanTypes = ["free", "premium"] as const;
  const validBusinessTypes = ["commercant", "activite"] as const;

  for (const row of data) {
    await prisma.shop.upsert({
      where: { email: row.email },
      update: {},
      create: {
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash ?? row.passwordHash,
        slug: row.slug,
        verificationStatus:
          toEnum(row.verification_status ?? row.verificationStatus, [...validVerificationStatuses]) ?? "pending",
        verificationDate: toDate(row.verification_date ?? row.verificationDate),
        verificationReason: row.verification_reason ?? row.verificationReason ?? null,
        address: row.address ?? null,
        city: row.city ?? null,
        postalCode: row.postal_code ?? row.postalCode ?? null,
        phone: row.phone ?? null,
        notificationEmail: row.notification_email ?? row.notificationEmail ?? null,
        latitude: toFloat(row.latitude),
        longitude: toFloat(row.longitude),
        description: row.description ?? null,
        openingHours: validateJson(row.opening_hours ?? row.openingHours),
        siret: row.siret ?? null,
        category: row.category ?? null,
        website: row.website ?? null,
        socialMedia: validateJson(row.social_media ?? row.socialMedia),
        businessType:
          toEnum(row.business_type ?? row.businessType, [...validBusinessTypes]) ?? "commercant",
        onboardingComplete: toBoolean(row.onboarding_complete ?? row.onboardingComplete),
        logo: row.logo ?? null,
        logoEmoji: row.logo_emoji ?? row.logoEmoji ?? null,
        banner: row.banner ?? null,
        coverImage: row.cover_image ?? row.coverImage ?? null,
        docIdRecto: row.doc_id_recto ?? row.docIdRecto ?? null,
        docIdVerso: row.doc_id_verso ?? row.docIdVerso ?? null,
        docJustificatif: row.doc_justificatif ?? row.docJustificatif ?? null,
        docKbis: row.doc_kbis ?? row.docKbis ?? null,
        siretVerified: toBoolean(row.siret_verified ?? row.siretVerified),
        siretApiName: row.siret_api_name ?? row.siretApiName ?? null,
        siretApiAddress: row.siret_api_address ?? row.siretApiAddress ?? null,
        planType: toEnum(row.plan_type ?? row.planType, [...validPlanTypes]) ?? "free",
        planExpires: toDate(row.plan_expires ?? row.planExpires),
        showStockPublic: toBoolean(row.show_stock_public ?? row.showStockPublic),
        clickCollectEnabled: toBoolean(row.click_collect_enabled ?? row.clickCollectEnabled),
        stripeAccountId: row.stripe_account_id ?? row.stripeAccountId ?? null,
        stripeOnboardingComplete: toBoolean(
          row.stripe_onboarding_complete ?? row.stripeOnboardingComplete
        ),
        ccPrepTime: toInt(row.cc_prep_time ?? row.ccPrepTime),
        ccInstructions: row.cc_instructions ?? row.ccInstructions ?? null,
        ccMinOrder: toFloat(row.cc_min_order ?? row.ccMinOrder),
        ccCommissionRate: toFloat(row.cc_commission_rate ?? row.ccCommissionRate),
        totpSecret: row.totp_secret ?? row.totpSecret ?? null,
        totpEnabled: toBoolean(row.totp_enabled ?? row.totpEnabled),
        pingEnabled: toBoolean(row.ping_enabled ?? row.pingEnabled),
        ownerPinHash: row.owner_pin_hash ?? row.ownerPinHash ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  shops done.`);
}

async function migrateEmployees(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating employees: ${data.length} rows...`);

  const validRoles = ["employee", "manager"] as const;

  for (const row of data) {
    await prisma.employee.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash ?? row.passwordHash,
        pinHash: row.pin_hash ?? row.pinHash ?? null,
        role: toEnum(row.role, [...validRoles]) ?? "employee",
        permStockView: toBoolean(row.perm_stock_view ?? row.permStockView),
        permStockEdit: toBoolean(row.perm_stock_edit ?? row.permStockEdit),
        permScanFacture: toBoolean(row.perm_scan_facture ?? row.permScanFacture),
        permScanTicket: toBoolean(row.perm_scan_ticket ?? row.permScanTicket),
        permAlertsView: toBoolean(row.perm_alerts_view ?? row.permAlertsView),
        permSettingsView: toBoolean(row.perm_settings_view ?? row.permSettingsView),
        permEmployeesManage: toBoolean(row.perm_employees_manage ?? row.permEmployeesManage),
        permShopEdit: toBoolean(row.perm_shop_edit ?? row.permShopEdit),
        active: toBoolean(row.active ?? 1),
        totpSecret: row.totp_secret ?? row.totpSecret ?? null,
        totpEnabled: toBoolean(row.totp_enabled ?? row.totpEnabled),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  employees done.`);
}

async function migrateClients(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating clients: ${data.length} rows...`);

  for (const row of data) {
    await prisma.client.upsert({
      where: { email: row.email },
      update: {},
      create: {
        email: row.email,
        passwordHash: row.password_hash ?? row.passwordHash,
        name: row.name ?? null,
        phone: row.phone ?? null,
        city: row.city ?? null,
        lastLogin: toDate(row.last_login ?? row.lastLogin),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  clients done.`);
}

async function migrateProducts(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating products: ${data.length} rows...`);

  for (const row of data) {
    await prisma.product.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        name: row.name,
        quantity: toFloat(row.quantity) ?? 0,
        unit: row.unit ?? null,
        price: toFloat(row.price),
        category: row.category ?? null,
        minStock: toInt(row.min_stock ?? row.minStock),
        expiryDate: toDate(row.expiry_date ?? row.expiryDate),
        barcode: row.barcode ?? null,
        supplier: row.supplier ?? null,
        description: row.description ?? null,
        image: row.image ?? null,
        lastUpdated: toDateRequired(row.last_updated ?? row.lastUpdated),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  products done.`);
}

async function migrateCatalogProducts(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating catalog_products: ${data.length} rows...`);

  for (const row of data) {
    await prisma.catalogProduct.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        name: row.name,
        description: row.description ?? null,
        price: toFloat(row.price),
        priceUnit: row.price_unit ?? row.priceUnit ?? null,
        category: row.category ?? null,
        image: row.image ?? null,
        available: toBoolean(row.available ?? 1),
        sortOrder: toInt(row.sort_order ?? row.sortOrder) ?? 0,
        linkedProductId: toInt(row.linked_product_id ?? row.linkedProductId),
        parentProductId: toInt(row.parent_product_id ?? row.parentProductId),
        variantSourceName: row.variant_source_name ?? row.variantSourceName ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  catalog_products done.`);
}

async function migrateCatalogVariants(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating catalog_variants: ${data.length} rows...`);

  for (const row of data) {
    await prisma.catalogVariant.create({
      data: {
        productId: row.product_id ?? row.productId,
        name: row.name,
        price: toFloat(row.price),
        available: toBoolean(row.available ?? 1),
        sortOrder: toInt(row.sort_order ?? row.sortOrder) ?? 0,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  catalog_variants done.`);
}

async function migrateOrders(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating orders: ${data.length} rows...`);

  const validOrderStatuses = ["pending", "paid", "preparing", "ready", "collected", "cancelled"] as const;
  const validPaymentStatuses = ["pending", "succeeded", "failed", "refunded"] as const;

  for (const row of data) {
    await prisma.order.create({
      data: {
        orderNumber: row.order_number ?? row.orderNumber,
        shopId: row.shop_id ?? row.shopId,
        clientId: toInt(row.client_id ?? row.clientId),
        status: toEnum(row.status, [...validOrderStatuses]) ?? "pending",
        subtotal: toFloat(row.subtotal) ?? 0,
        platformFee: toFloat(row.platform_fee ?? row.platformFee) ?? 0,
        total: toFloat(row.total) ?? 0,
        stripePaymentIntentId: row.stripe_payment_intent_id ?? row.stripePaymentIntentId ?? null,
        stripeChargeId: row.stripe_charge_id ?? row.stripeChargeId ?? null,
        paymentStatus:
          toEnum(row.payment_status ?? row.paymentStatus, [...validPaymentStatuses]) ?? "pending",
        clientName: row.client_name ?? row.clientName ?? null,
        clientEmail: row.client_email ?? row.clientEmail ?? null,
        clientPhone: row.client_phone ?? row.clientPhone ?? null,
        pickupTime: toDate(row.pickup_time ?? row.pickupTime),
        notes: row.notes ?? null,
        cancelledBy: row.cancelled_by ?? row.cancelledBy ?? null,
        cancelReason: row.cancel_reason ?? row.cancelReason ?? null,
        readyAt: toDate(row.ready_at ?? row.readyAt),
        collectedAt: toDate(row.collected_at ?? row.collectedAt),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
        updatedAt: toDateRequired(row.updated_at ?? row.updatedAt),
      },
    });
  }
  console.log(`  orders done.`);
}

async function migrateOrderItems(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating order_items: ${data.length} rows...`);

  for (const row of data) {
    await prisma.orderItem.create({
      data: {
        orderId: row.order_id ?? row.orderId,
        catalogProductId: toInt(row.catalog_product_id ?? row.catalogProductId),
        variantId: toInt(row.variant_id ?? row.variantId),
        productName: row.product_name ?? row.productName,
        variantName: row.variant_name ?? row.variantName ?? null,
        quantity: toInt(row.quantity) ?? 1,
        unitPrice: toFloat(row.unit_price ?? row.unitPrice) ?? 0,
        totalPrice: toFloat(row.total_price ?? row.totalPrice) ?? 0,
      },
    });
  }
  console.log(`  order_items done.`);
}

async function migrateShopEvents(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating shop_events: ${data.length} rows...`);

  for (const row of data) {
    await prisma.shopEvent.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        title: row.title,
        description: row.description ?? null,
        eventType: row.event_type ?? row.eventType ?? null,
        eventDate: toDate(row.event_date ?? row.eventDate),
        eventTime: row.event_time ?? row.eventTime ?? null,
        endTime: row.end_time ?? row.endTime ?? null,
        address: row.address ?? null,
        isRecurring: toBoolean(row.is_recurring ?? row.isRecurring),
        recurringDay: row.recurring_day ?? row.recurringDay ?? null,
        recurringDays: row.recurring_days ?? row.recurringDays ?? null,
        active: toBoolean(row.active ?? 1),
        phone: row.phone ?? null,
        website: row.website ?? null,
        isPrivate: toBoolean(row.is_private ?? row.isPrivate),
        privateCode: row.private_code ?? row.privateCode ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  shop_events done.`);
}

async function migrateShopActivities(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating shop_activities: ${data.length} rows...`);

  for (const row of data) {
    await prisma.shopActivity.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        name: row.name,
        description: row.description ?? null,
        category: row.category ?? null,
        address: row.address ?? null,
        latitude: toFloat(row.latitude),
        longitude: toFloat(row.longitude),
        phone: row.phone ?? null,
        website: row.website ?? null,
        priceInfo: row.price_info ?? row.priceInfo ?? null,
        duration: row.duration ?? null,
        mainImage: row.main_image ?? row.mainImage ?? null,
        images: validateJson(row.images) ?? [],
        active: toBoolean(row.active ?? 1),
        sortOrder: toInt(row.sort_order ?? row.sortOrder) ?? 0,
        folderId: toInt(row.folder_id ?? row.folderId),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  shop_activities done.`);
}

async function migrateActivityFolders(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating activity_folders: ${data.length} rows...`);

  for (const row of data) {
    await prisma.activityFolder.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        name: row.name,
        code: row.code ?? null,
        description: row.description ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  activity_folders done.`);
}

async function migrateClientFavorites(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating client_favorites: ${data.length} rows...`);

  const validItemTypes = ["shop", "product", "event", "activity"] as const;

  for (const row of data) {
    const itemType = toEnum(row.item_type ?? row.itemType, [...validItemTypes]);
    if (!itemType) {
      console.warn(`  [warn] Skipping favorite with invalid item_type: ${row.item_type}`);
      continue;
    }
    await prisma.clientFavorite.create({
      data: {
        clientId: row.client_id ?? row.clientId,
        itemType,
        itemId: row.item_id ?? row.itemId,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  client_favorites done.`);
}

async function migrateClientNotifications(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating client_notifications: ${data.length} rows...`);

  for (const row of data) {
    await prisma.clientNotification.create({
      data: {
        clientId: row.client_id ?? row.clientId,
        shopId: toInt(row.shop_id ?? row.shopId),
        type: row.type,
        title: row.title,
        message: row.message ?? null,
        targetId: toInt(row.target_id ?? row.targetId),
        shopName: row.shop_name ?? row.shopName ?? null,
        shopLogo: row.shop_logo ?? row.shopLogo ?? null,
        read: toBoolean(row.read),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  client_notifications done.`);
}

async function migrateStockPings(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating stock_pings: ${data.length} rows...`);

  const validStatuses = ["pending", "responded", "expired"] as const;

  for (const row of data) {
    await prisma.stockPing.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        productId: toInt(row.product_id ?? row.productId),
        productName: row.product_name ?? row.productName,
        productImage: row.product_image ?? row.productImage ?? null,
        clientId: toInt(row.client_id ?? row.clientId),
        status: toEnum(row.status, [...validStatuses]) ?? "pending",
        response: row.response ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
        respondedAt: toDate(row.responded_at ?? row.respondedAt),
      },
    });
  }
  console.log(`  stock_pings done.`);
}

async function migrateShopPhotos(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating shop_photos: ${data.length} rows...`);

  for (const row of data) {
    await prisma.shopPhoto.create({
      data: {
        shopId: row.shop_id ?? row.shopId,
        url: row.url,
        sortOrder: toInt(row.sort_order ?? row.sortOrder) ?? 0,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  shop_photos done.`);
}

async function migrateAnalyticsEvents(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating analytics_events: ${data.length} rows...`);

  // Batch insert for performance (analytics can be large)
  const batchSize = 500;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.analyticsEvent.createMany({
      data: batch.map((row: any) => ({
        eventType: row.event_type ?? row.eventType,
        targetType: row.target_type ?? row.targetType ?? null,
        targetId: toInt(row.target_id ?? row.targetId),
        targetName: row.target_name ?? row.targetName ?? null,
        searchQuery: row.search_query ?? row.searchQuery ?? null,
        sessionId: row.session_id ?? row.sessionId ?? null,
        clientId: toInt(row.client_id ?? row.clientId),
        userAgent: row.user_agent ?? row.userAgent ?? null,
        referrer: row.referrer ?? null,
        extra: validateJson(row.extra),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      })),
      skipDuplicates: true,
    });
    if (data.length > batchSize) {
      console.log(`  analytics_events: ${Math.min(i + batchSize, data.length)}/${data.length}`);
    }
  }
  console.log(`  analytics_events done.`);
}

async function migrateCityAccounts(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating city_accounts: ${data.length} rows...`);

  for (const row of data) {
    await prisma.cityAccount.upsert({
      where: { email: row.email },
      update: {},
      create: {
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash ?? row.passwordHash,
        contactName: row.contact_name ?? row.contactName ?? null,
        phone: row.phone ?? null,
        department: row.department ?? null,
        region: row.region ?? null,
        active: toBoolean(row.active ?? 1),
        description: row.description ?? null,
        banner: row.banner ?? null,
        logo: row.logo ?? null,
        logoEmoji: row.logo_emoji ?? row.logoEmoji ?? null,
        slogan: row.slogan ?? null,
        cityCategory: row.city_category ?? row.cityCategory ?? null,
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  city_accounts done.`);
}

async function migrateCityPoints(data: any[]) {
  if (!data?.length) return;
  console.log(`Migrating city_points: ${data.length} rows...`);

  for (const row of data) {
    await prisma.cityPoint.create({
      data: {
        cityId: row.city_id ?? row.cityId,
        name: row.name,
        description: row.description ?? null,
        history: row.history ?? null,
        address: row.address ?? null,
        category: row.category ?? null,
        image: row.image ?? null,
        latitude: toFloat(row.latitude),
        longitude: toFloat(row.longitude),
        sortOrder: toInt(row.sort_order ?? row.sortOrder) ?? 0,
        active: toBoolean(row.active ?? 1),
        createdAt: toDateRequired(row.created_at ?? row.createdAt),
      },
    });
  }
  console.log(`  city_points done.`);
}

// ─── Integrity Verification ─────────────────────────

async function verifyIntegrity(dump: Record<string, any[]>) {
  console.log("\n--- Integrity Verification ---");

  const tableMap: [string, { count: () => Promise<number> }][] = [
    ["admins", prisma.admin],
    ["shops", prisma.shop],
    ["employees", prisma.employee],
    ["clients", prisma.client],
    ["products", prisma.product],
    ["catalog_products", prisma.catalogProduct],
    ["catalog_variants", prisma.catalogVariant],
    ["orders", prisma.order],
    ["order_items", prisma.orderItem],
    ["shop_events", prisma.shopEvent],
    ["shop_activities", prisma.shopActivity],
    ["activity_folders", prisma.activityFolder],
    ["client_favorites", prisma.clientFavorite],
    ["client_notifications", prisma.clientNotification],
    ["stock_pings", prisma.stockPing],
    ["shop_photos", prisma.shopPhoto],
    ["analytics_events", prisma.analyticsEvent],
    ["city_accounts", prisma.cityAccount],
    ["city_points", prisma.cityPoint],
  ];

  let allGood = true;

  for (const [tableName, model] of tableMap) {
    const sourceCount = dump[tableName]?.length ?? 0;
    const dbCount = await (model as any).count();
    const status = dbCount >= sourceCount ? "OK" : "MISMATCH";
    if (status === "MISMATCH") allGood = false;
    console.log(
      `  ${tableName.padEnd(25)} source=${String(sourceCount).padStart(6)}  db=${String(dbCount).padStart(6)}  [${status}]`
    );
  }

  if (allGood) {
    console.log("\nAll tables verified successfully.");
  } else {
    console.warn("\nSome tables have count mismatches. Review warnings above.");
  }
}

// ─── Main ────────────────────────────────────────────

async function main() {
  const dumpPath = path.resolve(process.argv[2] || "sqlite-dump.json");

  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump file not found: ${dumpPath}`);
    console.error("Usage: npx tsx scripts/migrate-data.ts [path-to-sqlite-dump.json]");
    process.exit(1);
  }

  console.log(`Reading dump from: ${dumpPath}`);
  const dump: Record<string, any[]> = JSON.parse(fs.readFileSync(dumpPath, "utf-8"));

  console.log(
    `Found tables: ${Object.keys(dump)
      .filter((k) => Array.isArray(dump[k]))
      .join(", ")}\n`
  );

  console.log("Starting migration (in dependency order)...\n");

  // Independent root tables (no foreign keys pointing to other app tables)
  await migrateAdmins(dump.admins);
  await migrateShops(dump.shops);
  await migrateClients(dump.clients);
  await migrateCityAccounts(dump.city_accounts);

  // Tables depending on shops
  await migrateEmployees(dump.employees);
  await migrateProducts(dump.products);
  await migrateActivityFolders(dump.activity_folders);
  await migrateShopEvents(dump.shop_events);
  await migrateShopPhotos(dump.shop_photos);

  // Tables depending on shops + products
  await migrateCatalogProducts(dump.catalog_products);
  await migrateShopActivities(dump.shop_activities);
  await migrateStockPings(dump.stock_pings);

  // Tables depending on catalog_products
  await migrateCatalogVariants(dump.catalog_variants);

  // Tables depending on shops + clients
  await migrateOrders(dump.orders);
  await migrateClientFavorites(dump.client_favorites);
  await migrateClientNotifications(dump.client_notifications);

  // Tables depending on orders + catalog
  await migrateOrderItems(dump.order_items);

  // Tables depending on city_accounts
  await migrateCityPoints(dump.city_points);

  // Analytics (large, independent)
  await migrateAnalyticsEvents(dump.analytics_events);

  // Verify integrity
  await verifyIntegrity(dump);

  console.log("\nMigration complete!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
