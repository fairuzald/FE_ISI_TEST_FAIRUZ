# Todo List Application

## 🚀 Live Demo

The application is deployed and accessible at:
[http://todo.fairuzald.site/](http://todo.fairuzald.site/)

### Demo Accounts

- **Lead/Admin User**:

  - Email: lead@example.com
  - Password: leadpassword

- **Team Member**:
  - Email: team1@example.com
  - Password: teampassword

## ✨ Features

- **User Authentication**

  - JWT-based authentication
  - Login and registration functionality
  - Role-based authorization (Lead and Team roles)

- **Task Management**

  - Create, read, update, and delete tasks
  - Task assignment to team members
  - Task status tracking (Not Started, On Progress, Done, Reject)
  - Activity logs for all task changes

- **User Interface**
  - Responsive design
  - Dark mode support
  - User-friendly dashboard
  - Real-time filtering and sorting

## 🛠️ Technologies Used

- **Frontend**

  - Next.js 14 (App Router)
  - TypeScript
  - TailwindCSS
  - React Hook Form
  - Zod for validation

- **Backend**

  - Next.js API Routes
  - PostgreSQL
  - Drizzle ORM
  - JWT authentication

- **Deployment**
  - Docker & Docker Compose
  - Nginx (as reverse proxy)

## 🔧 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Docker & Docker Compose (optional)

### Local Development Setup

1. Clone the repository

   ```bash
   git clone https://github.com/fairuzald/FE_ISI_TEST_FAIRUZ.git
   cd FE_ISI_TEST_FAIRUZ
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create `.env` file based on `.env.example`

   ```bash
   cp .env.example .env
   ```

4. Run database local

   ```bash
   npm run docker:dev
   ```

5. Set up the database

   ```bash
   npm run db:push
   npm run db:seed
   ```

6. Start the development server

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Setup

1. Clone the repository and navigate to the project directory

2. Build and start the containers

   ```bash
   docker-compose up -d
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000)
   m what I've included, such as the exact technologies or implementation details.
