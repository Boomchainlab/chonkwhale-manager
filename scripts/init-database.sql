-- CHONK9K Whale Manager Database Schema
-- Run this script to initialize your Neon database

-- Users table for subscription management
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'basic',
  status VARCHAR(50) DEFAULT 'active',
  subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerts configuration table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  condition VARCHAR(500) NOT NULL,
  threshold DECIMAL(20, 8) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  triggered BOOLEAN DEFAULT false,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert history table
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
  alert_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Whale wallets tracking table
CREATE TABLE IF NOT EXISTS whale_wallets (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  usd_value DECIMAL(20, 2) DEFAULT 0,
  last_activity TIMESTAMP,
  tags TEXT[],
  known_entity VARCHAR(255),
  is_monitored BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table for whale activity
CREATE TABLE IF NOT EXISTS whale_transactions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) NOT NULL,
  signature VARCHAR(88) UNIQUE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'buy', 'sell', 'transfer'
  token_address VARCHAR(44),
  token_symbol VARCHAR(20),
  amount DECIMAL(20, 8) NOT NULL,
  usd_value DECIMAL(20, 2),
  block_time TIMESTAMP NOT NULL,
  slot BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Price data table for charts
CREATE TABLE IF NOT EXISTS price_data (
  id SERIAL PRIMARY KEY,
  token_address VARCHAR(44) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(20, 2),
  market_cap DECIMAL(20, 2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alert_history_timestamp ON alert_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_wallets_address ON whale_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_whale_wallets_monitored ON whale_wallets(is_monitored) WHERE is_monitored = true;
CREATE INDEX IF NOT EXISTS idx_whale_transactions_wallet ON whale_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_whale_transactions_time ON whale_transactions(block_time DESC);
CREATE INDEX IF NOT EXISTS idx_whale_transactions_signature ON whale_transactions(signature);
CREATE INDEX IF NOT EXISTS idx_price_data_token_time ON price_data(token_address, timestamp DESC);

-- Insert some initial whale wallets to monitor
INSERT INTO whale_wallets (wallet_address, tags, known_entity) VALUES
('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', ARRAY['DeFi', 'Whale'], 'Unknown Large Holder'),
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', ARRAY['Institutional'], 'Possible Exchange Wallet'),
('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', ARRAY['Active Trader'], 'High Frequency Trader'),
('DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump', ARRAY['Token Creator'], 'CHONK Token Creator')
ON CONFLICT (wallet_address) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whale_wallets_updated_at BEFORE UPDATE ON whale_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON TABLE users IS 'User accounts and subscription management';
COMMENT ON TABLE alerts IS 'User-configured whale tracking alerts';
COMMENT ON TABLE alert_history IS 'History of triggered alerts';
COMMENT ON TABLE whale_wallets IS 'Known whale wallets being monitored';
COMMENT ON TABLE whale_transactions IS 'Historical whale transaction data';
COMMENT ON TABLE price_data IS 'Token price and volume data for charts';
