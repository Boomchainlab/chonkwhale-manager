import {
  users,
  whales,
  whaleTransactions,
  alerts,
  alertHistory,
  type User,
  type UpsertUser,
  type Whale,
  type InsertWhale,
  type WhaleTransaction,
  type InsertWhaleTransaction,
  type Alert,
  type InsertAlert,
  type AlertHistory,
  type InsertAlertHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(userId: string, tier: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User | undefined>;

  // Whale operations
  getAllWhales(limit?: number, offset?: number): Promise<Whale[]>;
  getWhaleByAddress(address: string): Promise<Whale | undefined>;
  upsertWhale(whale: InsertWhale): Promise<Whale>;
  updateWhaleRanks(): Promise<void>;
  getTopWhales(limit: number): Promise<Whale[]>;

  // Whale transaction operations
  insertWhaleTransaction(transaction: InsertWhaleTransaction): Promise<WhaleTransaction>;
  getWhaleTransactions(whaleId: string, limit?: number): Promise<WhaleTransaction[]>;
  getRecentTransactions(limit: number): Promise<(WhaleTransaction & { whale: Whale })[]>;

  // Alert operations
  getUserAlerts(userId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(alertId: string, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(alertId: string): Promise<boolean>;
  getAllActiveAlerts(): Promise<Alert[]>;

  // Alert history operations
  insertAlertHistory(history: InsertAlertHistory): Promise<AlertHistory>;
  getUserAlertHistory(userId: string, limit?: number): Promise<AlertHistory[]>;

  // Analytics
  getWhaleAnalytics(): Promise<{
    totalWhales: number;
    activeWhales: number;
    volume24h: string;
    priceImpact24h: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, tier: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ subscriptionTier: tier, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId, 
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Whale operations
  async getAllWhales(limit = 50, offset = 0): Promise<Whale[]> {
    return await db
      .select()
      .from(whales)
      .orderBy(asc(whales.rank))
      .limit(limit)
      .offset(offset);
  }

  async getWhaleByAddress(address: string): Promise<Whale | undefined> {
    const [whale] = await db.select().from(whales).where(eq(whales.walletAddress, address));
    return whale;
  }

  async upsertWhale(whaleData: InsertWhale): Promise<Whale> {
    const [whale] = await db
      .insert(whales)
      .values(whaleData)
      .onConflictDoUpdate({
        target: whales.walletAddress,
        set: {
          ...whaleData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return whale;
  }

  async updateWhaleRanks(): Promise<void> {
    // Update ranks based on balance in descending order
    await db.execute(sql`
      UPDATE whales 
      SET rank = ranked.new_rank 
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY balance DESC) as new_rank
        FROM whales 
        WHERE is_active = true
      ) ranked 
      WHERE whales.id = ranked.id
    `);
  }

  async getTopWhales(limit: number): Promise<Whale[]> {
    return await db
      .select()
      .from(whales)
      .where(eq(whales.isActive, true))
      .orderBy(asc(whales.rank))
      .limit(limit);
  }

  // Whale transaction operations
  async insertWhaleTransaction(transactionData: InsertWhaleTransaction): Promise<WhaleTransaction> {
    const [transaction] = await db
      .insert(whaleTransactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getWhaleTransactions(whaleId: string, limit = 50): Promise<WhaleTransaction[]> {
    return await db
      .select()
      .from(whaleTransactions)
      .where(eq(whaleTransactions.whaleId, whaleId))
      .orderBy(desc(whaleTransactions.timestamp))
      .limit(limit);
  }

  async getRecentTransactions(limit: number): Promise<(WhaleTransaction & { whale: Whale })[]> {
    const result = await db
      .select()
      .from(whaleTransactions)
      .innerJoin(whales, eq(whaleTransactions.whaleId, whales.id))
      .orderBy(desc(whaleTransactions.timestamp))
      .limit(limit);

    return result.map(row => ({
      ...row.whale_transactions,
      whale: row.whales
    }));
  }

  // Alert operations
  async getUserAlerts(userId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(alertData).returning();
    return alert;
  }

  async updateAlert(alertId: string, alertData: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set({ ...alertData, updatedAt: new Date() })
      .where(eq(alerts.id, alertId))
      .returning();
    return alert;
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, alertId));
    return result.rowCount > 0;
  }

  async getAllActiveAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.isActive, true));
  }

  // Alert history operations
  async insertAlertHistory(historyData: InsertAlertHistory): Promise<AlertHistory> {
    const [history] = await db.insert(alertHistory).values(historyData).returning();
    return history;
  }

  async getUserAlertHistory(userId: string, limit = 50): Promise<AlertHistory[]> {
    return await db
      .select()
      .from(alertHistory)
      .where(eq(alertHistory.userId, userId))
      .orderBy(desc(alertHistory.timestamp))
      .limit(limit);
  }

  // Analytics
  async getWhaleAnalytics(): Promise<{
    totalWhales: number;
    activeWhales: number;
    volume24h: string;
    priceImpact24h: string;
  }> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [whaleStats] = await db
      .select({
        totalWhales: sql<number>`count(*)`,
        activeWhales: sql<number>`count(*) filter (where is_active = true)`,
      })
      .from(whales);

    const [volumeStats] = await db
      .select({
        volume24h: sql<string>`coalesce(sum(amount_usd), '0')`,
        avgPriceImpact: sql<string>`coalesce(avg(price_impact), '0')`,
      })
      .from(whaleTransactions)
      .where(gte(whaleTransactions.timestamp, yesterday));

    return {
      totalWhales: whaleStats.totalWhales || 0,
      activeWhales: whaleStats.activeWhales || 0,
      volume24h: volumeStats.volume24h || '0',
      priceImpact24h: volumeStats.avgPriceImpact || '0',
    };
  }
}

export const storage = new DatabaseStorage();
