# Bizz AI - AI Stack Recommendation Platform

## Overview

Bizz AI is a full-stack web application that provides personalized AI tool recommendations for businesses. The platform features a multi-step questionnaire that collects business information and generates customized AI stack recommendations using OpenAI's GPT models. The application includes voice interaction capabilities, Stripe payment integration, and email delivery of recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React 18 and TypeScript, using a component-based architecture with the following key decisions:

- **Routing**: Uses Wouter for lightweight client-side routing with pages for home, questionnaire, results, and checkout
- **State Management**: React Query (TanStack Query) for server state management with custom query client configuration
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with custom cream/golden color palette and CSS variables for theming
- **Voice Integration**: Custom hooks for speech recognition and synthesis using Web Speech API
- **Payment UI**: Stripe Elements for secure payment processing

### Backend Architecture
The server-side follows a REST API pattern with Express.js:

- **Server Framework**: Express.js with TypeScript, middleware for JSON parsing and request logging
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Pattern**: Repository pattern with `IStorage` interface for data access abstraction
- **API Design**: RESTful endpoints under `/api/` namespace with error handling middleware

### Data Storage Solutions
Database schema designed for business profiling and AI recommendations:

- **Users Table**: Basic user information with Stripe integration fields
- **Business Profiles**: Detailed business characteristics (type, team size, objectives, current tools)
- **AI Stacks**: Generated recommendation summaries with implementation guidance
- **AI Recommendations**: Individual tool recommendations with priority and feature details
- **Database**: PostgreSQL with Neon serverless for scalability

### Authentication and Authorization
Currently implements a simple user identification system:

- **User Creation**: Email-based user lookup and creation during stack generation
- **Session Management**: Basic user tracking without complex authentication
- **Payment Integration**: Stripe customer and subscription ID storage for billing

### External Service Integrations

#### AI and ML Services
- **OpenAI GPT-4**: Core AI recommendation engine using structured prompts
- **Kyutai AI**: Placeholder integration for future text-to-speech capabilities

#### Payment Processing
- **Stripe**: Complete payment infrastructure with Elements for secure card processing
- **Subscription Management**: Customer and subscription tracking in user records

#### Communication Services
- **Email Delivery**: Nodemailer with Gmail SMTP for sending AI stack recommendations
- **SendGrid**: Alternative email service integration for scalable email delivery

#### Development and Deployment
- **Vite**: Modern build tool with HMR for development and optimized production builds
- **Replit Integration**: Special development environment handling with runtime error overlay
- **Database Migrations**: Drizzle Kit for schema management and database versioning

The architecture prioritizes rapid development and deployment while maintaining type safety throughout the stack. The modular design allows for easy extension of AI models, payment providers, and communication channels.