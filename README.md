# StockMaster - Stock & Inventory Management Software

An isolated, full-stack Stock Management System inside `stock-management`.

---

## 📂 Project Structure

```text
stock-management/
├── database/
│   ├── schema.sql           # PostgreSQL table definitions
│   └── seed.sql             # Demo credentials and sample inventory
├── backend/                 # Node.js & Express REST API
│   ├── config/db.js         # pg connection pool
│   ├── controllers/         # Products, Stock movements, Auth, Reports
│   ├── routes/              # API endpoints
│   ├── .env                 # Database credentials
│   ├── package.json
│   └── server.js
└── frontend/                # React.js & React-Bootstrap Dashboard
    ├── public/
    ├── src/
    │   ├── components/      # Sidebar, Topbar, ProtectedRoute
    │   ├── pages/           # Dashboard, Products, Stock, Reports
    │   ├── context/         # AuthContext
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🚀 How to Run

### Step 1: Database Setup (pgAdmin)
1. In pgAdmin, create a database named `stock_management`.
2. Open Query Tool and run [`database/schema.sql`](file:///d:/idigischool/stock-management/database/schema.sql).
3. Next, run [`database/seed.sql`](file:///d:/idigischool/stock-management/database/seed.sql).

### Step 2: Start Backend
```powershell
cd d:\idigischool\stock-management\backend
npm install
npm run dev
```
*(Runs on http://localhost:5000)*

### Step 3: Start Frontend
```powershell
cd d:\idigischool\stock-management\frontend
npm install
npm start
```
*(Runs on http://localhost:3000)*

---

## 🔑 Login Credentials
- **Admin**: `admin@stock.com` / `admin123`
- **Staff**: `staff@stock.com` / `staff123`
