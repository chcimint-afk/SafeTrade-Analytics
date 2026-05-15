# Technical Specification: SafeTrade Analytics

## 1. Technology Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS + Framer Motion (для плавной анимации графиков).
- **Icons:** Lucide React.
- **Charts:** Lightweight Charts (by TradingView) — для отрисовки свечей и индикаторов.
- **Data Source:** Binance API или CoinGecko API (для получения цен в реальном времени).

## 2. Architecture
- **State Management:** React Context API (для хранения баланса и текущих сигналов).
- **Signal Engine:** Клиентский скрипт, который каждые 10 секунд запрашивает данные и проверяет условия индикаторов (RSI/EMA).
- **Local Storage:** Сохранение истории сделок пользователя и его настроек риска.

## 3. Security
- Приложение является чисто аналитическим. Оно не требует доступа к ключам биржи (Read-only) и не совершает сделок самостоятельно. Пользователь сам вводит данные в терминал биржи.

---
*Bonus material for Homework 9.*
