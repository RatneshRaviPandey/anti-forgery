import {
  pgTable, uuid, text, integer, boolean, decimal,
  timestamp, date, jsonb, index, pgEnum,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── ENUMS ───────────────────────────────────────────────────────
export const planEnum = pgEnum('plan', ['starter', 'growth', 'enterprise']);
export const codeStatusEnum = pgEnum('code_status', ['active', 'suspicious', 'deactivated']);
export const scanResultEnum = pgEnum('scan_result', ['authentic', 'suspicious', 'invalid']);
export const alertTypeEnum = pgEnum('alert_type', [
  'duplicate_scan', 'geo_anomaly', 'scan_spike', 'recall', 'deactivated_use',
]);
export const industryEnum = pgEnum('industry', [
  'dairy', 'pharma', 'cosmetics', 'fmcg', 'agro_products',
  'electronics', 'auto_parts', 'lubricants', 'supplements',
  'beverages', 'luxury', 'industrial_chemicals',
]);

export const brandStatusEnum = pgEnum('brand_status', [
  'pending_verification', 'active', 'suspended', 'trial', 'churned',
]);
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'viewer']);

// ─── BRANDS ──────────────────────────────────────────────────────
export const brands = pgTable('brands', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  name:               text('name').notNull(),
  email:              text('email').unique().notNull(),
  phone:              text('phone'),
  logoUrl:            text('logo_url'),
  website:            text('website'),
  plan:               planEnum('plan').default('starter'),
  isActive:           boolean('is_active').default(true),
  apiKey:             text('api_key').unique(),
  apiKeyHash:         text('api_key_hash'),
  settings:           jsonb('settings').default({}),
  // Auth fields
  status:             brandStatusEnum('status').default('pending_verification'),
  emailVerified:      boolean('email_verified').default(false),
  emailVerifiedAt:    timestamp('email_verified_at'),
  mfaEnabled:         boolean('mfa_enabled').default(false),
  mfaSecret:          text('mfa_secret'),
  trialEndsAt:        timestamp('trial_ends_at'),
  lastLoginAt:        timestamp('last_login_at'),
  loginCount:         integer('login_count').default(0),
  failedLoginCount:   integer('failed_login_count').default(0),
  lockedUntil:        timestamp('locked_until'),
  passwordChangedAt:  timestamp('password_changed_at'),
  onboardingComplete: boolean('onboarding_complete').default(false),
  onboardingStep:     integer('onboarding_step').default(0),
  timezone:           text('timezone').default('Asia/Kolkata'),
  country:            text('country').default('IN'),
  metadata:           jsonb('metadata').default({}),
  createdAt:          timestamp('created_at').defaultNow(),
  updatedAt:          timestamp('updated_at').defaultNow(),
});

// ─── PRODUCTS ────────────────────────────────────────────────────
export const products = pgTable('products', {
  id:          uuid('id').primaryKey().defaultRandom(),
  brandId:     uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  sku:         text('sku').notNull(),
  industry:    industryEnum('industry').notNull(),
  description: text('description'),
  imageUrl:    text('image_url'),
  category:    text('category'),
  isActive:    boolean('is_active').default(true),
  metadata:    jsonb('metadata').default({}),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
}, (table) => [
  index('products_brand_id_idx').on(table.brandId),
  index('products_sku_idx').on(table.sku),
]);

// ─── BATCHES ─────────────────────────────────────────────────────
export const batches = pgTable('batches', {
  id:              uuid('id').primaryKey().defaultRandom(),
  productId:       uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  brandId:         uuid('brand_id').references(() => brands.id),
  batchCode:       text('batch_code').unique().notNull(),
  manufactureDate: date('manufacture_date'),
  expiryDate:      date('expiry_date'),
  totalUnits:      integer('total_units').notNull(),
  generatedUnits:  integer('generated_units').default(0),
  activatedAt:     timestamp('activated_at'),
  isActive:        boolean('is_active').default(false),
  notes:           text('notes'),
  createdAt:       timestamp('created_at').defaultNow(),
}, (table) => [
  index('batches_product_id_idx').on(table.productId),
  index('batches_brand_id_idx').on(table.brandId),
]);

// ─── QR CODES ────────────────────────────────────────────────────
export const qrCodes = pgTable('qr_codes', {
  token:           text('token').primaryKey(),
  batchId:         uuid('batch_id').references(() => batches.id),
  productId:       uuid('product_id').references(() => products.id),
  brandId:         uuid('brand_id').references(() => brands.id),
  status:          codeStatusEnum('status').default('active'),
  scanCount:       integer('scan_count').default(0),
  uniqueLocations: integer('unique_locations').default(0),
  firstScannedAt:  timestamp('first_scanned_at'),
  lastScannedAt:   timestamp('last_scanned_at'),
  lastScannedCity: text('last_scanned_city'),
  deactivatedAt:   timestamp('deactivated_at'),
  deactivatedBy:   text('deactivated_by'),
  createdAt:       timestamp('created_at').defaultNow(),
}, (table) => [
  index('qr_codes_batch_id_idx').on(table.batchId),
  index('qr_codes_status_idx').on(table.status),
  index('qr_codes_brand_id_idx').on(table.brandId),
]);

// ─── SCANS ───────────────────────────────────────────────────────
export const scans = pgTable('scans', {
  id:           uuid('id').primaryKey().defaultRandom(),
  token:        text('token').notNull(),
  productId:    uuid('product_id'),
  brandId:      uuid('brand_id'),
  scannedAt:    timestamp('scanned_at').defaultNow(),
  resultStatus: scanResultEnum('result_status').notNull(),
  city:         text('city'),
  country:      text('country').default('IN'),
  lat:          decimal('lat', { precision: 9, scale: 6 }),
  lng:          decimal('lng', { precision: 9, scale: 6 }),
  deviceHash:   text('device_hash'),
  userAgent:    text('user_agent'),
  ipHash:       text('ip_hash'),
  sessionId:    text('session_id'),
}, (table) => [
  index('scans_token_idx').on(table.token),
  index('scans_scanned_at_idx').on(table.scannedAt),
  index('scans_brand_id_idx').on(table.brandId),
  index('scans_result_status_idx').on(table.resultStatus),
]);

// ─── ALERTS ──────────────────────────────────────────────────────
export const alerts = pgTable('alerts', {
  id:          uuid('id').primaryKey().defaultRandom(),
  token:       text('token'),
  productId:   uuid('product_id'),
  brandId:     uuid('brand_id').references(() => brands.id),
  type:        alertTypeEnum('type').notNull(),
  severity:    text('severity').default('medium'),
  details:     jsonb('details').default({}),
  scanCount:   integer('scan_count'),
  locations:   jsonb('locations').default([]),
  resolved:    boolean('resolved').default(false),
  resolvedAt:  timestamp('resolved_at'),
  resolvedBy:  text('resolved_by'),
  emailSentAt: timestamp('email_sent_at'),
  createdAt:   timestamp('created_at').defaultNow(),
}, (table) => [
  index('alerts_brand_id_idx').on(table.brandId),
  index('alerts_resolved_idx').on(table.resolved),
  index('alerts_created_at_idx').on(table.createdAt),
]);

// ─── USERS ───────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:          uuid('id').primaryKey(),
  brandId:     uuid('brand_id').references(() => brands.id),
  email:       text('email').unique().notNull(),
  name:        text('name'),
  role:        text('role').default('viewer'),
  avatarUrl:   text('avatar_url'),
  lastLoginAt: timestamp('last_login_at'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
});

// ─── AUDIT LOGS ──────────────────────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id'),
  brandId:   uuid('brand_id'),
  action:    text('action').notNull(),
  entity:    text('entity').notNull(),
  entityId:  text('entity_id'),
  before:    jsonb('before'),
  after:     jsonb('after'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('audit_logs_brand_id_idx').on(table.brandId),
  index('audit_logs_created_at_idx').on(table.createdAt),
]);

// ─── BRAND USERS (Team members per brand) ────────────────────────
export const brandUsers = pgTable('brand_users', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  supabaseUid:        text('supabase_uid').unique(),
  brandId:            uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  email:              text('email').unique().notNull(),
  name:               text('name').notNull(),
  passwordHash:       text('password_hash'),
  role:               userRoleEnum('role').default('viewer'),
  avatarUrl:          text('avatar_url'),
  isActive:           boolean('is_active').default(true),
  emailVerified:      boolean('email_verified').default(false),
  mfaEnabled:         boolean('mfa_enabled').default(false),
  mfaSecret:          text('mfa_secret'),
  lastLoginAt:        timestamp('last_login_at'),
  lastLoginIp:        text('last_login_ip'),
  lastLoginCity:      text('last_login_city'),
  failedAttempts:     integer('failed_attempts').default(0),
  lockedUntil:        timestamp('locked_until'),
  passwordChangedAt:  timestamp('password_changed_at'),
  mustChangePassword: boolean('must_change_password').default(false),
  isSuperAdmin:       boolean('is_super_admin').default(false),
  invitedBy:          uuid('invited_by'),
  invitedAt:          timestamp('invited_at'),
  acceptedAt:         timestamp('accepted_at'),
  preferences:        jsonb('preferences').default({}),
  createdAt:          timestamp('created_at').defaultNow(),
  updatedAt:          timestamp('updated_at').defaultNow(),
}, (table) => [
  index('brand_users_brand_id_idx').on(table.brandId),
  index('brand_users_email_idx').on(table.email),
]);

// ─── SESSIONS ────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id:            uuid('id').primaryKey().defaultRandom(),
  userId:        uuid('user_id').references(() => brandUsers.id, { onDelete: 'cascade' }),
  brandId:       uuid('brand_id').references(() => brands.id),
  sessionToken:  text('session_token').unique().notNull(),
  refreshToken:  text('refresh_token').unique(),
  ipAddress:     text('ip_address'),
  userAgent:     text('user_agent'),
  city:          text('city'),
  country:       text('country'),
  deviceType:    text('device_type'),
  isActive:      boolean('is_active').default(true),
  mfaVerified:   boolean('mfa_verified').default(false),
  expiresAt:     timestamp('expires_at').notNull(),
  lastActiveAt:  timestamp('last_active_at').defaultNow(),
  createdAt:     timestamp('created_at').defaultNow(),
}, (table) => [
  index('sessions_user_id_idx').on(table.userId),
  index('sessions_token_idx').on(table.sessionToken),
  index('sessions_active_idx').on(table.isActive),
]);

// ─── INVITATIONS ─────────────────────────────────────────────────
export const invitations = pgTable('invitations', {
  id:             uuid('id').primaryKey().defaultRandom(),
  brandId:        uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  invitedBy:      uuid('invited_by').references(() => brandUsers.id),
  email:          text('email').notNull(),
  role:           userRoleEnum('role').default('viewer'),
  token:          text('token').unique().notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  acceptedAt:     timestamp('accepted_at'),
  revokedAt:      timestamp('revoked_at'),
  createdAt:      timestamp('created_at').defaultNow(),
}, (table) => [
  index('invitations_brand_id_idx').on(table.brandId),
  index('invitations_email_idx').on(table.email),
  index('invitations_token_idx').on(table.token),
]);

// ─── PASSWORD HISTORY ────────────────────────────────────────────
export const passwordHistory = pgTable('password_history', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => brandUsers.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash').notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
});

// ─── LOGIN ATTEMPTS ──────────────────────────────────────────────
export const loginAttempts = pgTable('login_attempts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  email:         text('email').notNull(),
  ipAddress:     text('ip_address'),
  success:       boolean('success').notNull(),
  failureReason: text('failure_reason'),
  userAgent:     text('user_agent'),
  attemptedAt:   timestamp('attempted_at').defaultNow(),
}, (table) => [
  index('login_attempts_email_idx').on(table.email),
  index('login_attempts_ip_idx').on(table.ipAddress),
  index('login_attempts_at_idx').on(table.attemptedAt),
]);

// ─── BRAND KEYS (Subscription keys for offline code generation) ──
export const brandKeys = pgTable('brand_keys', {
  id:             uuid('id').primaryKey().defaultRandom(),
  keyId:          text('key_id').unique().notNull(),         // short public identifier e.g. "bk_a3f8c1"
  brandId:        uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  brandName:      text('brand_name').notNull(),
  encryptionKey:  text('encryption_key').notNull(),          // 64 hex chars (32 bytes AES-256)
  version:        integer('version').default(1),
  isActive:       boolean('is_active').default(true),
  issuedAt:       timestamp('issued_at').defaultNow(),
  expiresAt:      timestamp('expires_at').notNull(),
  revokedAt:      timestamp('revoked_at'),
  lastUsedAt:     timestamp('last_used_at'),                 // updated on each verify
  verifyCount:    integer('verify_count').default(0),
  createdBy:      uuid('created_by'),
  notes:          text('notes'),
  createdAt:      timestamp('created_at').defaultNow(),
}, (table) => [
  index('brand_keys_brand_id_idx').on(table.brandId),
  index('brand_keys_key_id_idx').on(table.keyId),
  index('brand_keys_active_idx').on(table.isActive),
]);

// ─── RELATIONS ───────────────────────────────────────────────────
export const brandsRelations = relations(brands, ({ many }) => ({
  products:   many(products),
  batches:    many(batches),
  alerts:     many(alerts),
  users:      many(users),
  brandUsers: many(brandUsers),
  sessions:   many(sessions),
  invitations: many(invitations),
  brandKeys:  many(brandKeys),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand:   one(brands, { fields: [products.brandId], references: [brands.id] }),
  batches: many(batches),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  product: one(products, { fields: [batches.productId], references: [products.id] }),
  brand:   one(brands, { fields: [batches.brandId], references: [brands.id] }),
  qrCodes: many(qrCodes),
}));

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  batch:   one(batches, { fields: [qrCodes.batchId], references: [batches.id] }),
  product: one(products, { fields: [qrCodes.productId], references: [products.id] }),
  brand:   one(brands, { fields: [qrCodes.brandId], references: [brands.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  brand: one(brands, { fields: [alerts.brandId], references: [brands.id] }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  brand: one(brands, { fields: [users.brandId], references: [brands.id] }),
}));

export const brandUsersRelations = relations(brandUsers, ({ one, many }) => ({
  brand:    one(brands, { fields: [brandUsers.brandId], references: [brands.id] }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user:  one(brandUsers, { fields: [sessions.userId], references: [brandUsers.id] }),
  brand: one(brands, { fields: [sessions.brandId], references: [brands.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  brand:     one(brands, { fields: [invitations.brandId], references: [brands.id] }),
  invitedByUser: one(brandUsers, { fields: [invitations.invitedBy], references: [brandUsers.id] }),
}));

export const brandKeysRelations = relations(brandKeys, ({ one }) => ({
  brand: one(brands, { fields: [brandKeys.brandId], references: [brands.id] }),
}));
