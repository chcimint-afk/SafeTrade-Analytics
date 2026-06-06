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
    daily_loss_limit NUMERIC DEFAULT -50.00, -- Лимит потерь (1% от стартового баланса)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Таблица Истории сделок
CREATE TABLE IF NOT EXISTS trades (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    asset TEXT NOT NULL,          -- АКТИВ (BTC, GOLD, TSLA, SPUS, WTI)
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

-- Включение защиты RLS на таблицах
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Удаление старых политик доступа (если существуют)
DROP POLICY IF EXISTS "User can read own profile" ON users;
DROP POLICY IF EXISTS "User can view own trades" ON trades;
DROP POLICY IF EXISTS "User can insert own trades" ON trades;

-- Создание новых политик безопасности
CREATE POLICY "User can read own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "User can view own trades" ON trades 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "User can insert own trades" ON trades 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
