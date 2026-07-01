# Gerona Stall Ledger System

The Gerona Stall Ledger System is a comprehensive web and desktop application designed to manage market stalls, tenant contracts, and payments. It streamlines stall allocations, tracks leasing agreements, and provides real-time insights into tenant ledgers and financial transactions. Built for municipal or private market administration, the system ensures accurate record-keeping and robust payment monitoring.

---

## ✨ Features

- **Stall & Layout Management:** Visually manage buildings, floors, and individual stall layouts.
- **Tenant & Contract Tracking:** Register tenants and maintain active leasing contracts securely.
- **Payment & Ledger System:** Track payments, generate ledgers, and automate penalty calculations.
- **Role-Based Access Control:** Secure authentication and authorization for different administrative roles.
- **Cross-Platform Access:** Accessible via a modern web interface or a dedicated desktop client application.

---

<h3>Languages & Tools (⌐■_■)</h3>

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" width="35" title="Laravel"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="35" title="React"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/electron/electron-original.svg" width="35" title="Electron"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg" width="35" title="PHP"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="35" title="TypeScript"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="35" title="JavaScript"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="35" title="Tailwind CSS"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" width="35" title="SQLite"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" width="35" title="MySQL"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" width="35" title="Vite"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg" width="35" title="npm"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/composer/composer-original.svg" width="35" title="Composer"/>
</p>

---

## 🚀 Getting Started

### Prerequisites

- PHP >= 8.3
- Node.js >= 20.x
- Composer
- SQLite or MySQL Database

### Installation

1. Clone the repository
2. Install PHP dependencies:
   ```sh
   composer install
   ```
3. Install NPM dependencies:
   ```sh
   npm install
   ```
4. Copy the environment variables configuration:
   ```sh
   cp .env.example .env
   ```
5. Generate the application key:
   ```sh
   php artisan key:generate
   ```
6. Run database migrations:
   ```sh
   php artisan migrate
   ```

### Environment Variables

```env
APP_NAME=
APP_ENV=
APP_KEY=
APP_DEBUG=
APP_URL=
DB_CONNECTION=
```

### Run

To run the web application locally:
```sh
npm run dev
```
*(This concurrently starts the Laravel server and the Vite development server)*

To run the desktop client:
```sh
cd gerona-ledger-client
npm install
npm start
```

For Windows LAN deployment, you can alternatively use the bundled batch scripts:
```sh
Start-Dev.bat
```

---

## 📄 License

Copyright (c) 2026 Allen Icee Dequiros

This project is shared for portfolio, educational, and learning purposes.

You are welcome to study the codebase and use it as inspiration for your own projects.

Copying substantial portions of this project, redistributing it, submitting it as your own work, or creating direct clones is not permitted without explicit permission.

If this project inspires your work, please build your own implementation rather than copying the source code.

All rights reserved.
