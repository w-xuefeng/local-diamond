# Local Diamond 💎

[![npm version](https://img.shields.io/npm/v/local-diamond.svg?style=flat-square&color=00b4d8)](https://www.npmjs.com/package/local-diamond)
[![npm downloads](https://img.shields.io/npm/dm/local-diamond.svg?style=flat-square&color=00b4d8)](https://www.npmjs.com/package/local-diamond)
[![node](https://img.shields.io/badge/runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh)

[English](./README.md) | **中文**

Local Diamond 是一款专为开发者设计的安全、本地优先的敏感配置管理工具。它可以将您的敏感密文（如数据库连接字符串、各类第三方 API Keys 等）使用高强度的 `AES-256-CBC` 加密后，安全地保存在您的本地计算机上。

## 🖥️ 界面预览

<p align="center">
  <img src="./docs/light-zh.png" alt="Light Theme" width="46%" />
  <img src="./docs/dark-zh.png" alt="Dark Theme" width="46%" />
</p>

<p align="center">
  <img src="./docs/light-zh-shrink.png" alt="Light shrink Theme" width="46%" />
  <img src="./docs/dark-zh-shrink.png" alt="Dark shrink Theme" width="46%" />
</p>

## 🌟 核心特性

- **🔐 本地存储与安全** — 采用高强度 `AES-256-CBC` 算法与严格的 32 字节主密钥进行加密保护
- **☁️ 无云端暴露** — 数据完全私密存储于 `~/.local-diamond/data.json`，绝不上传至云端或第三方服务器
- **🔑 主密钥自动管理** — 一键自动生成 64 位十六进制主密钥，CLI 与 UI 皆可将其持久化存储在 `~/.local-diamond-master-key`
- **⚡ 极速 CLI** — 基于 Bun 构建，支持 `lod set`、`lod get` 等命令，即时在终端读写、移除或列出您的数据配置
- **🌐 内置 Web UI** — 现代化 Dashboard 风格图形界面；支持 Dark / Light / Auto 主题切换
- **📦 一键导入与导出** — 支持将加密数据导出为 JSON 文件进行备份，并通过 CLI 或 Web 面板进行合并或覆盖导入
- **🌍 多语言（i18n）支持** — 内置 🇨🇳 中文 和 🇺🇸 英文 界面，自动获取并可持久化您的语言偏好

## 📦 环境要求

- **Bun** 运行时 — 如果您还未安装，请访问 [bun.sh](https://bun.sh) 进行安装。

## 🚀 快速开始

可以通过 `npm`、`yarn`、`pnpm` 或 `bun` 轻松将其全局安装到您的设备中：

```bash
# 使用 Bun 全局安装（推荐）
bun install -g local-diamond

# 或者使用 npm
npm install -g local-diamond

# 您也可以无需安装直接使用（通过 npx 或 bunx）
npx local-diamond ui
bunx local-diamond ui
```

## 💻 CLI 命令行使用指南

Local Diamond CLI 提供了极为丰富的命令交互。由于加入了全局执行脚本 `lod`，您可以随时随地调取：

### 存储新的敏感配置

```bash
lod set DATABASE_URL "postgres://user:pass@localhost:5432/db"

# 💡 推荐：使用带有命名空间的键名，以便为多项目进行完美的密钥隔离管理：
lod set "acme/backend/DATABASE_URL" "postgres://user:pass@localhost:5432/acme_db"
```

> *如果您还没有主密钥（Master Key），系统会帮您自动生成并将其妥善存放到 `~/.local-diamond-master-key`。*

### 获取已有的配置值

```bash
lod get DATABASE_URL
# 输出：postgres://user:pass@localhost:5432/db
```

### 列出所有保存的配置键名

```bash
lod list
# 输出：
# DATABASE_URL
# STRIPE_API_KEY
```

### 移除并删除特定配置

```bash
lod remove DATABASE_URL
```

### 数据的导出与导入

```bash
# 导出当前数据备份至 json 文件
lod export ./my-backup.json

# 将备份重新导入当前计算机
lod import ./my-backup.json

# 追加/合并目前存储和备份文件里的参数（如果不加此 flag 将完全覆盖现有数据）
lod import ./my-backup.json --merge
```

### 在 Shell 脚本中使用

结合 `lod get` 和 Shell 命令替换，可以在部署脚本、CI 流水线或日常运维中直接注入密钥：

```bash
#!/bin/bash

# 从 Local Diamond 读取密钥到 Shell 变量
server_host=$(lod get myapp/server-host)
server_user=$(lod get myapp/server-user)
db_url=$(lod get myapp/db-url)

# 在 SSH 命令中使用
ssh ${server_user}@${server_host} "docker run -e DATABASE_URL='${db_url}' myapp:latest"

# 在 Docker Compose 中使用
export DATABASE_URL=$(lod get myapp/db-url)
export REDIS_URL=$(lod get myapp/redis-url)
docker compose up -d

# 从存储的密钥生成 .env 文件
echo "DATABASE_URL=$(lod get myapp/db-url)" > .env
echo "API_KEY=$(lod get myapp/api-key)" >> .env
echo "JWT_SECRET=$(lod get myapp/jwt-secret)" >> .env
```

---

## 🌐 Web 图形界面 (UI)

Local Diamond 捆绑了一个轻量级 Web 服务器供您使用现代化浏览器进行管理，无需背诵命令：

```bash
# 在默认端口 3000 上启动 UI
lod ui

# 在自定义端口上启动界面
lod ui -p 8080

# 强制以中文界面启动
lod ui --lang zh

# 强制以英文界面启动
lod ui --lang en

# 设置全局首选项，以后启动时都会默认保持该语言
lod ui --default-lang zh
```

执行后，打开浏览器访问 `http://localhost:3000` 即可自由地进行所有增、删、改、查、生成密钥及全量的导入和导出操作！

---

## 💻 在您的项目中使用 API

在平时开发中，如果您的应用需要读取本地存储的密钥，可以直接引入该库：

```bash
bun add -D local-diamond
```

```typescript
import { get, set, list, readMasterKey } from 'local-diamond';

// 1. 读取系统持久化的主密钥（如果之前通过 CLI 或 UI 生成过）
const myMasterKey = readMasterKey();

if (!myMasterKey) {
  console.log('未找到主密钥，请先运行 `lod ui` 进行配置！');
} else {
  // 2. 将数据写入本地加密库
  set('GITHUB_TOKEN', 'ghp_xxxxxx...', myMasterKey);

  // 💡 推荐：为了对多个项目的密钥进行高效管理和隔离，建议采用 `命名空间/项目名/配置键` 的命名规范：
  set('acme-corp/user-service/GITHUB_TOKEN', 'ghp_yyyyyy...', myMasterKey);

  // 3. 读取解密后的数据
  const token = get('acme-corp/user-service/GITHUB_TOKEN', myMasterKey);
  console.log('您的项目 Token 为:', token);

  // 4. 获取当前存储的所有参数名称
  const allKeys = list();
  console.log('配置库中拥有：', allKeys);
}
```

除此之外，还暴露了完整的生命周期管理函数供深度定制使用： `generateMasterKey, encrypt, decrypt, remove, exportData, importData, writeMasterKey` 等等。
