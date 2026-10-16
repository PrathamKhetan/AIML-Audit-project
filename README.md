# AuditAI – AI Expense Audit & Fraud Detection Platform

> **College Capstone Project**  
> An autonomous, full-stack corporate expense auditing and fraud detection web platform powered by a transparent 5-layer heuristic AI risk engine.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Heuristic AI Risk Engine (How Scoring Works)](#-heuristic-ai-risk-engine)
5. [Repository & Folder Structure](#-repository--folder-structure)
6. [Quick Start (Run Locally)](#-quick-start-run-locally)
7. [Deployment Guide](#-deployment-guide)
   - [Deploying Backend to Render](#1-deploying-backend-to-render)
   - [Deploying Frontend to Vercel](#2-deploying-frontend-to-vercel)
   - [Linking the Two](#3-linking-frontend-and-backend)
8. [Student Viva / Presentation Guide](#-student-viva--presentation-guide)

---

## 🌟 Project Overview

**AuditAI** is designed to solve a multi-billion-dollar problem in corporate financial governance: **fraudulent, non-compliant, and duplicate employee expense claims**.

Instead of relying on slow manual audits or opaque black-box machine learning models that cannot explain their decisions to auditors, **AuditAI** utilizes an **explainable 5-layer heuristic AI risk engine**. Every expense submitted is analyzed in sub-second time, assigned an auditable risk score (0–100), categorized into risk tiers (**Low**, **Medium**, **High**), and paired with human-readable violation rationales.

---

## ✨ Key Features

### 🖥️ Frontend Features
- **Modern Dark UI Design**: Glassmorphic panels with subtle glowing borders, tailored blue/purple gradient accents, and responsive typography (Inter font).
- **Interactive Landing Page**: Animated hero with glowing ambient lights, live status simulation, capability cards, and an interactive workflow breakdown.
- **Auditor Dashboard**: Collapsible sidebar, sticky top bar with live search, and live backend connection telemetry.
- **4 Animated KPI Stat Cards**:
  - Total Audited Claims (Count-up animation)
  - Total Monetary Volume Audited
  - Flagged High-Risk Claims
  - Total Money Saved from Prevented Fraud
  - System-Wide Fraud Index Bar
- **Interactive Visual Charts (Chart.js via CDN)**:
  - *Monthly Spending vs Flagged Losses Line Chart* (with area fills and dual datasets).
  - *Expense Category Allocation Doughnut Chart*.
  - *Category Anomaly Distribution Bar Chart* (Total Submitted vs Flagged by AI).
- **Transactions Table**:
  - Live filtering by **Expense Category** and **Risk Level** (Low, Medium, High).
  - Instant debounced free-text search (matches Employee, Department, Category, ID, or Description).
  - Visual mini risk progress bars and color-coded status badges.
  - Working **Approve** and **Reject** buttons that communicate directly with the REST API.
- **Live Fraud Alerts Panel**:
  - Animated pulsing red indicator dot.
  - Prioritized list of high-risk transactions with immediate rejection/approval buttons.
- **Expense Audit Form & Circular Gauge**:
  - Submit custom corporate claims or use one of the **4 Quick-Test Presets** (*Clean Expense*, *Duplicate Anomaly*, *High-Value $16.5k*, *Off-Hours Anomaly*).
  - Displays an "AI Analyzing..." state upon submission.
  - Renders an **animated SVG circular risk gauge** with dynamic color shifts (Green for Low, Amber for Medium, Red for High).
  - Detailed list of specific triggered rule penalties (e.g. `+50`, `+30`, `+25`, etc.).
  - Automatically updates the dashboard's table, KPI stats, alerts, and charts without reloading the page.
- **Resilient Cold-Start Handling**:
  - Subtle progress bar while waiting for API responses.
  - Graceful notifications for Render free-tier cold starts.

### ⚙️ Backend Features
- **Node.js & Express REST API**: Clean, lightweight, and structured for zero setup overhead.
- **Strictly Decoupled Architecture**: Prepared for independent hosting (Vercel for Frontend, Render for Backend).
- **Configurable CORS**: Allows local development origins and designated Vercel URLs via environment variables.
- **In-Memory Repository with Realistic Seed Data**: Pre-seeded with 40+ realistic corporate transactions across 6 months, evaluated through the risk engine.
- **Database Ready**: Structured so an in-memory array can be swapped for PostgreSQL, SQLite, or MongoDB with minimal code changes.
- **Render Health Check**: Dedicated `GET /health` endpoint for uptime monitoring and zero-downtime deployment checks.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | Plain HTML5, CSS3 (Vanilla Glassmorphism), Vanilla JavaScript (ES6+ Modules) |
| **Icons & Fonts** | Font Awesome 6 (CDN), Google Fonts Inter |
| **Data Visualization** | Chart.js v4 (CDN) |
| **Backend Runtime** | Node.js (v18+) |
| **Server Framework** | Express.js |
| **Middleware** | CORS, Dotenv |
| **Deployment Targets** | Vercel (Frontend), Render (Backend) |

---

## 🧠 Heuristic AI Risk Engine

The risk engine (`backend/services/riskEngine.js`) assesses every expense against 5 corporate fraud criteria, calculating a cumulative score between **0 and 100**:

```
                       [ New Expense Submission ]
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                               ▼                               ▼
Rule 1: Amount > $10,000       Rule 2: Duplicate Detection     Rule 3: Timing Anomaly
Points: +50                    Points: +30                    Points: +20
    │                               │                               │
    └───────────────────────────────┼───────────────────────────────┘
                                    ▼
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
Rule 4: Round Number ($5,000 flat)               Rule 5: >3x Category Average
Points: +10                                      Points: +25
    │                                                               │
    └───────────────────────────────┬───────────────────────────────┘
                                    ▼
                      [ Final Score: 0 - 100 ]
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
     0 - 29                     30 - 59                      60+
    [ Low Risk ]             [ Medium Risk ]            [ High Risk ]
  (Auto-Approved)           (Auditor Review)          (Auto-Flagged)
```

### Risk Rules Summary:
1. **High Amount Ceiling (+50 points)**: Any single transaction exceeding $10,000 triggers an automatic executive review penalty.
2. **Duplicate Detection (+30 points)**: Identifies if an expense with identical employee, category, and monetary amount was already submitted.
3. **Irregular Timing (+20 points)**: Flags claims filed during weekends or late nights between 11:00 PM and 5:00 AM.
4. **Suspicious Round-Number (+10 points)**: Flags flat, unitemized estimates (e.g. $5,000 or $2,500 exactly) without cents.
5. **Category Outlier (+25 points)**: Flags transactions that exceed 300% (3x) of historical average spending for that specific category.

---

## 📂 Repository & Folder Structure

```
aiml project/
├── .gitignore               # Root git ignore (node_modules, .env, etc.)
├── README.md                # Comprehensive project documentation
├── backend/
│   ├── .env.example         # Template for environment variables
│   ├── .gitignore           # Backend git ignore
│   ├── package.json         # Node.js dependencies (express, cors, dotenv)
│   ├── server.js            # Express server entry point & CORS configuration
│   ├── data/
│   │   └── seed.js          # ~40 realistic mock expenses spanning 6 months
│   ├── routes/
│   │   └── expenses.js      # REST API endpoints & aggregations
│   └── services/
│       └── riskEngine.js    # Rule-based AI fraud detection logic
└── frontend/
    ├── index.html           # Landing page with hero, features & workflow
    ├── dashboard.html       # Main auditor dashboard, charts, table & form
    ├── vercel.json          # Clean URLs configuration for Vercel
    ├── css/
    │   └── style.css        # Responsive dark glassmorphism design system
    └── js/
        ├── config.js        # API_BASE_URL (Localhost vs Render toggle)
        ├── api.js           # Centralized fetch() calls with error handling
        ├── animations.js    # Count-up, SVG circular gauge, scroll reveal
        ├── dashboard.js     # Chart.js charts, table rendering, filters
        └── audit.js         # Audit form submission & instant synchronization
```

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- Node.js (version 18 or higher)
- A modern web browser (Chrome, Edge, Firefox, Safari)

---

### Step 1: Start the Backend API

Open your terminal, navigate into the `backend` folder, install dependencies, and start the server:

```bash
cd backend
npm install
npm start
```

The backend will start on **`http://localhost:5001`**:
- Health check: `http://localhost:5001/health`
- Expense API: `http://localhost:5001/api/expenses`

*(Optional: Run `npm run dev` if you have nodemon installed for auto-reload).*

---

### Step 2: Launch the Frontend

Because the frontend is built with pure static HTML, CSS, and JavaScript, you have two simple options:

#### Option A: Using Python (Recommended)
In a new terminal window:
```bash
cd frontend
python3 -m http.server 5500
```
Open **`http://localhost:5500`** in your browser.

#### Option B: Using VS Code Live Server
- Open the project folder in VS Code.
- Right-click `frontend/index.html` and select **"Open with Live Server"**.

#### Option C: Direct File Opening
Double-click `frontend/index.html` in your file explorer.  
*(Note: `frontend/js/config.js` is programmed to automatically connect to `http://localhost:5001` when running locally).*

---

## 🌐 Deployment Guide

### 1. Deploying Backend to Render

1. Push your code to a GitHub repository.
2. Log in to [Render](https://render.com) and click **"New +"** -> **"Web Service"**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `auditai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `PORT` = `5001` (or leave default, Render sets this automatically)
   - `CLIENT_URL` = `https://your-frontend-project.vercel.app` *(Your Vercel URL)*
6. Click **"Deploy Web Service"**.
7. Copy your assigned Render URL (e.g. `https://auditai-backend.onrender.com`).

---

### 2. Deploying Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Select your GitHub repository.
3. In the project setup screen:
   - **Framework Preset**: `Other`
   - **Root Directory**: Click edit and select **`frontend`**
   - **Build & Development Settings**: Leave empty (no build step required)
4. Click **"Deploy"**.
5. Vercel will provide your live URL (e.g. `https://auditai-platform.vercel.app`).

---

### 3. Linking Frontend and Backend

1. In your project, open `frontend/js/config.js`.
2. Update the `RENDER_BACKEND_URL` variable with your live Render backend URL:
   ```javascript
   const CONFIG = {
     RENDER_BACKEND_URL: 'https://auditai-backend.onrender.com',
     // ...
   };
   ```
3. Commit and push this change to GitHub. Vercel will automatically re-deploy the updated configuration!

> 💡 **Render Free Tier Note**: Render puts free services to sleep after 15 minutes of inactivity. When accessed after inactivity, the first request takes ~30 to 45 seconds to spin up. AuditAI's frontend displays a loading bar and a friendly notice while the server is waking up.

---

## 🎓 Student Viva / Presentation Guide

If presenting this project for an evaluation, viva, or grading committee, here are the key concepts and answers:

### 1. Why use a Rule-Based AI Engine instead of a Deep Neural Network?
> *"In financial compliance and forensic accounting, **explainability** is a legal requirement. A black-box deep learning model cannot easily provide an auditor with an auditable justification for why a reimbursement was blocked. Our 5-tier heuristic AI engine guarantees **100% deterministic transparency**, produces exact point deductions, and never suffers from hallucinations."*

### 2. How is this project architected?
> *"The project follows a **strict separation of concerns**. The frontend is a zero-build static single-page application hosted on Vercel, which ensures instant loading and high CDN cacheability. The backend is an independent REST API on Render that handles data integrity, statistical aggregations, and rule processing."*

### 3. How would you scale this to a production database?
> *"Currently, data is managed in an in-memory repository initialized via `backend/data/seed.js` for zero-configuration presentation. The Express route handlers in `backend/routes/expenses.js` are modularized: by replacing `expenses.filter()` or `expenses.push()` with an ORM like Prisma or Mongoose, the application can connect to PostgreSQL or MongoDB in minutes."*

### 4. What happens during duplicate or anomaly detection?
> *"When an expense is submitted, the risk engine scans historical entries for matching employee name, category, and dollar amount. It checks for timing anomalies (weekends and late hours between 11 PM and 5 AM) and computes the category's running average to flag statistical outliers exceeding a 3x multiplier."*

---

## 📄 License
This project is open-source and created for academic evaluation and portfolio demonstration.
