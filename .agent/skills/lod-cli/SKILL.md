---
name: Local Diamond CLI (lod)
description: Commands and instructions for interacting with the local-diamond project's CLI tool to manage encrypted sensitive data locally.
---

# Local Diamond CLI (`lod`) Skills

This project provides a CLI tool named `lod` (Local Diamond) for managing encrypted sensitive data locally. Other AI agents working on or utilizing this project can interact with it using the following commands.

When running these commands within the project before it is globally linked, you must execute them via the bun runtime and the TypeScript entrypoint, for example: `bun src/bin.ts <command>`.

## Core Concepts

- **Master Key**: A 64-character (32-byte) hex string required for encrypting and decrypting values.
  - Can be provided via the `-k` or `--key` CLI option.
  - Can be read from the `LOCAL_DIAMOND_KEY` environment variable.
  - If omitted and a key is found in `~/.local-diamond-master-key`, it will use that automatically.
  - During a `set` operation, if no key is found anywhere, a new one will be auto-generated and saved to `~/.local-diamond-master-key`.

## Command Reference

### 1. Set a Value (`set`)
Encrypts and stores a new key-value pair.
```bash
bun src/bin.ts set <key> <value> [-k <masterKey>]
```

### 2. Get a Value (`get`)
Retrieves and decrypts a value by its key.
```bash
bun src/bin.ts get <key> [-k <masterKey>]
```

### 3. Remove a Key (`remove`)
Deletes a stored key-value pair from the local data store.
```bash
bun src/bin.ts remove <key>
```

### 4. List All Keys (`list`)
Lists all the keys currently stored (does not output the decrypted values).
```bash
bun src/bin.ts list
```

### 5. Export Data (`export`)
Exports all stored data (in encrypted form) to a specified JSON file.
```bash
bun src/bin.ts export <destination.json>
```

### 6. Import Data (`import`)
Imports stored keys from a previously exported JSON file.
```bash
bun src/bin.ts import <source.json> [-m, --merge]
```
- `-m, --merge`: Use this option to merge imported data with existing keys (overwrites duplicates instead of replacing everything). If omitted, the import replaces all current keys.

### 7. Start Web UI (`ui`)
Starts a local web interface for managing the keys.
```bash
bun src/bin.ts ui [-p <port>] [--lang <en|zh>] [--default-lang <en|zh>]
```
- `-p, --port <number>`: Specify the port to run the UI on (default: 3000).
- `--lang <en|zh>`: Set the ad-hoc display language for this session.
- `--default-lang <en|zh>`: Set the default language for all future sessions.

## Best Practices for AI Agents

1. **Working with Secrets**: Whenever you need to handle test secrets or environment variables contextually for scripts in this project, use `lod set` to store them securely.
2. **Missing Master Key Error**: If `lod get` fails due to a missing master key, you may need to run `bun src/bin.ts set <dummy_key> <dummy_value>` to trigger the auto-generation of the `~/.local-diamond-master-key` file.
3. **Execution context**: This project is built using Bun and TypeScript. Always use `bun src/bin.ts` instead of `node` during development to execute the CLI logic. If you need to test the production build, ensure you use the generated binary after the build step (if available).
