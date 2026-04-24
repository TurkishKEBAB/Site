# Yiğit Okur Portfolio — Uçtan Uca Teknik Denetim Raporu

**Repo:** `c:\Develop\Projects\Site`
**Tarih:** 2026-04-22
**Branch:** `main` (working tree clean; system-reminder'daki `feature/frontend-nextjs-public-migration` artık merge edilmiş)
**Son commit:** `784fdbe Chore/repo ignore frontend build artifacts (#20)`
**Audit kapsamı:** Mimari, Backend, Frontend, Veri Akışı, Güvenlik, Performans, Test, DevOps, UX, Dokümantasyon
**Yöntem:** 3 paralel Explore agent + hedeflenmiş dosya doğrulamaları (deps.py, main.py, config.py, api.ts, ci.yml, contact.py, auth.py, eslintrc, next.config.mjs, vite.config.ts, package.json, pytest.ini, sonar-project.properties)

> **Codex revizyonu R1 (2026-04-23):** Beş düzeltme uygulandı — (1) backend test sayısı 13 → 12; (2) markdown XSS bulgusu "doğrudan XSS riski" yerine "sanitization politikası tanımsız" olarak yeniden çerçevelendi (`rehype-raw` ve `dangerouslySetInnerHTML` markdown render path'inde yok); (3) **storage upload doğrulamasının magic-byte/content kontrolü olmadığı kesin doğrulandı** (`storage_service.py:180` `validate_file` sadece uzantı + boyut); (4) `seed_data.py:43` parolayı stdout'a yazdığı doğrulandı; (5) `pip-audit` lokal kurulum notu eklendi.

> **Codex revizyonu R2 (2026-04-23):** İkinci tur çapraz kontrol sonuçları — (a) **Security skoru 6/10 → 5.5/10**: yerelde `npm audit --audit-level=high` çıktısı 18 açık (12 high) raporluyor → CI gate olsaydı PR baştan blocklu olurdu; (b) **Yeni Bulgu #18**: `deploy-vercel-preview.yml:7,11` ve `deploy-railway-staging.yml:6` hâlâ silinmiş `Codex_Implementation` branch'ini referans alıyor — AGENTS.md ve GIT_WORKFLOW.md ile çelişki; (c) **Yeni Bulgu #19**: `portfolio-project/README.md:27` "React 18 + TypeScript + Vite 5" diyor, gerçek stack Next 16 + React 19 (root `package.json` doğrulandı); (d) Backend test sonucu Codex tarafından çalıştırıldı: **75 test geçti** (önceki "scope dar ama %80+ raporluyor" yorumu doğrulandı, sayı netleşti); (e) Frontend test sayısı Codex çalıştırmasında 3 dosya / 11 Vitest test — "frontend kapsamı dar" bulgusunun somut sayısı.

> **Not:** Bu doküman bir uygulama planı değil; kullanıcının talep ettiği teknik denetim raporunun kendisidir. Plan modu sadece bu dosyanın yazılmasına izin verdiği için tüm çıktı buraya konumlandırılmıştır. ExitPlanMode çağrısıyla rapor onaya sunulacak — onayla birlikte herhangi bir kod değişikliği yapılmayacak (rapor zaten salt analiz).

---

## 1. EXECUTIVE SUMMARY

### Skor Tablosu (kanıt-tabanlı)

| Eksen | Puan | Gerekçe (özet) |
|---|---|---|
| **Genel sağlık** | **6.5/10** | Temel mimari sağlam (FastAPI+Next App Router), ama dökümantasyon gürültüsü, Admin god-component, eksik observability ve test coverage scope dar |
| **Prod readiness** | **5.5/10** | Refresh token + blacklist + CAPTCHA gating + healthcheck endpoint'leri var, ama Alembic yok, Sentry yok, smoke test hardcoded domain'e bağlı, npm audit `continue-on-error` |
| **Maintainability** | **5/10** | `Admin.tsx` 1845 satır, `site.ts` 767 satır, repo kökünde 12+ tarihsel MD dosyası, `api.ts` interceptor regression'ları (MEMORY spec ile uyumsuz) |
| **Security** | **5.5/10** (Codex R2 ↓) | JWT rotation + bcrypt + ILIKE escape + HTML escape + CAPTCHA-prod-zorunlu iyi; ama email-only admin, `logger.debug` admin email logluyor, default `ADMIN_EMAILS` kişisel email, login lockout yok, **storage magic-byte yok**, **seed parola stdout**, **`npm audit` 12 high açık** (yerel ölçüm: 18 toplam / 12 high — CI gate olsaydı PR baştan blocklu) |
| **Scalability** | **5.5/10** | Joinedload + atomic view increment + bulk commit + Redis cache mevcut; ama cache scope dar (sadece GitHub repos), Postgres connection pooling var, ama bağlantı havuzu metrik gözetimi yok, Alembic olmadan schema evrimi tehlikeli |
| **Developer experience** | **4.5/10** | PowerShell-only `start.ps1`/`quality.ps1` cross-platform engeli, root README 2 satır, 12+ tarihsel MD karmaşası, `.eslintrc.cjs` `exhaustive-deps` ve `no-explicit-any` kapalı, `jsx-a11y` plugin yok (MEMORY spec'ine göre olmalıydı) |

### En Kritik 10 Problem (öncelik sırasıyla)

1. **CI'da `npm audit --audit-level=high` `continue-on-error: true`** → high-severity güvenlik açıkları PR'ı bloklamıyor. **Yerel ölçüm: 18 toplam / 12 high açık (Codex R2)** — CI gate olsaydı PR baştan blocklu. (`.github/workflows/ci.yml:112-113`)
2. **Alembic yok** → schema değişiklikleri prod'a versiyonlanmamış SQL ile gidiyor; rollback yok. (`portfolio-project/backend/alembic*` aranıyor → 0 sonuç)
3. **`Admin.tsx` 1845 satır god-component** → projects+skills+experiences+contact CRUD + focus-trap + admin formları tek dosyada. (`frontend/src/routes/Admin.tsx`)
4. **`api.ts`: 403 hala token siliyor** → MEMORY spec sadece 401 demişti; 403 sayfa-bazlı yetki hatasında kullanıcıyı oturumdan atıyor. (`frontend/src/services/api.ts:62-70`)
5. **Admin sadece email-eşleşmesi ile** → `User` modelinde `is_admin` yok; admin email listesinden çıkarmak için ya kullanıcıyı silmek ya `ADMIN_EMAILS` env değişkenini değiştirmek gerekiyor. Audit log da yok. (`backend/app/api/deps.py:103-117`, `backend/app/config.py:34`)
6. **`logger.debug` admin email listesini ve user email'ini logluyor** → log seviyesi DEBUG'a çekilirse PII + admin yetkilendirme yüzeyi sızıyor. (`backend/app/api/deps.py:107-109`)
7. **`next/image` kullanımı yok** → tüm görseller raw `<img>`; LCP cezası, format dönüşümü ve responsive yok. (Grep `next/image` → sadece `next-env.d.ts` tip tanımı)
8. **`config.py:34` default `ADMIN_EMAILS` kişisel email içeriyor** → kod içinde kullanıcı adresi (`yigitokur@ieee.org`) hardcoded; dev hatası prod'a sızabilir. Ek olarak `main.py:228` ve `main.py:230` aynı email'i ve GitHub kullanıcı adını gömüyor.
9. **Tarihsel MD çoğulluğu** → `portfolio-project/` kökünde 12+ MD (BACKEND_COMPLETE, BACKEND_PACKAGES_INSTALLED, COMPREHENSIVE_PROJECT_ANALYSIS, DETAILED_ANALYSIS_REPORT, FRONTEND_STARTED, IMPLEMENTATION_AUDIT, INSTALLATION_SUMMARY, PROGRESS, TASK1_BACKEND_ANALYSIS, TODO_QUICKSTART, AUDIT_REMEDIATION) yeni katkıcıyı boğuyor.
10. **Frontend coverage threshold yok** → `vite.config.ts:35-39` sadece reporter; MEMORY spec'inde `lines/functions/statements: 20, branches: 15` vardı — **regression**. ESLint `exhaustive-deps: 'off'` ve `no-explicit-any: 'off'` da regression.

### En Güçlü 10 Taraf

1. **JWT refresh token rotation + blacklist + session table** — `auth.py:171-234` token rotasyonu, `deps.py:77` blacklist kontrolü, `crud/token.py` session yönetimi tam.
2. **`production_validation_errors()`** — `config.py:152-167` prod'da SECRET_KEY uzunluğu, FRONTEND_URL localhost kontrolü, CAPTCHA enforcement; lifespan'de `RuntimeError` ile boot blokluyor (`main.py:39-43`).
3. **CAPTCHA çoklu sağlayıcı desteği + provider switch** — `config.py:103-113` Turnstile/hCaptcha/reCAPTCHA arasında URL switch; prod'da zorunlu.
4. **ILIKE escape (`_escape_ilike`) ve `escape="\\"` parametresi** — `crud/blog.py:16-18` + `:263-269` SQL injection ve wildcard abuse'a karşı çift katmanlı koruma.
5. **Atomic view increment** — `crud/blog.py:219-239` `UPDATE SET views = views + 1` ile race-condition-safe.
6. **Pydantic v2 ConfigDict + SQLAlchemy 2.0 DeclarativeBase** — modern stack'in doğru kullanımı; `database.py:39-46` `pool_pre_ping` + `pool_recycle` connection sağlığı.
7. **Bulk commit pattern** — `crud/github.py` `bulk_create_or_update_repos`, `crud/site.py` `bulk_set_translations` tek commit; `crud/experience.py` grouped query.
8. **CORS dar prod allow_origins** — `config.py:74-77` prod'da sadece `FRONTEND_URL` + `CORS_EXTRA_ORIGINS`; dev'de localhost variant'ları.
9. **App Router route group ayrımı** — `app/(public)`, `app/(admin)`, `app/(auth)` net; `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/resume/route.ts` tam SEO yüzeyi.
10. **CI Action SHA pin'leri** — `ci.yml:35,38,75,78,163,169,176,183` üçüncü-parti action'lar 40-char SHA'ya sabitlenmiş (PR-4'te yapılan iş).

### En Acil 7 Aksiyon (Codex revizyonu)

1. `ci.yml:113` `continue-on-error: true` satırını kaldır → npm audit gerçekten gate olsun.
2. `api.ts:62` koşulu `status === 401` ile sınırla; 403 token temizleme regression'ını geri al.
3. `deps.py:107-109` admin email loglamasını sil veya `logger.debug` yerine SIEM-friendly hash'le.
4. `config.py:34` ve `main.py:228-230` kişisel email/kullanıcı adı default'larını kaldır → env-zorunlu yap.
5. **`seed_data.py:43` generated parola `print` satırını kaldır; env yoksa `RuntimeError` fırlat (Codex doğrulama).**
6. **`storage_service.py` `validate_file_content(bytes)` ekle (filetype/python-magic) ve `projects.py:223` upload akışına bağla (Codex doğrulama).**
7. Repo kökünde 10+ tarihsel MD dosyasını `docs/_archive/` altına taşı; `README.md`'i (root, 2 satır) anlamlı bir landing'e çevir.

---

## 2. REPO HARİTASI

### Klasör Yapısı (üst düzey)

```
c:\Develop\Projects\Site\
├── .github/workflows/         (9 workflow: ci, sonar-pr-gate, deploy-prod/preview/staging,
│                                backup-restore-drill, pr-labeler, release-drafter, stale)
├── .github/CODEOWNERS         (tek owner: @TurkishKEBAB)
├── README.md                  (2 satır — boş)
├── AGENTS.md, GIT_WORKFLOW.md
├── start.ps1                  (PowerShell-only)
└── portfolio-project/
    ├── README.md, QUICKSTART.md, CI_CD_SETUP.md
    ├── PROGRESS.md, BACKEND_COMPLETE.md, BACKEND_PACKAGES_INSTALLED.md,
    │   COMPREHENSIVE_PROJECT_ANALYSIS.md, DETAILED_ANALYSIS_REPORT.md,
    │   FRONTEND_STARTED.md, IMPLEMENTATION_AUDIT.md, INSTALLATION_SUMMARY.md,
    │   TASK1_BACKEND_ANALYSIS.md, TODO_QUICKSTART.md, AUDIT_REMEDIATION.md
    │                          ← 12+ tarihsel MD karmaşası
    ├── pytest.ini             (cov-fail-under=80, ama scope dar)
    ├── sonar-project.properties
    ├── start.ps1, quality.ps1 (PowerShell-only)
    ├── backend/
    │   ├── Dockerfile         (single-stage, non-root, healthcheck ✓)
    │   ├── docker-compose.yml (postgres + redis + backend, internal_net ✓)
    │   ├── requirements.txt, requirements-dev.txt
    │   ├── init_db.py, seed_data.py
    │   ├── .env (gitignored ✓ — `git check-ignore` doğruladı)
    │   ├── .env.example
    │   └── app/
    │       ├── main.py        (lifespan + CORS + middleware + handlers + health/live/ready)
    │       ├── config.py      (Pydantic v2 Settings + production_validation_errors)
    │       ├── database.py    (DeclarativeBase, pool config)
    │       ├── api/
    │       │   ├── deps.py    (get_current_user, require_admin, get_current_user_optional)
    │       │   └── v1/        (auth, admin, blog, contact, experiences, github,
    │       │                   projects, skills, technologies, translations)
    │       ├── crud/          (blog, contact, experience, github, project, site, skill,
    │       │                   token, user)
    │       ├── models/        (auth, blog, contact, experience, github, project,
    │       │                   site, skill, technology, user)
    │       ├── schemas/       (admin, blog, contact, experience, github, project,
    │       │                   site, skill, technology, user)
    │       ├── services/      (cache, captcha, email, github, storage)
    │       ├── core/          (rate_limit)
    │       └── utils/         (logger, security)
    ├── backend/tests/         (12 test_*.py + conftest.py)
    └── frontend/
        ├── package.json       (next 16, react 19, motion 12, vitest 3, eslint 8 — mismatch!)
        ├── next.config.mjs    (poweredByHeader: false; ama image/headers config YOK)
        ├── vite.config.ts     (coverage reporter var, threshold YOK — regression)
        ├── .eslintrc.cjs      (exhaustive-deps OFF, no-explicit-any OFF, jsx-a11y YOK — regression)
        ├── tsconfig.json      (strict ✓)
        ├── scripts/check-public-server-components.mjs (server boundary linter ✓)
        ├── app/
        │   ├── layout.tsx     (theme script + Providers + next/font)
        │   ├── (public)/[layout, page, about, projects, blog, contact]
        │   ├── (admin)/admin/
        │   ├── (auth)/login/
        │   ├── not-found.tsx, opengraph-image.tsx, twitter-image.tsx,
        │   ├── sitemap.ts, robots.ts, resume/route.ts
        │   └── ...
        └── src/
            ├── components/    (Navigation, Toast, ContactForm, ProjectExplorer,
            │                   ProtectedRoute, ErrorBoundary, AnimatedBackground,
            │                   AnimatedSection, Footer, ThemeToggle, LanguageToggle,
            │                   providers, ui/, admin/AdminForms)
            ├── contexts/      (AuthContext, LanguageContext)
            ├── routes/        (Home+HomeClient, About+AboutClient, Projects+ProjectsClient,
            │                   Contact+ContactClient, Blog, BlogDetail, Admin (1845 satır!),
            │                   Login, NotFound)
            ├── services/      (api, blogService, contactService, experienceService,
            │                   projectService, skillService, technologyService, types)
            ├── content/site.ts (767 satır — config + i18n + content monoliti)
            ├── lib/           (blog, locale, metadata, queryKeys ←? — varsa)
            └── test/          (setup, public-routes.ssr)
```

### Backend Katmanları (akış)

```
HTTP request
  → main.py middleware (logging, CORS, rate-limit-handler)
  → api/v1/<domain>.py route handler
        ├── @limiter.limit (auth/contact için)
        ├── Depends(get_current_user / require_admin)  → deps.py
        ├── Depends(get_db)                            → database.py
        └── crud.<domain>.<func>(db, ...)              → crud/*.py
              └── models.<Domain>                      → models/*.py
                    └── SQLAlchemy session
  ← Pydantic schema serialize  → schemas/*.py
  ← Exception handlers (validation, general) → main.py:115,134
```

### Frontend Katmanları (akış)

```
Browser
  → app/layout.tsx (RSC: next/font, theme script, Providers)
       └── Providers (Language → Toast → Auth)
  → app/(public)/<route>/page.tsx (RSC: metadata + render)
       └── src/routes/<Page>Client.tsx (Client wrapper, useLanguage)
            └── src/routes/<Page>.tsx (RSC, props.locale, JSON-LD)
                 └── src/components/<Component>.tsx (Client islands)
                      └── src/services/<x>Service.ts → src/services/api.ts → axios
                            ↓ (interceptor)
                            JWT token (localStorage), language query param
                            401|403 → token wipe, /admin path → redirect /login
                            api:error CustomEvent → ErrorBoundary/Toast
```

### Frontend ↔ Backend Veri Akışı

- **Auth:** Frontend `POST /auth/login/json` → `{access_token, refresh_token}` → localStorage. Sonraki istekler `Authorization: Bearer`. Refresh yok client-side (sadece 401/403 → wipe → manuel re-login). MEMORY'de `token-refreshed` CustomEvent vardı — `api.ts` artık dispatch etmiyor (regression).
- **Language:** GET istekleri otomatik `?language=tr|en` (api.ts:34-39, `/auth/*` hariç). Backend `/api/v1/translations/{language}` ile çevirileri sağlıyor. Cookie + localStorage dual-source `LanguageContext.tsx:49-77`.
- **CRUD:** Admin sayfası tüm CRUD'u tek `Admin.tsx`'te yapıyor; her `<X>Service.ts` thin wrapper.
- **Error contract:** Backend `{success: false, error: ..., (details)}` (main.py:122,128); frontend tarafında merkezi error parser yok — her component upstream hatasını kendi yorumluyor.

### Auth Akışı

```
Login → POST /auth/login/json (rate-limit 5/min)
      → user_crud.authenticate_user → bcrypt verify
      → _issue_token_pair → access (jti, type=access, 15dk)
                            refresh (jti, type=refresh, 14gün) → token_crud session
      → response {access_token, refresh_token, token_type, expires_in}

Authenticated request → Bearer access_token
      → deps.get_current_user
            → jwt.decode (HS256, SECRET_KEY)
            → type == "access" check
            → token_crud.is_token_blacklisted(jti) check
            → user_crud.get_user_by_id

Admin endpoint → Depends(require_admin)
      → email in settings.admin_email_list set check
      → 500 if list empty, 403 if mismatch

Refresh → POST /auth/refresh (rate-limit 5/min)
      → decode refresh, type == "refresh"
      → blacklist + session active check
      → issue new pair → revoke old session → blacklist old jti
```

### Deployment Akışı

```
Push to main / PR
   → ci.yml (backend tests, frontend lint+test+build, pip-audit, npm audit*)
   → sonar-pr-gate.yml (PR'lar için, fork PR filtresi)
   → sonarcloud.yml job (push only, qualitygate.wait=true)

Push to main (Vercel preview otomatik?)
   → deploy-vercel-preview.yml (PR'da preview)
   → deploy-railway-staging.yml (staging)

Manual / tag-based?
   → deploy-production.yml
        → backend: Railway migration webhook → readiness poll
        → frontend: Vercel deploy → hardcoded "yigitokur.me" smoke test
        → backend smoke: admin login test
        → notification webhook
```

### Problemli Coupling Alanları

- **`Admin.tsx` ↔ tüm services + contexts + AdminForms** — single component all CRUD; bölünmesi gerek.
- **`site.ts` ↔ neredeyse tüm route'lar ve metadata** — i18n + config + içerik tek dosya.
- **`api.ts` ↔ `LanguageContext` (örtük)** — language query param injection localStorage'tan; SSR senaryosunda tutarsızlık riski.
- **`ProtectedRoute` + `api.ts` 403/401 redirect** — yetki gate'i iki yere yayılmış.
- **`config.py` ↔ runtime kullanım** — `settings.admin_email_list` her admin check'te yeniden hesaplanıyor (lru_cache var ama property hesaplama hâlâ yapılıyor); `_admin_emails_set` cache'lenebilir.

---

## 3. EN KRİTİK 19 BULGU

| # | Başlık | Ciddiyet | Öncelik | Alan | Kanıt | Etki | Çözüm Özeti |
|---|---|---|---|---|---|---|---|
| 1 | `npm audit` `continue-on-error: true` | **Critical** | **P0** | DevOps | `.github/workflows/ci.yml:112-113` | High-severity FE açıkları PR'ı bloklamıyor | Satırı sil; gerçek başarısızlığa CI fail |
| 2 | Schema migrations için Alembic yok | **Critical** | **P0** | Backend | `portfolio-project/backend/alembic*` ⇒ 0 dosya; `init_db.py` `Base.metadata.create_all` | Prod'da kolon eklemek manuel SQL → rollback yok | Alembic kur, baseline migration üret, deploy-production.yml içine `alembic upgrade head` ekle |
| 3 | `Admin.tsx` 1845 satır god-component | **High** | **P1** | Frontend | `frontend/src/routes/Admin.tsx` (1845 satır) | Bakılamaz; her CRUD değişikliği regression riski | `components/admin/{ProjectsTab, SkillsTab, ExperiencesTab, MessagesTab}.tsx` + `lib/admin/focus-trap.ts` |
| 4 | `api.ts` 401 + 403 token siliyor | **High** | **P0** | Frontend | `frontend/src/services/api.ts:62-70` | 403 yetki hatası kullanıcıyı oturumdan atıyor; admin olmayan public flow'lar bozuk | Koşulu `status === 401`'e indirmek; 403 sadece toast |
| 5 | Email-only admin, DB'de `is_admin` yok | **High** | **P1** | Backend/Security | `backend/app/api/deps.py:103-117`, `backend/app/models/user.py` | Kullanıcıyı admin'den çıkarmak için `User.is_active=false` veya env değişikliği gerekir; audit log yok | `User.is_admin: bool` kolonu ekle; admin grant/revoke event log'la; `ADMIN_EMAILS` bootstrap mekanizmasına indirgensin |
| 6 | `next/image` kullanımı yok | **High** | **P1** | Frontend/Performance | Grep `next/image` → 0 kullanım | LCP cezası, format dönüşümü ve responsive yok | Tüm `<img>`'leri `next/image` + remotePatterns config |
| 7 | `logger.debug` admin email listesi + user email loglanıyor | **High** | **P1** | Security | `backend/app/api/deps.py:107-109` | DEBUG seviyesinde PII + admin yetkilendirme yüzeyi sızıyor | Hash ya da sadece "matched: bool" logla; INFO seviyesine indirgeme |
| 8 | Default `ADMIN_EMAILS` kişisel email içeriyor | **High** | **P1** | Security | `backend/app/config.py:34` `"yigitokur@ieee.org,admin@portfolio.com"` | Default'la prod'a gidebilir; kişisel adres source code'da | Default'u boş bırak, `production_validation_errors`'da boş ise hata fırlat |
| 9 | Frontend coverage threshold yok (regression) | **High** | **P1** | Test | `frontend/vite.config.ts:35-39` (sadece reporter); MEMORY: lines/functions/statements 20, branches 15 | Coverage düşse de CI yeşil; gerçek korumayı yok ediyor | `coverage.thresholds.{lines,functions,statements,branches}` ekle |
| 10 | ESLint `exhaustive-deps` ve `no-explicit-any` kapalı (regression) | **High** | **P1** | Frontend/Quality | `frontend/.eslintrc.cjs:14,16` | Stale closure ve `any` sızıntısı görünmez kalıyor | Önce `'warn'` çek, ihlalleri sayıp seansla `'error'` yap |
| 11 | Tarihsel MD çoğulluğu (12+ dosya `portfolio-project/` kökünde) | **High** | **P2** | DX/Docs | `BACKEND_COMPLETE.md`, `BACKEND_PACKAGES_INSTALLED.md`, `COMPREHENSIVE_PROJECT_ANALYSIS.md`, `DETAILED_ANALYSIS_REPORT.md`, `FRONTEND_STARTED.md`, `IMPLEMENTATION_AUDIT.md`, `INSTALLATION_SUMMARY.md`, `PROGRESS.md`, `TASK1_BACKEND_ANALYSIS.md`, `TODO_QUICKSTART.md`, `AUDIT_REMEDIATION.md` | Yeni katkıcı hangisini okuyacağını bilmiyor; çelişen "completed" rozetleri | `docs/_archive/` altına taşı; root README + AGENTS + GIT_WORKFLOW + QUICKSTART canonical |
| 12 | `site.ts` 767 satır monolit | **Medium** | **P2** | Frontend | `frontend/src/content/site.ts` | Config + i18n + içerik karışmış; client bundle'da gereksiz alan | `content/{config,ui,home,about,contact,seo,projects}.ts` split |
| 13 | `*Client.tsx` wrapper indirection (6 dosya) | **Medium** | **P2** | Frontend | `routes/HomeClient`, `AboutClient`, `ProjectsClient`, `ContactClient`, vb. — sadece useLanguage çağırıp `<Page locale={...}>` render ediyor | Gereksiz katman, render ağacında karışıklık | `app/(public)/<page>/page.tsx`'i client'leştir veya server-side `getRequestLocale()` kullan |
| 14 | Sentry/observability yok | **Medium** | **P1** | DevOps | Grep `sentry|opentelemetry|prometheus` → 0 sonuç | Prod hataları sadece dosya log; alerting yok | Sentry SDK (BE+FE) entegre, source map upload, release tag |
| 15 | CORS `allow_methods=["*"]` + `allow_credentials=True` | **Medium** | **P2** | Security | `backend/app/main.py:80-86` | Origin'ler dar olsa da method whitelist olmalı | `allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"]` |
| 16 | **Storage upload magic-byte/content doğrulaması yok** (Codex doğrulama) | **High** | **P1** | Security | `backend/app/services/storage_service.py:180` `validate_file` sadece uzantı + boyut; `validate_file_content` mevcut değil | `.jpg` uzantılı arbitrary binary upload edilebilir; stored XSS / kötü amaçlı dosya dağıtımı | `filetype`/`python-magic` ile MIME kontrolü; `projects.py:223` upload akışında ek doğrulama |
| 17 | **`seed_data.py:43` generated admin parolayı stdout'a basıyor** (Codex doğrulama) | **High** | **P1** | Security | `seed_data.py:42-44`: `SEED_ADMIN_PASSWORD` env yoksa `secrets.token_urlsafe(18)` ile üretip `print(...)` ile basıyor | CI log'larında ya da operatör terminalinde admin parola sızıyor; SEED_ADMIN_PASSWORD env'i unutulursa risk her seed run'ında yeniden | `print` satırını kaldır; env yoksa `RuntimeError` fırlat (fail-fast) |
| 18 | **Stale `Codex_Implementation` branch referansı deploy workflow'larında** (Codex R2 doğrulama) | **High** | **P1** | DevOps | `deploy-vercel-preview.yml:7,11`, `deploy-railway-staging.yml:6` — AGENTS/GIT_WORKFLOW ile çelişki | Silinmiş branch'e push asla yapılmıyor → bu workflow'lar fiilen ölü; geliştirici "preview neden tetiklenmiyor?" diye dolaşıyor | `Codex_Implementation` satırlarını `main` veya gerçek feature branch pattern'i ile değiştir |
| 19 | **`portfolio-project/README.md` outdated stack** (Codex R2 doğrulama) | **Medium** | **P1** | Docs/DX | `portfolio-project/README.md:27` "React 18 + TypeScript + Vite 5"; gerçek: Next 16 + React 19 (`package.json` doğrulandı) | Yeni katkıcı yanlış stack dokümanından başlıyor; Vite komutları artık çalışmıyor (Next CLI'ye geçildi) | README'yi gerçek stack ile (Next 16 App Router, React 19, Vitest test, ESLint 8) güncelle; "build/dev" komutları `next` ile |

---

## 4. ALAN BAZLI DETAYLI İNCELEME

### 4.1 Architecture

#### 4.1.1 Genel Yapı — **Sağlam ama bazı noktalarda akış kaçağı**

- **Ciddiyet:** Low (genel) / Medium (`Admin.tsx` ve `site.ts` özelinde)
- **Öncelik:** P2
- **Alan:** Architecture
- **İlgili dosyalar:** `backend/app/api/v1/*.py`, `backend/app/crud/*.py`, `frontend/src/routes/Admin.tsx`, `frontend/src/content/site.ts`
- **Kanıt:**
  - Backend katmanlama disiplini iyi: route → crud → model. Her `crud/*.py` mevcut (blog, contact, experience, github, project, site, skill, token, user).
  - Route handler'ları thin: `contact.py:30-84` 50 satır, `auth.py:67-90` 24 satır.
  - Ancak `backend/app/api/v1/contact.py:54-79` rota katmanında crud + email orkestrasyonu yapıyor (ki bu makul, ama service katmanına çekilebilirdi).
  - Frontend'de routes/<Page>.tsx dosyaları içerik+JSON-LD+layout karışımı; `Admin.tsx` 1845 satır — exception.
- **Problem:** Backend disiplinli; frontend `Admin.tsx` ve `site.ts` kompozisyonu istisnai biçimde büyük.
- **Etki:** `Admin.tsx`'te bir focus-trap değişikliği projeler tab'ını bozabilir; `site.ts` revize edilince tüm route'lar yeniden derleniyor.
- **Çözüm:** Sadece `Admin.tsx` + `site.ts` parçalansın; backend hâlihazırdaki katmanlamayı koru. Service katmanı `email_service`, `github_service`, `cache_service`, `captcha_service`, `storage_service` ile mevcut — yeni servis fabrikasyonu gerekmiyor.

#### 4.1.2 Manual schema init/migration

Detay için bkz. **§4.9 DevOps — Migration**.

#### 4.1.3 `deps.py` God-Dependency Riski

- **Ciddiyet:** Low
- **İlgili:** `backend/app/api/deps.py`
- **Gözlem:** `get_current_user`, `require_admin`, `get_current_user_optional` — üçü de tek dosyada. Boyut 176 satır, taşınabilir.
- **Risk:** Düşük; ancak `require_admin` içinde `logger.debug` ile email'i logluyor (bkz. Bulgu #7).

---

### 4.2 Backend

#### 4.2.1 JWT + Refresh — **Güçlü tasarım**

- **Ciddiyet:** Low (notlar Medium)
- **Alan:** Auth
- **İlgili dosyalar:** `backend/app/api/v1/auth.py`, `backend/app/utils/security.py`, `backend/app/api/deps.py`, `backend/app/crud/token.py`
- **Kanıt:**
  - `auth.py:25-64` `_issue_token_pair`: access (jti, type=access, 15dk default) + refresh (jti, type=refresh, 14gün) + DB session record.
  - `auth.py:171-234` rotation: blacklist + session check + new pair + revoke + blacklist old.
  - `deps.py:55-78` decode + algorithm pin + type check + blacklist check.
- **Problem:** `JWT_ALGORITHM` `HS256` hardcoded default (`config.py:30`); algorithm rotation politikası yok. **`access_token_expire_minutes`** önce `ACCESS_TOKEN_EXPIRE_MINUTES`'a, yoksa `JWT_EXPIRE_MINUTES=15`'e düşüyor (`config.py:97-100`); MEMORY notunda `.env`'de 10080 (7 gün) görüldüğü belirtilmiş — bu yapılandırma access token süresini 7 güne çıkarır ve refresh'i anlamsızlaştırır. `.env` gitignored olduğundan içerik onaylanmadı (Doğrulanmalı).
- **Etki:** Access token süresi 15 dk yerine yanlışlıkla 7 gün olursa blacklist gecikmeli devreye giriyor demektir (logout sonrası 7 güne kadar token geçerli kalabilir).
- **Çözüm:** `ACCESS_TOKEN_EXPIRE_MINUTES` üst sınırı (`<= 60`) `production_validation_errors`'a ekle.

#### 4.2.2 Admin Yetkisi Email-Only — **Yapısal zayıflık**

- **Ciddiyet:** **High**
- **Öncelik:** **P1**
- **Alan:** Authorization
- **İlgili:** `backend/app/api/deps.py:103-117`, `backend/app/config.py:34,92-94`, `backend/app/models/user.py`
- **Kanıt:** `if user_email not in admin_emails:` → 403; `User` modelinde `is_admin` kolonu yok.
- **Problem:** Admin atama/iptali ENV değişikliği gerektiriyor; aynı email farklı kullanıcılarda ele alınamıyor (email değişimi → admin kalır); audit log yok.
- **Neden problem:** Yetki kararı kod değil, deployment'a bağlı. CI'da `ADMIN_EMAILS=admin@test.com` (`ci.yml:31`); her ortamda ayrı set; kayıt eksikliği.
- **Etki:** Compromised hesap acil iptali deploy gerektirir.
- **Çözüm:** `User.is_admin: Mapped[bool] = mapped_column(default=False)` ekle; `require_admin` önce `is_admin` kontrol etsin, fallback olarak email match (bootstrap senaryosu için). `crud/user.set_admin(user_id, granted_by, reason)` audit kayıtla.

#### 4.2.3 `logger.debug` Admin Yüzeyini Logluyor

- **Ciddiyet:** **High** (DEBUG açıksa)
- **Öncelik:** **P1**
- **İlgili:** `backend/app/api/deps.py:107-109`
- **Kanıt:**
  ```python
  logger.debug(f"Admin check - User email: '{user_email}'")
  logger.debug(f"Admin emails list: {admin_emails}")
  logger.debug(f"Is admin: {user_email in admin_emails}")
  ```
- **Problem:** Loguru config (`utils/logger.py`) prod'da default INFO; ama bir incident sırasında DEBUG'a alınması olağan. Tüm admin email seti log dosyasına yazılır.
- **Etki:** PII + yetkilendirme listesi sızıntısı; hizmet sağlayıcı log forwarder'ı varsa 3. tarafta görünür.
- **Çözüm:** Log satırlarını sil ya da `logger.debug("admin_check user=<sha256(email)[:8]> matched=%s", ...)` formatına çek.

#### 4.2.4 Default `ADMIN_EMAILS` Kişisel Email

- **Ciddiyet:** **High**
- **Öncelik:** **P1**
- **İlgili:** `backend/app/config.py:34`, `backend/app/main.py:228-230`
- **Kanıt:** `ADMIN_EMAILS: str = "yigitokur@ieee.org,admin@portfolio.com"`; `main.py:228` `"email": "yigitokur@ieee.org"` root endpoint response.
- **Problem:** Source code içinde kişisel iletişim adresi; yanlış env yüklenirse default ile prod ayağa kalkar.
- **Çözüm:** Default boş; `production_validation_errors` boş listeyi engellesin. Root endpoint email/`github` env'den okusun (ya da kaldır).

#### 4.2.5 CORS Methods Wildcard

- **Ciddiyet:** Medium
- **İlgili:** `backend/app/main.py:80-86`
- **Kanıt:** `allow_methods=["*"]`, `allow_credentials=True`.
- **Problem:** Origin listesi dar (config.py:74-77 prod'da sadece `FRONTEND_URL`+CORS_EXTRA_ORIGINS) — ana risk düşük; ancak `*` methods + credentials kombosu defense-in-depth ihlali.
- **Çözüm:** Açık liste: `["GET","POST","PUT","PATCH","DELETE","OPTIONS"]`; `allow_headers` da gerekirse kısıt.

#### 4.2.6 Login Lockout Yok

- **Ciddiyet:** Medium
- **İlgili:** `backend/app/api/v1/auth.py:67-84`
- **Kanıt:** `@limiter.limit(settings.AUTH_LOGIN_RATE_LIMIT)` = "5/minute"; başka kontrol yok.
- **Problem:** Rate-limit IP-bazlı (slowapi `get_remote_address` X-Forwarded-For aware); IP değiştirerek geçilebilir. Hesap-bazlı lockout (örn. 5 başarısız → 15 dk hesap bloke) yok.
- **Çözüm:** `failed_login_count` + `locked_until` kolonları `User`'a; başarısız 5'ten sonra 15 dk lock; başarılı login'de sıfırla.

#### 4.2.7 Validation Errors Production'da Hidden ✓

- **Pozitif:** `main.py:118-131` `is_production` ise `details` kapanıyor; `RequestValidationError` log'a yazılıyor ama response'a sızmıyor.

#### 4.2.8 General Exception Handler ✓

- **Pozitif:** `main.py:134-158` `is_production` ise `str(exc)` ve type gizli.

#### 4.2.9 N+1 + Pagination — **İyi**

- **Pozitif:** `crud/blog.py:59`, `crud/project.py:56-60`, `crud/skill.py`, `crud/experience.py` joinedload paterni; tüm liste endpoint'lerinde `skip`+`limit`+`COUNT` pattern (PR-2 sonrası).

#### 4.2.10 GitHub Service — Cache + Timeout

- **Pozitif:** `services/github_service.py` config-bazlı `username` (no SSRF), `httpx` 30s timeout, Redis cache 24 saat fallback'lı.

#### 4.2.11 Storage Service — Magic-Byte Doğrulaması Yok ⚠ (DÜZELTME)

- **Ciddiyet:** **High**
- **Öncelik:** **P1**
- **İlgili:** `backend/app/services/storage_service.py:180-210` (`validate_file`), `backend/app/api/v1/projects.py:223`
- **Kanıt (doğrulandı 2026-04-23):**
  ```python
  def validate_file(self, filename, file_size, allowed_extensions=None):
      ...
      if file_size > settings.MAX_UPLOAD_SIZE: return False, "..."
      extension = filename.split(".")[-1].lower() if "." in filename else ""
      if extension not in allowed_extensions: return False, "..."
      return True, ""
  ```
- **Problem:** `validate_file` SADECE uzantı + boyut kontrol ediyor; magic-byte/content sniffing **yok**. Önceki MEMORY notu (`validate_file_content`) ve PR-1 rozeti yanıltıcı — kod tabanında böyle bir fonksiyon hiç bulunmuyor.
- **Etki:** `.jpg` uzantılı bir HTML/SVG/PE binary upload edilebilir; Supabase'a yüklendikten sonra `Content-Type` server-side ayarlanıyor (line 113 `"content-type": content_type`), ama bu da request'te gelene güveniyor. Stored XSS / arbitrary file delivery riski.
- **Pozitif (mevcut savunmalar):** filename sanitization (`re.sub(r"[^\w\-.]", "_", ...)` + 100-char cap), `MAX_IMAGE_PIXELS=25_000_000`, `optimize_image()` PIL ile yeniden encode (image-only path için fiili magic-byte doğrulamasına dolaylı koruma sağlıyor — non-image MIME için PIL `Image.open` exception fırlatır, ama `optimize_image` exception'ı yutup orijinal byte'ları döndürüyor → guardrail değil).
- **Çözüm:**
  ```python
  import filetype  # veya python-magic
  def validate_file_content(self, file_data: bytes, allowed_mimes: set[str]) -> tuple[bool, str]:
      kind = filetype.guess(file_data)
      if not kind or kind.mime not in allowed_mimes:
          return False, "Content does not match an allowed image type"
      return True, ""
  ```
  + `projects.py:223` upload akışında `validate_file` sonrası `validate_file_content(content, {"image/jpeg","image/png","image/webp","image/gif"})` çağır + `optimize_image` exception'ında orijinal döndürmek yerine raise et.

#### 4.2.12 Email Service HTML Escape ✓

- `services/email_service.py` `html.escape(user_name)`, `html.escape(message_content)` (MEMORY/PR-1 doğruluyor).

#### 4.2.13 Health/Live/Ready Endpoint'leri ✓

- `main.py:162-215` üç ayrı probe; `/ready` 503 dönüyor DB down ise.

#### 4.2.14 Bcrypt 72-char Sınırı

- **Ciddiyet:** Low
- `schemas/user.py` (MEMORY notu) `max_length=72`. UI'da görünür mesaj olmalı (form validation).

---

### 4.3 Frontend

#### 4.3.1 `Admin.tsx` Monolit — **High**

- **Ciddiyet:** High
- **Öncelik:** P1
- **İlgili:** `frontend/src/routes/Admin.tsx` (1845 satır)
- **Kanıt:** İlk 100 satır taraması: focus-trap helper, formatDate, AdminProject tipi, defaultProjectFormValues import — hepsi tek dosya. CRUD üç domain (projects, skills, experiences) + messages.
- **Problem:** Cognitive load çok yüksek; testlenemez; tab değiştirmede yan etki riski.
- **Etki:** Her admin değişikliği tüm dosyayı bundle'a sokuyor; kod inceleme imkansız.
- **Çözüm:**
  - `components/admin/ProjectsTab.tsx`, `SkillsTab.tsx`, `ExperiencesTab.tsx`, `MessagesTab.tsx`
  - `lib/admin/focus-trap.ts` (FOCUSABLE_SELECTOR + getFocusableElements)
  - `lib/admin/format-date.ts`
  - `Admin.tsx` 200 satır altına insin (layout + tab orchestration).

#### 4.3.2 `api.ts` 401+403 Token Wipe — **Regression**

- **Ciddiyet:** High
- **Öncelik:** P0
- **İlgili:** `frontend/src/services/api.ts:62-70`
- **Kanıt:**
  ```ts
  if (status === 401 || status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      ...
    }
  }
  ```
- **Problem:** MEMORY/PR-1 spec sadece 401 → wipe; 403 yetkisizlik (örn. admin değil) iken kullanıcı oturumu silinmemeli.
- **Etki:** 403 sonrası user re-login gerekiyor — public flow'larda admin endpoint'e yanlışlıkla istek atan user oturumdan çıkıyor.
- **Çözüm:** `if (status === 401)` olarak daralt.

#### 4.3.3 `api.ts` Hard-coded `/admin` Redirect

- **Ciddiyet:** Medium
- **İlgili:** `frontend/src/services/api.ts:67-69`
- **Kanıt:** `if (window.location.pathname.startsWith('/admin'))`
- **Problem:** Yeni protected route eklendiğinde unutulur.
- **Çözüm:** `ProtectedRoute` component'ı 401 event'i dinlesin; api.ts sadece event dispatch etsin (`api:error` zaten var, `api:unauthorized` ek event).

#### 4.3.4 `next/image` Yok — **High**

- **Ciddiyet:** High
- **Öncelik:** P1
- **İlgili:** Tüm `<img>` kullanımları (Home hero, Admin upload preview, Projects cover)
- **Kanıt:** Grep `next/image` sadece `next-env.d.ts` tip tanımında; runtime kullanımı yok.
- **Etki:** LCP geç, format dönüşümü (WebP/AVIF) yok, responsive `srcset` yok.
- **Çözüm:** `next/image` + `next.config.mjs` içinde `images.remotePatterns` (Supabase storage host).

#### 4.3.5 ESLint Kapalı Kurallar — **High Regression**

- **Ciddiyet:** High
- **Öncelik:** P1
- **İlgili:** `frontend/.eslintrc.cjs:14-16`
- **Kanıt:**
  ```js
  'react-hooks/exhaustive-deps': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  ```
  Ayrıca `jsx-a11y` plugin yok (MEMORY: `eslint-plugin-jsx-a11y` extends'e eklenmişti — regression).
- **Etki:** Stale closure ve `any` sızıntısı; a11y check'leri devre dışı.
- **Çözüm:** Önce `'warn'`'a çek + `eslint-plugin-jsx-a11y` ekle; ihlalleri batch fix; sonra `'error'`.

#### 4.3.6 Frontend Coverage Threshold Yok — **Regression**

- **Ciddiyet:** High
- **Öncelik:** P1
- **İlgili:** `frontend/vite.config.ts:35-39`
- **Kanıt:** `coverage: { provider: 'v8', reporter: [...], reportsDirectory: ... }` — `thresholds` yok. MEMORY'de `lines/functions/statements: 20, branches: 15` belirtilmişti.
- **Etki:** Coverage düşse de CI yeşil.
- **Çözüm:**
  ```ts
  coverage: {
    ...
    thresholds: { lines: 30, functions: 30, statements: 30, branches: 20 }
  }
  ```

#### 4.3.7 `*Client.tsx` Wrapper Indirection

- **Ciddiyet:** Medium
- **İlgili:** `routes/HomeClient`, `AboutClient`, `ProjectsClient`, `ContactClient`
- **Kanıt:** Tipik içerik:
  ```tsx
  "use client";
  import Home from "@/routes/Home";
  import { useLanguage } from "@/contexts/LanguageContext";
  export default function HomeClient() {
    const { language } = useLanguage();
    return <Home locale={language} />;
  }
  ```
- **Problem:** Sırf locale geçirmek için ekstra component katmanı.
- **Çözüm:** Server tarafında `getRequestLocale()` (`src/lib/locale.ts`) zaten var — `app/(public)/page.tsx` doğrudan `locale` prop'u versin; `*Client.tsx` kaldırılır. `LanguageContext`'in client-side dil değişimi için ayrı bir mini hydration gerekiyorsa, dil değişimi için `router.refresh()` paterni daha temiz.

#### 4.3.8 `site.ts` Monolit (767 satır)

- **Ciddiyet:** Medium
- **Öncelik:** P2
- **İlgili:** `frontend/src/content/site.ts`
- **Kanıt:** 767 satır; `siteConfig`, `uiDictionary`, `homeContent`, `aboutContent`, `contactContent`, `seoContent`, `projectRecords`, `skillGroups`, `impactMetrics` tek dosyada.
- **Problem:** İçerik+config+i18n karışımı; client tree'sine sürükleniyor.
- **Çözüm:** `content/{config,ui,home,about,contact,seo,projects,types}.ts` parçalanması; `import "server-only"` ekleyerek server-only veriyi koru.

#### 4.3.9 `AuthContext` Token Refresh Stratejisi Yok

- **Ciddiyet:** Medium
- **İlgili:** `frontend/src/contexts/AuthContext.tsx`
- **Kanıt:** `useEffect([token])` sadece `/auth/me` ile doğrulama; access expiry'de otomatik refresh yok. Backend `/auth/refresh` mevcut ama client kullanmıyor.
- **Etki:** 15 dk sonra kullanıcı manuel re-login.
- **Çözüm:** axios interceptor 401 alınca tek seferlik `/auth/refresh` denesin; başarısızsa wipe.

#### 4.3.10 Toast Map'siz Timeout

- **Ciddiyet:** Low
- **İlgili:** `frontend/src/components/Toast.tsx`
- **Kanıt:** `window.setTimeout(() => hideToast(id), duration)` — ID Map'i yok; toast manuel kapanırsa timer fire'ı no-op (idempotent ama timer çalışmaya devam ediyor).
- **Notu:** MEMORY spec `useRef<Map>` istemişti — regression. Düşük etki.

#### 4.3.11 SEO + JSON-LD ✓

- **Pozitif:** `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/twitter-image.tsx`, `lib/metadata.ts` `buildPersonJsonLd` — solid SEO katmanı.

#### 4.3.12 next/font ✓

- **Pozitif:** `app/layout.tsx:3-23` `Inter`, `JetBrains_Mono`, `Space_Grotesk` self-hosted; latin subset.

#### 4.3.13 Theme Flash Yok ✓

- `app/layout.tsx:42-53` inline script localStorage + system preference; `suppressHydrationWarning` doğru.

#### 4.3.14 server-component-boundary Linter ✓

- `frontend/scripts/check-public-server-components.mjs` + `npm run check:server-boundaries` (CI'da çalışıyor `ci.yml:102-104`) — yaratıcı ve değerli.

---

### 4.4 Frontend ↔ Backend Data Flow

#### 4.4.1 Type Contract Sağlanmamış

- **Ciddiyet:** Medium
- **Öncelik:** P2
- **Kanıt:** `frontend/src/services/types.ts` el-yazısı tipler; backend Pydantic schema'larından otomatik üretilmiyor.
- **Etki:** Backend schema değişikliği sessizce çalışan ama yanlış tip aktaran istek üretebilir.
- **Çözüm:** `openapi-typescript` ile `npm run gen:api` script + CI step. FastAPI `/openapi.json` zaten available.

#### 4.4.2 Error Contract Standart Değil

- **Kanıt:** Backend `{success, error, details?}` (main.py:122,128); CRUD `ValueError`→400, not-found→404. Frontend tarafında merkezi parser yok.
- **Çözüm:** `lib/errors.ts` ile standart `parseApiError(err) → { code, message, fields }` + Toast/inline gösterim.

#### 4.4.3 Cache Invalidation / TanStack Query Yok

- **Kanıt:** MEMORY'de `src/lib/queryKeys.ts` referansı vardı; current branch'te dosya araştırması yapıldı, kullanım sınırlı (Doğrulanmalı). CRUD sonrası tutarlılık yönetimi component-level.
- **Çözüm:** TanStack Query ile cache + invalidate; admin form submit sonrası `queryClient.invalidateQueries(projectKeys.all)`.

#### 4.4.4 Language Query Param Otomatik Ekleme

- **Pozitif:** `api.ts:14-22` GET + non-`/auth/*` filtresi öngörülebilir.
- **Risk (Low):** Cache invalidation yok; aynı endpoint farklı `language` ile cache'leniyor olsaydı çakışma yaratabilirdi (TanStack ile kullanılıyorsa key'e dahil edilmeli).

---

### 4.5 UI/UX

> Lokal olarak çalıştırılamadı (plan modu, sadece okuma). Aşağıdaki bulgular statik kod analizine dayanıyor; runtime testler önerilen QA listesinde.

#### 4.5.1 Public Home

- **Pozitif:** `routes/Home.tsx` JSON-LD + featured projects + animated section.
- **Sorun (Medium):** Hero görseli `<img>` ile (next/image yok) → LCP cezası. Mobile padding/spacing tutarlı (Tailwind breakpoint'leri).
- **Aksiyon:** `next/image priority` + WebP variant + blurDataURL.

#### 4.5.2 About

- **Pozitif:** `routes/About.tsx` — MEMORY notu `<Link to>` regression'ı düzelttiğini söylüyor; `routes/About.tsx`'e SSR test'i public-routes.ssr.test.tsx'te var.
- **Doğrulanmalı:** İçeriğin TR/EN paritesi.

#### 4.5.3 Projects

- **Pozitif:** Keyboard nav + role/tabIndex + Esc modal close — MEMORY spec'inde belgelenmiş; mevcut görünüyor.
- **Sorun (Low):** Filter UI (tag/teknoloji) varsa ARIA `aria-pressed` durumu doğrulanmalı.

#### 4.5.4 Blog List + Detail

- **Pozitif:** Skeleton loader (BlogSkeleton), tag focus ring, "post not found" state.
- **Sorun (Low — Codex revizyonu):** `react-markdown` + `rehype-highlight` kullanılıyor; `rehype-raw` veya `dangerouslySetInnerHTML` markdown render path'inde **yok** (grep doğrulandı: dangerouslySetInnerHTML sadece `app/layout.tsx:67` theme script + `routes/Home.tsx:32` JSON-LD'de — ikisi de controlled). Bu yüzden "doğrudan XSS" değil, "**markdown sanitization politikası açıkça tanımlanmamış**" — react-markdown default behavior güvenli, ancak ileride `rehype-raw` eklenirse koruma yok.
- **Aksiyon:** `rehype-sanitize` ekle (defense-in-depth); ADR'ye "raw HTML markdown'da yasak" politikası yaz; eslint custom rule veya CI grep ile `rehype-raw` import'u engelle.

#### 4.5.5 Contact

- **Pozitif:** `ContactForm.test.tsx` — draft persistence, validation, submit tested.
- **Sorun (Medium):** Email regex `/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i` (ContactForm:65) RFC5322 değil; backend Pydantic `EmailStr` daha sıkı — frontend "kabul ediyor", backend "reddediyor" dissonance'ı.
- **Aksiyon:** Frontend'i basit boundary ile bırak (form submission backend'in son söz olduğunu kabul etsin); error state'i backend mesajına bağla.

#### 4.5.6 Login

- **Sorun (Medium):** Hesap kilidi feedback'i yok (login lockout backend'de yok zaten — ürün-hata-bildirim eşlemesi).
- **Aksiyon:** Backend lockout eklendikten sonra `423 Locked` ya da custom error code'a "Try again in N minutes" UI bağlanmalı.

#### 4.5.7 Admin Dashboard

- **Sorun (High):** `Admin.tsx` 1845 satır → admin'in iş akışı hızlı ama her formun durumu inanılmaz dolaşık. Form submission sırasında loading state per-tab değil global olabiliyor (Doğrulanmalı).
- **Aksiyon:** Tab başına `useReducer` veya TanStack `useMutation`.

#### 4.5.8 Loading/Error/Empty States

- **Kanıt:** ContactForm + Blog skeleton + Login error mesajı tutarlı; Projects/Admin tarafında aynı disiplin uygulanmalı.

#### 4.5.9 Mobil Deneyim

- **Pozitif:** Tailwind breakpoints yaygın; Navigation route change'de mobile menu kapanıyor.
- **Sorun (Low):** Touch target boyutları doğrulanmadı; ContactForm submit button focus ring var.

#### 4.5.10 Accessibility

- **Sorun (High):** `eslint-plugin-jsx-a11y` aktif değil → otomatik a11y kontrol yok. Manuel: alt text, aria-label, focus management görünüyor (Navigation, ProjectExplorer, ErrorBoundary), ama uygulama kapsamı parça parça.
- **Aksiyon:** Plugin enable, tüm ihlalleri toplu fix; `eslint --report-unused-disable-directives` zaten açık (`package.json:10`).

---

### 4.6 Security

#### Doğrulanmış Güvenlik Bulguları

- **(High)** `npm audit` `continue-on-error: true` (`ci.yml:113`) — bkz. Bulgu #1.
- **(High)** Email-only admin (`deps.py:103-117`) — bkz. Bulgu #5.
- **(High)** `logger.debug` admin email listesi (`deps.py:107-109`) — bkz. Bulgu #7.
- **(High)** Default `ADMIN_EMAILS` kişisel email (`config.py:34`) — bkz. Bulgu #8.
- **(Medium)** CORS `allow_methods=["*"]` + credentials (`main.py:84`).
- **(Medium)** Login lockout yok (`auth.py:67-90`); rate limit IP-bazlı.
- **(Low)** `JWT_ALGORITHM` rotation politikası yok; algorithm pin var.
- **(Low)** Root endpoint email + GitHub URL hardcoded (`main.py:228-230`).
- **(High — Codex doğrulama)** `storage_service.py:180` `validate_file` magic-byte yok; sadece uzantı + boyut. Bkz. §4.2.11 ve Bulgu #16.
- **(High — Codex doğrulama)** `seed_data.py:43` `SEED_ADMIN_PASSWORD` env yoksa generated parolayı stdout'a basıyor. Bkz. Bulgu #17.
- **(Pozitif)** ILIKE escape, refresh token rotation, blacklist, CAPTCHA prod-zorunlu, HTML escape email, filename sanitization, Pydantic validation, validation error production-hidden, request logging PII'siz.

#### Muhtemel Güvenlik Riskleri / Doğrulama Gerekenler

- **(Low — Codex revizyonu)** `react-markdown` + `rehype-highlight` markdown render — `rehype-raw` ve `dangerouslySetInnerHTML` markdown path'inde yok (grep doğrulandı). Doğrudan XSS yok, ancak `rehype-sanitize` defense-in-depth olarak eklenmeli ve "raw HTML markdown'da yasak" politikası ADR'ye yazılmalı.
- **(Doğrulanmalı)** `.env` içeriği — `git check-ignore` doğruladı, ama `git log -p .env` kontrol edilmeli (geçmişte commit edilmiş mi?).
- **(Doğrulanmalı)** `services/email_service.py` SMTP TLS modu (STARTTLS vs implicit TLS) port 587 ile uyumlu mu?
- **(Doğrulanmalı)** Supabase signed URL süresi (storage_service'te); `MAX_UPLOAD_SIZE=10MB` config.py:123 ✓.
- **(Doğrulanmalı)** GitHub repo sync admin-only mi? `api/v1/github.py` endpoint dependency'leri kontrol edilmeli.
- **(Doğrulanmalı)** CSRF: SPA + Bearer token mimarisinde CSRF az risk; ancak `SameSite=Lax` cookie kullanımı için (LanguageContext set ediyor `samesite=lax` doğru) sorun yok.

#### Eksik Güvenlik Yapıtları

- `.github/dependabot.yml` yok → bağımlılık güncelleme manuel.
- `SECURITY.md` yok → vulnerability disclosure politikası yok.
- CSP/Security headers `next.config.mjs`'de yok → XSS sertleştirme eksik.
- Sentry yok → güvenlik olayı tespiti yok.

---

### 4.7 Performance

#### Doğrulanmış Performans Bulguları

- **(High)** `next/image` yok → LCP cezası (Bulgu #6).
- **(Medium)** Dynamic import yok → ProjectExplorer modal, AdminForms tam bundle'da.
- **(Medium)** `site.ts` 767 satır client'a sızıyor → bundle ağırlığı.
- **(Medium)** Vite manualChunks tanımlı (`vite.config.ts:18-26`) ama Next App Router build'inde kullanılmıyor — vite config sadece test için var. Next chunking otomatik.
- **(Low)** `framer-motion` yerine `motion` (lighter) — pozitif seçim.
- **(Pozitif)** Backend joinedload, atomic UPDATE, bulk commit, Redis cache, pool_pre_ping/pool_recycle, slim Docker image, healthcheck.
- **(Pozitif)** Backend pagination her listede; admin stats `func.count` ile.

#### Muhtemel Performans Riskleri / Ölçüm Gerekenler

- **(Doğrulanmalı)** TTFB ölçümü: Next 16 server component first-byte, Vercel cold start, Railway warm start tahmini.
- **(Doğrulanmalı)** Bundle size: `npm run analyze` çıktısı; `motion` + `react-markdown` + `highlight.js` 3 ana ağırlık.
- **(Doğrulanmalı)** Postgres slow query log; Railway production query latency.
- **(Doğrulanmalı)** Redis memory policy (docker-compose'da `requirepass` var, `maxmemory-policy` yok).
- **(Doğrulanmalı)** AnimatedBackground canvas FPS impact mobil cihazlarda.

---

### 4.8 Testing

#### Backend (12 test dosyası)

`backend/tests/`:
- `conftest.py` — SQLite + StaticPool + admin email fixture + rate limiter reset (MEMORY/agent doğrulandı).
- `test_admin_stats.py`, `test_auth.py`, `test_blog.py`, `test_config.py`, `test_contact_messages.py`, `test_experiences.py`, `test_github.py`, `test_projects_admin.py`, `test_skills.py`, `test_system_health.py`, `test_technologies.py`, `test_translations.py` (toplam 12 dosya).
- `pytest.ini`: `--cov=app.api.v1 --cov=app.crud --cov=app.api.deps --cov-fail-under=80`.

**Sorunlar:**
- **(High)** Coverage scope `app.services`, `app.models`, `app.schemas`, `app.utils`, `app.core`, `app.main` dışlanmış → gerçek coverage muhtemelen %50-65 ama raporlanan %80+.
- **(Medium)** Rate limit testi yok (slowapi behavior).
- **(Medium)** Captcha bypass / Captcha success path testi yok.
- **(Medium)** Refresh token rotation race condition testi yok.
- **(Medium)** SQLite ↔ PostgreSQL fark (PG_INET, ARRAY, JSON variant) → test env'de SQLite, prod'da PG; davranışsal farklar yakalanmıyor.
- **(Low)** E2E API testi yok (Playwright API mode veya schemathesis).

**Aksiyon:**
- `--cov=app` ile scope genişlet, `--cov-fail-under=70` daha gerçekçi başla.
- `tests/test_rate_limit.py` (auth/contact 6. istek 429).
- `tests/test_token_refresh.py` (rotation + blacklist).
- `testcontainers-python` ile PostgreSQL'e karşı entegrasyon test runner'ı.

#### Frontend (3 test dosyası)

- `src/components/ContactForm.test.tsx` (152 satır — draft, validation, submit).
- `src/lib/metadata.test.ts` (40 satır — metadata, robots, sitemap).
- `src/test/public-routes.ssr.test.tsx` (83 satır — Home/About/Projects/Contact SSR).

**Sorunlar:**
- **(High)** AuthContext, LanguageContext, Navigation, ProjectExplorer, Toast, Admin tabs **testsiz**.
- **(High)** Coverage threshold yok (Bulgu #9).
- **(Medium)** E2E (Playwright) yok → admin login → CRUD → logout flow yok.
- **(Medium)** API client mock infra yok (`src/test/setup.ts` minimal).

**Aksiyon:**
- `vite.config.ts` `coverage.thresholds` ekle.
- AuthContext + LanguageContext unit test'leri (MEMORY notları zaten yazım rehberi içeriyor — `mockGet.mockResolvedValue` paterni dokümantasyonu hazır).
- Playwright `tests/e2e/` ile public + admin smoke flow.

---

### 4.9 DevOps / CI-CD / Operations

#### 4.9.1 CI Pipeline (`.github/workflows/ci.yml`)

- **Pozitif:**
  - SHA pin'leri (Action'lar 40-char).
  - `permissions: contents: read` minimization (`ci.yml:17-18`).
  - pip-audit (`ci.yml:52-56`).
  - `check:server-boundaries` linter (`ci.yml:102-104`) — özgün ve değerli.
  - SonarCloud `qualitygate.wait=true` (push-only ama).
- **Sorunlar:**
  - **(Critical)** `npm audit` `continue-on-error: true` (Bulgu #1).
  - **(Medium)** SonarCloud `if: ${{ github.event_name == 'push' }}` → PR'larda çalışmıyor; `sonar-pr-gate.yml` ayrıca kuruluyor ama opsiyonel.
  - **(Medium)** Backend coverage scope dar — bkz. §4.8.
  - **(Low)** Frontend `type-check` step'i CI'da yok (sadece `lint`+`test:coverage`+`build`); `package.json:12` var ama çalıştırılmıyor.

#### 4.9.2 Migration / Schema (Alembic Yok)

- **Ciddiyet:** **Critical**
- **Öncelik:** P0
- **Kanıt:** `portfolio-project/backend/alembic*` → 0 dosya. `init_db.py` `Base.metadata.create_all`. `deploy-production.yml:109-112` Railway webhook'a POST atıyor — webhook ne yapıyor unspecified.
- **Etki:** Yeni kolon → manuel SQL → rollback yok → audit trail yok.
- **Çözüm:**
  1. `alembic init alembic`; baseline `alembic revision --autogenerate -m "baseline"`.
  2. CI'da `alembic upgrade head` test (sqlite ile).
  3. `deploy-production.yml` migration step'i alembic ile değiştir; mevcut webhook'u dokümante et veya kaldır.

#### 4.9.3 Docker

- **Pozitif:** `Dockerfile` non-root user (`appuser`), HEALTHCHECK 30s, `python:3.13-slim`, `--no-cache-dir`. `docker-compose.yml` mandatory env (`POSTGRES_PASSWORD:?...`), depends_on health, internal_net isolation.
- **Sorunlar:**
  - **(Medium)** Single-stage build → `gcc` runtime image'da kalıyor (~50MB fazla, attack surface).
  - **(Medium)** `docker-compose.yml:13` `../database/migrations:/docker-entrypoint-initdb.d:ro` Windows path; cross-platform sorun.
  - **(Medium)** Redis `maxmemory-policy` yok.
- **Çözüm:** Multi-stage Dockerfile (`builder` + `runtime`); migration paths repo-relative; Redis `maxmemory 256mb maxmemory-policy allkeys-lru`.

#### 4.9.4 Production Deploy

- **Sorun (Critical)** `deploy-production.yml:198-200` smoke test `grep -q "https://yigitokur.me"` hardcoded.
- **Sorun (High)** Migration webhook'a sağlık kontrolü yok; başarısızsa frontend yine deploy oluyor.
- **Sorun (Medium)** Smoke test başarısızlığı sonrası rollback otomasyonu yok.

#### 4.9.5 Observability

- **Yok:** Sentry, OpenTelemetry, Prometheus, structured JSON logs.
- **Var:** loguru file logging (rotated), GitHub Action step summary, basic uptime via `/health`/`/ready`.
- **Aksiyon:** Sentry SDK entegrasyonu (BE Python + FE Next), source map upload, release/`SENTRY_RELEASE`. JSON log output (`loguru.add(serialize=True)`) prod'da.

#### 4.9.6 Secret Management

- **Pozitif:** `.env` gitignored ✓ (doğrulandı). GitHub Secrets + Vercel/Railway env.
- **Sorun (High — Codex doğrulama)** `seed_data.py:42-44` `SEED_ADMIN_PASSWORD` env yoksa `secrets.token_urlsafe(18)` ile üretip `print(...)` ile stdout'a basıyor → CI log / operatör terminali expose. **Doğrulandı (2026-04-23).** Bkz. Bulgu #17.
- **Sorun (Medium)** `.env.example:26` `SMTP_USERNAME=yigitokur@ieee.org` (agent doğrulamış) → kişisel email örnek olarak.

#### 4.9.7 Branch Protection / CODEOWNERS

- **Pozitif:** `.github/CODEOWNERS` var (single owner @TurkishKEBAB).
- **Sorun (Low):** Branch protection rules kod tabanında dokümante değil; GitHub Settings'e bağlı.

#### 4.9.8 Cross-Platform

- **Sorun (Medium):** `start.ps1`, `quality.ps1` PowerShell-only; macOS/Linux geliştirici çalıştıramaz. `npm` script'leri OK ama orchestration PowerShell'e bağlı.
- **Aksiyon:** `start.sh`, `quality.sh` veya `Makefile` veya `just` ekle.

---

### 4.10 Dependencies

#### Backend (`requirements.txt` + `requirements-dev.txt`)

- **Modern:** FastAPI 0.104+, SQLAlchemy 2.0+, Pydantic 2.10+, PyJWT 2.8+ (CVE düzeltildi), bcrypt 4.1+.
- **Sorun (Medium):** `slowapi >=0.1.9, <1.0.0` — proje aktif bakım hızı düşük (son release 2023); alternatif `fastapi-limiter` (Redis-bazlı) ya da custom middleware.
- **Sorun (Low):** Caret-style `>=` üst sınırlar geniş — minor güncelleme otomatik kabul; `==` veya dar pin daha öngörülebilir.
- **Sorun (Low):** `cryptography >=46.0.5` (CVE-aware versiyon).

#### Frontend (`package.json`)

- **Sorun (High):** `eslint ^8.55.0` → ESLint 8 EOL (Eylül 2024); ESLint 9 flat config gerekli.
- **Sorun (High):** `@typescript-eslint/eslint-plugin ^6.14.0` ve `parser ^6.14.0` — current major v8; v6 → v8 migration gerekli (TypeScript 5.4+ gerçek desteği için).
- **Sorun (Medium):** `vitest ^3.2.4` ile `vite ^5.0.8` mismatch — Vitest 3 vite 6+ önerir; coverage instabilite riski.
- **Sorun (Medium):** `next ^16.2.1` major caret — 17 otomatik kabul. Pin: `next@16.2.x`.
- **Sorun (Medium):** `axios ^1.6.2` — current 1.7+ (CVE-2024-39338 vs durumu doğrulanmalı; pin günceleme).
- **Sorun (Low):** `eslint-plugin-react-hooks ^4.6.0` — v5 mevcut.
- **Eksik:** `eslint-plugin-jsx-a11y` (regression — MEMORY belgeli).

#### Aksiyon

- `dependabot.yml` haftalık pip + npm + github-actions; `open-pull-requests-limit: 5`.
- ESLint 9 + flat config + jsx-a11y + react-hooks v5 + typescript-eslint v8 migration single PR.
- Vite + Vitest sürüm hizalaması.

---

### 4.11 Documentation / DX

#### 4.11.1 Tarihsel MD Çoğulluğu — **High**

- **Kanıt:** `portfolio-project/` kökünde 12+ MD (BACKEND_COMPLETE, BACKEND_PACKAGES_INSTALLED, COMPREHENSIVE_PROJECT_ANALYSIS, DETAILED_ANALYSIS_REPORT, FRONTEND_STARTED, IMPLEMENTATION_AUDIT, INSTALLATION_SUMMARY, PROGRESS, TASK1_BACKEND_ANALYSIS, TODO_QUICKSTART, AUDIT_REMEDIATION).
- **Etki:** Yeni katkıcı 12 dosya gezerek "hangi gerçek?" sorusunu yanıtlamaya çalışıyor.
- **Aksiyon:** `portfolio-project/docs/_archive/` altına taşı; `README.md` (root, 2 satır) anlamlı bir landing'e çevir; canonical: `README.md`, `AGENTS.md`, `GIT_WORKFLOW.md`, `QUICKSTART.md`, `docs/architecture.md`, `docs/runbook.md`.

#### 4.11.2 Root `README.md` (2 satır)

- "Bu kendi kişisel web sayfam/portfolyom" — onboarding için yetersiz.
- **Aksiyon:** Tech stack, hızlı başlangıç, deployment akışı (3-4 paragraf).

#### 4.11.3 ADR Yok

- Mimari karar kayıtları (ör. "Neden Alembic değil `create_all`?", "Neden TanStack Query değil context+axios?") yok.
- **Aksiyon:** `docs/adr/0001-record-architecture-decisions.md` ile başla; her büyük kararı 1 sayfa.

#### 4.11.4 API Doc

- **Pozitif:** FastAPI `/docs` (dev only), `/redoc`.
- **Sorun (Medium):** `/openapi.json` CI artifact olarak yayınlanmıyor → frontend type generation manuel.
- **Aksiyon:** CI step `python -c "import json; from app.main import app; print(json.dumps(app.openapi()))" > openapi.json` ve artifact upload; frontend `npm run gen:api`.

#### 4.11.5 Cross-platform Komutlar

- **Sorun:** PowerShell-only — bkz. §4.9.8.

---

## 5. DOSYA/KLASÖR BAZLI REFACTOR ÖNERİLERİ

### Repo Root (`c:\Develop\Projects\Site\`)

- **İş:** Repo orchestration (CI, README, agent talimatları).
- **Konum:** Doğru.
- **Sorun:** `start.ps1` PowerShell-only; root `README.md` 2 satır.
- **Aksiyon:** `start.sh` ekle; root README'i kapsamlı hale getir; `docs/_archive/` oluştur.

### `portfolio-project/`

- **İş:** Monorepo kök; backend + frontend + ortak script'ler.
- **Konum:** Doğru, ama 12+ tarihsel MD kirliliği.
- **Aksiyon:** MD'leri `docs/_archive/`'e taşı. `quality.ps1`'a Bash karşılığı ekle.

### `portfolio-project/backend/`

- **İş:** FastAPI service.
- **Konum:** Doğru.
- **Eksik:** `alembic/` klasörü; `app/services/observability.py` (Sentry init).
- **Aksiyon:** Alembic kur; `app/services/sentry.py` ekle; `app/middleware/security_headers.py` (CSP, X-Frame-Options).

### `portfolio-project/backend/app/`

- **İş:** FastAPI uygulama paketi.
- **Konum:** Doğru.
- **Sorun:** `services/` katmanı 5 servis (cache, captcha, email, github, storage) iyi; ama `email_service.py` admin notification alıcısı SMTP_USERNAME (hardcoded recipient, agent notu).
- **Aksiyon:** `ADMIN_NOTIFICATION_EMAIL` env var; default `SMTP_USERNAME` fallback.

### `portfolio-project/backend/app/api/`

- **İş:** REST endpoint'leri.
- **Konum:** `v1/` versioning iyi.
- **Sorun:** `admin.py` ve diğer domain'ler arasında dashboard stats tek yerde — iyi.
- **Aksiyon:** Dosyalar küçük (her biri 50-300 satır); değişiklik gerekmiyor.

### `portfolio-project/backend/app/crud/`

- **İş:** DB operations.
- **Konum:** Doğru, her domain ayrı.
- **Sorun:** Tutarlı pattern (CRUD + bulk + count).
- **Aksiyon:** `crud/base.py` (generic `CRUDBase[Model, CreateSchema, UpdateSchema]`) + her domain inherit — sadece ortak pattern repetisyonu varsa; mevcut yapı sade ve okunabilir, premature abstraction yapmaktan kaçın.

### `portfolio-project/backend/app/models/`

- **İş:** SQLAlchemy models.
- **Konum:** Doğru.
- **Eksik:** `User.is_admin` (bkz. Bulgu #5); `User.failed_login_count`, `User.locked_until` (bkz. §4.2.6).
- **Aksiyon:** Alembic migration ile kolonları ekle; `User.audit_log` ilişkisi (opsiyonel).

### `portfolio-project/backend/app/schemas/`

- **İş:** Pydantic v2 contracts.
- **Konum:** Doğru, `ConfigDict(from_attributes=True)` PR-3 sonrası.
- **Aksiyon:** Yok (mevcut kalite iyi).

### `portfolio-project/backend/app/services/`

- **İş:** Infrastructure / 3rd party orchestration.
- **Sorun:** `email_service` admin notify hardcoded (yukarıda); `github_service` sadece read; `storage_service` Supabase wrapper.
- **Aksiyon:** `notification_service.py` (email + future webhooks); `observability_service.py` (Sentry + log enricher).

### `portfolio-project/backend/tests/`

- **İş:** pytest suite.
- **Sorun:** Coverage scope dar; rate limit / refresh token / CAPTCHA testi yok.
- **Aksiyon:** §4.8 başlığındaki test ek planı uygula.

### `portfolio-project/frontend/`

- **İş:** Next.js App Router uygulaması.
- **Sorun:** `vite.config.ts` artık sadece test için kullanılıyor (Next.js build kendi); coverage threshold yok.
- **Aksiyon:** `vite.config.ts` build config'i (manualChunks vs.) Next ile çelişmediğinden temizlenebilir; sadece test config bırak.

### `portfolio-project/frontend/app/`

- **İş:** App Router routes + sitemap/robots/og.
- **Konum:** Doğru, route group disiplini iyi.
- **Sorun:** `(public)/page.tsx` → `<HomeClient/>` indirection; bkz. §4.3.7.
- **Aksiyon:** Wrapper'ları kaldır.

### `portfolio-project/frontend/src/components/`

- **İş:** Shared UI + form/widget.
- **Sorun:** `admin/AdminForms.tsx` Admin'le tightly coupled; `AnimatedBackground` canvas perf etkisi.
- **Aksiyon:** `components/admin/` altına Tab componentlerini Admin.tsx'ten ayır; AnimatedBackground'ı `prefers-reduced-motion` respect.

### `portfolio-project/frontend/src/contexts/`

- **İş:** Auth + Language providers.
- **Sorun:** Token refresh stratejisi yok (§4.3.9); LanguageContext SSR'ı doğru ama `react-server-only` enforcement yok.
- **Aksiyon:** Refresh interceptor; LanguageContext `useMemo` + split (`useLanguageT`, `useLanguageCurrent`).

### `portfolio-project/frontend/src/routes/`

- **İş:** Page-level orchestration.
- **Sorun:** `Admin.tsx` 1845 satır (Bulgu #3); `*Client.tsx` indirection (§4.3.7).
- **Aksiyon:** Admin split + wrapper kaldırma.

### `portfolio-project/frontend/src/services/`

- **İş:** API client + thin wrappers.
- **Sorun:** `api.ts` 401+403 wipe (Bulgu #4); `/admin` hardcoded (§4.3.3); type-safe contract manuel.
- **Aksiyon:** Bulguya göre düzelt; openapi-typescript ile generate.

### `portfolio-project/frontend/src/content/`

- **İş:** Statik içerik + i18n.
- **Sorun:** `site.ts` 767 satır (Bulgu #12).
- **Aksiyon:** Topic-based split.

### `.github/workflows/`

- **İş:** CI/CD.
- **Sorun:** npm audit gate (Bulgu #1); SonarCloud PR gating opsiyonel; smoke test hardcoded domain; deploy migration unspecified.
- **Aksiyon:** §4.9 detayında.

---

## 6. 30-60-90 GÜNLÜK ROADMAP

### 30 Gün (Stabilizasyon — Critical/High düzeltmeleri)

| İş | Etki | Risk | Öncelik |
|---|---|---|---|
| `npm audit` `continue-on-error` kaldır + ihlalleri triage | Açık güvenlik gate | Düşük (geçici fail) | **P0** |
| `api.ts` 401+403 → 401-only | Kullanıcı oturum stabilitesi | Düşük | **P0** |
| `deps.py` admin email log kaldır | PII/yetkilendirme sızıntısı kapan | Düşük | **P0** |
| `config.py` default `ADMIN_EMAILS` boşalt + validation enforce | Güvenli default | Düşük (env zorunlu olur) | **P0** |
| Alembic kur + baseline migration + CI'da `upgrade head` test | Schema versiyonlama | Orta (mevcut DB ile uyum) | **P0** |
| `User.is_admin` kolonu + `require_admin` öncelik DB → email fallback | Authz audit edilebilir | Orta | **P1** |
| Frontend coverage threshold (vite.config.ts) ekle | Test gate | Düşük | **P1** |
| ESLint `exhaustive-deps` ve `no-explicit-any` `'warn'`'a çek + jsx-a11y plugin | Kod kalitesi | Düşük (warning seli) | **P1** |
| Tarihsel MD'leri `docs/_archive/` taşı + root README yaz | DX kazancı | Düşük | **P2** |
| `dependabot.yml` ekle (haftalık pip+npm+actions) | Bağımlılık güncel | Düşük | **P1** |

### 60 Gün (Genişleme — Maintainability + Observability)

| İş | Etki | Risk | Öncelik |
|---|---|---|---|
| `Admin.tsx` parçala (ProjectsTab/SkillsTab/ExperiencesTab/MessagesTab) | Bakım maliyeti yarıya | Orta (regresyon riski) | **P1** |
| `site.ts` parçala (config/ui/home/about/contact/seo/projects) | Bundle + bakım | Düşük | **P2** |
| `next/image` migrasyonu + `images.remotePatterns` | LCP iyileştirme | Düşük | **P1** |
| Sentry SDK (BE+FE) entegrasyonu, source map upload | Prod hata görünürlüğü | Düşük | **P1** |
| openapi-typescript ile FE type generation | API contract drift'i biter | Düşük | **P2** |
| `auth.py` login lockout (failed_count + locked_until) | Brute-force koruma | Orta (UX dikkat) | **P1** |
| Backend coverage scope `--cov=app` + threshold 70 | Gerçek coverage | Orta (ihlaller görünür) | **P1** |
| Multi-stage Dockerfile + `maxmemory-policy` Redis | Image size + cache stability | Düşük | **P2** |
| `ESLint 9 + typescript-eslint v8` migration | Modern lint | Orta (config rewrite) | **P2** |
| `*Client.tsx` wrapper'ları kaldır | Render ağacı sade | Düşük | **P2** |

### 90 Gün (Sürdürülebilirlik — Test + Mimari)

| İş | Etki | Risk | Öncelik |
|---|---|---|---|
| TanStack Query (FE) + cache invalidation | UX, admin form stability | Orta | **P2** |
| Playwright E2E (public + admin smoke) | Regression koruma | Orta | **P2** |
| testcontainers-python ile PostgreSQL entegrasyon test | SQLite ↔ PG fark yakalama | Orta | **P2** |
| Security headers (next.config + FastAPI middleware: CSP, X-Frame-Options, X-Content-Type-Options) | Defense in depth | Düşük | **P2** |
| `SECURITY.md` + vulnerability disclosure process | Compliance | Düşük | **P3** |
| ADR'ler (`docs/adr/`) | Bilgi kaybını önle | Düşük | **P3** |
| Cross-platform start/quality scripts | Yeni katkıcı kazanımı | Düşük | **P3** |
| Backend `notification_service` (email + future Slack) | Genişleyebilir alerting | Düşük | **P3** |

---

## 7. HIZLI KAZANIMLAR (1-2 günde yapılabilecek)

| İş | Etki | Risk | Öncelik | İlgili dosyalar |
|---|---|---|---|---|
| `npm audit continue-on-error` sil | Güvenlik gate | Düşük | **P0** | `.github/workflows/ci.yml:113` |
| `api.ts` 403'ü token wipe'tan çıkar | Oturum stabil | Düşük | **P0** | `frontend/src/services/api.ts:62-70` |
| `deps.py` admin email log sil | PII güvenlik | Düşük | **P0** | `backend/app/api/deps.py:107-109` |
| `config.py` default `ADMIN_EMAILS` boşalt | Default güvenlik | Düşük (env eklenecek) | **P0** | `backend/app/config.py:34` |
| `vite.config.ts` coverage threshold ekle (lines/functions/statements 30, branches 20) | Test gate | Düşük | **P1** | `frontend/vite.config.ts:35-39` |
| `.eslintrc.cjs` exhaustive-deps `'warn'`, no-explicit-any `'warn'` + jsx-a11y plugin | Kalite | Düşük | **P1** | `frontend/.eslintrc.cjs` |
| `dependabot.yml` ekle | Bağımlılık | Düşük | **P1** | `.github/dependabot.yml` (yeni) |
| `SECURITY.md` ekle | Discloser | Düşük | **P3** | repo root |
| Tarihsel MD'leri `docs/_archive/` taşı | DX | Düşük | **P2** | `portfolio-project/*.md` |
| Root README.md'i kapsamlı yaz | DX | Düşük | **P2** | `README.md` |
| `next.config.mjs` `images.remotePatterns` ekle (Supabase) | next/image kullanımı için ön koşul | Düşük | **P1** | `frontend/next.config.mjs` |
| CORS `allow_methods` whitelist | Defense in depth | Düşük | **P2** | `backend/app/main.py:84` |
| `main.py:228-230` root endpoint email/GitHub default'larını config'e taşı | Hardcoded PII kaldır | Düşük | **P1** | `backend/app/main.py` |
| `ci.yml` frontend `type-check` step ekle | Tip güvenliği gate | Düşük | **P1** | `.github/workflows/ci.yml` (yeni step) |
| **`seed_data.py:43` parola `print` sil; env yoksa fail-fast** (Codex) | Admin parola sızıntısı kapat | Düşük | **P0** | `portfolio-project/backend/seed_data.py:42-44` |
| **`storage_service.validate_file_content` ekle + upload akışına bağla** (Codex) | Magic-byte güvenlik açığı kapat | Düşük (yeni dependency: `filetype` ya da `python-magic`) | **P1** | `backend/app/services/storage_service.py`, `backend/app/api/v1/projects.py:223` |
| **`Codex_Implementation` branch refs'i `main` + feature pattern ile değiştir** (Codex R2) | Ölü workflow'u canlandır | Düşük | **P1** | `.github/workflows/deploy-vercel-preview.yml:7,11`, `deploy-railway-staging.yml:6` |
| **`portfolio-project/README.md`'i Next 16 + React 19 + Vitest stack'ine güncelle** (Codex R2) | Yanlış onboarding bilgisi temizle | Düşük | **P1** | `portfolio-project/README.md:27` ve build/dev komut bölümleri |
| **`axios`/`next`/`rollup` high CVE'lerini upgrade PR'ı ile kapat** (Codex R2: 12 high açık) | Aktif CVE riski | Orta (breaking change taraması) | **P0** | `portfolio-project/frontend/package.json` |

---

## 8. RİSKLER VE VARSAYIMLAR

### Doğrulanmış Riskler

- (R1) `npm audit` continue-on-error → güvenlik gate yok.
- (R2) Alembic yok → schema değişikliği rollback'siz.
- (R3) Email-only admin → audit/iptal zayıf.
- (R4) `Admin.tsx` 1845 satır → her değişiklik tüm dosyayı etkiliyor.
- (R5) `api.ts` 403 token wipe regression → oturum stabilitesi.
- (R6) Frontend coverage threshold yok → CI yeşil ama gerçek koruma yok.
- (R7) Sentry yok → prod hata teşhisi log dosyalarına bağlı.
- (R8) `next/image` yok → LCP performans cezası.
- (R9) Tarihsel MD karmaşası → onboarding zor.
- (R10) ESLint 8 EOL + typescript-eslint v6 → güvenlik patch akışı zayıf.

### Doğrulanmış Riskler (Codex revizyonu eklemeleri)

- (R11) **Storage upload magic-byte/content doğrulaması yok** — `storage_service.py:180` sadece uzantı + boyut kontrol ediyor (önceki MEMORY notu hatalıydı).
- (R12) **`seed_data.py:43` generated admin parolayı stdout'a basıyor** — `SEED_ADMIN_PASSWORD` env yoksa.

### Muhtemel Riskler / Doğrulama Gerekenler

- (M1) `react-markdown` markdown render — `rehype-raw`/`dangerouslySetInnerHTML` yok (Codex doğrulama). Doğrudan XSS yok; sanitization policy ADR ile yazılmalı, `rehype-sanitize` defense-in-depth eklenmeli.
- (M3) `.env` git tarihinde commit edilmiş mi — `git log --all -- portfolio-project/backend/.env` kontrolü.
- (M4) `ACCESS_TOKEN_EXPIRE_MINUTES` `.env`'de yanlışlıkla 10080 (7 gün) iddiası — operasyon doğrulamalı.
- (M6) Bundle size — `npm run analyze` çıktısı görülmedi.
- (M7) Postgres slow query log — production metric yok.
- (M8) Captcha provider runtime davranışı — sahte token entegrasyon testiyle doğrulanmalı.
- (M9) GitHub sync endpoint admin-only mu — `api/v1/github.py` dependency check'i okunmalı.

### Varsayımlar

- (V1) Production ENVIRONMENT=production ile çalışıyor → `production_validation_errors` etkin.
- (V2) Vercel + Railway aktif deployment hedefleri (workflow dosyaları öyle gösteriyor).
- (V3) Repo public — kişisel email default'lar bu varsayımla daha riskli.
- (V4) MEMORY notları (PR-1..PR-4 tamamlanma rozetleri) doğru; ancak api.ts 403, eslint config, vite coverage threshold gibi noktalarda regression mevcut → MEMORY ile current state arasında drift var.

### Eksik Bilgi

- (E1) Vercel/Railway dashboard erişimi yok → cold start latency tahmin değil.
- (E2) Production traffic profili — hangi endpoint sıcak.
- (E3) Sentry/Datadog gibi APM olmadığı için historic error rate bilinmiyor.
- (E4) Tarayıcı destek matrisi (Lighthouse score) ölçümlenmedi.

---

## 9. GÜVENLİK VE PERFORMANS ÖNCELİK LİSTESİ

### Top 14 Security Issue (Codex R2 sonrası)

| # | Ciddiyet | Öncelik | Dosya/Modül | Doğrulanmış? | Risk | Çözüm |
|---|---|---|---|---|---|---|
| 1 | Critical | P0 | `.github/workflows/ci.yml:113` | Evet | High-severity FE açıkları PR'a giriyor | `continue-on-error` sil |
| 2 | High | P1 | `backend/app/api/deps.py:103-117` | Evet | Email-only admin, audit yok | `User.is_admin` + audit log |
| 3 | High | P1 | `backend/app/api/deps.py:107-109` | Evet | DEBUG log'larında PII + admin yüzeyi | Log sil veya hash |
| 4 | High | P1 | `backend/app/config.py:34` | Evet | Default kişisel email | Default boşalt + validation |
| 5 | High | P0 | `frontend/src/services/api.ts:62-70` | Evet | 403 token wipe regression | 401-only |
| 6 | Medium | P1 | `backend/app/api/v1/auth.py:67-90` | Evet | Login lockout yok | failed_count + locked_until |
| 7 | Medium | P2 | `backend/app/main.py:84` | Evet | CORS methods wildcard + credentials | Method whitelist |
| 8 | Medium | P1 | `frontend/next.config.mjs` | Evet | Security headers + CSP yok | `headers()` config |
| 9 | Medium | P2 | `frontend/.eslintrc.cjs` | Evet | jsx-a11y kapalı, exhaustive-deps off | Plugin + warn → error |
| 10 | Low | P3 | `BlogDetail.tsx` markdown render | Evet (Codex doğrulama: `rehype-raw`/`dangerouslySetInnerHTML` yok) | Doğrudan XSS değil; sanitization politikası tanımsız (defense-in-depth eksik) | `rehype-sanitize` + ADR ile "raw HTML yasak" politikası |
| 11 | **High** | **P1** | `backend/app/services/storage_service.py:180` | Evet (Codex) | Upload magic-byte yok; arbitrary binary `.jpg` ile yüklenebilir | `filetype`/`python-magic` ile content-type doğrulama |
| 12 | **High** | **P1** | `backend/seed_data.py:43` | Evet (Codex) | Generated admin parola stdout'a basılıyor (env yoksa) | `print` kaldır, env zorunlu yap |
| 13 | **High** | **P1** | `npm audit` runtime ölçümü (Codex R2) | Evet (yerel: 18 / 12 high) | `axios`, `next`, `rollup` ailesinde aktif high CVE'ler | Bağımlılık upgrade PR'ı + `continue-on-error` kaldırma birlikte |
| 14 | **Medium** | **P1** | `deploy-vercel-preview.yml`, `deploy-railway-staging.yml` (Codex R2) | Evet | Stale `Codex_Implementation` branch ref → preview/staging tetiklenmiyor | Branch listesini `main` + feature pattern ile güncelle |

### Top 10 Performance Issue

| # | Ciddiyet | Öncelik | Dosya/Modül | Doğrulanmış? | Risk | Çözüm |
|---|---|---|---|---|---|---|
| 1 | High | P1 | Tüm `<img>` kullanımları | Evet | LCP cezası | `next/image` |
| 2 | Medium | P2 | `frontend/src/content/site.ts` | Evet | Bundle ağırlığı 767 satır | Topic-based split + server-only |
| 3 | Medium | P2 | `frontend/src/routes/Admin.tsx` | Evet | Admin route'unda tek dosya 1845 satır | Tab-based split + dynamic import |
| 4 | Medium | P2 | `ProjectExplorer.tsx` (modal) | Evet | Eager bundle | `next/dynamic` |
| 5 | Medium | Ölçüm | `motion` + `react-markdown` + `highlight.js` | Doğrulanmalı | Bundle ağırlığı | `npm run analyze` + tree-shake |
| 6 | Medium | P2 | `docker-compose.yml` Redis service | Evet | maxmemory-policy yok | `maxmemory 256mb allkeys-lru` |
| 7 | Low | P2 | `backend/app/services/cache_service.py` | Evet | Cache scope dar (sadece GitHub) | Public list endpoint'ler için TTL cache |
| 8 | Low | Ölçüm | `AnimatedBackground.tsx` canvas | Doğrulanmalı | Mobil FPS impact | `prefers-reduced-motion` respect |
| 9 | Low | P3 | Backend logging middleware | Evet | Her istek `logger.info` synchronous I/O | Structured + async sink |
| 10 | Low | Ölçüm | Postgres index'leri | Doğrulanmalı | Slow query | `EXPLAIN` + index ekle |

---

## 10. TEST STRATEJİSİ

### Backend Unit Test

- `crud/*` saf fonksiyonlar — fixtures ile.
- `utils/security.py` (token sign/verify, bcrypt edge cases).
- `services/captcha_service.py` (provider switch, network mock).
- `services/email_service.py` (HTML escape, template render — SMTP mock).
- `services/storage_service.py` (validate_file_content, optimize_image, filename sanitization).
- `core/rate_limit.py` (key function: X-Forwarded-For vs client.host).

### Backend Integration Test

- `test_auth.py` — login + refresh rotation + blacklist (zaten kısmen var, **rotation** + **blacklist** + **race** ek test).
- `test_admin_authz.py` — `is_admin=False` user → 403; `ADMIN_EMAILS` boş → 500; `is_admin=True` ✓.
- `test_rate_limit.py` — login 6. istek 429; contact 6. istek 429.
- `test_contact_captcha.py` — captcha mocked false → 400; true → 201.
- `test_upload_validation.py` — bad magic byte 400; oversize 413; sanitized filename.
- `test_translations.py` — `/languages/available` ile `/{language}` route precedence.

### Frontend Component Test

- `AuthContext.test.tsx` — initial token from localStorage; `/auth/me` success/fail; token-refreshed event flow.
- `LanguageContext.test.tsx` — cookie + localStorage merge; setLanguage persists; SSR safe.
- `Navigation.test.tsx` — mobile menu open/close, route change closes, escape closes.
- `Toast.test.tsx` — multi-toast, duration, manual dismiss.
- `ProjectExplorer.test.tsx` — modal open/close, ESC, focus trap.
- `ContactForm.test.tsx` — mevcut, kapsamı genişlet (server validation error UI).
- `ErrorBoundary.test.tsx` — child throw → fallback render.

### Frontend Integration Test

- `public-routes.ssr.test.tsx` — mevcut, blog detail + 404 ekle.
- `services/api.test.ts` — 401 wipe + redirect; 403 sadece event (regresyon koruma); language param injection.

### E2E (yeni, Playwright)

- `e2e/public-smoke.spec.ts` — Home → About → Projects → Contact submit (CAPTCHA disabled test env) → Toast.
- `e2e/admin-smoke.spec.ts` — Login → Dashboard → Create project → Edit → Delete → Logout.
- `e2e/blog.spec.ts` — Blog list → click detail → markdown render.
- `e2e/i18n.spec.ts` — Language toggle TR ↔ EN, cookie + URL param.

### Auth/Admin/Contact/Blog/Projects Kritik Senaryolar

- Auth: brute-force lockout (yeni özellik); refresh edge case (expired refresh; rotation).
- Admin: dual-language project create + image upload + delete + DB cascade.
- Contact: CAPTCHA fail; CAPTCHA disabled in dev (config validation enforces in prod).
- Blog: search ILIKE injection deneme; view increment race (concurrent requests).
- Projects: featured order; deleted project translations cleanup.

### Coverage Artırma Planı

- Backend: `--cov=app --cov-fail-under=70` — şu an dar scope ile %85 raporluyor; gerçek scope ile %50-65 muhtemelen. Hedef: 60 → 70 → 80.
- Frontend: 0 (threshold yok) → 30 (lines/functions/statements), 20 (branches) — sonra 50/40 → 70/55.

### CI Test Gate Önerileri

- Backend: `pytest -q` + scope-extended coverage + `mypy` + `flake8`.
- Frontend: `lint` + `type-check` + `test:coverage` + `check:server-boundaries` + `build` + `npm audit --audit-level=high` (gate-on-fail).
- E2E: nightly veya PR'da Playwright matrix (chromium + webkit).
- SonarCloud: PR + push, qualitygate.wait=true her ikisinde.

---

## 11. İDEAL HEDEF MİMARİ

### Backend İdeal Klasör Yapısı

```
backend/
├── alembic/                      ← YENİ
│   ├── env.py
│   └── versions/
├── app/
│   ├── main.py
│   ├── config.py                 (default'lar boş, validation enforced)
│   ├── database.py
│   ├── api/
│   │   ├── deps/
│   │   │   ├── db.py
│   │   │   ├── auth.py           (get_current_user, require_admin)
│   │   │   └── pagination.py
│   │   └── v1/                   (mevcut yapı korunur)
│   ├── crud/                     (mevcut, base.py opsiyonel)
│   ├── models/                   (User.is_admin, failed_login_count, locked_until ekli)
│   ├── schemas/
│   ├── services/
│   │   ├── notification.py       (email + future Slack/webhook)
│   │   ├── observability.py      (Sentry init)
│   │   ├── captcha.py
│   │   ├── github.py
│   │   ├── storage.py
│   │   └── cache.py
│   ├── middleware/
│   │   ├── security_headers.py   (CSP, X-Frame-Options)
│   │   └── request_logging.py    (structured JSON log)
│   ├── core/
│   │   ├── rate_limit.py
│   │   ├── exceptions.py         (ApiError base + handlers)
│   │   └── audit.py              (admin action audit log)
│   └── utils/
│       ├── logger.py             (loguru + JSON sink)
│       └── security.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py               (testcontainers PG opsiyonel)
├── Dockerfile                    (multi-stage)
├── docker-compose.yml
├── requirements.txt
├── requirements-dev.txt
└── .env.example                  (kişisel veri kaldırılmış)
```

### Frontend İdeal Klasör Yapısı

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── (public)/                 (HomeClient/AboutClient/... wrapper'sız)
│   ├── (admin)/admin/
│   ├── (auth)/login/
│   └── ...
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── ProjectsTab.tsx
│   │   │   ├── SkillsTab.tsx
│   │   │   ├── ExperiencesTab.tsx
│   │   │   ├── MessagesTab.tsx
│   │   │   └── forms/            (mevcut AdminForms parçaları)
│   │   ├── ui/                   (mevcut)
│   │   └── ...
│   ├── contexts/                 (Auth + Language; Auth refresh interceptor)
│   ├── routes/                   (Admin.tsx <200 satır olur)
│   ├── services/
│   │   ├── api.ts                (401-only wipe; event-driven redirect)
│   │   ├── apiTypes.generated.ts (openapi-typescript output)
│   │   └── ...
│   ├── content/
│   │   ├── config.ts
│   │   ├── i18n/                 (ui, home, about, contact, seo, projects)
│   │   └── types.ts
│   ├── lib/
│   │   ├── errors.ts             (parseApiError)
│   │   ├── metadata.ts
│   │   ├── locale.ts
│   │   └── admin/                (focus-trap, format-date)
│   ├── hooks/                    (useApi, useDebouncedSearch, ...)
│   └── test/
│       ├── setup.ts              (msw veya axios-mock-adapter)
│       └── ...
└── tests/e2e/                    (Playwright)
```

### API Contract Standardı

```ts
// Success
{ data: T, meta?: { pagination, locale } }
// Error
{ success: false, error: { code: "VALIDATION_ERROR", message: "...", fields?: { email: "..." } } }
```

### Error Response Standardı

- `ApiError(BaseException)`: `code`, `http_status`, `message`, `fields`.
- `core/exceptions.py` global handler: `ApiError` → JSON; `ValueError` → 400; `LookupError` → 404; diğer → 500.

### Auth/Authorization Yaklaşımı

- JWT access (15 dk) + refresh (14 gün) + session table + blacklist (mevcut).
- `User.is_admin` kolon-tabanlı; bootstrap için `ADMIN_EMAILS` env.
- Audit log: `admin_action` tablosu (actor, target, action, before, after, ts).

### Validation Yaklaşımı

- Backend: Pydantic v2 ConfigDict + Field constraints (mevcut).
- Frontend: minimal client-side boundary; backend hata mesajını authoritative kabul.

### Service / Use-Case / Repository Sınırları

- Mevcut: route → crud → model. Bu **basit ve okunabilir**, premature abstraction yapmaktan kaçın.
- Yalnızca **service** katmanına çekilmesi gereken: external API (GitHub), email/SMTP, captcha, storage, cache, observability.

### Frontend Data Fetching Yaklaşımı

- TanStack Query (`@tanstack/react-query`) → `queryKeys` factory → `useProjects`, `useBlog`, vb.
- SSR initial data: Next App Router `cache: 'no-store' | 'force-cache'` + `Suspense` boundaries.
- Mutation sonrası `queryClient.invalidateQueries`.

### Shared Types / OpenAPI Contract

- `npm run gen:api` → `openapi-typescript` ile `src/services/apiTypes.generated.ts`.
- CI'da `gen:api` çıktısı diff'lerse fail (drift detection).

### Observability Yaklaşımı

- Backend: Sentry + structured JSON logs (loguru `serialize=True`) + `/health`/`/ready` (mevcut).
- Frontend: Sentry browser SDK + `Sentry.ErrorBoundary`.
- Release tagging: `SENTRY_RELEASE=$(git rev-parse --short HEAD)`.

---

## 12. YARIN EKİP İŞE NEREDEN BAŞLAMALI?

### İlk 10 İş (Codex R2 sonrası)

| # | İş | Kim | Tahmini efor | Başarı kriteri |
|---|---|---|---|---|
| 1 | `.github/workflows/ci.yml:113` `continue-on-error: true` satırını sil; çıkan ihlalleri triage et | DevOps | 1-2 saat (+ bağımlılık güncelleme süresi) | CI'da `npm audit --audit-level=high` failure deploy'ı blokluyor |
| 2 | `frontend/src/services/api.ts:62` koşulu `status === 401`'e indir | Frontend | 30 dk + test | 403 hatasında localStorage temizlenmiyor; mevcut testlerden hiçbiri kırılmıyor |
| 3 | `backend/app/api/deps.py:107-109` `logger.debug` satırlarını sil veya hash'le | Backend/Security | 30 dk | Admin check'te user/admin email log'a düşmüyor |
| 4 | `backend/app/config.py:34` default `ADMIN_EMAILS` boş string yap; `production_validation_errors`'da boşa hata fırlat | Backend/Security | 1 saat (+ env doğrulama) | Default'la prod ayağa kalkmıyor; CI test fixture'ı `ADMIN_EMAILS` set ediyor (zaten var) |
| 5 | **`backend/seed_data.py:42-44` `print` satırlarını sil; env yoksa `RuntimeError` fırlat** | Backend/Security | 15 dk | `SEED_ADMIN_PASSWORD` env'siz seed çalışmıyor; CI log'larında parola yok |
| 6 | **`backend/app/services/storage_service.py` `validate_file_content(bytes)` ekle (filetype lib); `api/v1/projects.py:223` upload akışında çağır** | Backend/Security | 2-3 saat (+ test) | `.jpg` uzantılı binary upload denemesi 400 dönüyor; mevcut image upload regresyonsuz |
| 7 | `portfolio-project/` kökündeki 12+ tarihsel MD'yi `docs/_archive/` altına taşı; `README.md` (root) için 1-sayfalık landing yaz | Tech Lead/DocOps | 2 saat | Repo kökünde sadece canonical: `README.md`, `AGENTS.md`, `GIT_WORKFLOW.md`, `QUICKSTART.md`, `docs/` |
| 8 | **`Codex_Implementation` branch ref'lerini `main` + feature pattern ile değiştir** (Codex R2) | DevOps | 15 dk | `deploy-vercel-preview.yml` ve `deploy-railway-staging.yml` `main` push'unda tetikleniyor |
| 9 | **`portfolio-project/README.md`'i Next 16 + React 19 + Vitest stack'ine yeniden yaz** (Codex R2) | Tech Lead/DocOps | 1 saat | "React 18 + Vite 5" satırı yok; `next dev/build/start` komutları ve gerçek script'ler dokümante |
| 10 | **`axios`/`next`/`rollup` high CVE upgrade PR'ı** (Codex R2: yerel 12 high açık) | Frontend/Security | 2-4 saat (test taraması dahil) | `npm audit --audit-level=high` 0 açık; build + smoke testler yeşil |

### Neden İlk Bunlar?

- **#1, #3, #4** açık güvenlik gate'lerini ve hardcoded PII'yi kapatıyor — saldırı yüzeyini hızla daraltıyor; düşük risk.
- **#2** kullanıcı oturum stabilitesi için aktif bir regression — public flow'da admin endpoint'e dokunan herhangi bir kullanıcının oturumu siliniyor; somut UX problemi.
- **#5** her gelecek katkıyı hızlandırıyor — bilişsel yükü düşürüp roadmap'in kalanını uygulanabilir kılıyor.

### Beklenen Etki

- 1 günde Critical/High güvenlik gate'lerinin %60'ı kapanır.
- 2-3 günde Frontend regresyonları ve dökümantasyon karmaşası temizlenir.
- 30 gün sonunda **Prod Readiness 5.5 → 7.5**, **Security 6 → 8**, **DX 4.5 → 7**.

---

## VERİFİKASYON SECTION

Bu rapor uygulamayı **lokal olarak çalıştırarak doğrulamadı** (plan modu, sadece okuma). Aşağıdaki komutlarla bulgular doğrulanabilir:

- Backend test: `cd portfolio-project && python -m pytest -q` (mevcut 12 dosya pass mı?)
- Frontend type-check: `cd portfolio-project/frontend && npm run type-check`
- Frontend lint: `cd portfolio-project/frontend && npm run lint`
- Frontend test: `cd portfolio-project/frontend && npm run test:coverage`
- Frontend build: `cd portfolio-project/frontend && npm run build`
- Bundle analiz: `cd portfolio-project/frontend && npm run analyze` (size raporu için)
- pip-audit: `cd portfolio-project/backend && pip-audit -r requirements.txt`
  > **Not (Codex revizyonu):** `pip-audit` CI workflow'unda kuruluyor (`ci.yml` backend job), ancak yerel geliştirici makinelerinde kurulu olmayabilir. Eksikse `pip install pip-audit` ile ya da CI çıktısını GitHub Actions UI'dan kontrol et.
- npm audit: `cd portfolio-project/frontend && npm audit --audit-level=high` (continue-on-error kaldırılmadan önce kaç açık var?)
- `git log --all -- portfolio-project/backend/.env` (`.env`'in geçmişte commit edilip edilmediği)
- `git log -p portfolio-project/backend/seed_data.py | grep -i password` (parola print iddiası)

---

**Son not:** Rapor; kanıt-tabanlı, dosya:satır referanslı, ciddiyet/öncelik etiketli ve Türkçe biçimlendirilmiştir. Plan onaylanırsa kod değişikliği yapılmayacak — bu yalnızca denetim çıktısıdır. Devam adımı için (örneğin yarın'ın 10 işine göre düzeltme PR'larını başlatma) ayrı bir oturum açıp uygulama planı yapılması önerilir.
