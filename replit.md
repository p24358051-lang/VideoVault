# Overview

This is a full-stack video management web application built with React and Express. The application allows users to browse, play, and manage videos with different permission levels. It features user authentication, role-based access control (user/admin), and a comprehensive video management system with metadata like titles, descriptions, thumbnails, and playback permissions.

The app is designed as a video library platform where admins can upload and manage videos, while regular users can browse and play videos based on their permissions. It includes features like video search, sharing capabilities (including Telegram integration), and profile management with avatar uploads.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with TypeScript using Vite as the build tool and dev server
- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing with protected routes for authentication
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Authentication Flow**: Context-based auth provider with session-based authentication

## Backend Architecture
- **Express.js Server**: RESTful API server with middleware for JSON parsing, CORS, and request logging
- **Authentication**: Passport.js with local strategy using bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL session store for persistence
- **File Upload**: Multer middleware for handling avatar image uploads with file validation
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Structure**: Organized routes with role-based middleware (requireAuth, requireAdmin)

## Database Design
- **PostgreSQL**: Primary database with connection pooling via Neon serverless
- **Schema Management**: Drizzle ORM with schema-first approach and automatic migrations
- **Key Tables**:
  - Users: Authentication, roles (USER/ADMIN), avatar storage
  - Videos: Metadata, permissions (canPlay, canShare, canDownload), view tracking
  - Sessions: Automated session persistence
- **Relationships**: Designed for future user-video associations

## Authentication & Authorization
- **Session-based Authentication**: Secure HTTP-only cookies with CSRF protection
- **Role-based Access Control**: Two-tier system (USER/ADMIN) with route-level protection
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Protected Routes**: Client-side route guards with server-side middleware validation

## File Management
- **Static File Serving**: Express static middleware for uploaded assets and build files
- **Upload Handling**: Multer with file type validation, size limits, and organized storage
- **Avatar System**: User profile picture upload with automatic URL generation

## Development Architecture
- **Monorepo Structure**: Shared schema and types between client and server
- **Hot Module Replacement**: Vite dev server integration with Express in development
- **TypeScript**: Full-stack type safety with shared interfaces and validation schemas
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines

# External Dependencies

## Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **File System**: Local file storage for uploaded assets (avatars, potentially videos)

## Authentication Services
- **Passport.js**: Authentication middleware with local strategy
- **bcrypt**: Password hashing and verification

## UI & Styling
- **shadcn/ui**: Pre-built component library based on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless UI components for accessibility and functionality
- **Lucide Icons**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool and development server
- **esbuild**: Server-side bundling for production builds
- **Drizzle Kit**: Database migration and schema management tools
- **TypeScript**: Type checking and development experience

## Third-party Integrations
- **Telegram Sharing**: Deep link integration for sharing videos via Telegram
- **Web Share API**: Native browser sharing capabilities where supported
- **Google Fonts**: Custom font loading for typography (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

## Production Considerations
- **Session Storage**: PostgreSQL-backed session persistence for scalability
- **File Serving**: Express static file serving (may need CDN for production scale)
- **Security**: HTTPS enforcement, secure session cookies, and CSRF protection built-in