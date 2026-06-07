import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Функция для ручного парсинга .env.local
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Ошибка: Файл .env.local не найден');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  });

  return env;
}

const env = loadEnvLocal();
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Ошибка: NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY отсутствуют в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const email = 'admin@safetrade.com';
  const password = 'SafeTradeAdmin2026!';

  console.log(`Попытка регистрации пользователя ${email} в Supabase (${supabaseUrl})...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin',
      }
    }
  });

  if (error) {
    console.error('Ошибка при регистрации:', error.message);
    process.exit(1);
  }

  console.log('Пользователь успешно зарегистрирован!');
  console.log('Данные пользователя:', data.user);
  console.log('--------------------------------------------------');
  console.log(`Используйте эти данные для входа:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------------------------');
  console.log('Примечание: Если на инстансе Supabase включено подтверждение email,');
  console.log('вам необходимо подтвердить его на почте или отключить "Confirm email" в консоли Supabase Auth.');
}

createAdmin();
