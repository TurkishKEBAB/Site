# Portfolio Refactor — Master Plan
**Proje:** yigitokur.me  
**Tarih:** 2026-03-12  
**Branch:** `feat/refactor` (Faz 0–1 için mevcut branch üzerinden, Faz 2+ için `feat/nextjs-rewrite`)  
**Durum:** Planlama tamamlandı — implementasyon başlamadı

> Bu dosya tüm teknik ve mimari kararların **tek kaynağı**dır.  
> Copilot veya diğer AI araçları implementasyon yaparken bu dosyayı context olarak almalı, yeniden plan üretmemeli.  
> Her faz tamamlandığında ilgili checkbox'lar işaretlenir, "Durum" satırı güncellenir.

---

## İçindekiler

1. [Kararlar Özeti](#1-kararlar-özeti)
2. [Mevcut Durum Tespiti](#2-mevcut-durum-tespiti)
3. [Mimari Hedef](#3-mimari-hedef)
4. [Design System](#4-design-system)
5. [Faz 0 — Security Hardening](#5-faz-0--security-hardening-backend)
6. [Faz 1 — Alembic + Backend Quality](#6-faz-1--alembic--backend-quality)
7. [Faz 2 — Next.js 15 Kurulum](#7-faz-2--nextjs-15-kurulum)
8. [Faz 3 — Design System & Core Components](#8-faz-3--design-system--core-components)
9. [Faz 4 — Sayfa Implementasyonu](#9-faz-4--sayfa-implementasyonu)
10. [Faz 5 — Testing & CI/CD](#10-faz-5--testing--cicd)
11. [AI Araç Rehberi](#11-ai-araç-rehberi)
12. [Dosya Referans Haritası](#12-dosya-referans-haritası)
13. [Verification Checklist](#13-verification-checklist)

---

## 1. Kararlar Özeti

| Alan | Eski | Yeni | Karar Gerekçesi |
|---|---|---|---|
| **Frontend Framework** | React 18 + Vite SPA | **Next.js 15 App Router** | SSG/ISR = SEO, portfolio sayfaları statik generate edilir, Vercel native |
| **UI Library** | Tailwind + custom | **shadcn/ui** + custom motion | Solid accessible primitives + tam görsel kontrol |
| **Design Aesthetic** | Mevcut (eksik/tutarsız) | **Dark minimalist tech + subtle gradients + refined motion** | Premium engineering portfolio hissi |
| **Accent Renk** | Mavi (#3B82F6) | **Cyan #06b6d4** (Tailwind `cyan-400`) | Tech/cloud vibe, dark bg ile güçlü kontrast |
| **Font** | Arial/system | **Geist Sans** (body) + **JetBrains Mono** (kod) | Zero layout shift (Next.js native), techy karakter |
| **Animasyon** | Framer Motion (var ama tutarsız) | **Framer Motion** — yeniden yapılandırılmış, performans-first | `{once: true}` viewport triggers, reduced-motion support |
| **Backend Framework** | FastAPI (kalıyor) | **FastAPI** (aynı) | Solid, async, Pydantic v2 uyumlu — değiştirme gereği yok |
| **ORM** | SQLAlchemy 2 sync | **SQLAlchemy 2 sync** (aynı) + **Alembic** migration | Alembic zaten requirements.txt'te var ama wire edilmemiş |
| **Migration** | Raw SQL dump | **Alembic** versioned migrations | Reproducible schema, CI/CD'ye entegre |
| **Test Hedefi** | Backend ≥80%, Frontend eksik | **Backend ≥90%, Frontend ≥90%** | Production confidence + CI gate |
| **i18n** | Custom LanguageContext + /translations API | **Mevcut context taşınır** (next-intl opsiyonel, Phase 4'te karar verilir) | API zaten var, gereksiz yeniden yazma önlenir |
| **Auth** | JWT localStorage | **JWT localStorage korunur** (mevcut `AuthContext` Next.js providers'a taşınır) | httpOnly cookie migration sonraki iterasyon |
| **State** | React Query v5 | **TanStack Query v5** (Next.js'te devam) | Client-side data fetching için yeterli |

---

## 2. Mevcut Durum Tespiti

### Backend — Sorunlar
```
portfolio-project/backend/app/
├── config.py          ⚠️  production_validation_errors(): KNOWN_INSECURE_KEYS kontrolü eksik
├── services/
│   └── email_service.py  ✅  html.escape() + urllib.parse.quote() ZATEN UYGULANMIŞ
├── database.py        ⚠️  Alembic yok, init_db() ile Base.metadata.create_all() kullanılıyor
├── api/v1/
│   └── auth.py        ✅  is_admin field /me endpoint response'unda mevcut
└── tests/             ⚠️  coverage ~%80, %90 hedefi için eksikler var
```

### Frontend — Sorunlar
```
portfolio-project/frontend/
├── React 18 + Vite SPA    ❌  SSG/SSR yok → SEO zayıf
├── src/pages/Home.tsx     ⚠️  i18n strings inline hardcoded (t() kullanılmıyor)
├── src/App.tsx            ⚠️  ErrorBoundary import var ama route'lara sarılmamış
├── src/components/
│   └── ProtectedRoute.tsx ✅  requireAdmin prop mevcut
└── UI/UX                  ❌  Tutarsız, "berbat görünüm" — komple yeniden yazılacak
```

### Alembic Durumu
```
backend/requirements.txt:
  alembic>=1.12.1,<2.0.0  ← paket var ama backend/ içinde alembic/ dizini yok
  → alembic init yapılmamış
```

---

## 3. Mimari Hedef

```
Site/
├── .github/workflows/          ← CI/CD (güncellenecek)
└── portfolio-project/
    ├── backend/                 ← FastAPI (mevcut, Alembic ekleniyor)
    │   ├── alembic/             ← YENİ: migrations dizini
    │   │   ├── env.py
    │   │   ├── script.py.mako
    │   │   └── versions/
    │   │       └── 0001_initial_schema.py
    │   ├── alembic.ini          ← YENİ
    │   └── app/
    │       └── ...              ← mevcut yapı korunur
    └── frontend/                ← TAM REWRITE: Next.js 15 App Router
        ├── app/
        │   ├── layout.tsx        ← root layout: fonts, providers, theme
        │   ├── (public)/         ← route group: public sayfalar
        │   │   ├── page.tsx      ← Home
        │   │   ├── about/page.tsx
        │   │   ├── projects/
        │   │   │   ├── page.tsx  ← listing (ISR)
        │   │   │   └── [slug]/page.tsx ← detail (ISR)
        │   │   ├── blog/
        │   │   │   ├── page.tsx  ← listing (ISR)
        │   │   │   └── [slug]/page.tsx ← detail (ISR)
        │   │   └── contact/page.tsx    ← "use client" (form)
        │   ├── (protected)/      ← route group: auth gerekli
        │   │   └── admin/
        │   │       ├── layout.tsx ← auth guard
        │   │       └── page.tsx
        │   ├── login/page.tsx    ← "use client"
        │   ├── not-found.tsx
        │   └── error.tsx         ← ErrorBoundary (Next.js native)
        ├── components/
        │   ├── ui/               ← shadcn/ui generated components
        │   ├── layout/           ← Navigation, Footer, Layout
        │   ├── sections/         ← Hero, Skills, FeaturedProjects, CTA
        │   └── admin/            ← Admin panel components
        ├── lib/
        │   ├── api.ts            ← Axios instance (taşınır)
        │   └── utils.ts          ← cn() + diğer helpers
        ├── contexts/             ← AuthContext, LanguageContext (taşınır)
        ├── hooks/                ← useProjects, useSkills vb. (taşınır)
        ├── services/             ← domain API calls (taşınır)
        ├── providers.tsx         ← QueryClientProvider + Auth + Language wrapper
        ├── tailwind.config.ts    ← custom tokens
        ├── next.config.ts
        └── package.json
```

### Next.js Rendering Stratejisi

| Sayfa | Strateji | Revalidate |
|---|---|---|
| `/` (Home) | SSG + ISR | 3600s |
| `/about` | SSG (statik) | — |
| `/projects` | ISR | 3600s |
| `/projects/[slug]` | ISR | 3600s |
| `/blog` | ISR | 1800s |
| `/blog/[slug]` | ISR | 1800s |
| `/contact` | Client Component | — |
| `/login` | Client Component | — |
| `/admin` | Client Component (protected) | — |

---

## 4. Design System

### Renk Paleti

```css
/* globals.css — CSS variables */
:root {
  --background: #09090b;          /* zinc-950 */
  --foreground: #fafafa;           /* zinc-50 */
  --card: #18181b;                 /* zinc-900 */
  --card-foreground: #fafafa;
  --border: #27272a;               /* zinc-800 */
  --input: #27272a;
  --muted: #3f3f46;                /* zinc-700 */
  --muted-foreground: #a1a1aa;    /* zinc-400 */

  /* Primary: Cyan */
  --primary: #06b6d4;              /* cyan-500 */
  --primary-hover: #0891b2;        /* cyan-600 */
  --primary-subtle: #164e63;       /* cyan-950 */
  --primary-glow: rgba(6,182,212,0.15);

  /* Accent gradients */
  --gradient-hero: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
  --gradient-card: linear-gradient(145deg, #18181b 0%, #09090b 100%);
}
```

### Typography

```ts
// next/font — layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'Menlo', 'monospace'],
}
```

### shadcn/ui Initialization

```bash
# Next.js projesinde çalıştır
npx shadcn@latest init
# → style: default
# → base color: zinc
# → CSS variables: yes
# → components.json oluşturulur
```

**Kullanılacak shadcn/ui Bileşenleri:**
- `button` — CTA, form submit, nav actions
- `card` — proje kartları, skill grupları, blog kaydı
- `badge` — technology tag'leri, featured/status label'ları
- `dialog` / `sheet` — admin modal CRUD formları, mobile nav
- `tabs` — admin panel section'ları
- `form` + `input` + `textarea` — contact form, admin forms
- `navigation-menu` — desktop navbar
- `separator` — layout dividers
- `avatar` — admin header
- `data-table` (tanstack table + shadcn) — admin project/blog listesi
- `skeleton` — loading placeholders

### Animasyon Prensipleri

```ts
// lib/motion.ts — paylaşılan animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
}

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export const cardHover = {
  rest: { scale: 1, rotateX: 0, rotateY: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
}
```

**Kurallar:**
- Tüm `motion.div` viewport trigger'larında `{once: true}` kullan
- `prefers-reduced-motion` için `useReducedMotion()` hook'u tüm animasyonlarda kontrol edilecek
- Smooth scroll: `scroll-behavior: smooth` sadece `@media (prefers-reduced-motion: no-preference)` altında
- Animasyon sürüm max 600ms; complex sequences max 1000ms

---

## 5. Faz 0 — Security Hardening (Backend)

**Branch:** mevcut feature branch  
**Bağımlılık:** yok — bağımsız, hemen başlanabilir  
**Hedef dosyalar:** `backend/app/config.py`, `backend/tests/test_config.py`

> **NOT:** `email_service.py` — `html.escape()` ve `urllib.parse.quote()` **ZATEN UYGULANMIŞ**.  
> `ProtectedRoute.tsx` + `AuthContext.tsx` — `is_admin` / `requireAdmin` **ZATEN UYGULANMIŞ**.  
> Faz 0'da tek kalan iş config.py ve test.

### 5.1 config.py — KNOWN_INSECURE_KEYS

**Dosya:** `portfolio-project/backend/app/config.py`  
**Metod:** `production_validation_errors()` içine ekle

```python
# Mevcut 32-char kontrolünün ALTINA ekle
KNOWN_INSECURE_KEYS = [
    "dev-secret-key-change-in-production",
    "changeme",
    "secret",
    "password",
    "12345",
]
if any(k in self.SECRET_KEY.lower() for k in KNOWN_INSECURE_KEYS):
    errors.append(
        "SECRET_KEY contains a known insecure default value. "
        "Generate a strong random key: python -c \"import secrets; print(secrets.token_hex(32))\""
    )
```

### 5.2 test_config.py — Insecure Key Testi

**Dosya:** `portfolio-project/backend/tests/test_config.py`

```python
def test_production_validation_rejects_known_insecure_key():
    """production_validation_errors should flag known insecure SECRET_KEY values."""
    from app.config import Settings
    s = Settings(
        DATABASE_URL="postgresql://x:x@localhost/x",
        SECRET_KEY="dev-secret-key-change-in-production",
        SMTP_USERNAME="x@x.com",
        SMTP_PASSWORD="pass",
        ENVIRONMENT="production",
        FRONTEND_URL="https://yigitokur.me",
        CAPTCHA_ENABLED=True,
        CAPTCHA_SECRET_KEY="real-captcha-key",
    )
    errors = s.production_validation_errors()
    assert any("insecure default" in e.lower() for e in errors)
```

### 5.3 App.tsx — ErrorBoundary

**Dosya:** `portfolio-project/frontend/src/App.tsx`  
`<Suspense>` bloğunu `<ErrorBoundary>` ile sar:

```tsx
import ErrorBoundary from './components/ErrorBoundary'

// Routes içinde:
<ErrorBoundary>
  <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* ... */}
    </Routes>
  </Suspense>
</ErrorBoundary>
```

**NOT:** Bu mevcut React app'te yapılır. Next.js'e geçince `app/error.tsx` native ErrorBoundary olarak devreye girer, bu dosya silinir.

### Faz 0 Tamamlama Kriterleri
- [ ] `python -m pytest backend/tests/test_config.py -v` — tüm testler geçiyor
- [ ] `production_validation_errors` insecure key'i reddediyor
- [ ] App.tsx ErrorBoundary sarılı

---

## 6. Faz 1 — Alembic + Backend Quality

**Branch:** mevcut feature branch  
**Bağımlılık:** Faz 0'dan bağımsız, paralel ilerleyebilir  
**Çalışma dizini:** `portfolio-project/backend/`

### 6.1 Alembic Init

```powershell
cd portfolio-project/backend
# venv aktif olmalı
alembic init alembic
```

Bu komut şunu oluşturur:
```
backend/
├── alembic.ini        ← sqlalchemy.url buradan okunur
└── alembic/
    ├── env.py
    ├── script.py.mako
    └── versions/       ← boş
```

### 6.2 alembic.ini Konfigürasyonu

`sqlalchemy.url` satırını yorum satırına al — env.py'den dinamik okunacak:

```ini
# alembic.ini
[alembic]
script_location = alembic
file_template = %%(year)d%%(month).2d%%(day).2d_%%(rev)s_%%(slug)s
truncate_slug_length = 40
# sqlalchemy.url = ...  ← COMMENT OUT
```

### 6.3 alembic/env.py Konfigürasyonu

```python
# alembic/env.py — tam içerik
import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# app/ dizinini sys.path'e ekle
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.database import Base

# Tüm modeller import edilmeli ki Alembic table'ları görsün
import app.models.auth          # noqa: F401
import app.models.blog          # noqa: F401
import app.models.contact       # noqa: F401
import app.models.experience    # noqa: F401
import app.models.project       # noqa: F401
import app.models.skill         # noqa: F401
import app.models.technology    # noqa: F401
import app.models.user          # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 6.4 Initial Migration Oluşturma

```powershell
# PostgreSQL ayakta olmalı (docker-compose up -d)
cd portfolio-project/backend
alembic revision --autogenerate -m "initial_schema"
# → alembic/versions/<timestamp>_initial_schema.py oluşur
```

Generated migration dosyasını `database/migrations/01_portfolio_db_schema.sql` ile karşılaştırarak doğrula. Eksik tablo/kolon varsa elle düzelt.

### 6.5 database.py Güncelleme

`init_db()` fonksiyonu artık sadece test/development ortamlarında kullanılacak. Production'da `alembic upgrade head` kullanılır.

```python
# database.py — init_db() fonksiyonunu güncelle
def init_db():
    """
    Initialize database tables — ONLY for testing/dev.
    Production: use alembic upgrade head.
    """
    import os
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise RuntimeError("init_db() must not be called in production. Use alembic upgrade head.")
    Base.metadata.create_all(bind=engine)
```

### 6.6 Backend Test Coverage — %90 Hedefi

Mevcut test dosyaları:
```
tests/
├── conftest.py
├── test_admin_stats.py
├── test_auth.py
├── test_blog.py
├── test_config.py       ← Faz 0'da güncellendi
├── test_contact_messages.py
├── test_experiences.py
├── test_github.py
├── test_projects_admin.py
├── test_skills.py
├── test_system_health.py
├── test_technologies.py
└── test_translations.py
```

Gap analizi için çalıştır:
```powershell
cd portfolio-project
python -m pytest --cov=app.api.v1 --cov=app.crud --cov=app.api.deps --cov-report=term-missing -q
```

**Kritik eksik test alanları (tahmin — coverage çıktısından doğrula):**
- `app.api.deps` — `require_admin` rejection (403) path
- `app.crud.token` — blacklist logic
- `app.services.email_service` — SMTP hata senaryosu
- `app.services.captcha_service` — provider validation

### 6.7 conftest.py — SQLite Uyumluluk Notu

Test'ler SQLite in-memory kullanır. `UUID` ve `INET` type'lar SQLite'ta farklı davranır. Mevcut conftest'te bu zaten patch'lenmiş durumdadır. Yeni testler yazarken sorunu tetikleyecek native PostgreSQL tiplerinden kaçın.

### Faz 1 Tamamlama Kriterleri
- [ ] `alembic upgrade head` PostgreSQL'de hatasız çalışıyor
- [ ] `alembic revision --autogenerate` çalıştırıldığında "No changes detected" dönüyor (schema sync)
- [ ] `python -m pytest --cov -q` → `app.api.v1`, `app.crud`, `app.api.deps` üçünde ≥%90
- [ ] Production ortamında `init_db()` çağrısı RuntimeError fırlatıyor

---

## 7. Faz 2 — Next.js 15 Kurulum

**Branch:** `feat/nextjs-rewrite` (yeni branch)  
**Bağımlılık:** Faz 0–1'den bağımsız, paralel başlatılabilir  
**Çalışma dizini:** `portfolio-project/`

### 7.1 Mevcut Frontend'i Arşivle

```powershell
# Mevcut frontend'i yedekle — silme, referans olarak kalacak
Rename-Item portfolio-project/frontend portfolio-project/frontend-legacy
```

### 7.2 Next.js 15 Projesi Oluştur

```powershell
cd portfolio-project
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Seçenekler (interactive prompt'ta):**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Turbopack: Yes (dev için)
- Import alias: `@/*` (default)

### 7.3 Bağımlılık Kurulumu

```powershell
cd portfolio-project/frontend
npm install framer-motion axios @tanstack/react-query react-hook-form react-icons
npm install geist
# shadcn/ui komponentler tek tek eklenir (Faz 3'te)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest @vitest/coverage-v8 jsdom
```

### 7.4 next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ]
  },
}

export default nextConfig
```

### 7.5 Environment Variables

**`frontend/.env.local` (development):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**`frontend/.env.example`:**
```env
# Required: Backend API base URL
NEXT_PUBLIC_API_BASE_URL=https://api.yigitokur.me/api/v1
```

**`frontend/.env.production` (Vercel'de env var olarak set edilir):**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yigitokur.me/api/v1
```

### 7.6 tailwind.config.ts — Tam Konfigürasyon

```typescript
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#06b6d4',    // cyan-500
          hover:   '#0891b2',    // cyan-600
          subtle:  '#164e63',    // cyan-950
          glow:    'rgba(6,182,212,0.15)',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6,182,212,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(6,182,212,0.25)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### 7.7 app/layout.tsx — Root Layout

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from '@/providers'

export const metadata: Metadata = {
  title: { default: 'Yiğit Okur', template: '%s | Yiğit Okur' },
  description: 'Software Engineer — Cloud & DevOps focused. Portfolio of projects, blog, and open-source work.',
  metadataBase: new URL('https://yigitokur.me'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yigitokur.me',
    siteName: 'Yiğit Okur',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### 7.8 providers.tsx

```tsx
// src/providers.tsx — "use client"
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ToastProvider } from '@/components/ui/toast-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
```

### Faz 2 Tamamlama Kriterleri
- [ ] `npm run build` → Next.js build hatasız tamamlanıyor
- [ ] `npm run dev` → `http://localhost:3000` açılıyor
- [ ] Root layout, fonts, dark mode CSS variables çalışıyor
- [ ] `NEXT_PUBLIC_API_BASE_URL` tanımlanmadan build hata veriyor

---

## 8. Faz 3 — Design System & Core Components

**Branch:** `feat/nextjs-rewrite`  
**Bağımlılık:** Faz 2 tamamlanmış olmalı

### 8.1 shadcn/ui Kurulum ve Bileşenler

```powershell
cd portfolio-project/frontend
npx shadcn@latest add button card badge dialog sheet tabs form input textarea \
  navigation-menu separator avatar skeleton data-table
```

**ÖNEMLI:** shadcn/ui bileşenlerini `src/components/ui/` dizinine kopyalar. Bu dosyalar projenin parçasına girer, `node_modules`'da değildir — özelleştirilebilir.

### 8.2 Navigation Komponenti

**Dosya:** `src/components/layout/Navigation.tsx`

Davranış:
- Scroll'da sticky + `backdrop-blur-md bg-background/80 border-b border-border/40`
- Desktop: shadcn/ui `NavigationMenu` — yatay link listesi
- Mobile: `Sheet` komponenti — hamburger ikonu ile açılan yan panel
- Aktif route: `cn()` ile `text-primary` class
- Dil switcher: mevcut LanguageContext'e bağlı EN/TR toggle

### 8.3 Hero Section

**Dosya:** `src/components/sections/Hero.tsx` — "use client" (animasyon)

Yapı:
1. **Üst etiket:** `<Badge>Available for opportunities</Badge>` — subtle cyan border
2. **İsim:** `Yiğit Okur` — büyük heading, kelime kelime `motion.span` ile reveal
3. **Rol:** Typewriter effect — `framer-motion` + karakterleri sırayla render
4. **Açıklama:** fade-in paragraph
5. **CTA butonlar:** shadcn/ui `Button` — "View Projects" (primary) + "Get In Touch" (outline)
6. **Sosyal linkler:** GitHub, LinkedIn, Mail ikonları — `react-icons/fi`
7. **Arkaplan:** Subtle animated grid + radial gradient cyan glow (`via-primary/5`)

```tsx
// Arkaplan: CSS + subtle JS
<div className="absolute inset-0 -z-10">
  {/* Grid pattern */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
  {/* Radial gradient */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.08),transparent)]" />
</div>
```

### 8.4 Project Card Komponenti

**Dosya:** `src/components/ProjectCard.tsx`

Props:
```typescript
interface ProjectCardProps {
  title: string
  description: string
  technologies: { name: string; color?: string }[]
  githubUrl?: string
  demoUrl?: string
  coverImage?: string
  featured?: boolean
  slug: string
}
```

Davranış:
- shadcn/ui `Card` tabanı
- Hover: subtle scale(1.02) + top border'da cyan glow
- Tech badge'leri: küçük `Badge` variant="outline" — overflow durumunda "+N more"
- featured=true ise üst köşede `Badge` — "Featured"
- Cover image: Next.js `<Image>` — lazy load, `object-cover`

### 8.5 Footer

**Dosya:** `src/components/layout/Footer.tsx`

Minimal: copyright + navigation linkleri + sosyal ikonlar. Çok detaylı olmasın.

### 8.6 Shared Motion Variants

**Dosya:** `src/lib/motion.ts`

```typescript
import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

// Tüm animasyonlarda kullanım:
// const shouldAnimate = !useReducedMotion()
// <motion.div variants={shouldAnimate ? fadeInUp : undefined}>
```

### Faz 3 Tamamlama Kriterleri
- [ ] shadcn/ui bileşenleri `src/components/ui/` altında mevcut
- [ ] Navigation: desktop + mobile (Sheet) çalışıyor, aktif route highlight ediliyor
- [ ] Hero section render oluyor, animasyonlar çalışıyor
- [ ] ProjectCard bileşeni Storybook olmasa da izole test edildi (görsel kontrol)
- [ ] `npm run build` hatasız

---

## 9. Faz 4 — Sayfa Implementasyonu

**Branch:** `feat/nextjs-rewrite`  
**Bağımlılık:** Faz 3 tamamlanmış olmalı

### 9.1 API Layer — lib/api.ts

Mevcut `services/api.ts` Next.js'e taşınır. Değişiklikler:
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
- `localStorage` → Server Components'ta kullanılamaz; Client Components'ta kalır

```typescript
// src/lib/api.ts
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required')
}

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })
// ... interceptors (mevcut logic aynen taşınır)
export default api
```

### 9.2 Home Page — `app/(public)/page.tsx`

```
Sections (yukarıdan aşağıya):
1. <Hero /> — tam ekran, animasyonlu
2. <FeaturedProjects /> — ISR data, max 3 proje
3. <Skills /> — ISR data, kategori grupları
4. <CTA /> — "Let's build together" + iletişim butonları
```

**Rendering:**
```typescript
// ISR
export const revalidate = 3600

// Server Component — data fetching
async function getFeaturedProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects?featured_only=true&limit=3`, {
    next: { revalidate: 3600 }
  })
  return res.json()
}
```

### 9.3 Projects Page — `app/(public)/projects/page.tsx`

- Server Component + ISR
- Client-side filtering için `useSearchParams` hook'lu `ProjectFilters` ("use client") alt bileşeni
- Teknoloji filter dropdown: shadcn/ui Select
- Sayfalama: shadcn/ui butonlar

### 9.4 Blog Page — `app/(public)/blog/page.tsx`

- Server Component + ISR
- Blog kartları: tarih, kısa özet, okuma süresi
- `blog/[slug]/page.tsx`: `react-markdown` + `rehype-highlight` → Shiki ile değiştir (daha iyi syntax highlighting)

```powershell
npm install shiki
```

### 9.5 Contact Page — `app/(public)/contact/page.tsx`

"use client" — form interaktif.

- shadcn/ui `Form` + `react-hook-form`
- Cloudflare Turnstile: `@marsidev/react-turnstile` (mevcut paket)
- Submit → backend `/api/v1/contact/`
- Başarı/hata: Toast notification

### 9.6 Login Page — `app/login/page.tsx`

"use client"

- shadcn/ui `Card` içinde minimal form
- Submit → mevcut `AuthContext.login()` çağrısı
- Başarılı giriş → `/admin`'e redirect

### 9.7 Admin — Korumalı Layout

**Dosya:** `app/(protected)/admin/layout.tsx`

```tsx
// "use client"
export default function AdminLayout({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [isAuthenticated, isAdmin, isLoading])

  if (isLoading) return <AdminSkeleton />
  if (!isAuthenticated || !isAdmin) return null
  return <AdminShell>{children}</AdminShell>
}
```

**Admin Dashboard Yapısı (`app/(protected)/admin/page.tsx`):**
```
AdminShell (sidebar layout)
├── Sidebar: Projects / Blog / Skills / Experiences / Messages / GitHub Sync
└── Main area:
    ├── /admin             → Stats overview
    ├── /admin/projects    → DataTable + Add/Edit/Delete modal
    ├── /admin/blog        → DataTable + Markdown editor
    ├── /admin/skills      → Grouped list + Add/Edit
    ├── /admin/experiences → Timeline list + Add/Edit
    └── /admin/messages    → Contact messages list + mark-read
```

**Admin DataTable:** TanStack Table v8 + shadcn/ui `data-table` pattern kullanılır.

### 9.8 i18n — LanguageContext Geçiş Kararı

Mevcut `LanguageContext` React Context pattern'ı Next.js'e aynen taşınır.  
`next-intl` **kullanılmaz** (backend `/translations` API yeterlI, yeniden yazma gerek yok).

Değişiklik:
- Context'i `providers.tsx`'e taşı
- `useLanguage()` hook'u tüm client components'ta çalışmaya devam eder
- Server Components: `lang` parametresini API fetch URL'sine ekle (default: `en`)

### 9.9 app/error.tsx — ErrorBoundary

```tsx
// app/error.tsx — "use client"
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <button onClick={reset} className="text-primary hover:underline text-sm">Try again</button>
    </div>
  )
}
```

### 9.10 not-found.tsx

Minimal 404 sayfası — "Page not found" + home link + animasyonlu.

### Faz 4 Tamamlama Kriterleri
- [ ] Tüm public sayfalar (Home, About, Projects, Blog, BlogDetail, Contact) render oluyor
- [ ] ISR çalışıyor — `next/cache` revalidate header'ları doğru
- [ ] Admin login → JWT alınıyor → admin panel açılıyor
- [ ] Admin CRUD: proje ekleme, düzenleme, silme çalışıyor
- [ ] Contact form submit → email gönderiliyor (backend log'da görünmeli)
- [ ] Dil switcher EN↔TR çalışıyor

---

## 10. Faz 5 — Testing & CI/CD

**Branch:** `feat/nextjs-rewrite`  
**Bağımlılık:** Faz 4 tamamlanmış olmalı

### 10.1 Frontend Test Kurulum

**`vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/components/ui/**', 'src/test/**'],
      thresholds: { lines: 90, functions: 90, branches: 85 },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

**`src/test/setup.ts`:**
```typescript
import '@testing-library/jest-dom'
// MSW setup (opsiyonel — API mock için)
```

**Test edilecek kritik alanlar:**
- `AuthContext` — login, logout, token refresh
- `LanguageContext` — dil değişimi
- `Navigation` — active route highlight, mobile menu
- `ContactForm` — validation, submit, error handling
- `ProtectedRoute/AdminLayout` — redirect davranışı
- API hooks (`useProjects`, `useSkills` vb.) — mock API responses

### 10.2 CI/CD Güncellemeleri

**`.github/workflows/ci.yml` — Frontend Quality job güncellemesi:**

```yaml
# Mevcut frontend job içinde:
- name: Install deps
  run: npm ci
  working-directory: portfolio-project/frontend

- name: Type check
  run: npm run type-check
  working-directory: portfolio-project/frontend

- name: Lint
  run: npm run lint
  working-directory: portfolio-project/frontend

- name: Test with coverage
  run: npm run test:coverage
  working-directory: portfolio-project/frontend

- name: Build
  run: npm run build           # → next build
  working-directory: portfolio-project/frontend
  env:
    NEXT_PUBLIC_API_BASE_URL: https://api.yigitokur.me/api/v1
```

**`.github/workflows/deploy-production.yml` — Vercel deploy adımı:**
```yaml
# vercel.json artık framework: "nextjs" (otomatik detect)
# Vercel project settings: Framework = Next.js
```

### 10.3 portfolio-project/frontend/vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci"
}
```

### 10.4 Smoke Test Güncellemesi

Mevcut smoke test script'i (CI/CD'deki) public sayfaları test eder. Next.js geçişi sonrası ek kontroller:
- `/<lang>` route'ları doğru response veriyor
- `/_next/static/` asset'leri serve ediliyor
- Lighthouse CI skoru (GitHub Action'da opsiyonel)

### Faz 5 Tamamlama Kriterleri
- [ ] `npm run test:coverage` → lines ≥90%, functions ≥90%
- [ ] `python -m pytest --cov -q` → ≥90%
- [ ] CI pipeline: Backend Quality + Frontend Quality + Sonar tüm geçiyor
- [ ] Vercel preview deploy: tüm sayfalar açılıyor
- [ ] Railway staging: backend health check geçiyor

---

## 11. AI Araç Rehberi

### Copilot (bu dosya context'i)

Her implementasyon oturumunda bu dosyayı context olarak ekle:
```
@workspace /path/to/REFACTOR_PLAN.md
```

Copilot'tan bir şey istediğinde faz numarasını belirt:
- "Faz 0, 5.1'i implement et: config.py KNOWN_INSECURE_KEYS"
- "Faz 1, 6.3'ü yaz: alembic/env.py"
- "Faz 3, 8.3 Hero section bileşenini yaz"

### Vercel v0 (v0.dev) — UI Scaffold

v0'a vermek için prompt şablonu:

```
Create a [component name] React component using shadcn/ui.
Design requirements:
- Dark theme: background #09090b, foreground #fafafa, border #27272a
- Primary accent: #06b6d4 (cyan-500)
- Typography: Geist Sans (body), Geist Mono (code)
- Style: dark minimalist tech aesthetic with subtle gradients
- Animation: Framer Motion, performance-first, once: true viewport triggers
- [component specific requirements]
```

**v0 için önerilen komponent talepleri:**
1. Hero section with animated terminal code block
2. Project card with hover tilt effect and tech badge row
3. Admin dashboard sidebar with icon navigation
4. Data table for admin project management
5. Contact form with validation states

### Claude / GPT-4 — Mimari Sorular

Alembic migration dosyası incelemesi, CRUD pattern düzeltme, test yazımı.

---

## 12. Dosya Referans Haritası

### Backend Kritik Dosyalar

| Dosya | Amaç | Son Değişiklik |
|---|---|---|
| `backend/app/config.py` | Settings + production validation | Faz 0: KNOWN_INSECURE_KEYS |
| `backend/app/services/email_service.py` | Email gönderimi | ✅ html.escape uygulandı |
| `backend/app/database.py` | Engine + SessionLocal | Faz 1: init_db() guard |
| `backend/alembic/env.py` | Alembic konfigürasyon | Faz 1: oluşturulacak |
| `backend/alembic.ini` | Alembic ayarları | Faz 1: oluşturulacak |
| `backend/tests/test_config.py` | Config testleri | Faz 0: insecure key testi |

### Frontend Kritik Dosyalar (Next.js)

| Dosya | Amaç |
|---|---|
| `frontend/src/app/layout.tsx` | Root layout: fonts, providers, metadata |
| `frontend/src/app/(public)/page.tsx` | Home — Hero + Featured Projects + Skills + CTA |
| `frontend/src/app/(protected)/admin/layout.tsx` | Auth guard + AdminShell |
| `frontend/src/providers.tsx` | QueryClient + Auth + Language providers |
| `frontend/src/lib/api.ts` | Axios instance + interceptors |
| `frontend/src/lib/motion.ts` | Paylaşılan Framer Motion variants |
| `frontend/src/contexts/AuthContext.tsx` | JWT auth state |
| `frontend/src/contexts/LanguageContext.tsx` | EN/TR i18n |
| `frontend/tailwind.config.ts` | Design tokens |
| `frontend/next.config.ts` | Next.js konfigürasyon |

### CI/CD Dosyaları

| Dosya | Değişiklik |
|---|---|
| `.github/workflows/ci.yml` | Frontend job: `next build` komutu |
| `.github/workflows/deploy-production.yml` | Vercel deploy: Next.js framework |
| `frontend/vercel.json` | `framework: nextjs` |

---

## 13. Verification Checklist

Projenin "hazır" sayılabilmesi için tüm maddeler geçmeli:

### Security
- [ ] `production_validation_errors()` insecure key reject ediyor (test var)
- [ ] Email template'larında tüm user input `html.escape()` ile escape'lenmiş
- [ ] `VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` olmadan build fail ediyor
- [ ] ProtectedRoute `requireAdmin` ile admin olmayan kullanıcı `/admin`'e erişemiyor

### Backend
- [ ] `alembic upgrade head` PostgreSQL'de hatasız çalışıyor
- [ ] `python -m pytest --cov -q` → ≥%90 coverage, tüm testler geçiyor
- [ ] Docker: `docker-compose up` → tüm servisler healthy

### Frontend
- [ ] `npm run build` → hatasız
- [ ] `npm run lint` → 0 warning
- [ ] `npm run type-check` → 0 hata
- [ ] `npm run test:coverage` → ≥%90 lines coverage

### Performance (Lighthouse — production URL)
- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95

### Feature Parity
- [ ] Tüm public sayfalar (Home, About, Projects, Blog, Contact) render oluyor
- [ ] Dil switcher EN↔TR çalışıyor
- [ ] Contact form submit → email iletiliyor
- [ ] Admin: login → CRUD (projects, blog, skills, experiences) çalışıyor
- [ ] GitHub sync admin panelinden tetiklenebiliyor

### CI/CD
- [ ] PR → `ci.yml` tüm job'lar geçiyor
- [ ] Main merge → Railway deploy + Vercel deploy + smoke test geçiyor
- [ ] Backup drill: haftalık PostgreSQL backup webhook çalışıyor
