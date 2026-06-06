# New Manoj Medical Hall 🏥

A comprehensive, production-ready Full-Stack Healthcare Management System designed specifically for clinics, pharmacies, and optical stores. It streamlines daily operations ranging from live patient queuing to advanced medical eye examinations and inventory management.

---

## 🌟 Key Features

### 1. Patient & Queue Management
* **Live Patient Queuing:** Real-time token generation and status tracking (`Waiting`, `Serving`, `Completed`) powered by WebSockets.
* **Patient Registration:** Fast patient onboarding and record keeping.
* **Token Printing:** One-click beautiful token generation and printing for walk-in patients.

### 2. Clinical Operations
* **Advanced Eye Examinations:** Digital forms for recording Visual Acuity, Refractive Errors, and comprehensive Eye Medical Reports.
* **Patient Records System:** Maintain full historical medical data for returning patients.
* **Direct Printing:** Native support for printing detailed medical reports formatted perfectly for A4 sheets.

### 3. Pharmacy & Optical Store
* **Medical Inventory:** Track medicines, stock levels, and expiring items.
* **Optical Store & Orders:** Manage frames, contact lenses, and custom glasses orders.
* **Billing System:** Integrated checkout and invoice generation.

### 4. Admin & Staff Management
* **Role-Based Access Control (RBAC):** Only Admin accounts can manage staff credentials and view sensitive business dashboards.
* **Staff Profiles:** Real-time session tracking for logged-in doctors and receptionists.

### 5. High Performance & PWA Ready
* **Progressive Web App (PWA):** Installable on mobile and desktop for a native app-like experience. Offline caching supported via Service Workers.
* **Lazy Loading:** Route-level code splitting ensures lightning-fast initial load times.

---

## 💻 Tech Stack

### Frontend (Client)
* **React 19**
* **Vite** (Build Tool)
* **Tailwind CSS v4** (Styling & Responsive Design)
* **React Router v7** (Navigation & Lazy Loading)
* **Lucide React** (Iconography)
* **Vite PWA Plugin** (Service Workers & Manifest)

### Backend (Server)
* **Node.js & Express**
* **Prisma ORM** (Database schema & migrations)
* **PostgreSQL** (Relational Database)
* **Socket.io** (Real-time queue updates)
* **JWT** (Authentication)
* **Cors & Dotenv** (Environment management)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL running locally or via a cloud provider.

### 1. Clone the repository
```bash
git clone https://github.com/aman-40/medicare.git
cd medicare
```

### 2. Backend Setup
```bash
cd backend
npm install

# Set up your environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run Prisma Migrations to setup the database
npx prisma migrate dev

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../MMH
npm install

# Start the development server
npm run dev
```

### 4. Production Build
To build the frontend for production (includes PWA generation):
```bash
cd MMH
npm run build
```

---

## 👨‍💻 Author

Engineered with ❤️ by **[Aman](https://aman-40.github.io/pro/)**
