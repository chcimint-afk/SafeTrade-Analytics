-- ====================================================================
-- SafeTrade Analytics - База Данных PostgreSQL (Supabase)
-- ====================================================================

-- 1. Таблица Пользователей и Балансов
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    starting_balance NUMERIC DEFAULT 5000.00,
    current_balance NUMERIC DEFAULT 5000.00,
    compounding_status BOOLEAN DEFAULT TRUE,
    daily_loss_limit NUMERIC DEFAULT -1.00, -- Лимит потерь (1% от стартового баланса)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Таблица Истории сделок
CREATE TABLE IF NOT EXISTS trades (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    asset TEXT NOT NULL,          -- АКТИВ (BTC, ETH, GOLD, TSLA, SPUS, EURUSD, NDX)
    direction TEXT NOT NULL,      -- НАПРАВЛЕНИЕ (BUY/SELL)
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    stop_loss NUMERIC NOT NULL,   -- Скрытый Стелс-Стоп в памяти сервера
    take_profit NUMERIC NOT NULL,
    profit_loss NUMERIC,          -- Финансовый результат (чистая прибыль/убыток)
    slippage NUMERIC DEFAULT 0.00 -- Проскальзывание в процентах
);

-- 3. Таблица Системных Логов и Событий Безопасности
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    event_type TEXT NOT NULL,     -- EOD_HALT, CIRCUIT_BREAKER, API_ERROR
    details TEXT NOT NULL
);

-- ====================================================================
-- Настройка безопасности Row Level Security (RLS)
-- ====================================================================

-- Включение защиты RLS на ВСЕХ таблицах
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Удаление старых политик доступа (идемпотентное применение)
-- ====================================================================
DROP POLICY IF EXISTS "User can read own profile" ON users;
DROP POLICY IF EXISTS "User can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Service role can update users" ON users;

DROP POLICY IF EXISTS "User can view own trades" ON trades;
DROP POLICY IF EXISTS "User can insert own trades" ON trades;
DROP POLICY IF EXISTS "Service role can insert trades" ON trades;

DROP POLICY IF EXISTS "Service role can insert logs" ON system_logs;
DROP POLICY IF EXISTS "Service role can read logs" ON system_logs;

-- ====================================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ users
-- ====================================================================

-- Чтение: пользователь читает только свой профиль
CREATE POLICY "User can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Обновление: пользователь обновляет только свой профиль (current_balance и т.д.)
CREATE POLICY "User can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT через Service Role: API-маршруты регистрации пользователей
-- (Используется при первом создании пользователя через Service Role Key)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- UPDATE через Service Role: обновление баланса и компаундинга из API
CREATE POLICY "Service role can update users" ON users
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ====================================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ trades
-- ====================================================================

-- SELECT: пользователь видит только свои сделки
CREATE POLICY "User can view own trades" ON trades
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT: пользователь создаёт сделки только для себя
CREATE POLICY "User can insert own trades" ON trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- INSERT через Service Role: API-маршруты создания сделок на сервере
CREATE POLICY "Service role can insert trades" ON trades
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ====================================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ system_logs
-- ====================================================================

-- INSERT: только Service Role может писать логи (безопасность)
CREATE POLICY "Service role can insert logs" ON system_logs
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- SELECT: только Service Role читает логи (Admin-only)
CREATE POLICY "Service role can read logs" ON system_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- ====================================================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON system_logs(event_type);
