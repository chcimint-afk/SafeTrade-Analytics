# 🎨 Design Map: SafeTrade Analytics v9
## Система визуального дизайна терминала

---

## 1. Философия дизайна
Интерфейс вдохновлён терминалом **Bloomberg Professional** — тёмный, чёткий, профессиональный. Пользователь должен чувствовать себя как институциональный трейдер на Уолл-стрит.

Три принципа:
- **Глубина:** Тёмный фон + стеклянные панели (glassmorphism)
- **Точность:** Каждый пиксель несёт информацию, никаких украшений
- **Скорость:** Анимации быстрые (200–300ms), не мешают работе

---

## 2. Цветовая палитра (Color Palette)

| Название | HEX / CSS | Где используется |
|---|---|---|
| **Background** | `#0a0a0b` | Основной фон терминала |
| **Surface** | `rgba(255,255,255,0.05)` | Стеклянные панели (glassmorphism) |
| **Border** | `rgba(255,255,255,0.08)` | Границы панелей |
| **Text Primary** | `#ffffff` | Заголовки, цифры |
| **Text Secondary** | `#6b7280` | Подписи, метки |
| **Green (Profit)** | `#22c55e` | Прибыль, статус Safe |
| **Red (Loss)** | `#ef4444` | Убыток, Panic Stop |
| **Amber (Warning)** | `#f59e0b` | Greed Lock, EOD Bypass |
| **Blue (Neutral)** | `#3b82f6` | Alpha Index, Live Feed |
| **Neon Cyan** | `#06b6d4` | Акценты, Whale Flow |

---

## 3. Типографика (Typography)

| Элемент | Шрифт | Размер | Вес |
|---|---|---|---|
| Заголовок терминала | `font-mono` | `text-2xl` | `font-bold` |
| Цифры (NAV, баланс) | `font-mono` | `text-4xl` | `font-bold` |
| Подписи виджетов | `font-sans` | `text-xs` | `font-medium` |
| Кнопки | `font-sans` | `text-sm` | `font-semibold` |
| Лента Audit Log | `font-mono` | `text-xs` | `font-normal` |

---

## 4. Компоненты (UI Components)

### Панель (Glass Card)
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
border-radius: 12px;
```

### Кнопка Danger (Panic Stop)
```css
background: #ef4444;
color: white;
border-radius: 8px;
padding: 8px 16px;
font-weight: 600;
```

### Кнопка Warning (EOD Bypass)
```css
background: #f59e0b;
color: black;
border-radius: 8px;
```

### Индикатор статуса (Badge)
```css
border-radius: 9999px; /* pill shape */
padding: 2px 8px;
font-size: 11px;
font-weight: 600;
```

---

## 5. Структура макета (Layout)

```
┌─────────────────────────────────────────────┐
│  HEADER: Confidence | Portfolio | Panic Stop │
├────────┬────────────────────────────────────┤
│        │                                    │
│SIDEBAR │      MAIN AREA                     │
│        │  (NAV | Alpha | Widgets)            │
│NavItems│                                    │
│        ├────────────────────────────────────┤
│Stealth │  Whale Monitor | Macro Intel       │
│        │                                    │
└────────┴────────────────────────────────────┘
```

---

## 6. Анимации (Animations)

| Элемент | Анимация | Длительность |
|---|---|---|
| Обновление цифр | fade + scale | 200ms |
| Panic Stop активация | background flush red | 300ms |
| Whale Activity лента | slide-in снизу | 250ms |
| Переключение экранов | opacity fade | 200ms |

---

*Design Map создан в рамках Сессии 18. Personal & Educational project.*
