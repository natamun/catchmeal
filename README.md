# CatCHMeal

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

A full-stack nutrition and wellness tracking web application. Users can log meals, track body composition, set calorie and macro goals, monitor progress through statistics, chat with friends, and get AI-powered dietary guidance.

## Table of Contents

- [Description](#description)
- [Screenshots](#screenshots)
- [Team](#team)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features](#features)
- [Instructions](#instructions)
- [API Documentation](#api-documentation)
- [Resources](#resources)

## Description

CatCHMeal is a full-stack nutrition and wellness tracking web application. The application is centered around a personal health dashboard where users log meals, track their body composition over time, and receive AI-powered dietary guidance tailored to their goals.

The project combines a React frontend with client-side routing, a NestJS backend, a PostgreSQL database hosted on Supabase, WebSocket communication, HTTPS deployment through Nginx and Caddy, user accounts, OAuth login, barcode scanning via Open Food Facts, calorie and macro goal setting with BMR/TDEE recommendations, body composition history, real-time chat, friend system with presence tracking, activity feed, statistics and charts, GDPR data export, and an integrated Mistral AI assistant.

### Key Features

- User registration, login, logout, and OAuth authentication (42, Google, GitHub).
- Editable user profile with avatar upload, height, weight, gender, birth date, and activity level.
- Body composition tracking per weigh-in: body fat, muscle mass, fat-free mass, and body water.
- Calorie and macro goal setting with BMR/TDEE recommendations (Mifflin-St Jeor and Katch-McArdle).
- Food item CRUD with barcode scanning and Open Food Facts auto-fill.
- Meal logging with food items, quantities, macro scaling, and meal templates.
- Daily journal to view and manage meals logged on a specific day.
- Statistics and charts for calories, macros, and body composition over a selected period.
- Friend system with real-time presence, activity feed, and WebSocket-based chat.
- Mistral AI assistant with access to the user's meals, goals, and weight history.
- Admin board for user management (view, edit role, delete).
- GDPR-compliant data export (HTML or JSON), account deletion with anonymization, and legal pages.
- Accessibility: ARIA roles, labels, focus management, and keyboard navigation.

## Screenshots

The home dashboard is your daily hub — log meals, monitor your calorie and macro progress, and stay connected with your friends' activity.

<p align="center">
  <img src="./docs/accueil.png" alt="CatCHMeal accueil" height="400" />
  <br/><em>Macro rings update in real time as you add food items to your meals.</em>
</p>

The profile page centralizes everything about you — your personal details, your body composition history, and your nutrition goals.

<p align="center">
  <img src="./docs/profile.png" alt="CatCHMeal profile screen" height="400" />
  <br/><em>BMR and TDEE are computed automatically from your stats to suggest a daily calorie target.</em>
</p>

The friends page keeps you connected — see who's online, browse their recent meals and weigh-ins, and chat in real time.

<p align="center">
  <img src="./docs/amis.png" alt="CatCHMeal friends screen" height="400" />
  <br/><em>Each activity card can be quoted directly in a chat message.</em>
</p>

The statistics page turns your logs into insights — visualize trends across any time period you choose.

<p align="center">
  <img src="./docs/stat.png" alt="CatCHMeal statistics screen" height="400" />
  <br/><em>Charts cover calories, protein, carbs, fat, and body composition metrics.</em>
</p>

## Team

[Natalino Munari](https://github.com/natamun), [Curtis Bezençon](https://github.com/CurtXY), [Diana Ramirez](https://www.linkedin.com/in/dianaramirezcarrillo), [Seully Trieste](https://www.linkedin.com/in/seully-trieste-dev/), [Maxime Martin](https://www.linkedin.com/in/maxime-martin-090731aa)

## Technical Stack

### Frontend
- **React 19** with TypeScript — component-based UI
- **Vite 8** — fast dev server and build tool
- **Tailwind CSS v4** — utility-first styling
- **React Router v8** — client-side routing
- **Recharts** — nutrition and body composition charts
- **Socket.IO client** — real-time chat and presence
- **zxing-wasm** — in-browser barcode scanning

### Backend
- **NestJS 11** with TypeScript — modular, decorator-based REST API
- **Passport.js** — JWT authentication + OAuth strategies (42, Google, GitHub)
- **Socket.IO** — WebSocket gateway for real-time messaging and presence
- **Multer** — file upload handling for avatars
- **Nodemailer + Mailtrap** — transactional emails
- **Mistral AI** — AI assistant via agent API
- **@nestjs/throttler** — rate limiting

### Database
- **PostgreSQL** (hosted on Supabase) — relational model fitting the structured relationships between users, meals, food items, goals, and weight logs. Supabase provides a managed instance with built-in Storage for avatar files.
- **Prisma 7** — type-safe ORM with migration management

### Infrastructure
- **Docker + Docker Compose** — containerized dev and prod environments
- **Nginx** — serves the built frontend in production
- **Caddy** — HTTPS (TLS termination) and reverse proxy to the frontend and backend in production
- **GitHub Actions** — CI/CD pipeline

## Database Schema

```mermaid
erDiagram
    User {
        int id PK
        text username
        text email
        text role
        timestamp lastSeenAt
        timestamp deletedAt
    }
    WeightLog {
        int id PK
        int userId FK
        float weight
        float bodyFat
        float muscleMass
        timestamp loggedAt
    }
    GoalSetting {
        int id PK
        int userId FK
        int dailyCalories
        int dailyProtein
        int dailyCarbs
        int dailyFat
        timestamp startDate
    }
    Meal {
        int id PK
        int userId FK
        int sourceMealId FK
        text name
        text typeMeal
        date loggedAt
    }
    MealFoodItem {
        int id PK
        int userId FK
        int mealId FK
        int foodItemId FK
        float quantity
        float kcal
    }
    FoodItem {
        int id PK
        int userId FK
        text name
        text barcode
        float kcal
        bool archived
    }
    Friend {
        int id PK
        int userId FK
        int friendId FK
        text status
    }
    Message {
        int id PK
        int senderId FK
        int receiverId FK
        int activityId FK
        text content
        timestamp sentAt
    }
    Activity {
        int id PK
        int userId FK
        text type
        jsonb metadata
        timestamp createdAt
    }

    User ||--o{ Meal : "has"
    User ||--o{ FoodItem : "owns"
    User ||--o{ MealFoodItem : "owns"
    User ||--o{ WeightLog : "logs"
    User ||--o{ GoalSetting : "sets"
    User ||--o{ Activity : "generates"
    User ||--o{ Friend : "as user"
    User ||--o{ Friend : "as friend"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"
    Meal ||--o{ MealFoodItem : "contains"
    Meal ||--o| Meal : "template of"
    FoodItem ||--o{ MealFoodItem : "used in"
    Activity ||--o{ Message : "quoted in"
```

`FoodItem` is the cornerstone of the data model. It stores the nutritional values (kcal, protein, carbs, fat) for a base quantity and unit (gram, milliliter, or piece). When a food is logged, the `MealFoodItem` line records the quantity eaten along with the kcal and macros scaled to that quantity, computed once at logging time. Editing or archiving a `FoodItem` later therefore leaves past meals unchanged. A quick add logs calories and macros directly, without a `FoodItem` (its `foodItemId` is `null`). A `FoodItem` belongs to a user and can be created manually, filled from a barcode scan via Open Food Facts, or archived when no longer needed. This keeps nutritional data reusable across meals and days.

## Features

| Feature | Description |
|---|---|
| JWT Authentication | Register, login, logout with cookie-based JWT sessions |
| OAuth Login | Sign in with 42, Google, or GitHub |
| User profile | Edit name, username, height, weight, gender, birth date, activity level, goals |
| Avatar upload/delete | Upload and remove profile picture stored on Supabase Storage |
| Body composition tracking | Log and track body fat, muscle mass, fat-free mass, body water per weigh-in |
| Weight history | Full weigh-in history, with edit and delete |
| Calorie & macro goals | Set daily calorie, protein, carbs, fat targets with BMR/TDEE recommendations |
| Food item CRUD | Create, edit, archive, and search personal food items |
| Barcode scanner | Scan a barcode with the camera to look up a product on Open Food Facts |
| Open Food Facts integration | Auto-fill food form from barcode lookup |
| Meal logging | Log meals with food items, quantities, and macro scaling |
| Meal templates | Reuse a previous meal as a template |
| Daily journal | View and manage meals logged on a specific day |
| Statistics & charts | Calorie, macro, and body composition charts over a selected period |
| Data export | Export nutrition data as JSON for a selected period |
| Friend system | Send, accept, and decline friend requests |
| Real-time presence | See which friends are online and their last seen time |
| Friend activity feed | See friends' recent meals, weight logs, and goal changes |
| Real-time chat | WebSocket-based chat with friends, with activity quoting |
| AI assistant | Mistral-powered chatbot with access to user data (meals, goals, weight, analytics) |
| Admin board | Admin-only user management panel (view, edit role, delete users) |
| GDPR | Data export (HTML or JSON), account deletion with anonymization, legal pages |
| Accessibility | ARIA roles, labels, focus management, keyboard navigation |

## Instructions

### Prerequisites

- Docker and Docker Compose
- Make
- A Supabase project (for the database and avatar storage)
- A Mailtrap account (for transactional emails in dev)
- OAuth app credentials for 42, Google and GitHub (required: the backend does not start without them)
- A Mistral API key and agent ID (for the AI assistant)

### Environment setup

1. Copy the root `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

2. Copy the backend `.env.example` to `backend/.env` and fill in all values:

```bash
cp backend/.env.example backend/.env
```

Key variables to set in `backend/.env`:

| Variable | Description |
|---|---|
| `FRONTEND_URL` | Frontend URL, used for CORS, OAuth redirects and email links |
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `JWT_SECRET` | Random secret string for signing JWT tokens |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for Storage) |
| `EMAIL_FROM` | Sender address of the emails |
| `MAILTRAP_HOST/PORT/USER/PASS` | SMTP credentials (Mailtrap in dev) |
| `EMAIL_VERIFICATION_REQUIRED` | `true` to block sign-in until the email address is confirmed |
| `FORTY_TWO_CLIENT_ID/SECRET/CALLBACK_URL` | 42 OAuth app credentials |
| `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL` | Google OAuth app credentials |
| `GITHUB_CLIENT_ID/SECRET/CALLBACK_URL` | GitHub OAuth app credentials |
| `MISTRAL_API_KEY` | Mistral API key |
| `MISTRAL_AGENT_ID` | Mistral agent ID |
| `OFF_USER_AGENT` | User-Agent sent to Open Food Facts, which asks apps to identify themselves |

3. Copy the frontend `.env.example` to `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Key variables to set in `frontend/.env`:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3000`) |
| `VITE_SOCKET_URL` | WebSocket server URL (e.g. `http://localhost:3000`) |

### Running in development

```bash
make dev
```

This starts the frontend (http://localhost:5173) and backend (http://localhost:3000) with hot reload.

### API Documentation

The backend exposes a Swagger UI in development mode. Once `make dev` is running, open:

```
http://localhost:3000/api/docs
```

It lists every REST endpoint, grouped by module, with its parameters, request body and possible response codes. To test authenticated routes, log in through the app first — the JWT cookie is automatically sent by the browser.

> Swagger is disabled in production.

### Running database migrations

```bash
make migrate name=<migration_name>
```

### Useful commands

```bash
make logsBackend      # Stream backend logs
make logsFrontend     # Stream frontend logs
make shellBackend     # Open a shell in the backend container
make test             # Run backend unit tests
make check            # Run format check, lint, build, and all tests
make clean            # Stop all containers
make fclean           # Stop containers and remove images and volumes
```

### Running in production

```bash
make prod
```

It uses the same `backend/.env`, with `FRONTEND_URL` set to the public URL, and `DOMAIN` in the root `.env`: the domain Caddy serves over HTTPS.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Passport.js Documentation](https://www.passportjs.org/docs)
- [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api)
- [Mistral AI Documentation](https://docs.mistral.ai)
- [Recharts Documentation](https://recharts.org/en-US)

> Food product data is sourced from [Open Food Facts](https://world.openfoodfacts.org), a free, open and collaborative database licensed under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).
