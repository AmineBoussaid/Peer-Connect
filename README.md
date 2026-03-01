# PeerConnect

**A role-based peer review platform for managing scientific article submission, assignment, and evaluation workflows.**

## Project Description

PeerConnect is a full-stack web application designed to streamline the scientific peer review process. It centralizes article submission, expert assignment, review management, and workflow supervision in one platform.

The project aims to improve transparency, traceability, and collaboration between authors, experts, and administrators in academic publishing workflows.

## Main Features

- Role-based authentication and access control
- Article submission and management for authors
- Expert assignment workflow for peer review
- Review submission with recommendation and scoring
- Dashboard views tailored to each user role
- Administrative oversight of users and workflow status

## User Roles

### Admin
Manages platform operations, validates users, monitors review workflows, and supervises overall system activity.

### Author
Creates and submits scientific articles, tracks submission progress, and follows review outcomes.

### Expert
Receives assignments, evaluates submitted articles, and provides structured peer reviews with recommendations.

## Tech Stack

### Frontend
- Angular (standalone architecture)
- TypeScript
- Angular Router

### Backend
- Node.js
- Express.js
- MySQL (`mysql2`)
- `bcryptjs`, `multer`, `cors`

### Styling
- Tailwind CSS
- PostCSS + Autoprefixer

## Installation

### Prerequisites

- Node.js 18+
- npm 10+
- MySQL 8+

### 1) Clone the repository

```bash
git clone https://github.com/AmineBoussaid/Peer-Connect.git
cd Peer-Connect
```

### 2) Install backend dependencies

```bash
cd server
npm install
```

### 3) Configure database connection

Create your MySQL database and update the backend DB configuration (see `server/config/db.js`) with your local credentials.

### 4) Seed/reset data (optional but recommended)

```bash
node scripts/reset-and-seed.js
```

### 5) Install frontend dependencies

```bash
cd ../client
npm install
```

## How to Run the Project

### Development Mode

Run backend:

```bash
cd server
npm run dev
```

Run frontend (in a second terminal):

```bash
cd client
npm start
```

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

### Production Mode

Build frontend:

```bash
cd client
npm run build
```

Start backend server:

```bash
cd ../server
npm start
```

If you use Angular SSR output, run:

```bash
cd ../client
npm run serve:ssr:client
```

## Project Structure

```text
Peer-Connect/
├── client/                 # Angular frontend
│   └── src/app/
│       ├── admin/          # Admin module
│       ├── auteur/         # Author module
│       ├── expert/         # Expert module
│       ├── auth/           # Login/register flows
│       ├── services/       # Shared services
│       └── shared/         # Shared UI components
├── server/                 # Node/Express backend
│   ├── config/             # DB config
│   ├── controllers/        # Business logic
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   └── scripts/            # Seed/reset scripts
└── README.md
```

## Future Improvements

- Dockerized deployment for consistent environments
- CI/CD pipeline for automated build/test/deploy
- Advanced matching logic for expert assignment
- Notifications (email/in-app) for workflow events
- Expanded analytics and reporting dashboards

## Author

**Amine Boussaid**  
PeerConnect — Scientific Peer Review Management Platform
