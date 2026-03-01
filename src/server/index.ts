import { Hono } from "hono";
import {
  exportData,
  generateMasterKey,
  get,
  importData,
  list,
  readMasterKey,
  remove,
  set,
  writeMasterKey,
} from "../index";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const I18N = {
  en: {
    title: "Local Diamond",
    headerDesc: "Secure local management for sensitive configuration",
    masterKeyTitle: "Master Key",
    masterKeyDesc:
      "Provide your 32-byte master key to decrypt existing values and encrypt new ones.",
    masterKeyGenDesc:
      "If you don't have one, you can automatically generate it and it will be saved to your system's Home directory securely.",
    masterKeyPlaceholder: "Enter your 64-character hex master key...",
    autoGenerateBtn: "Auto Generate",
    addSecretTitle: "Add New Secret",
    secretKeyLabel: "Secret Key Name",
    secretKeyPlaceholder: "e.g., DATABASE_URL",
    secretValueLabel: "Secret Value",
    secretValuePlaceholder: "Enter the sensitive value...",
    storeSecretBtn: "Store Secret",
    dataManagementTitle: "Data Management",
    exportBtn: "Export",
    importBtn: "Import",
    storedSecretsTitle: "Stored Secrets",
    refreshBtn: "Refresh",
    viewBtn: "View",
    deleteBtn: "Delete",
    decryptedValueLabel: "Decrypted Value",
    closeBtn: "Close",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    noSecrets: "No secrets stored yet. Add your first secret above.",
    searchPlaceholder: "Search secrets...",
    noSearchResults: "No secrets match your search.",
    mergePrompt:
      "Do you want to merge imported keys with existing ones? (Click 'Cancel' to overwrite all existing keys)",
    deletePrompt: "Are you sure you want to delete",
    masterKeyRequiredAdd: "Master key is required!",
    masterKeyInvalid: "Master key must be exactly 64 hex characters!",
    bothRequired: "Both Key Name and Value are required!",
    storeSuccess: "Secret stored successfully!",
    masterKeyRequiredView: "Please enter your Master Key first.",
    genSuccess: "New Master Key generated and saved!",
    importSuccess: "Data imported successfully!",
    showKey: "Show",
    hideKey: "Hide",
    keyCount: "items",
    storing: "Storing...",
    exportDesc: "Export all secrets to a JSON file",
    importDesc: "Import secrets from a JSON file",
    editBtn: "Edit",
    editTitle: "Edit Secret",
    editValueLabel: "New Value",
    editValuePlaceholder: "Enter the new value...",
    updateBtn: "Update",
    updating: "Updating...",
    updateSuccess: "Updated successfully!",
  },
  zh: {
    title: "Local Diamond",
    headerDesc: "本地敏感配置安全管理",
    masterKeyTitle: "主密钥",
    masterKeyDesc: "提供您的 32 字节主密钥以解密现有值并加密新值。",
    masterKeyGenDesc:
      "如果没有，您可以自动生成它并安全地保存在系统的主目录下。",
    masterKeyPlaceholder: "输入您的 64 字符十六进制主密钥...",
    autoGenerateBtn: "自动生成",
    addSecretTitle: "添加新配置",
    secretKeyLabel: "配置项名称",
    secretKeyPlaceholder: "例如：DATABASE_URL",
    secretValueLabel: "配置项值",
    secretValuePlaceholder: "输入敏感内容...",
    storeSecretBtn: "安全存储",
    dataManagementTitle: "数据管理",
    exportBtn: "导出",
    importBtn: "导入",
    storedSecretsTitle: "已存储的数据",
    refreshBtn: "刷新",
    viewBtn: "查看",
    deleteBtn: "删除",
    decryptedValueLabel: "解密结果",
    closeBtn: "关闭",
    copyBtn: "复制",
    copiedBtn: "已复制！",
    noSecrets: "暂未存储任何数据，请在上方添加。",
    searchPlaceholder: "搜索配置项...",
    noSearchResults: "没有匹配的配置项。",
    mergePrompt:
      "您想将导入的密钥与现有密钥合并吗？（点击「取消」将覆盖所有现有密钥）",
    deletePrompt: "您确定要删除",
    masterKeyRequiredAdd: "必须填写主密钥！",
    masterKeyInvalid: "主密钥必须是精确的 64 个十六进制字符！",
    bothRequired: "名称和内容均为必填项！",
    storeSuccess: "存储成功！",
    masterKeyRequiredView: "请先输入您的主密钥。",
    genSuccess: "已生成新主密钥并保存！",
    importSuccess: "数据导入成功！",
    showKey: "显示",
    hideKey: "隐藏",
    keyCount: "条记录",
    storing: "存储中...",
    exportDesc: "导出所有配置为 JSON 文件",
    importDesc: "从 JSON 文件导入配置",
    editBtn: "编辑",
    editTitle: "编辑配置",
    editValueLabel: "新值",
    editValuePlaceholder: "输入新值...",
    updateBtn: "更新",
    updating: "更新中...",
    updateSuccess: "更新成功！",
  },
};

function renderHtml(lang: "en" | "zh") {
  const t: Record<string, string> = I18N[lang] || I18N["en"];
  const templatePath = join(import.meta.dir, "ui-template.html");
  let html = readFileSync(templatePath, "utf-8");
  html = html.replace(/\{\{lang\}\}/g, lang);
  html = html.replace(/\{\{t\.(\w+)\}\}/g, (_, key) => t[key] ?? "");
  return html;
}

export function startUi(port: number = 3000, lang: string = "en") {
  const app = new Hono();

  app.get("/", (c) => c.html(renderHtml(lang as "en" | "zh")));

  // API Routes
  app.get("/api/keys", (c) => {
    return c.json({ keys: list() });
  });

  app.post("/api/master-key", (c) => {
    try {
      const newKey = generateMasterKey();
      writeMasterKey(newKey);
      return c.json({ key: newKey });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.get("/api/master-key", (c) => {
    const key = readMasterKey();
    if (key) {
      return c.json({ key });
    }
    return c.json({ key: null });
  });

  app.post("/api/keys", async (c) => {
    try {
      let { key, value, masterKey } = await c.req.json();
      masterKey = masterKey || readMasterKey();
      if (!key || !value || !masterKey) {
        return c.json({
          error: "Missing required fields or master key.",
        }, 400);
      }
      set(key, value, masterKey);
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.post("/api/keys/decrypt", async (c) => {
    try {
      let { key, masterKey } = await c.req.json();
      masterKey = masterKey || readMasterKey();
      if (!key || !masterKey) {
        return c.json({ error: "Missing required fields" }, 400);
      }
      const val = get(key, masterKey);
      if (val === null) {
        return c.json(
          { error: "Not found or invalid master key" },
          404,
        );
      }
      return c.json({ value: val });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.delete("/api/keys/:id", (c) => {
    const key = c.req.param("id");
    try {
      remove(key);
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.get("/api/export", (c) => {
    try {
      const tempFile = join(
        tmpdir(),
        `local - diamond -export -${Date.now()}.json`,
      );
      exportData(tempFile);
      const content = readFileSync(tempFile, "utf-8");
      return c.body(content, 200, {
        "Content-Type": "application/json",
        "Content-Disposition":
          'attachment; filename="local-diamond-backup.json"',
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.post("/api/import", async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body["file"] as File;
      const merge = body["merge"] === "true";

      if (!file) {
        return c.json({ error: "No file uploaded" }, 400);
      }

      const tempFile = join(
        tmpdir(),
        `local - diamond -import -${Date.now()}.json`,
      );
      const buffer = await file.arrayBuffer();
      writeFileSync(tempFile, Buffer.from(buffer));

      importData(tempFile, merge);

      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  console.log(
    `\x1b[36mLocal Diamond UI is running on: \x1b[0m \x1b[32mhttp://localhost:${port}\x1b[0m`,
  );
  return Bun.serve({
    fetch: app.fetch,
    port,
  });
}
