# Overview

HEYY GURU is an online education platform for K-12 students in India, offering affordable live classes and personalized mentorship. The platform provides three course tiers (Aarambh, Atal, and Atal Premium) covering school academics and beyond-curriculum subjects like Vedic Math and Public Speaking. Built as a full-stack React application with Express.js backend, it features course enrollment, payment processing via Razorpay, and a responsive design optimized for Indian educational needs.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for Home, Courses, and 404
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color palette and typography (Poppins/Nunito fonts)
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions between frontend and backend using Zod
- **Storage**: Configurable storage interface with in-memory implementation for development
- **API Structure**: RESTful API with endpoints for courses, enrollments, and payments

## Data Storage
- **Database**: PostgreSQL configured via Drizzle with migrations support
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity
- **Tables**: Students, courses, enrollments, payments with proper foreign key relationships
- **Schema Validation**: Drizzle-Zod integration for runtime type checking

## Authentication & Session Management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **User Management**: Basic user table structure prepared for authentication implementation

## Payment Processing
- **Gateway**: Razorpay integration for handling course payments
- **Flow**: Order creation → Payment processing → Enrollment confirmation
- **Security**: Server-side payment verification with order tracking

# External Dependencies

## Core Technologies
- **Database**: Neon Database (PostgreSQL serverless)
- **Payment Gateway**: Razorpay for payment processing
- **Fonts**: Google Fonts (Poppins, Nunito)
- **Icons**: Lucide React icon library

## Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production bundling
- **Development**: Hot module replacement and error overlay via Replit plugins

## Third-Party Services
- **WhatsApp Integration**: Direct linking to business WhatsApp number
- **Social Media**: Instagram and Facebook page integration
- **App Distribution**: ClassPlus app ecosystem integration
- **Asset Hosting**: Unsplash for placeholder images and educational content

## UI Components & Libraries
- **Component Library**: Extensive shadcn/ui component collection
- **Animations**: CSS-based animations and transitions
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA-compliant components with proper semantic markup