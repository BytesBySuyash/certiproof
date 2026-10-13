import { config } from 'dotenv';
import { createInterface } from 'node:readline/promises';
import { setEnvironment } from './env-file';

config({ path: '.env.local', quiet: true });

type Setting = {
  env: string;
  label: string;
  secret?: boolean;
  defaultValue?: string;
  validate(value: string): string | undefined;
};

function required(value: string) {
  return value.trim() ? undefined : 'A value is required.';
}

const settings: Record<string, Setting> = {
  'project-url': {
    env: 'NEXT_PUBLIC_SUPABASE_URL',
    label: 'Supabase Project URL',
    validate(value) {
      try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) {
          return 'Use the HTTPS Project URL ending in .supabase.co.';
        }
      } catch {
        return 'Enter a valid URL, such as https://your-project.supabase.co.';
      }
    },
  },
  'publishable-key': {
    env: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    label: 'Supabase Publishable Key',
    validate: required,
  },
  'secret-key': {
    env: 'SUPABASE_SECRET_KEY',
    label: 'Supabase Secret Key',
    secret: true,
    validate: required,
  },
  'migration-url': {
    env: 'DIRECT_URL',
    label: 'Supabase Session Pooler URL (port 5432)',
    secret: true,
    validate(value) {
      if (/\[[^\]]*\]/.test(value)) {
        return 'Remove square brackets from the password and URL-encode reserved characters.';
      }
      try {
        const url = new URL(value);
        if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
          return 'Use a postgres:// or postgresql:// connection string.';
        }
        if (!url.password) return 'The connection string must include the database password.';
        if (url.port && url.port !== '5432') return 'Use the session pooler URL on port 5432.';
      } catch {
        return 'Enter the complete session pooler connection string.';
      }
    },
  },
  'operator-email': {
    env: 'OPERATOR_EMAIL',
    label: 'Operator Email',
    validate(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Enter a valid email address.';
    },
  },
  'app-origin': {
    env: 'APP_ORIGIN',
    label: 'Public App Origin',
    defaultValue: 'http://localhost:3000',
    validate(value) {
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/') {
          return 'Enter an origin only, such as https://certiproof.vercel.app.';
        }
      } catch {
        return 'Enter a valid origin, such as http://localhost:3000.';
      }
    },
  },
};

async function hidden(label: string, existing?: string) {
  if (!process.stdin.isTTY) throw Error('Use an interactive terminal.');
  process.stdout.write(`${label}${existing ? ' (Enter preserves existing)' : ''}: `);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise<string>((resolve, reject) => {
    let value = '';
    const listener = (buffer: Buffer) => {
      for (const character of buffer.toString()) {
        if (character === '\u0003') {
          end();
          reject(Error('Cancelled'));
          return;
        }
        if (character === '\r' || character === '\n') {
          end();
          resolve(value || existing || '');
          return;
        }
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character >= ' ') value += character;
      }
    };
    function end() {
      process.stdin.off('data', listener);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    }
    process.stdin.on('data', listener);
  });
}

function showStatus() {
  for (const [alias, setting] of Object.entries(settings)) {
    console.log(`${alias.padEnd(16)} ${process.env[setting.env] ? 'SET' : 'MISSING'}`);
  }
}

function showHelp() {
  console.log('Save one local setting at a time:');
  console.log('  npm run configure -- <name>');
  console.log('  npm run configure -- --status');
  console.log(`Names: ${Object.keys(settings).join(', ')}`);
  console.log('Values are saved in gitignored .env.local. Secret input is hidden.');
}

async function main() {
  if (process.argv.includes('--status')) {
    showStatus();
    return;
  }
  const setIndex = process.argv.indexOf('--set');
  const alias = setIndex >= 0
    ? process.argv[setIndex + 1]
    : process.argv.slice(2).find((argument) => !argument.startsWith('-'));
  if (!alias || process.argv.includes('--help')) {
    showHelp();
    return;
  }
  const setting = settings[alias];
  if (!setting) throw Error(`Unknown setting "${alias}". Run with --help to list valid names.`);

  const existing = process.env[setting.env];
  let value: string;
  if (setting.secret) {
    value = await hidden(setting.label, existing);
  } else {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    value = await rl.question(`${setting.label}${existing ? ' (Enter preserves existing)' : ''}: `);
    rl.close();
    value ||= existing || setting.defaultValue || '';
  }

  const error = setting.validate(value);
  if (error) throw Error(error);
  await setEnvironment({ [setting.env]: value });
  console.log(`${setting.env} saved in .env.local.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Configuration was not completed.');
  process.exitCode = 1;
});
