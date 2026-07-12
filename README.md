# OptiPrint AI - Intelligent Pre-Print Document Optimizer

**OptiPrint AI** is an enterprise-grade, production-ready full-stack web application designed to intelligently optimize PDF, DOCX, and PPTX document layouts before printing—slashing paper, toner, and overall printing costs by up to 40% while preserving pristine readability.

This repository contains the complete codebase foundation, standard architecture, and infrastructure for the OptiPrint AI platform, with fully verified end-to-end integration and verified visual assets.

---

## Technical Stack

### Backend
*   **FastAPI** (Python 3.12, modular routers, automated Swagger OpenAPI documentation, global error logging, exception handlers)
*   **Motor / MongoDB** (Asynchronous MongoDB ODM, automated async index creation, transaction-safe query isolation)
*   **JWT Security** (JWT Access/Refresh flow, OAuth2 schema compliance, passlib bcrypt password hashing)
*   **Pytest** (End-to-end API integration test coverage)

### Frontend
*   **Next.js 14** (Latest React App Router, dynamic layouts, static page prerendering, hydration checks)
*   **Zustand** (Local persisted client state management)
*   **Axios** (Configured REST client with automatic request header injection and token refresh interceptors)
*   **Tailwind CSS & Lucide Icons** (A stunning, modern blue, green, and white user experience)

---

## Directory Structure

```text
optiprint_ai/
├── backend/                   # FastAPI Backend Service
│   ├── app/                   # Main FastAPI entry point & global setup
│   ├── api/                   # Route modules grouping
│   ├── routes/                # Modular API endpoints (/auth, /dashboard, etc.)
│   ├── controllers/           # Endpoint controllers & coordinators
│   ├── services/              # Core business layers (user, document, dashboard)
│   ├── repositories/          # Persistence mappings
│   ├── middleware/            # Global custom middlewares
│   ├── auth/                  # Security helpers & dependencies
│   ├── database/              # MongoDB connection & index automation
│   ├── models/                # MongoDB collection declarations
│   ├── schemas/               # Pydantic V2 schemas & converters (MongoBaseModel)
│   ├── utils/                 # Utility functions
│   ├── storage/               # Secure local disk file uploads manager
│   ├── reports/               # Report metrics compilers
│   ├── ai_engine/             # Layout algorithms placeholder
│   └── tests/                 # Pytest integration tests
│
├── frontend/                  # Next.js Frontend Application
│   ├── app/                   # React App Router pages (Landing, Login, Dashboard, Upload, etc.)
│   ├── components/            # Reusable React components (Navbar, widgets, etc.)
│   ├── hooks/                 # Reusable custom React hooks
│   ├── services/              # Axios API clients
│   ├── lib/                   # Formatting & merging utility wrappers
│   ├── store/                 # Zustand global persistent stores
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Shared client-side helpers
│   └── public/                # Static visual assets
│
├── uploads/                   # Local file storage target directory (git-ignored)
├── docker-compose.yml         # Multi-container orchestration manifest
├── requirements.txt           # Shared python package requirements
└── README.md                  # System manual and architecture overview
```

---

## Environment Configuration

A single `.env` file should be placed at the root level. Below are the key environment parameters configured in `.env.example`:

```bash
# --- BACKEND SETTINGS ---
PORT=8000
HOST=0.0.0.0
DEBUG=true
PROJECT_NAME="OptiPrint AI"
API_V1_STR="/api"

# --- MONGODB CONFIGURATION ---
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=optiprint_ai

# --- SECURITY & AUTHENTICATION ---
JWT_SECRET_KEY=947c945b6db76092025ebae54ef861c83fc6e48da25df5d098e980f772ba65c2
JWT_REFRESH_SECRET_KEY=a7a00f2878c5fb43a0889dbd16bf784bc13b0c36b6f7902cd962eb020ad613e5
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080
ALGORITHM=HS256

# --- FILE UPLOAD SETTINGS ---
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=50

# --- FRONTEND SETTINGS ---
NEXT_PUBLIC_API_URL=http://localhost:8000/api
PORT_FRONTEND=3000
```

---

## Local Installation & Startup

Follow these instructions to launch both services on your development machine.

### Prerequisites
*   Python 3.12+
*   Node.js 20+
*   MongoDB Instance (or running Docker container)

### 1. Launch MongoDB
Launch a local MongoDB container:
```bash
docker compose up -d db
```

### 2. Launch FastAPI Backend
1.  Navigate to root and install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Launch the development server:
    ```bash
    PYTHONPATH=. uvicorn backend.app.main:app --port 8000 --reload
    ```
3.  The API Swagger is available at: `http://localhost:8000/docs`

### 3. Launch Next.js Frontend
1.  Navigate into `frontend/` and install npm packages:
    ```bash
    cd frontend
    npm install
    ```
2.  Launch Next.js development server:
    ```bash
    npm run dev
    ```
3.  Open browser and navigate to `http://localhost:3000`

---

## Docker Deployment

To launch the complete platform (Frontend, Backend, and MongoDB Database) with one single orchestration command:

```bash
docker compose up --build
```

Services are exposed at:
*   **Frontend Client:** `http://localhost:3000`
*   **FastAPI API Server:** `http://localhost:8000`
*   **Swagger API Docs:** `http://localhost:8000/docs`

---

## API Routes Overview

All endpoints return properly structured, standard JSON payloads. All protected endpoints expect `Authorization: Bearer <token>` header values.

| Route | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Guest | User registration & initial preferences configuration |
| `/api/auth/login` | `POST` | Guest | User Authentication (supports JSON & form payloads) |
| `/api/auth/refresh` | `POST` | Guest | Refresh JWT Access/Refresh tokens |
| `/api/auth/me` | `GET` | User | Retrieve current authenticated user profile |
| `/api/auth/logout` | `POST` | User | Terminate session & log activity event |
| `/api/profile` | `GET` | User | Fetch profile settings & theme configurations |
| `/api/profile` | `PUT` | User | Update personal details & layout rules |
| `/api/upload` | `POST` | User | Secure upload with UUID suffixes (PDF, DOCX, PPTX) |
| `/api/documents` | `GET` | User | Retrieve full index list of documents |
| `/api/documents/{id}` | `GET` | User | Fetch metadata details for a single file |
| `/api/documents/{id}/report`| `GET` | User | Get detailed pages/toner savings metrics report |
| `/api/documents/{id}` | `DELETE` | User | Safe file deletion from disk storage and databases |
| `/api/dashboard` | `GET` | User | Returns real-time aggregated metric analytics |

---

## Run Unit and Integration Tests

The test suite runs against the test database `optiprint_ai_test` and drops it cleanly upon completion.

Run tests:
```bash
python3 -m pytest backend/tests/test_api.py
```
