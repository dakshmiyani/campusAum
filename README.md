# CampusAUM — Higher Education SaaS Platform
## Teacher Profiling & Institutional Operations Module (v1)

CampusAUM is a multi-tenant institutional SaaS platform architected for higher-education trusts, universities, and multi-campus college systems. 

The **Teacher Profiling Module (v1)** serves as the core foundation for staff onboarding, multi-tab faculty profile tracking, academic allocations, salary & increment management, leaves, document vaults, and reporting analytics.

---

## 🎨 Visual Design Palette

Designed with a **Premium Institutional SaaS** aesthetic:

- **Warm Ivory** (`#F8F4EC`) — Primary background surface
- **Soft Cream** (`#EFE8DA`) — Secondary card & panel background
- **Champagne Gold** (`#C9A85C`) — Primary buttons, active highlights & accents
- **Soft Gold** (`#D9BE7A`) — Secondary highlights & active badges
- **Deep Navy** (`#17243A`) — Header background & primary typography
- **Warm Gray** (`#6F6A60`) — Subtitles, muted labels & body text
- **Muted Burgundy** (`#722B2B`) — Critical warnings, status badges & emphasis actions
- **Light Gold** (`#D8C28A`) — Dividers & structural card borders

---

## 🏛️ Multi-Tenant Architecture Hierarchy

Every database record, query, and API endpoint enforces strict multi-tenant isolation across the 4-tier hierarchy:

$$\text{Organization / Trust} \longrightarrow \text{Campus} \longrightarrow \text{Institute} \longrightarrow \text{Department} \longrightarrow \text{Staff / User}$$

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 8, TypeScript, TailwindCSS v4, Lucide Icons, React Router v6, Axios
- **Backend**: Node.js, Express.js (Modular Monolith architecture)
- **Database**: PostgreSQL (NeonDB Cloud Database instance)
- **ORM / Query Builder**: Knex.js with dynamic SSL handling & IPv4 DNS fallback
- **Authentication**: JWT & Header Tenant Context (`X-Organization-ID`, `X-Campus-ID`, `X-Institute-ID`)

---

## 🚀 Getting Started & Setup Guide

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Database**: PostgreSQL database connection string (e.g. [NeonDB](https://neon.tech))

---

### 2. Repository Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/dakshmiyani/campusAum.git
cd campusAum
```

---

### 3. Backend Setup (`server`)

1. Navigate to the `server` folder and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5001
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=campusaum_secret_key_2026
   ```

3. Run database migrations & seed initial institutional dataset:
   ```bash
   node index.js
   ```
   *Note: On boot, `index.js` automatically executes Knex schema migrations and populates seed data for Apex Education Trust if the database is empty.*

4. Start backend server in development mode:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5001`.

---

### 4. Frontend Setup (`client`)

1. Open a new terminal window, navigate to the `client` folder, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start Vite development server:
   ```bash
   npm run dev
   ```
   The frontend web application will run on `http://localhost:3000`.

3. Production build (optional verification):
   ```bash
   npm run build
   ```

---

## 📑 API Reference

All backend routes are prefixed with `/api/v1`.

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Staff** | `GET` | `/api/v1/staff` | Retrieve paginated & filtered staff directory |
| **Staff** | `GET` | `/api/v1/staff/:id` | Fetch detailed 10-tab teacher profile record |
| **Staff** | `POST` | `/api/v1/staff` | Onboard new staff member (8-Step Wizard submission) |
| **Staff** | `PATCH` | `/api/v1/staff/:id/status` | Change staff employment status (`ACTIVE`, `INACTIVE`) |
| **Staff** | `POST` | `/api/v1/staff/:id/remarks` | Add performance evaluation remark by authority |
| **Staff** | `POST` | `/api/v1/staff/:id/increments` | Apply salary revision & update net payroll |
| **Staff** | `POST` | `/api/v1/staff/:id/documents` | Upload institutional document certificate |
| **Departments**| `GET` | `/api/v1/departments` | List all active departments with headcount |
| **Departments**| `POST` | `/api/v1/departments` | Create new academic department & assign HOD |
| **Designations**| `GET` | `/api/v1/designations` | Retrieve institutional designations & cadres |
| **Qualifications**| `GET` | `/api/v1/qualifications` | Master catalog of recognized degrees |
| **Subjects** | `GET` | `/api/v1/subjects` | List subjects & allocated faculty members |
| **Subjects** | `POST` | `/api/v1/subjects/allocate` | Map subject to faculty member for semester |
| **Reports** | `GET` | `/api/v1/reports/summary` | Analytics metrics, headcount mix & payroll totals |
| **Settings** | `GET` | `/api/v1/settings/tenant` | Active Organization/Campus/Institute context |

---

## 🗄️ Database Schema Tables

The Knex migration (`001_initial_schema.js`) provisions 20 relational tables:

1. `organizations` — Education Foundation / Trust
2. `campuses` — Physical campus locations
3. `institutes` — Colleges & technical institutes
4. `departments` — Academic departments & HOD assignments
5. `designations` — Job designations & cadre hierarchy
6. `qualifications` — Master degree catalog
7. `roles` & `permissions` — RBAC authorization roles
8. `users` — System login accounts
9. `staff` — Core staff records & tenant mapping
10. `staff_profiles` — Personal details, contact & photos
11. `staff_addresses` — Permanent & correspondence addresses
12. `staff_employment` — Joining date, status & location
13. `staff_qualifications` — Degrees earned & institution grades
14. `staff_experiences` — Prior employment work history
15. `subjects` & `staff_subjects` — Course catalog & teaching workload
16. `staff_salary` — Basic, HRA, Gross & Net salary structure
17. `staff_increments` — Historical appraisal increment log
18. `staff_leave_balance` — Quota balances (CL, ML, EL)
19. `staff_documents` — Document vault & uploaded PDFs
20. `staff_remarks` & `audit_logs` — Evaluation remarks & system audit trail

---

## 📁 Repository Structure

```text
campusAum/
├── .gitignore
├── README.md
├── client/
│   ├── src/
│   │   ├── components/      # UI components, Header, Sidebar, Layout
│   │   ├── pages/           # Dashboard, Staff Directory, Profile, Wizard, Settings
│   │   ├── services/        # Axios API client
│   │   ├── context/         # Tenant & Auth Context
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Router configuration
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── server/
    ├── src/
    │   ├── database/        # Knex config, Migrations & Seed data
    │   ├── middleware/      # Tenant context, Auth & Error handlers
    │   └── modules/         # Modular routes (Staff, Depts, Reports, Settings)
    ├── .env.example
    ├── index.js
    └── package.json
```

---

## 🛡️ License

CampusAUM Institutional SaaS Platform © 2026. All Rights Reserved.