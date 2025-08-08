import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, basic, pro, enterprise
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Whale wallets table
export const whales = pgTable("whales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: varchar("wallet_address").notNull().unique(),
  balance: decimal("balance", { precision: 20, scale: 8 }).notNull(),
  balanceUsd: decimal("balance_usd", { precision: 12, scale: 2 }),
  rank: integer("rank"),
  firstDetected: timestamp("first_detected").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Whale transactions table
export const whaleTransactions = pgTable("whale_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whaleId: varchar("whale_id").notNull().references(() => whales.id),
  signature: varchar("signature").notNull().unique(),
  type: varchar("type").notNull(), // buy, sell, transfer
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  amountUsd: decimal("amount_usd", { precision: 12, scale: 2 }),
  priceImpact: decimal("price_impact", { precision: 5, scale: 2 }),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // new_whale, whale_exit, large_transfer, price_impact
  conditions: jsonb("conditions").notNull(), // Alert conditions as JSON
  channels: varchar("channels").array(), // discord, slack, telegram, email
  webhookUrl: varchar("webhook_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alert history table
export const alertHistory = pgTable("alert_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id").notNull().references(() => alerts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  channels: varchar("channels").array(),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  alerts: many(alerts),
  alertHistory: many(alertHistory),
}));

export const whalesRelations = relations(whales, ({ many }) => ({
  transactions: many(whaleTransactions),
}));

export const whaleTransactionsRelations = relations(whaleTransactions, ({ one }) => ({
  whale: one(whales, {
    fields: [whaleTransactions.whaleId],
    references: [whales.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  history: many(alertHistory),
}));

export const alertHistoryRelations = relations(alertHistory, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertHistory.alertId],
    references: [alerts.id],
  }),
  user: one(users, {
    fields: [alertHistory.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertWhaleSchema = createInsertSchema(whales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhaleTransactionSchema = createInsertSchema(whaleTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertHistorySchema = createInsertSchema(alertHistory).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Whale = typeof whales.$inferSelect;
export type InsertWhale = z.infer<typeof insertWhaleSchema>;
export type WhaleTransaction = typeof whaleTransactions.$inferSelect;
export type InsertWhaleTransaction = z.infer<typeof insertWhaleTransactionSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = z.infer<typeof insertAlertHistorySchema>;
