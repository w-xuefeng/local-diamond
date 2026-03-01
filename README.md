# Local Diamond 💎

[![npm version](https://img.shields.io/npm/v/local-diamond.svg?style=flat-square&color=00b4d8)](https://www.npmjs.com/package/local-diamond)
[![npm downloads](https://img.shields.io/npm/dm/local-diamond.svg?style=flat-square&color=00b4d8)](https://www.npmjs.com/package/local-diamond)
[![node](https://img.shields.io/badge/runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh)

**English** | [中文](./README_zh-CN.md)

A secure, local-first sensitive configuration management tool designed for developers. Encrypt your secrets — database connection strings, API keys, tokens, and more — with strong `AES-256-CBC` encryption and store them safely on your local machine.

## 🖥️ UI Preview

<p align="center">
  <img src="./docs/light-en.png" alt="Light Theme" width="46%" />
  <img src="./docs/dark-en.png" alt="Dark Theme" width="46%" />
</p>

<p align="center">
  <img src="./docs/light-en-shrink.png" alt="Light shrink Theme" width="46%" />
  <img src="./docs/dark-en-shrink.png" alt="Dark shrink Theme" width="46%" />
</p>
## 🌟 Key Features

- **🔐 Local Storage & Security** — Strong `AES-256-CBC` encryption with a strict 32-byte master key
- **☁️ Zero Cloud Exposure** — Data stays entirely local in `~/.local-diamond/data.json`, never uploaded to any server
- **🔑 Auto Master Key Management** — One-click generation of a 64-character hex master key, persisted to `~/.local-diamond-master-key`
- **⚡ Blazing Fast CLI** — Built on Bun with commands like `lod set`, `lod get` for instant terminal access
- **🌐 Built-in Web UI** — Modern dashboard-style interface with Dark / Light / Auto theme support
- **📦 Import & Export** — Export encrypted data as JSON for backup; import via CLI or Web panel with merge or overwrite
- **🌍 i18n Support** — Built-in 🇨🇳 Chinese and 🇺🇸 English interfaces with automatic and persistent language preference

## 📦 Requirements

- **Bun** runtime — Install from [bun.sh](https://bun.sh) if you haven't already.

## 🚀 Quick Start

Install globally via `npm`, `yarn`, `pnpm`, or `bun`:

```bash
# Using Bun (recommended)
bun install -g local-diamond

# Or using npm
npm install -g local-diamond

# Run without installing (via npx or bunx)
npx local-diamond ui
bunx local-diamond ui
```

## 💻 CLI Usage

Local Diamond provides a rich CLI accessible via the `lod` command:

### Store a Secret

```bash
lod set DATABASE_URL "postgres://user:pass@localhost:5432/db"

# 💡 Recommended: Use namespaced keys for multi-project isolation:
lod set "acme/backend/DATABASE_URL" "postgres://user:pass@localhost:5432/acme_db"
```

> *If you don't have a Master Key yet, the system will auto-generate one and save it to `~/.local-diamond-master-key`.*

### Retrieve a Secret

```bash
lod get DATABASE_URL
# Output: postgres://user:pass@localhost:5432/db
```

### List All Keys

```bash
lod list
# Output:
# DATABASE_URL
# STRIPE_API_KEY
```

### Remove a Secret

```bash
lod remove DATABASE_URL
```

### Export & Import

```bash
# Export to a JSON backup file
lod export ./my-backup.json

# Import from a backup file
lod import ./my-backup.json

# Merge with existing data (without this flag, existing data will be overwritten)
lod import ./my-backup.json --merge
```

### Use in Shell Scripts

Combine `lod get` with shell command substitution to inject secrets into your scripts, deploy workflows, or CI pipelines:

```bash
#!/bin/bash

# Read secrets from Local Diamond into shell variables
server_host=$(lod get myapp/server-host)
server_user=$(lod get myapp/server-user)
db_url=$(lod get myapp/db-url)

# Use in SSH commands
ssh ${server_user}@${server_host} "docker run -e DATABASE_URL='${db_url}' myapp:latest"

# Use in Docker Compose
export DATABASE_URL=$(lod get myapp/db-url)
export REDIS_URL=$(lod get myapp/redis-url)
docker compose up -d

# Generate a .env file from stored secrets
echo "DATABASE_URL=$(lod get myapp/db-url)" > .env
echo "API_KEY=$(lod get myapp/api-key)" >> .env
echo "JWT_SECRET=$(lod get myapp/jwt-secret)" >> .env
```

---

## 🌐 Web UI

Local Diamond ships with a lightweight web server for browser-based management:

```bash
# Start on default port 3000
lod ui

# Custom port
lod ui -p 8080

# Force Chinese interface
lod ui --lang zh

# Force English interface
lod ui --lang en

# Set default language preference
lod ui --default-lang en
```

Then open `http://localhost:3000` in your browser to manage all your secrets — create, read, update, delete, generate keys, and import/export data!

---

## 💻 Programmatic API

For applications that need to read locally stored secrets, import the library directly:

```bash
bun add -D local-diamond
```

```typescript
import { get, set, list, readMasterKey } from 'local-diamond';

// 1. Read the persisted master key (generated via CLI or UI)
const myMasterKey = readMasterKey();

if (!myMasterKey) {
  console.log('No master key found. Run `lod ui` to set one up!');
} else {
  // 2. Store an encrypted secret
  set('GITHUB_TOKEN', 'ghp_xxxxxx...', myMasterKey);

  // 💡 Recommended: Use namespace/project/key naming for multi-project isolation:
  set('acme-corp/user-service/GITHUB_TOKEN', 'ghp_yyyyyy...', myMasterKey);

  // 3. Read a decrypted secret
  const token = get('acme-corp/user-service/GITHUB_TOKEN', myMasterKey);
  console.log('Your token:', token);

  // 4. List all stored key names
  const allKeys = list();
  console.log('Stored keys:', allKeys);
}
```

Additional lifecycle functions are also exported for advanced use: `generateMasterKey`, `encrypt`, `decrypt`, `remove`, `exportData`, `importData`, `writeMasterKey`, and more.
