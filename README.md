# HR Admin - PCRED

Full-stack HR administration system: **React** frontend, **Node.js** backend, **MongoDB** database. Includes login-protected admin (employees table + add employee modal) and a **public employee card** page reachable via QR code **without login**.

## Features

- **Login** – Email/password auth; JWT stored in localStorage
- **Employees table** – List all employees (after login)
- **Add Employee modal** – Create employees; data stored in MongoDB
- **Public Employee Card** – Design matching the provided card: light blue background, white card, profile photo, company logo, details (Name, Father's Name, Blood Group, Office/Home Address, Emergency Contact, Website). Opened via **QR code** at `/employee/:id` with **no login required**
- **QR codes** – Use any QR generator to create a code for `https://your-domain.com/employee/<employee_id>`

## Tech Stack

| Layer    | Stack                    |
|----------|--------------------------|
| Frontend | React 18, Vite, React Router |
| Backend  | Node.js, Express         |
| Database | Firebase Realtime Database (employees), MongoDB (users) |
| Auth     | JWT (httpOnly not used; token in localStorage) |

## Environment Setup

### 1. Backend (Node + MongoDB for users, Firebase for employees)

```bash
cd backend
cp .env.example .env
# Edit backend/.env:
# - PORT, JWT_SECRET
# - FIREBASE_SERVICE_ACCOUNT_PATH (path to downloaded serviceAccountKey.json)
# - FIREBASE_DATABASE_URL (from Firebase project settings)
npm install
npm run dev
```

- Create admin user (one-time):

```bash
node scripts/seedAdmin.js
```

- Default login: **admin@hr.com** / **admin123**. Change password in production.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Optional: set VITE_API_URL if API is on another host (e.g. production)
npm install
npm run dev
```

- Open **http://localhost:5173**
- Place **logo.png** (PCRED logo) in `frontend/public/` so the login page and employee card show the logo.

### 4. Environment variables

**Backend (`backend/.env`):**

| Variable     | Description                    |
|-------------|--------------------------------|
| `PORT`      | Server port (default 5000)     |
| `JWT_SECRET`  | Secret for signing JWTs     |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON |
| `FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |

**Frontend (`frontend/.env`):**

| Variable       | Description                                      |
|----------------|--------------------------------------------------|
| `VITE_API_URL` | API base URL (e.g. `http://localhost:5000/api`) |

If `VITE_API_URL` is not set, the Vite dev server proxy forwards `/api` to `http://localhost:5000`.

## Running the app

1. Start MongoDB.
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Log in at http://localhost:5173 with **admin@hr.com** / **admin123**.
5. Add employees via **Add Employee**; use **View card** to get the public URL for each employee.
6. Generate a QR code for that URL (e.g. `https://yoursite.com/employee/507f1f77bcf86cd799439011`). Scanning the QR opens the employee card **without login**.

## Project structure

```
HR_Admin/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/User.js, Employee.js
│   ├── routes/auth.js, employees.js
│   ├── scripts/seedAdmin.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── logo.png          ← add PCRED logo here
│   ├── src/
│   │   ├── api/client.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── AddEmployeeModal.jsx
│   │   │   └── EmployeeTable.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── EmployeePublicView.jsx   ← QR card (no login)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## API (summary)

- `POST /api/auth/login` – Login (email, password) → JWT
- `GET /api/employees` – List employees from Firebase (**auth required**)
- `GET /api/employees/:id` – Get one employee from Firebase (**public**, for QR page / card)
- `POST /api/employees` – Create employee in Firebase (**auth required**)
- `PUT /api/employees/:id` – Update employee in Firebase (**auth required**)
- `DELETE /api/employees/:id` – Delete employee in Firebase (**auth required**)

## License

Private / internal use.
