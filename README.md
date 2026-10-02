# 🏥 VetCare Clinic

Sistem manajemen klinik hewan — full-stack app dengan React + Express + PostgreSQL.

## 📋 Fitur

- 👤 Manajemen pemilik hewan (CRUD)
- 🐾 Manajemen hewan peliharaan (CRUD)
- 👨‍⚕️ Manajemen dokter hewan (CRUD)
- 📅 Penjadwalan janji temu (CRUD + ubah status)

## 🛠️ Tech Stack

**Backend:** Node.js + Express + PostgreSQL (pg, cors, dotenv)  
**Frontend:** React (Vite) + React Router + Axios  
**Database Tools:** pgAdmin 4, DBeaver

## 📁 Struktur

```
vetcare-clinic/
├── vetcare-backend/     # REST API Express
└── vetcare-frontend/    # SPA React
```

## 🚀 Cara Menjalankan

### 1. Setup Database

Buat database `vetcare_db` di PostgreSQL dengan tabel `owners`, `pets`, `vets`, `appointments`.

### 2. Backend

```bash
cd vetcare-backend
npm install
cp .env.example .env   # lalu edit password database
npm run dev
```

Backend jalan di `http://localhost:5000`.

### 3. Frontend

```bash
cd vetcare-frontend
npm install
npm run dev
```

Frontend jalan di `http://localhost:5173`.

## 👤 Author

**PhamRipki** — [GitHub](https://github.com/PhamRipki)