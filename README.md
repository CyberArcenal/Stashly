# Stashly

Stashly is a modern offline‑first inventory management system built with **Electron, React, TypeScript, and TypeORM**. It streamlines stock tracking, warehouse limits, purchases, and orders while offering reporting, exports, and notifications. Designed for scalability and simplicity, Stashly empowers businesses to manage inventory with clarity and control.

## 📸 Screenshots

_Sample screens – replace with actual images of your application._

![Dashboard](https://github.com/CyberArcenal/Stashly/blob/main/screenshots/1.png?raw=true)
![Inventory List](https://github.com/CyberArcenal/Stashly/blob/main/screenshots/3.png?raw=true)
![Product Form](https://github.com/CyberArcenal/Stashly/blob/main/screenshots/2.png?raw=true)
![Reports](https://github.com/CyberArcenal/Stashly/blob/main/screenshots/4.png?raw=true)

## 🚀 Features

### Core

- **Dashboard** – real‑time overview of stock, alerts, and activities.
- **Inventory Management** – track products, variants, stock quantities, reorder levels, and warehouse locations.
- **Purchase Orders** – create, manage, and receive purchase orders with full history.
- **Stock Movements** – detailed log of all stock changes (in, out, transfers, adjustments).
- **Reporting & Analytics** – generate comprehensive reports:
  - Inventory report (stock by category, low stock, stock movements)
  - Sales report (monthly trends, top products, category performance)
  - Profit & loss report (monthly profit, expense breakdown)
  - Out‑of‑stock and low‑stock reports
- **Export** – export reports or lists to CSV, Excel, or PDF.

### Advanced

- **Audit Log** – complete trail of user actions and record changes.
- **User Management** – role‑based access (admin, staff, viewer).
- **Settings** – configurable currency, tax rates, thresholds, and preferences.
- **Automatic Backups** – scheduled and pre‑migration backups.
- **Migrations** – seamless schema updates without data loss.

## 🛠 Tech Stack

**Frontend**

- React 18, TypeScript, Vite, Tailwind CSS
- Zustand for state management, React Router for navigation

**Backend**

- Electron (desktop framework)
- Node.js runtime
- TypeORM + SQLite3 (local database)

**Key Libraries**

- `exceljs` – Excel export
- `pdfkit` – PDF generation
- `bcryptjs` – password hashing
- `decimal.js` – precise financial calculations
- `lucide-react` – icons
- `winston` – logging

## 📁 Project Structure

```
stashly/
├── src/
│   ├── channels/                # IPC channels
│   ├── drivers/                 # External drivers/adapters
│   ├── entities/                # TypeORM entities
│   ├── handlers/                # Request/response handlers
│   ├── main/                    # Electron main process
│   │   ├── db/                  # Database datasource & config
│   │   ├── ipc/                 # IPC modules
│   │   │   ├── core/            # Core modules
│   │   │   ├── reports/         # Reporting modules
│   │   │   └── exports/         # Export modules
│   │   ├── index.js             # Electron entry point
│   │   ├── activation.ipc.js    # Activation/licensing IPC
│   │   ├── system_config.ipc.js # System configuration IPC
│   │   └── windows_control.ipc.js # Window management IPC
│   ├── middlewares/             # Middleware
│   ├── migrations/              # Database migrations
│   ├── schedulers/              # Scheduled jobs
│   ├── seeders/                 # Seed data scripts
│   ├── services/                # Business logic services
│   ├── stateTransitionServices/ # Workflow transitions
│   ├── subscribers/             # TypeORM subscribers
│   └── utils/                   # Utility functions
│
├── dist/                        # Compiled output
├── release/                     # Electron-builder artifacts
├── build/                       # App icons and assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Installation

**Prerequisites**: Node.js 18+, npm, Git

1. Clone the repository

   ```bash
   git clone https://github.com/CyberArcenal/stashly.git
   cd stashly
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Run database migrations

   ```bash
   npm run migration:run
   ```

4. (Optional) Seed the database
   ```bash
   npm run seed
   ```

## 🚦 Development

Available scripts:

- `npm run dev` – start Vite dev server and Electron with hot reload
- `npm run build` – build production version
- `npm run migration:generate` – generate new migration
- `npm run migration:run` – apply migrations
- `npm run migration:revert` – revert last migration
- `npm run seed:reset` – reset and reseed database
- `npm run lint` – lint source code
- `npm run preview` – preview production build

## 📦 Production Build

```bash
npm run build
```

Packaged app will be placed in `release/` folder.

- **Windows**: NSIS installer
- **macOS**: DMG
- **Linux**: AppImage

Auto‑updates enabled via GitHub releases.

## 🗄️ Database

- SQLite database stored in user data directory.
- Automatic backup before migrations.
- Backup files stored in `backups/`.

**Main entities**:  
`Customer`, `Product`, `ProductVariant`, `Category`, `Supplier`, `Warehouse`, `StockItem`, `StockMovement`, `Order`, `OrderItem`, `Purchase`, `PurchaseItem`, `AuditLog`, `Notification`, `Settings`, `LoyaltyTransaction`

## 🔒 Security

- Passwords hashed with bcrypt.
- Parameterized queries via TypeORM.
- Audit logging for all CRUD operations.
- Role‑based access control at IPC level.
- Optional SQLite encryption.

## 📊 Reporting

Reports can be exported to:

- **CSV** – spreadsheet compatible
- **Excel** – formatted workbooks with charts
- **PDF** – print‑ready reports

## 🛠 Troubleshooting

- **Database errors**: check permissions on SQLite file.
- **Migration failures**: restore from backup.
- **Build errors**: verify Node.js version and rebuild native modules.

Logs are written to console (dev) and log file (production).

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Proprietary – all rights reserved. See `[Looks like the result wasn't safe to show. Let's switch things up and try something else!]`.

## 📞 Support

- Open an issue on GitHub
- Consult `/docs` folder
- Review troubleshooting section

## 📜 Changelog

See `[Looks like the result wasn't safe to show. Let's switch things up and try something else!]`.

---

## 💖 Support This Project

If you find this project helpful, consider supporting its development:

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-blue)](https://github.com/sponsors/CyberArcenal)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/Lugawan677)
[![Ko-fi](https://img.shields.io/badge/Support-Ko--fi-red)](https://ko-fi.com/cyberarcenal60019)

## 📱 Donate via GCash
Scan the QR code below to send your support:

![GCash QR](https://github.com/CyberArcenal/Kabisilya-Management/blob/main/screenshots/gcash-qr.JPG?raw=true)
