import { storage } from '../storage';
import { Alert, Whale, WhaleTransaction, InsertAlertHistory } from '@shared/schema';

export interface AlertCondition {
  type: 'new_whale' | 'whale_exit' | 'large_transfer' | 'price_impact' | 'balance_change';
  operator?: '>' | '<' | '=' | '>=' | '<=';
  value?: number;
  timeframe?: string;
}

export class AlertService {
  async processWhaleEvent(eventType: string, whale: Whale, transaction?: WhaleTransaction) {
    const activeAlerts = await storage.getAllActiveAlerts();
    
    for (const alert of activeAlerts) {
      if (await this.shouldTriggerAlert(alert, eventType, whale, transaction)) {
        await this.triggerAlert(alert, whale, transaction);
      }
    }
  }

  private async shouldTriggerAlert(
    alert: Alert, 
    eventType: string, 
    whale: Whale, 
    transaction?: WhaleTransaction
  ): Promise<boolean> {
    const conditions = alert.conditions as AlertCondition[];
    
    for (const condition of conditions) {
      switch (condition.type) {
        case 'new_whale':
          if (eventType === 'new_whale') {
            return true;
          }
          break;
          
        case 'whale_exit':
          if (eventType === 'whale_exit' || !whale.isActive) {
            return true;
          }
          break;
          
        case 'large_transfer':
          if (transaction && condition.value) {
            const amount = parseFloat(transaction.amount);
            return amount >= condition.value;
          }
          break;
          
        case 'price_impact':
          if (transaction?.priceImpact && condition.value) {
            const impact = parseFloat(transaction.priceImpact);
            return Math.abs(impact) >= condition.value;
          }
          break;
          
        case 'balance_change':
          if (condition.value && condition.operator) {
            const balance = parseFloat(whale.balance);
            return this.evaluateCondition(balance, condition.operator, condition.value);
          }
          break;
      }
    }
    
    return false;
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '=': return value === threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      default: return false;
    }
  }

  private async triggerAlert(alert: Alert, whale: Whale, transaction?: WhaleTransaction) {
    const message = this.formatAlertMessage(alert, whale, transaction);
    
    // Send to configured channels
    const channels = alert.channels || [];
    const results = [];
    
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'discord':
            if (alert.webhookUrl) {
              await this.sendDiscordAlert(alert.webhookUrl, message);
              results.push({ channel, success: true });
            }
            break;
            
          case 'slack':
            if (alert.webhookUrl) {
              await this.sendSlackAlert(alert.webhookUrl, message);
              results.push({ channel, success: true });
            }
            break;
            
          case 'telegram':
            // TODO: Implement Telegram bot integration
            results.push({ channel, success: false, error: 'Not implemented' });
            break;
            
          case 'email':
            // TODO: Implement email integration
            results.push({ channel, success: false, error: 'Not implemented' });
            break;
        }
      } catch (error) {
        results.push({ 
          channel, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    // Log alert history
    const historyData: InsertAlertHistory = {
      alertId: alert.id,
      userId: alert.userId,
      message,
      channels,
      success: results.every(r => r.success),
      errorMessage: results.filter(r => !r.success).map(r => r.error).join(', ') || undefined,
    };
    
    await storage.insertAlertHistory(historyData);
  }

  private formatAlertMessage(alert: Alert, whale: Whale, transaction?: WhaleTransaction): string {
    const walletShort = `${whale.walletAddress.slice(0, 4)}...${whale.walletAddress.slice(-4)}`;
    const balance = parseFloat(whale.balance).toLocaleString();
    
    let message = `🐋 **${alert.name}** Alert!\n`;
    message += `Wallet: \`${walletShort}\`\n`;
    message += `Balance: ${balance} CHONK9K\n`;
    
    if (whale.balanceUsd) {
      const usdValue = parseFloat(whale.balanceUsd).toLocaleString();
      message += `Value: ~$${usdValue}\n`;
    }
    
    if (transaction) {
      const amount = parseFloat(transaction.amount).toLocaleString();
      message += `Transaction: ${transaction.type} ${amount} CHONK9K\n`;
      
      if (transaction.priceImpact) {
        message += `Price Impact: ${transaction.priceImpact}%\n`;
      }
    }
    
    message += `\nTime: ${new Date().toLocaleString()}\n`;
    message += `Track all whales at your dashboard! 📊`;
    
    return message;
  }

  private async sendDiscordAlert(webhookUrl: string, message: string) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        username: 'CHONK9K Whale Tracker',
        avatar_url: 'https://via.placeholder.com/64x64/00d4aa/ffffff?text=🐋',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }
  }

  private async sendSlackAlert(webhookUrl: string, message: string) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        username: 'CHONK9K Whale Tracker',
        icon_emoji: ':whale:',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }
}
