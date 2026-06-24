# 🎬 CineWave — Cinema Ticket Booking

A full-stack cinema ticket reservation system with an ASP.NET Core backend and a modern React single-page app frontend. Browse screenings, pick your seat on an interactive cinema map, and reserve in seconds — wrapped in a premium dark, cinematic UI.

![Stack](https://img.shields.io/badge/.NET-10-512BD4) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 Live Demo

**[▶ Open the live app](https://cinema-app-adaf-b8gpc5gbdjcmf0hc.francecentral-01.azurewebsites.net/app)**

> Hosted on Azure App Service with an Azure SQL database. The database runs on a free
> serverless tier that auto-pauses when idle, so the **first visit may take ~30–60 seconds**
> to wake up — after that it's fast.

---

## ✨ Features

- **Browse screenings** — films, showtimes, and cinemas at a glance
- **Interactive seat map** — pick available seats, see reserved ones, cancel your own
- **User accounts** — register, log in, and manage your profile (with secure password change)
- **Role-based access** — admins can create/delete screenings and manage users
- **Concurrency-safe** — row-version checks prevent double-booking and conflicting edits
- **Premium UI** — dark cinematic theme with glassmorphism, gradients, and smooth animations

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core (.NET 10), MVC + REST API controllers |
| Auth | ASP.NET Core Identity (cookie-based) |
| Data | Entity Framework Core, SQL Server LocalDB |
| Frontend | React 18 + TypeScript, Vite, React Router |
| Styling | Custom CSS design system + Bootstrap 5 |

## 🏗 Architecture

- **Backend** serves both Razor views and a JSON API under `Controllers/Api/`.
- **Frontend** is a React SPA in `ClientApp/`, served at `/app`.
  - **Dev:** React dev server on `:3000` proxies `/api/*` to ASP.NET on `:5095`.
  - **Prod:** `npm run build` outputs to `wwwroot/app/`, served directly by ASP.NET.

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (18+)
- SQL Server LocalDB (included with Visual Studio)

### Run it

```bash
# 1. Create the database (applies EF Core migrations)
dotnet tool install --global dotnet-ef   # first time only
dotnet ef database update

# 2. Build the React frontend
cd ClientApp
npm install
npm run build
cd ..

# 3. Run the server (seeds a default admin and sample screenings on first run)
dotnet run
```

Then open **http://localhost:5095/app** (the server also opens it automatically).

**Standalone build:** `dotnet publish -c Release -o publish` produces a self-contained
folder — just run `publish/tickets.exe` to launch the app.

### Frontend development

For live-reload while working on the UI:

```bash
cd ClientApp
npm run dev      # React dev server on http://localhost:3000
```

(Keep `dotnet run` running in another terminal for the API.)

## 👤 Default Admin

On first run, a default admin account is seeded so you can manage the system right away. Log in, create a screening, and start booking seats.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
