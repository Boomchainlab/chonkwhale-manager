import { SolanaService, TokenAccount } from './solanaService';
import { storage } from '../storage';
import { InsertWhale, InsertWhaleTransaction } from '@shared/schema';
import WebSocket from 'ws';

export class WhaleTracker {
  private solanaService: SolanaService;
  private isTracking = false;
  private trackingInterval: NodeJS.Timeout | null = null;
  private webSocketServer: WebSocket.Server | null = null;

  constructor() {
    this.solanaService = new SolanaService();
  }

  setWebSocketServer(wss: WebSocket.Server) {
    this.webSocketServer = wss;
  }

  async startTracking() {
    if (this.isTracking) return;

    console.log('Starting whale tracking...');
    this.isTracking = true;

    // Initial scan
    await this.scanWhales();

    // Set up periodic scanning (every 5 minutes)
    this.trackingInterval = setInterval(async () => {
      try {
        await this.scanWhales();
      } catch (error) {
        console.error('Error during whale scan:', error);
      }
    }, 5 * 60 * 1000);
  }

  stopTracking() {
    console.log('Stopping whale tracking...');
    this.isTracking = false;

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  private async scanWhales() {
    try {
      console.log('Scanning for whales...');
      const tokenAccounts = await this.solanaService.getTokenAccounts();
      const tokenPrice = await this.solanaService.getTokenPrice();

      const newWhales: any[] = [];
      const updatedWhales: any[] = [];

      for (const account of tokenAccounts) {
        const tokenAmount = this.solanaService.formatTokenAmount(account.amount, account.decimals);
        const balanceUsd = tokenAmount * tokenPrice;

        // Check if whale already exists
        const existingWhale = await storage.getWhaleByAddress(account.owner);

        const whaleData: InsertWhale = {
          walletAddress: account.owner,
          balance: tokenAmount.toString(),
          balanceUsd: balanceUsd.toString(),
          lastActivity: new Date(),
          isActive: true,
        };

        if (!existingWhale) {
          // New whale detected
          const newWhale = await storage.upsertWhale({
            ...whaleData,
            firstDetected: new Date(),
          });
          newWhales.push(newWhale);

          // Broadcast new whale event
          this.broadcastWhaleEvent('new_whale', {
            whale: newWhale,
            message: `New whale detected! Wallet ${account.owner.slice(0, 4)}...${account.owner.slice(-4)} holds ${tokenAmount.toLocaleString()} CHONK9K tokens`,
          });
        } else {
          // Update existing whale
          const updatedWhale = await storage.upsertWhale(whaleData);
          updatedWhales.push(updatedWhale);

          // Check for significant balance changes
          const oldBalance = parseFloat(existingWhale.balance);
          const balanceChange = tokenAmount - oldBalance;
          const percentageChange = oldBalance === 0 ? 0 : (balanceChange / oldBalance) * 100;

          if (Math.abs(percentageChange) > 5) { // 5% change threshold
            this.broadcastWhaleEvent('whale_movement', {
              whale: updatedWhale,
              change: balanceChange,
              percentageChange,
              message: `Whale ${account.owner.slice(0, 4)}...${account.owner.slice(-4)} ${balanceChange > 0 ? 'bought' : 'sold'} ${Math.abs(balanceChange).toLocaleString()} CHONK9K tokens (${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%)`,
            });
          }
        }
      }

      // Update whale ranks
      await storage.updateWhaleRanks();

      console.log(`Whale scan complete: ${newWhales.length} new whales, ${updatedWhales.length} updated whales`);

      // Broadcast general stats update
      this.broadcastWhaleEvent('stats_update', {
        totalWhales: tokenAccounts.length,
        newWhales: newWhales.length,
        updatedWhales: updatedWhales.length,
      });

    } catch (error) {
      console.error('Error scanning whales:', error);
    }
  }

  private broadcastWhaleEvent(event: string, data: any) {
    if (!this.webSocketServer) return;

    const message = JSON.stringify({
      type: event,
      timestamp: new Date().toISOString(),
      data,
    });

    this.webSocketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch {
          try { client.terminate(); } catch {}
        }
      }
    });
  }

  async getWhaleAnalytics() {
    return await storage.getWhaleAnalytics();
  }

  async getTopWhales(limit = 50) {
    return await storage.getTopWhales(limit);
  }

  async getRecentActivity(limit = 10) {
    return await storage.getRecentTransactions(limit);
  }
}
