# ClinicHub — Frontend

ClinicHub — klinikalar uchun boshqaruv tizimi. Bu repo tizimning **frontend** qismi bo'lib, uchta alohida React ilovadan iborat:

| Ilova | Papka | Kimlar uchun | Port |
|---|---|---|---|
| Admin panel | `/` (`src/`) | Administratorlar | 5173 |
| Patient portal | `patient-portal/` | Bemorlar | 5174 |
| Doctor portal | `doctor-portal/` | Shifokorlar | 5175 |

Backend (Django/DRF) alohida repoda joylashgan. Frontend unga `/api/v1` orqali murojaat qiladi.

## Imkoniyatlar

**Admin panel** — klinikalar, tibbiyot markazlari, shifokorlar, bemorlar, foydalanuvchilar, mutaxassisliklar, rank turlari va narxlari, uchrashuvlar, invoyslar va reytinglarni boshqarish; dashboard.

**Patient portal** — shifokorni topish va profilini ko'rish, uchrashuvga yozilish, retseptlar, Stripe orqali to'lov, shifokor bilan chat, sharhlar, analitika.

**Doctor portal** — uchrashuvlar, ish jadvali, bemorlar, retseptlar, chat, sharhlar va profil.

Interfeys ikki tilda: **o'zbek** va **rus**.

## Texnologiyalar

React 19 · Vite · React Router 7 · Tailwind CSS 4 · Axios · Recharts · lucide-react · Stripe (`@stripe/react-stripe-js`, faqat patient portal)

## Talablar

- Node.js 20+ va npm
- Ishlayotgan ClinicHub backend (default: `http://127.0.0.1:8000`)

## Ishga tushirish

Har bir ilova o'zining `package.json` va `node_modules`iga ega, shuning uchun bog'liqliklar har birida alohida o'rnatiladi.

```bash
# Admin panel (repo ildizida)
npm install
npm run dev            # http://localhost:5173

# Patient portal
cd patient-portal
npm install
npm run dev            # http://localhost:5174

# Doctor portal
cd doctor-portal
npm install
npm run dev            # http://localhost:5175
```

## Muhit o'zgaruvchilari

Har bir ilovadagi `.env.example` faylini `.env` ga nusxalang.

| O'zgaruvchi | Qayerda | Tavsif |
|---|---|---|
| `VITE_API_URL` | uchala ilova | Backend API manzili. Default: `http://127.0.0.1:8000/api/v1` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `patient-portal` | Stripe publishable key (to'lov sahifasi uchun) |

`.env` fayllarini gitga qo'shmang.

## Skriptlar

Har bir ilovada bir xil:

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Build natijasini lokal ko'rish |
| `npm run lint` | ESLint tekshiruvi |

## Loyiha tuzilmasi

```
clinichub_fronted/
├── src/                # Admin panel
│   ├── api/            # axios sozlamasi
│   ├── components/
│   ├── context/        # AuthContext, LangContext
│   ├── i18n/           # uz/ru tarjimalar
│   └── pages/
├── patient-portal/     # Bemorlar portali (alohida Vite loyihasi)
├── doctor-portal/      # Shifokorlar portali (alohida Vite loyihasi)
├── TASKS.md            # Progress jurnali
└── CLAUDE.md           # Ishlash tartibi
```

## Progress

Ish rejasi va bajarilgan ishlar tarixi [`TASKS.md`](./TASKS.md) faylida yuritiladi.

## Litsenziya

[MIT](./LICENSE) © 2026 Olimjon Xikmatullayev
