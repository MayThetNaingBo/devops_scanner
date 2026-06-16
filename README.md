# CodeGuard AI

CodeGuard AI is an AI-driven security scanning platform that helps developers review GitHub repositories for portfolio readiness, security risks, environment configuration issues, README quality, deployment readiness, and code structure improvements.

The system allows users to create an account, verify their email, submit a public GitHub repository URL, scan the project, view detailed security findings, and receive the scan report through email.

## Features

- User registration and login
- Email verification with secure verification codes
- JWT-based authentication
- Public GitHub repository scanning
- Secret and sensitive file detection
- README quality analysis
- Environment configuration checks
- Deployment readiness checks
- Project structure and package script analysis
- Security score breakdown
- Scan history dashboard
- Detailed scan report page
- Email notification after scan completion
- PostgreSQL database with Prisma ORM
- Swagger API documentation

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt
- Nodemailer
- Simple Git
- Swagger

### Tools

- Docker
- GitHub
- Swagger / Insomnia
- Prisma Studio

## Screenshots

### Login Page

![Login Page](./screenshots/login.png)

### Sign Up Page

![Sign Up Page](./screenshots/signup.png)

### Verify Email Page

![Verify Email Page](./screenshots/verify-email.png)

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Scan History

![Scan History](./screenshots/scan-history.png)

### Scan Report

![Scan Report](./screenshots/scan-report1.png)
![Scan Report](./screenshots/scan-report2.png)
![Scan Report](./screenshots/scan-report3.png)
![Scan Report](./screenshots/scan-report4.png)

## Demo

![CodeGuard AI Demo](./screenshots/demo.gif)


## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MayThetNaingBo/devops_scanner.git
cd codeguard-ai
```

## Backend Setup

### 2. Go to the backend folder

```bash
cd backend
```

### 3. Install dependencies

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your own values.


### 5. Start PostgreSQL with Docker

```bash
docker compose up -d
```

### 6. Run Prisma migration

```bash
npx prisma migrate dev
```

### 7. Generate Prisma client

```bash
npx prisma generate
```

### 8. Start the backend server

```bash
npm run start:dev
```

The backend should run on:

```text
http://localhost:3000
```

Swagger API documentation:

```text
http://localhost:3000/api
```

## Frontend Setup

### 9. Go to the frontend folder

Open a new terminal:

```bash
cd frontend
```

### 10. Install dependencies

```bash
npm install
```

### 11. Start the frontend

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:3001
```

## How It Works

1. User signs up with name, email, and password.
2. Backend hashes the password and sends an email verification code.
3. User verifies email and logs in.
4. User submits a public GitHub repository URL.
5. Backend clones the repository temporarily.
6. Scanner checks for:

   * Exposed secrets
   * Missing `.env.example`
   * Committed `.env` files
   * README quality
   * Missing Dockerfile
   * Missing GitHub Actions
   * Missing build/start/test scripts

7. Backend calculates scores and stores the scan report.
8. User views the detailed report in the dashboard.
9. Email report notification is sent to the user.

## Scan Categories

* Security
* README Quality
* Environment Configuration
* Deployment Readiness
* Code Structure


## What I Learned

* Building secure authentication with JWT
* Implementing email verification
* Using Prisma with PostgreSQL
* Designing scan report data models
* Cloning and analyzing GitHub repositories
* Detecting security and configuration risks
* Creating a full-stack dashboard with scan history
* Sending automated email reports
* Structuring a full-stack project for portfolio presentation


## Author

**May Thet Naing Bo**

Software Developer focused on full-stack development, DevOps, cloud technologies, and AI-powered applications.
