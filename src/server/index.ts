import { Hono } from 'hono';
import { get, set, remove, list, exportData, importData, readMasterKey, writeMasterKey, generateMasterKey } from '../index';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const I18N = {
  en: {
    title: 'Local Diamond UI',
    headerDesc: 'Secure local management for sensitive configuration',
    masterKeyTitle: 'Master Key',
    masterKeyDesc: "Provide your 32-byte master key to decrypt existing values and encrypt new ones.",
    masterKeyGenDesc: "If you don't have one, you can automatically generate it and it will be saved to your system's Home directory securely.",
    masterKeyPlaceholder: 'Enter your 64-character hex master key...',
    autoGenerateBtn: 'Auto Generate',
    addSecretTitle: 'Add New Secret',
    secretKeyLabel: 'Secret Key Name',
    secretKeyPlaceholder: 'e.g., DATABASE_URL',
    secretValueLabel: 'Secret Value',
    secretValuePlaceholder: 'Enter the sensitive value...',
    storeSecretBtn: 'Store Secret',
    dataManagementTitle: 'Data Management',
    exportBtn: 'Export to JSON',
    importBtn: 'Import from JSON',
    storedSecretsTitle: 'Stored Secrets',
    refreshBtn: 'Refresh',
    viewBtn: 'View',
    deleteBtn: 'Delete',
    decryptedValueLabel: 'Decrypted Value:',
    closeBtn: 'Close',
    noSecrets: 'No secrets stored yet.',
    mergePrompt: "Do you want to merge imported keys with existing ones? (Click 'Cancel' to overwrite all existing keys)",
    deletePrompt: 'Are you sure you want to delete',
    masterKeyRequiredAdd: 'Master key is required!',
    masterKeyInvalid: 'Master key must be exactly 64 hex characters!',
    bothRequired: 'Both Key Name and Value are required!',
    storeSuccess: 'Secret stored successfully!',
    masterKeyRequiredView: 'Please enter your Master Key in the main screen first.',
    genSuccess: 'New Master Key generated and saved locally!',
    importSuccess: 'Data imported successfully!'
  },
  zh: {
    title: 'Local Diamond 用户界面',
    headerDesc: '本地敏感配置安全管理',
    masterKeyTitle: '主密钥',
    masterKeyDesc: '提供您的 32 字节主密钥以解密现有值并加密新值。',
    masterKeyGenDesc: '如果没有，您可以自动生成它并安全地保存在系统的主目录下。',
    masterKeyPlaceholder: '输入您的 64 字符十六进制主密钥...',
    autoGenerateBtn: '自动生成',
    addSecretTitle: '添加新配置',
    secretKeyLabel: '配置项名称',
    secretKeyPlaceholder: '例如：DATABASE_URL',
    secretValueLabel: '配置项值',
    secretValuePlaceholder: '输入敏感内容...',
    storeSecretBtn: '安全存储',
    dataManagementTitle: '数据管理',
    exportBtn: '导出 JSON',
    importBtn: '导入 JSON',
    storedSecretsTitle: '已存储的数据',
    refreshBtn: '刷新',
    viewBtn: '查看',
    deleteBtn: '删除',
    decryptedValueLabel: '解密结果：',
    closeBtn: '关闭',
    noSecrets: '暂未存储任何数据。',
    mergePrompt: '您想将导入的密钥与现有密钥合并吗？（点击“取消”将覆盖所有现有密钥）',
    deletePrompt: '您确定要删除',
    masterKeyRequiredAdd: '必须填写主密钥！',
    masterKeyInvalid: '主密钥必须是精确的 64 个十六进制字符！',
    bothRequired: '名称和内容均为必填项！',
    storeSuccess: '存储成功！',
    masterKeyRequiredView: '请先在主屏幕中输入您的主密钥。',
    genSuccess: '系统已为您生成了新主密钥并保存在本地！',
    importSuccess: '数据导入成功！'
  }
};

function renderHtml(lang: 'en' | 'zh') {
  const t = I18N[lang] || I18N['en'];
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --surface-color: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
            --danger-color: #ef4444;
            --danger-hover: #dc2626;
            --border-color: #334155;
            --success-color: #22c55e;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
            min-height: 100vh;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        header {
            margin-bottom: 2rem;
            text-align: center;
        }

        h1 {
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
        }

        .card {
            background-color: var(--surface-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid var(--border-color);
        }

        .form-group {
            margin-bottom: 1rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        input {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background-color: var(--bg-color);
            color: var(--text-color);
            font-size: 1rem;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }

        input:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        button {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            font-size: 1rem;
        }

        button:active {
            transform: scale(0.98);
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .btn-danger {
            background-color: var(--danger-color);
            color: white;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }

        .btn-danger:hover {
            background-color: var(--danger-hover);
        }

        .master-key-container {
            display: flex;
            gap: 1rem;
            align-items: flex-end;
        }

        .master-key-container .form-group {
            flex: 1;
            margin-bottom: 0;
        }

        .key-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .key-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.2s;
        }

        .key-item:last-child {
            border-bottom: none;
        }

        .key-item:hover {
            background-color: rgba(255, 255, 255, 0.02);
        }

        .key-name {
            font-weight: 600;
            font-size: 1.1rem;
        }

        .key-actions {
            display: flex;
            gap: 0.5rem;
        }

        .status-message {
            margin-top: 1rem;
            padding: 0.75rem;
            border-radius: 6px;
            display: none;
            font-size: 0.875rem;
        }

        .status-success {
            background-color: rgba(34, 197, 94, 0.1);
            color: var(--success-color);
            border: 1px solid var(--success-color);
            display: block;
        }

        .status-error {
            background-color: rgba(239, 68, 68, 0.1);
            color: var(--danger-color);
            border: 1px solid var(--danger-color);
            display: block;
        }

        /* Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 1000;
            backdrop-filter: blur(4px);
        }

        .modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .modal {
            background-color: var(--surface-color);
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            transform: translateY(20px);
            transition: transform 0.2s;
            border: 1px solid var(--border-color);
        }

        .modal-overlay.active .modal {
            transform: translateY(0);
        }

        .modal h2 {
            margin-top: 0;
        }

        code {
            background-color: var(--bg-color);
            padding: 0.5rem;
            border-radius: 4px;
            display: block;
            margin: 1rem 0;
            word-break: break-all;
            border: 1px solid var(--border-color);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Local Diamond</h1>
            <p style="color: var(--text-muted);">${t.headerDesc}</p>
        </header>

        <div class="card">
            <h2>${t.masterKeyTitle}</h2>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
                ${t.masterKeyDesc}
                <br />${t.masterKeyGenDesc}
            </p>
            <div class="master-key-container">
                <div class="form-group">
                    <input type="password" id="masterKey" placeholder="${t.masterKeyPlaceholder}" oninput="checkMasterKeyInput()" />
                </div>
                <button id="autoGenerateBtn" class="btn-primary" style="background-color: var(--border-color); white-space: nowrap;" onclick="generateKey()">${t.autoGenerateBtn}</button>
            </div>
            <div id="masterKeyStatus" class="status-message"></div>
        </div>

        <div class="card">
            <h2>${t.addSecretTitle}</h2>
            <div class="form-group">
                <label for="newKey">${t.secretKeyLabel}</label>
                <input type="text" id="newKey" placeholder="${t.secretKeyPlaceholder}" />
            </div>
            <div class="form-group">
                <label for="newValue">${t.secretValueLabel}</label>
                <input type="password" id="newValue" placeholder="${t.secretValuePlaceholder}" />
            </div>
            <button class="btn-primary" onclick="addSecret()">${t.storeSecretBtn}</button>
            <div id="addStatus" class="status-message"></div>
        </div>

        <div class="card">
            <h2>${t.dataManagementTitle}</h2>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button class="btn-primary" onclick="exportDataFile()">${t.exportBtn}</button>
                <button class="btn-primary" style="background-color: var(--border-color);" onclick="document.getElementById('importFile').click()">${t.importBtn}</button>
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="importDataFile(event)" />
            </div>
            <div id="dataStatus" class="status-message"></div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;">${t.storedSecretsTitle}</h2>
                <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="loadKeys()">${t.refreshBtn}</button>
            </div>
            <ul id="keyList" class="key-list">
                <!-- Keys will be loaded here -->
            </ul>
        </div>
    </div>

    <!-- Decrypt Modal -->
    <div class="modal-overlay" id="decryptModal">
        <div class="modal">
            <h2 id="modalKeyName">Secret Name</h2>
            <div id="modalStatus" class="status-message"></div>
            <div id="modalContent" style="display: none;">
                <label>${t.decryptedValueLabel}</label>
                <code id="modalValue"></code>
            </div>
            <div style="margin-top: 1.5rem; text-align: right;">
                <button class="btn-primary" onclick="closeModal()">${t.closeBtn}</button>
            </div>
        </div>
    </div>

    <script>
        // Store master key in memory safely
        let keys = [];

        function showStatus(elementId, message, isError = false) {
            const el = document.getElementById(elementId);
            el.textContent = message;
            el.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
            setTimeout(() => {
                el.className = 'status-message';
            }, 3000);
        }

        async function loadKeys() {
            try {
                const res = await fetch('/api/keys');
                const data = await res.json();
                keys = data.keys || [];
                renderKeys();
            } catch (err) {
                console.error('Failed to load keys', err);
            }
        }

        async function exportDataFile() {
            try {
                window.location.href = '/api/export';
            } catch (err) {
                showStatus('dataStatus', 'Failed to export', true);
            }
        }

        async function loadMasterKey() {
            try {
                const res = await fetch('/api/master-key');
                const data = await res.json();
                if (data.key) {
                    document.getElementById('masterKey').value = data.key;
                    document.getElementById('autoGenerateBtn').style.display = 'none';
                }
            } catch (err) {
                console.error('Failed to load local master key', err);
            }
        }

        function checkMasterKeyInput() {
            const val = document.getElementById('masterKey').value.trim();
            const btn = document.getElementById('autoGenerateBtn');
            if (val.length > 0) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-block';
            }
        }

        async function generateKey() {
            try {
                const res = await fetch('/api/master-key', { method: 'POST' });
                const data = await res.json();
                if (data.key) {
                    document.getElementById('masterKey').value = data.key;
                    document.getElementById('autoGenerateBtn').style.display = 'none';
                    showStatus('masterKeyStatus', '${t.genSuccess}');
                } else {
                    showStatus('masterKeyStatus', 'Failed to generate key', true);
                }
            } catch (err) {
                showStatus('masterKeyStatus', 'Network error during generation', true);
            }
        }

        async function importDataFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const confirmMerge = confirm("${t.mergePrompt}");

            const formData = new FormData();
            formData.append('file', file);
            formData.append('merge', confirmMerge);

            try {
                const res = await fetch('/api/import', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    showStatus('dataStatus', '${t.importSuccess}');
                    loadKeys();
                } else {
                    const data = await res.json();
                    showStatus('dataStatus', data.error || 'Failed to import data', true);
                }
            } catch (err) {
                showStatus('dataStatus', 'Network error during import', true);
            }

            // clear file input
            event.target.value = '';
        }

        function renderKeys() {
            const list = document.getElementById('keyList');
            if (keys.length === 0) {
                list.innerHTML = '<li style="color: var(--text-muted); padding: 1rem; text-align: center;">${t.noSecrets}</li>';
                return;
            }

            list.innerHTML = keys.map(key => \`
                <li class="key-item">
                    <span class="key-name">\${key}</span>
                    <div class="key-actions">
                        <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem; background-color: var(--border-color);" onclick="viewSecret('\${key}')">${t.viewBtn}</button>
                        <button class="btn-danger" onclick="deleteSecret('\${key}')">${t.deleteBtn}</button>
                    </div>
                </li>
            \`).join('');
        }

        async function addSecret() {
            const masterKey = document.getElementById('masterKey').value.trim();
            const key = document.getElementById('newKey').value.trim();
            const value = document.getElementById('newValue').value;

            if (!masterKey) {
                showStatus('addStatus', '${t.masterKeyRequiredAdd}', true);
                return;
            }
            if (masterKey.length !== 64) {
                showStatus('addStatus', '${t.masterKeyInvalid}', true);
                return;
            }
            if (!key || !value) {
                showStatus('addStatus', '${t.bothRequired}', true);
                return;
            }

            try {
                const res = await fetch('/api/keys', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value, masterKey })
                });

                const data = await res.json();
                if (res.ok) {
                    showStatus('addStatus', '${t.storeSuccess}');
                    document.getElementById('newKey').value = '';
                    document.getElementById('newValue').value = '';
                    loadKeys();
                } else {
                    showStatus('addStatus', data.error || 'Failed to construct secret', true);
                }
            } catch (err) {
                showStatus('addStatus', 'Network error', true);
            }
        }

        async function viewSecret(key) {
            const masterKey = document.getElementById('masterKey').value.trim();
            const modal = document.getElementById('decryptModal');
            document.getElementById('modalKeyName').textContent = key;
            document.getElementById('modalContent').style.display = 'none';
            document.getElementById('modalStatus').className = 'status-message';
            modal.classList.add('active');

            if (!masterKey) {
                showStatus('modalStatus', '${t.masterKeyRequiredView}', true);
                return;
            }

            try {
                const res = await fetch('/api/keys/decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, masterKey })
                });
                const data = await res.json();

                if (res.ok) {
                    document.getElementById('modalValue').textContent = data.value;
                    document.getElementById('modalContent').style.display = 'block';
                } else {
                    showStatus('modalStatus', data.error || 'Failed to construct secret. Invalid master key?', true);
                }
            } catch (err) {
                showStatus('modalStatus', 'Network error', true);
            }
        }

        async function deleteSecret(key) {
            if (!confirm(\`${t.deletePrompt} "\${key}"?\`)) return;

            try {
                await fetch(\`/api/keys/\${encodeURIComponent(key)}\`, { method: 'DELETE' });
                loadKeys();
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }

        function closeModal() {
            document.getElementById('decryptModal').classList.remove('active');
        }

        // Initial load
        loadMasterKey();
        loadKeys();
    </script>
</body>
</html>
`;
}

export function startUi(port: number = 3000, lang: string = 'en') {
  const app = new Hono();

  app.get('/', (c) => c.html(renderHtml(lang as 'en' | 'zh')));

  // API Routes
  app.get('/api/keys', (c) => {
    return c.json({ keys: list() });
  });

  app.post('/api/master-key', (c) => {
    try {
      const newKey = generateMasterKey();
      writeMasterKey(newKey);
      return c.json({ key: newKey });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.get('/api/master-key', (c) => {
    const key = readMasterKey();
    if (key) {
      return c.json({ key });
    }
    return c.json({ key: null });
  });

  app.post('/api/keys', async (c) => {
    try {
      let { key, value, masterKey } = await c.req.json();
      masterKey = masterKey || readMasterKey();
      if (!key || !value || !masterKey) {
        return c.json({ error: 'Missing required fields or master key.' }, 400);
      }
      set(key, value, masterKey);
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.post('/api/keys/decrypt', async (c) => {
    try {
      let { key, masterKey } = await c.req.json();
      masterKey = masterKey || readMasterKey();
      if (!key || !masterKey) {
        return c.json({ error: 'Missing required fields' }, 400);
      }
      const val = get(key, masterKey);
      if (val === null) return c.json({ error: 'Not found or invalid master key' }, 404);
      return c.json({ value: val });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.delete('/api/keys/:id', (c) => {
    const key = c.req.param('id');
    try {
      remove(key);
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.get('/api/export', (c) => {
    try {
      const tempFile = join(tmpdir(), `local - diamond -export -${Date.now()}.json`);
      exportData(tempFile);
      const content = readFileSync(tempFile, 'utf-8');
      return c.body(content, 200, {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="local-diamond-backup.json"'
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.post('/api/import', async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body['file'] as File;
      const merge = body['merge'] === 'true';

      if (!file) {
        return c.json({ error: 'No file uploaded' }, 400);
      }

      const tempFile = join(tmpdir(), `local - diamond -import -${Date.now()}.json`);
      const buffer = await file.arrayBuffer();
      writeFileSync(tempFile, Buffer.from(buffer));

      importData(tempFile, merge);

      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  console.log(`\x1b[36mLocal Diamond UI is running on: \x1b[0m \x1b[32mhttp://localhost:${port}\x1b[0m`);
  return Bun.serve({
    fetch: app.fetch,
    port,
  });
}
