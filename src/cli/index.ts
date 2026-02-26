import { Command } from 'commander';
import { get, set, remove, list, generateMasterKey, exportData, importData, readMasterKey, writeMasterKey, readDefaultLang, writeDefaultLang } from '../index';
import { startUi } from '../server/index';
import pkg from "../../package.json" with { type: "json" };

export const program = new Command();

program
  .name('lod')
  .description('Manage encrypted sensitive data locally')
  .version(pkg.version, "-v, --version")
  .version(pkg.version, "-V, --VERSION");

function getMasterKey(options: any, allowGenerate = false): string {
  let key = options.key || process.env.LOCAL_DIAMOND_KEY || readMasterKey();
  if (!key && allowGenerate) {
    key = generateMasterKey();
    writeMasterKey(key);
    console.log(`\n\x1b[33m[WARNING] No master key provided. A new one has been generated and saved to ~/.local-diamond-master-key!\x1b[0m`);
    console.log(`\x1b[31mPlease keep this file safe. You will need it to read your data:\x1b[0m`);
    console.log(`\x1b[32m${key}\x1b[0m\n`);
  } else if (!key) {
    console.error('Error: Master key is required. Provide it via -k, --key, LOCAL_DIAMOND_KEY env variable, or let the tool auto-generate it during a `set` operation.');
    process.exit(1);
  }

  if (key.length !== 64) {
    console.error('Error: Master key must be exactly 64 hex characters (32 bytes).');
    process.exit(1);
  }

  return key;
}

program.command('set')
  .description('Set a key-value pair')
  .argument('<key>', 'The key to set')
  .argument('<value>', 'The value to store')
  .option('-k, --key <masterKey>', 'Master key (32 bytes hex)')
  .action((key, value, options) => {
    const mk = getMasterKey(options, true);
    set(key, value, mk);
    console.log(`Successfully stored "${key}".`);
  });

program.command('get')
  .description('Get a decrypted value by key')
  .argument('<key>', 'The key to retrieve')
  .option('-k, --key <masterKey>', 'Master key (32 bytes hex)')
  .action((key, options) => {
    const mk = getMasterKey(options, false);
    const value = get(key, mk);
    if (value === null) {
      console.log(`Key "${key}" not found or could not be decrypted.`);
    } else {
      console.log(value);
    }
  });

program.command('remove')
  .description('Remove a stored key')
  .argument('<key>', 'The key to remove')
  .action((key) => {
    remove(key);
    console.log(`Removed "${key}".`);
  });

program.command('list')
  .description('List all stored keys')
  .action(() => {
    const keys = list();
    if (keys.length === 0) {
      console.log('No keys stored.');
    } else {
      console.log(keys.join('\n'));
    }
  });

program.command('export')
  .description('Export stored keys to a JSON file')
  .argument('<destination>', 'The destination file path')
  .action((destination) => {
    try {
      exportData(destination);
      console.log(`Successfully exported data to "${destination}".`);
    } catch (e: any) {
      console.error(`Error exporting data: ${e.message}`);
    }
  });

program.command('import')
  .description('Import stored keys from a JSON file')
  .argument('<source>', 'The source file path')
  .option('-m, --merge', 'Merge with existing keys (overwrites duplicates)')
  .action((source, options) => {
    try {
      importData(source, !!options.merge);
      console.log(`Successfully imported data from "${source}".`);
    } catch (e: any) {
      console.error(`Error importing data: ${e.message}`);
    }
  });

program.command('ui')
  .description('Start the web UI for Local Diamond')
  .option('-p, --port <number>', 'Port to run the UI on', '3000')
  .option('--lang <string>', 'Language of the UI page (en|zh)')
  .option('--default-lang <string>', 'Set the default language for future UI startups (en|zh)')
  .action((options) => {
    if (options.defaultLang) {
      if (!['en', 'zh'].includes(options.defaultLang)) {
        console.error('Error: default-lang must be "en" or "zh".');
        process.exit(1);
      }
      writeDefaultLang(options.defaultLang);
      console.log(`Default language successfully set to "${options.defaultLang}".`);
      if (!options.lang) {
        options.lang = options.defaultLang;
      }
    }

    let languageToUse = options.lang || readDefaultLang() || 'en';
    if (!['en', 'zh'].includes(languageToUse)) {
      languageToUse = 'en';
    }

    startUi(parseInt(options.port, 10), languageToUse);
  });
