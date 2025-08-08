# Overview

CHONK9K Whale Manager is a professional-grade whale tracking platform specifically designed for Solana tokens, with initial focus on the CHONKPUMP 9000 token. The application provides real-time monitoring of large token holders ("whales"), advanced analytics, intelligent alerting systems, and subscription-based monetization features. Built as a full-stack web application with enterprise-level capabilities, it targets crypto traders, DeFi institutions, and token projects seeking sophisticated whale intelligence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time**: WebSocket integration for live whale tracking updates

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live data streaming
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with proper error handling middleware

## Authentication System
- **Provider**: Replit OAuth integration for user authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Complete user lifecycle with subscription tiers (free, basic, pro, enterprise)
- **Authorization**: Route-level protection with subscription-based feature gating

## Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle migrations with versioned schema files
- **Core Entities**: Users, whales, whale transactions, alerts, alert history, and sessions
- **Indexing**: Optimized indexes for whale ranking and transaction queries

## Blockchain Integration
- **Network**: Solana mainnet integration
- **RPC**: Configurable Solana RPC endpoint for blockchain data
- **Token Focus**: CHONK9K token (DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump) with extensible architecture
- **Whale Detection**: Configurable balance thresholds for whale identification

## Real-time Features
- **Whale Tracking**: Continuous monitoring of token holder balances
- **Live Updates**: WebSocket-powered real-time dashboard updates
- **Alert System**: Configurable alert conditions with multiple notification channels
- **Event Streaming**: Live whale activity feed with event categorization

## Monetization Architecture
- **Subscription Tiers**: Four-tier system (free, basic, pro, enterprise) with feature differentiation
- **Payment Processing**: Stripe integration for subscription management
- **Export Features**: Data export capabilities (JSON, CSV, PDF) for paid tiers
- **API Access**: Rate-limited API endpoints with usage-based pricing
- **White-label**: Multi-tenant architecture supporting branded instances

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting for primary data storage
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

## Blockchain Services
- **Solana Web3.js**: For blockchain interaction and token account monitoring
- **Solana RPC**: Mainnet endpoint for real-time blockchain data

## Authentication & Payments
- **Replit OAuth**: Primary authentication provider with OpenID Connect
- **Stripe**: Payment processing and subscription management
- **Stripe React**: Frontend payment components and checkout flows

## Communication APIs
- **Slack Web API**: Webhook and bot integration for alert notifications
- **Email Services**: SMTP integration for email notifications
- **Discord/Telegram**: Bot APIs for community alerts (configured via environment)

## Frontend Dependencies
- **Radix UI**: Comprehensive component library for accessible UI elements
- **Chart.js**: Data visualization for whale activity and analytics
- **React Hook Form**: Form management with validation
- **TanStack React Query**: Server state management and caching

## Development & Deployment
- **Vite**: Development server and build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production bundling for server-side code
- **Drizzle Kit**: Database migration and schema management tools
