# PyVision — Metallurgiya Zavodi Monitoring Tizimi

Industrial monitoring dashboard — React + Vite + MUI + Redux Toolkit + React Query + Axios

## O'rnatish

```bash
npm install
npm run dev
```

## Sahifalar

| Yo'l | Sahifa | Tavsif |
|------|--------|--------|
| `/` | Dashboard | Asosiy boshqaruv paneli — KPI, sexlar holati, grafiklar |
| `/sexlar` | Sexlar | 6 ta sex kartalar va detail panel |
| `/uchastkalar` | Uchastkalar | DataGrid + karta ko'rinish, filtr |
| `/uskunalar` | Uskunalar | DataGrid + side drawer batafsil |
| `/datchiklar` | Datchiklar | Grid/List ko'rinish, jonli yangilanish (3s) |
| `/kameralar` | Kameralar | Video nazorat, fullscreen dialog |
| `/analitika` | Analitika | Area, Bar, Radar, Pie grafiklar (Recharts) |
| `/ogohlantirishlar` | Ogohlantirishlar | Filtrli ogohlantirish boshqaruvi |

## Arxitektura

```
src/
├── api/          # Axios + fake backend (400-600ms delay simulatsiya)
├── components/
│   ├── common/   # StatusChip, KpiCard, SectionHeader, LiveBadge, ...
│   └── layout/   # Layout, Sidebar, AppBar
├── pages/        # 8 ta sahifa
├── store/        # Redux Toolkit slices (ui, ogohlantirishlar, datchiklar, uskunalar)
├── theme/        # MUI dark industrial theme
└── utils/        # Fake data (sexlar, uchastkalar, uskunalar, datchiklar, kameralar)
```

## Texnologiyalar

- **React 18** + **Vite 5**
- **MUI v6** — industrial dark theme (Orbitron + Rajdhani + Share Tech Mono)
- **Redux Toolkit** — UI state, filterlar
- **React Query v5** — server state, auto-refetch
- **Axios** — API layer (fake interceptor bilan)
- **Recharts** — grafiklar (Line, Bar, Area, Radar, Pie)
- **MUI X DataGrid** — jadvallar
- **React Router v6** — sahifalar

## Fake Data

Haqiqiy API yo'q — `src/utils/fakeData.js` da to'liq fake ma'lumotlar:
- 6 ta sex, 24 ta uchastka, 12 ta uskuna, 12 ta datchik, 7 ta ogohlantirish, 9 ta kamera
- API interceptor 300-500ms kechikish simulatsiya qiladi
- Ba'zi querylar avtomatik yangilanadi (KPI: 5s, datchiklar: 3s, ogohlantirishlar: 5s)
