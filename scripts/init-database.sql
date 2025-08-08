-- CHONK9K Whale Manager Database Schema
-- Initialize database tables for whale tracking and user management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and subscription management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    email VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Whale wallets table for tracking known large holders
CREATE TABLE IF NOT EXISTS whale_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0,
    usd_value DECIMAL(15,2) DEFAULT 0,
    known_entity VARCHAR(255),
    tags TEXT[],
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Whale transactions table for tracking large movements
CREATE TABLE IF NOT EXISTS whale_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_signature VARCHAR(88) UNIQUE NOT NULL,
    wallet_address VARCHAR(44) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'transfer')),
    token_symbol VARCHAR(20) DEFAULT 'CHONK9K',
    amount BIGINT NOT NULL,
    usd_value DECIMAL(15,2) NOT NULL,
    block_time TIMESTAMP WITH TIME ZONE NOT NULL,
    slot BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (wallet_address) REFERENCES whale_wallets(wallet_address) ON DELETE CASCADE
);

-- User alerts table for custom whale tracking alerts
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('volume', 'price', 'whale_activity', 'transaction_size')),
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('above', 'below', 'equals')),
    threshold DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    triggered_count INTEGER DEFAULT 0,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alert history table for tracking when alerts are triggered
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    trigger_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (alert_id) REFERENCES user_alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Price history table for storing token price data
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_symbol VARCHAR(20) DEFAULT 'CHONK9K',
    price DECIMAL(15,8) NOT NULL,
    volume DECIMAL(15,2) DEFAULT 0,
    market_cap DECIMAL(15,2) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) DEFAULT 'internal',
    
    UNIQUE(token_symbol, timestamp)
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL,
    max_alerts INTEGER DEFAULT 5,
    api_rate_limit INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whale_wallets_balance ON whale_wallets(balance DESC);
CREATE INDEX IF NOT EXISTS idx_whale_wallets_address ON whale_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_whale_transactions_wallet ON whale_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_whale_transactions_time ON whale_transactions(block_time DESC);
CREATE INDEX IF NOT EXISTS idx_whale_transactions_type ON whale_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_whale_transactions_amount ON whale_transactions(amount DESC);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created ON alert_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(token_symbol);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, max_alerts, api_rate_limit) 
VALUES 
    ('Free', 0.00, 0.00, '{"alerts": 3, "history": "7 days", "api_access": false, "priority_support": false}', 3, 50),
    ('Pro', 29.99, 299.99, '{"alerts": 50, "history": "90 days", "api_access": true, "priority_support": true, "advanced_analytics": true}', 50, 1000),
    ('Enterprise', 99.99, 999.99, '{"alerts": "unlimited", "history": "unlimited", "api_access": true, "priority_support": true, "advanced_analytics": true, "custom_integrations": true}', -1, 10000)
ON CONFLICT (name) DO NOTHING;

-- Insert some sample whale wallets (these would be populated by your whale detection service)
INSERT INTO whale_wallets (wallet_address, balance, usd_value, known_entity, tags) 
VALUES 
    ('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 45000000, 4500000, 'Binance Hot Wallet', ARRAY['exchange', 'hot_wallet']),
    ('DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn', 32000000, 3200000, 'Coinbase Custody', ARRAY['exchange', 'custody']),
    ('EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq', 28500000, 2850000, 'Jump Trading', ARRAY['market_maker', 'institutional']),
    ('FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK', 21000000, 2100000, NULL, ARRAY['whale', 'early_investor']),
    ('GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL', 18750000, 1875000, 'Alameda Research', ARRAY['trading_firm', 'institutional'])
ON CONFLICT (wallet_address) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whale_wallets_updated_at BEFORE UPDATE ON whale_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_alerts_updated_at BEFORE UPDATE ON user_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for active whale statistics
CREATE OR REPLACE VIEW whale_stats AS
SELECT 
    COUNT(*) as total_whales,
    SUM(balance) as total_balance,
    SUM(usd_value) as total_usd_value,
    AVG(balance) as avg_balance,
    MAX(balance) as max_balance,
    MIN(balance) as min_balance
FROM whale_wallets 
WHERE is_active = true;

-- Create a view for recent whale activity
CREATE OR REPLACE VIEW recent_whale_activity AS
SELECT 
    wt.*,
    ww.known_entity,
    ww.tags
FROM whale_transactions wt
JOIN whale_wallets ww ON wt.wallet_address = ww.wallet_address
WHERE wt.block_time >= NOW() - INTERVAL '24 hours'
ORDER BY wt.block_time DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts and subscription information';
COMMENT ON TABLE whale_wallets IS 'Known whale wallets and their current balances';
COMMENT ON TABLE whale_transactions IS 'Historical whale transactions and movements';
COMMENT ON TABLE user_alerts IS 'User-configured alerts for whale activity';
COMMENT ON TABLE alert_history IS 'History of triggered alerts';
COMMENT ON TABLE price_history IS 'Historical price data for tokens';
COMMENT ON TABLE subscription_plans IS 'Available subscription tiers and features';
COMMENT ON TABLE user_sessions IS 'Active user sessions for authentication';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CHONK9K Whale Manager database initialized successfully!';
    RAISE NOTICE 'Tables created: users, whale_wallets, whale_transactions, user_alerts, alert_history, price_history, subscription_plans, user_sessions';
    RAISE NOTICE 'Views created: whale_stats, recent_whale_activity';
    RAISE NOTICE 'Sample data inserted for whale wallets and subscription plans';
END $$;
