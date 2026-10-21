*This project has been created as part of the 42 curriculum by nmunari, cbezenco, diramire, strieste, maxmarti*

# CatCHMeal

A full-stack nutrition and wellness tracking web application. Users can log meals, track body composition, set calorie and macro goals, monitor progress through statistics, chat with friends, and get AI-powered dietary guidance.

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Instructions](#instructions)
- [Resources](#resources)
- [Individual Contributions](#individual-contributions)
- [AI Usage](#ai-usage)

---

## Description

CatCHMeal is a full-stack nutrition and wellness tracking web application built as the final project of the 42 Common Core (ft_transcendence). The application is centered around a personal health dashboard where users log meals, track their body composition over time, and receive AI-powered dietary guidance tailored to their goals.

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
- GDPR-compliant data export (JSON), account deletion with anonymization, and legal pages.
- Accessibility: ARIA roles, labels, focus management, and keyboard navigation.

---

## Team Information

| Login | Name | Role | Responsibilities |
|---|---|---|---|
| nmunari | Natalino Munari | (To Update) | (To Update)  |
| cbezenco | Curtis Bezençon | (To Update)  | (To Update)  |
| diramire | Diana Carrillo |(To Update)  | (To Update)  |
| strieste | Seully Trieste | (To Update)  | (To Update)  |
| maxmarti | Maxime Martin | (To Update) | User profile, body composition tracking, calorie & macro goals, JWT guards and ownership checks, accessibility |

---

## Project Management

- **Task distribution**: GitHub Issues with umbrella issues broken into sub-issues. Each sub-issue maps to one PR.
- **Meetings**: Regular syncs via Discord voice channels.
- **Communication**: Discord (primary), GitHub PR comments (code review).
- **Workflow**: Feature branches rebased onto `main`, reviewed by codeowners, merged with merge commits to preserve individual author history. CI must pass before merge.
- **CI/CD**: GitHub Actions runs format check, lint, build, unit tests, and e2e tests on every PR. Automatic deployment to production on merge to `main`.

---

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
- **PostgreSQL** (hosted on Supabase) — chosen for its relational model, which fits the structured relationships between users, meals, food items, goals, and weight logs. Supabase provides a managed instance with built-in Storage for avatar files.
- **Prisma 7** — type-safe ORM with migration management

### Infrastructure
- **Docker + Docker Compose** — containerized dev and prod environments
- **Nginx** — static file serving and reverse proxy in production
- **Caddy** — TLS termination in production
- **GitHub Actions** — CI/CD pipeline

### Key technical choices
- **Cookie-based JWT sessions** over localStorage — more secure against XSS
- **Prisma migrations** as the single source of truth for schema changes — no manual SQL
- **Supabase Storage** for avatar files — avoids storing binary data in PostgreSQL
- **Shared Socket.IO connection** across the app — one connection per user instead of one per conversation

---

## Database Schema

### Models and relationships

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

### Key tables

| Table | Key fields |
|---|---|
| `User` | id, username, name, email, passwordHash, oauthProvider, avatarUrl, height, targetWeight, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal, gender, birthDate, activityLevel, role, lastSeenAt, deletedAt, createAt |
| `WeightLog` | id, userId, weight, bodyFat, fatFreeMass, bodyWater, muscleMass, loggedAt |
| `GoalSetting` | id, userId, dailyCalories, dailyProtein, dailyCarbs, dailyFat, objective, startDate |
| `Meal` | id, userId, name, typeMeal (BREAKFAST/LUNCH/DINNER/SNACK), loggedAt, sourceMealId |
| `MealFoodItem` | id, userId, mealId, foodItemId, quantity, kcal, protein, carbs, fat |
| `FoodItem` | id, userId, name, brand, barcode, baseQuantity, baseUnit (GRAM/PIECE/MILLILITER), kcal, protein, carbs, fat, archived |
| `Friend` | id, userId, friendId, status (PENDING/ACCEPTED/DECLINED), lastTimeConnected |
| `Message` | id, senderId, receiverId, content, sentAt, readAt, activityId |
| `Activity` | id, userId, type (MEAL_LOGGED/WEIGHT_LOGGED/GOAL_REACHED/...), metadata, createdAt |

---

## Features List

| Feature | Description | Author(s) |
|---|---|---|
| JWT Authentication | Register, login, logout with cookie-based JWT sessions | maxmarti |
| OAuth Login | Sign in with 42, Google, or GitHub | (To Update) |
| OAuth Onboarding | Complete profile after first OAuth login | (To Update) |
| Password change | Change password from profile | (To Update) |
| User profile | Edit name, username, height, weight, gender, birth date, activity level, goals | maxmarti |
| Avatar upload/delete | Upload and remove profile picture stored on Supabase Storage | maxmarti |
| Body composition tracking | Log and track body fat, muscle mass, fat-free mass, body water per weigh-in | maxmarti |
| Weight history | Full immutable weigh-in history with edit and delete | (To Update) |
| Calorie & macro goals | Set daily calorie, protein, carbs, fat targets with BMR/TDEE recommendations | maxmarti |
| Food item CRUD | Create, edit, archive, and search personal food items | (To Update) |
| Barcode scanner | Scan a barcode with the camera to look up a product on Open Food Facts | (To Update) |
| Open Food Facts integration | Auto-fill food form from barcode lookup | (To Update) |
| Meal logging | Log meals with food items, quantities, and macro scaling | (To Update) |
| Meal templates | Reuse a previous meal as a template | (To Update) |
| Daily journal | View and manage meals logged on a specific day from the home page | (To Update) |
| Statistics & charts | Calorie, macro, and body composition charts over a selected period | (To Update) |
| Data export | Export nutrition data as JSON for a selected period | (To Update) |
| Friend system | Send, accept, and decline friend requests | (To Update) |
| Real-time presence | See which friends are online and their last seen time | (To Update) |
| Friend activity feed | See friends' recent meals, weight logs, and goal changes on Home and Friends pages | (To Update) |
| Real-time chat | WebSocket-based chat with friends, with activity quoting | (To Update) |
| AI assistant | Mistral-powered chatbot with access to user data (meals, goals, weight, analytics) | (To Update) |
| Admin board | Admin-only user management panel (view, edit role, delete users) | (To Update) |
| GDPR | Data export (JSON), account deletion with anonymization, legal pages | (To Update) |
| Accessibility | ARIA roles, labels, focus management, keyboard navigation | maxmarti |
| Legal pages | Terms of service, privacy policy, cookie notice | (To Update) |

---

## Modules

| Module | Type | Points | Description | Author(s) |
|---|---|---|---|---|
| Major module: Use a Framework as backend | Major | 2 | NestJS as the backend framework | (To Update) |
| Minor module: Use a front-end framework or toolkit | Minor | 1 | React + TypeScript + Tailwind CSS | (To Update) |
| Major module: Standard user management | Major | 2 | Registration, login, profile, avatar, OAuth | (To Update) |
| Major module: Implementing a remote authentication | Major | 2 | OAuth with 42, Google, GitHub via Passport.js | (To Update) |
| Major module: Live chat | Major | 2 | Real-time WebSocket chat between friends | (To Update) |
| Major module: Introduce an AI opponent | Major | 2 | Mistral AI assistant with user data context | (To Update) |
| Minor module: User and Game Stats Dashboards | Minor | 1 | Nutrition and body composition statistics with charts | (To Update) |
| Major module: Server-Side Rendering (SSR) integration | Major | 2 | NestJS REST API serving a React SPA | (To Update) |
| Minor module: Multiple language support | Minor | 1 | French UI throughout the application | all |
| Major module: Implement Two-Factor Authentication (2FA) and JWT | Major | 2 | JWT-based session management with cookie auth | maxmarti, (To Update) |
| Minor module: Expanding Browser Compatibility | Minor | 1 | Tested on Chrome, Firefox, Safari | all |
| Major module: Accessibility | Major | 2 | WCAG-compliant ARIA attributes, keyboard nav, focus management | maxmarti |
| Minor module: Server-Side Rendering (SSR) | Minor | 1 | Nginx serving the built React app in production | (To Update) |
| Major module: GDPR compliance | Major | 2 | Data export, account deletion, privacy policy, cookie notice | (To Update) |

**Total: 24 points**

### Module choice rationale

- **NestJS as backend framework**: NestJS provides a modular, decorator-based architecture that scales well with the number of features in this project. Its built-in support for guards, interceptors, and Passport.js made implementing JWT authentication and role-based access straightforward.
- **React + TypeScript + Tailwind CSS**: React's component model fits a data-heavy UI with many interactive forms, charts, and real-time updates. TypeScript catches integration errors between frontend and backend early. Tailwind CSS v4 allows rapid, consistent styling without a separate design system.
- **Standard user management**: Required to support the full user lifecycle — registration, login, profile editing, avatar upload, and OAuth — which underpins every other feature in the app.
- **Remote authentication (OAuth)**: Allows users to sign in with existing accounts (42, Google, GitHub), reducing friction at registration and covering the 42 intra requirement.
- **Live chat**: Real-time messaging between friends is a core social feature. WebSockets were chosen over polling to keep latency low and avoid unnecessary server load.
- **AI assistant (Mistral)**: Provides personalized dietary guidance by giving the model access to the user's meals, goals, and weight history. Mistral's agent API was chosen for its function-calling support, which allows the assistant to query live user data.
- **User and game stats dashboards**: Nutrition and body composition charts give users actionable feedback on their progress over time, which is the primary value proposition of the app.
- **Server-Side Rendering (SSR) integration**: NestJS serves the REST API while Nginx serves the built React SPA in production, giving a clean separation between API and static asset delivery.
- **Multiple language support**: The application targets French-speaking users (42 school context), so a French UI was the natural choice.
- **JWT with cookie-based sessions**: Storing the JWT in an HttpOnly cookie instead of localStorage protects against XSS attacks. The module covers session management across all protected routes.
- **Expanding browser compatibility**: Tested on Chrome, Firefox, and Safari to ensure the app works for the widest possible audience during evaluation.
- **Accessibility**: WCAG-compliant ARIA attributes, keyboard navigation, and focus management ensure the app is usable by people with disabilities and meets the 42 evaluation criteria.
- **Nginx in production**: Nginx serves the built React app as static files and proxies API requests to the NestJS backend, which is the standard production setup for a SPA + REST API.
- **GDPR compliance**: Required by French and European law for any app that stores personal data. Implemented as data export (JSON), account deletion with anonymization, and legal pages (privacy policy, terms of service, cookie notice).

---

## Instructions

### Prerequisites

- Docker and Docker Compose
- Make
- A Supabase project (for the database and avatar storage)
- A Mailtrap account (for transactional emails in dev)
- OAuth app credentials for 42, Google, and/or GitHub (optional)
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
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `JWT_SECRET` | Random secret string for signing JWT tokens |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for Storage) |
| `MAILTRAP_HOST/PORT/USER/PASS` | Mailtrap SMTP credentials |
| `FORTY_TWO_CLIENT_ID/SECRET` | 42 OAuth app credentials |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth app credentials |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth app credentials |
| `MISTRAL_API_KEY` | Mistral API key |
| `MISTRAL_AGENT_ID` | Mistral agent ID |

3. Copy the frontend `.env.example` to `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

### Running in development

```bash
make dev
```

This starts the frontend (http://localhost:5173) and backend (http://localhost:3000) with hot reload.

### Running database migrations

```bash
make migrate name=<migration_name>
```

### Useful commands

```bash
make logs-backend     # Stream backend logs
make logs-frontend    # Stream frontend logs
make shell-backend    # Open a shell in the backend container
make prisma-studio    # Open Prisma Studio at http://localhost:5555
make test             # Run backend unit tests
make test-e2e         # Run backend e2e tests
make check            # Run format check, lint, build, and all tests
make clean            # Stop all containers
make fclean           # Stop containers and remove images and volumes
```

### Running in production

```bash
make prod
```

Requires additional environment variables: `VITE_API_URL`, `FRONTEND_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

---

## Resources

### Documentation
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
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/TR/WCAG21)

---

## Individual Contributions

### maxmarti / Maxime Martin

Maxime worked mainly on the user profile, JWT guards and ownership checks across the project, body composition tracking, and accessibility.

Main areas:

- User profile: editable fields (name, username, height, weight, gender, birth date, activity level), avatar upload and deletion via Supabase Storage, BMI and weight progress display.
- Calorie and macro goal setting with BMR/TDEE recommendations using the Mifflin-St Jeor and Katch-McArdle formulas.
- Body composition tracking: moved body fat, muscle mass, fat-free mass, and body water from the static profile into the `WeightLog` model, with full history preservation and last-known-value carry-forward per field on edit.
- JWT guards and ownership checks across all protected routes, ensuring users can only access and modify their own data.
- Accessibility: ARIA roles, labels, focus management, and keyboard navigation across the application.

Challenge and resolution: securing every route with JWT guards and ownership checks required a consistent pattern across all controllers. Early in the project some routes derived the `userId` from the URL parameter instead of the authenticated token, which opened ownership bypass vulnerabilities. Maxime systematically audited and refactored all controllers to derive the `userId` exclusively from the JWT payload, added ownership checks on every sensitive operation, and covered the behavior with unit tests.

---

### nmunari / Natalino Munari

*To be filled in by nmunari.*

Main areas:

Challenge and resolution:

---

### cbezenco / Curtis Bezençon

*To be filled in by cbezenco.*

Main areas:

Challenge and resolution:

---

### diramire / Diana Carrillo

*To be filled in by diramire.*

Main areas:

Challenge and resolution:

---

### strieste / Seully Trieste

*To be filled in by strieste.*

Main areas:

Challenge and resolution:

---

## AI Usage

AI tools were used during the development of this project for the following purposes:

- Understand the project stack and architecture.
- Review code.
- Assist with debugging.
- Help implement some functions.
- Documentation editing.

All generated suggestions were reviewed, tested, and adapted before being integrated into the project.
