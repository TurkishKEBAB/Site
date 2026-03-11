# Production Go-Live Plan

**Proje:** Yigit Okur Portfolio Site
**Branch:** `Codex_Implementation` -> `main`
**Tarih:** 2026-03-11
**Durum:** Staging-ready, production-ready degil

---

## Mevcut Durum Ozeti

Codex tarafindan yapilan isler:
- Auth flow: access + refresh token rotation + blacklist + rate limit
- CAPTCHA backend entegrasyonu (Turnstile/hCaptcha/reCAPTCHA)
- Deploy pipeline: quality gate -> deploy -> smoke test
- Docker non-root user, health check, CI SHA pinning
- Backup-restore drill workflow
- Production config validation (startup'ta kontrol)
- GitHub production environment setup script

Eksik kalanlar asagida fazlara ayrilmistir.

---

## FAZ 1: Guvenlik Hardening (Kod Degisiklikleri)

> Bu faz tamamen `Codex_Implementation` branch'inde yapilir.
> Tahmini dosya sayisi: ~8 dosya

### 1.1 SECRET_KEY Default Bypass Kapatma
- **Dosya:** `portfolio-project/backend/app/config.py`
- **Satir:** `production_validation_errors()` metodu (~line 160)
- **Sorun:** docker-compose default'u `dev-secret-key-change-in-production` 38 karakter -- 32 char kontrolunu geciyor
- **Cozum:** Production validation'a bilinen default degerleri reddeden kontrol ekle:
  ```python
  KNOWN_INSECURE_KEYS = ["dev-secret-key-change-in-production", "changeme", "secret"]
  if any(k in self.SECRET_KEY.lower() for k in KNOWN_INSECURE_KEYS):
      errors.append("SECRET_KEY contains a known insecure default value")
  ```
- **Test:** Mevcut `test_config.py`'ye insecure key testi ekle

### 1.2 ADMIN_EMAILS Placeholder Temizligi
- **Dosya:** `portfolio-project/backend/app/config.py`
- **Satir:** ~line 34
- **Sorun:** Default `yigitokur@ieee.org,admin@portfolio.com` -- `admin@portfolio.com` placeholder
- **Cozum:** Default'u sadece `yigitokur@ieee.org` yap
  ```python
  ADMIN_EMAILS: str = "yigitokur@ieee.org"
  ```

### 1.3 Email HTML Injection Korumasi
- **Dosya:** `portfolio-project/backend/app/services/email_service.py`
- **Satirlar:** ~118-153 (confirmation), ~191-230 (admin notification)
- **Sorun:** `user_name`, `subject`, `message_content`, `user_email` HTML'e escape'siz giriyor
- **Cozum:** Python `html.escape()` kullan:
  ```python
  import html
  safe_name = html.escape(user_name)
  safe_subject = html.escape(subject)
  safe_message = html.escape(message_content)
  safe_email = html.escape(user_email)
  ```
  Tum f-string interpolasyonlarinda safe_ versiyonlarini kullan.
  `mailto:` href icindeki subject icin `urllib.parse.quote()` ekle.

### 1.4 Frontend Localhost Fallback Kaldirilmasi
- **Dosya:** `portfolio-project/frontend/src/services/api.ts`
- **Satir:** ~10
- **Sorun:** `VITE_API_BASE_URL` yoksa `http://localhost:8000` kullaniliyor
- **Cozum:**
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL environment variable is required');
  }
  ```
  **NOT:** Bu degisiklik dev ortaminda `.env` dosyasinda `VITE_API_BASE_URL` tanimlanmasini zorunlu kilar.
  Frontend `.env.example`'a aciklama ekle.

### 1.5 ProtectedRoute Admin Kontrolu
- **Dosya:** `portfolio-project/frontend/src/components/ProtectedRoute.tsx`
- **Sorun:** Sadece `isAuthenticated` kontrol ediliyor. Normal kullanici `/admin`'e erisebilir (backend 403 doner ama UX kotu).
- **Cozum:** `useAuth()` context'ten admin bilgisi kullan. Eger backend `/auth/me` response'unda admin flagi yoksa:
  1. `/auth/me` response'una `is_admin` fieldi ekle (backend schemas/user.py + deps.py)
  2. AuthContext'e `isAdmin` state ekle
  3. ProtectedRoute'a `requireAdmin` prop ekle, `/admin` route'unda kullan
- **Dosyalar:**
  - `portfolio-project/backend/app/schemas/user.py` -- `UserResponse`'a `is_admin: bool` ekle
  - `portfolio-project/backend/app/api/v1/auth.py` -- `/me` endpoint'inde admin kontrolu yap
  - `portfolio-project/frontend/src/contexts/AuthContext.tsx` -- `isAdmin` state
  - `portfolio-project/frontend/src/components/ProtectedRoute.tsx` -- `requireAdmin` prop
  - `portfolio-project/frontend/src/App.tsx` -- `<ProtectedRoute requireAdmin>`

### 1.6 ErrorBoundary Entegrasyonu
- **Dosya:** `portfolio-project/frontend/src/App.tsx`
- **Sorun:** ErrorBoundary komponenti var ama kullanilmiyor. Unhandled React error tum app'i cokertiyor.
- **Cozum:** Route'lari `<ErrorBoundary>` ile sar:
  ```tsx
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>
      <Routes>...</Routes>
    </Suspense>
  </ErrorBoundary>
  ```
- **Kontrol:** Oncelikle `ErrorBoundary` komponentinin nerede tanimlandigini dogrula.
  Eger yoksa basit bir class component olustur.

### 1.7 Deploy Pipeline cancel-in-progress Duzeltmesi
- **Dosya:** `.github/workflows/deploy-production.yml`
- **Satir:** ~11
- **Sorun:** `cancel-in-progress: true` production deploy'da tehlikeli
- **Cozum:** `cancel-in-progress: false` yap

### 1.8 Sonar Python Version Duzeltmesi
- **Dosya:** `portfolio-project/sonar-project.properties`
- **Sorun:** `sonar.python.version=3.14.3` -- CI ve Dockerfile `3.13` kullaniyor
- **Cozum:** `sonar.python.version=3.13` yap

### 1.9 Dev Bagimliliklari Ayirma
- **Dosyalar:**
  - `portfolio-project/backend/requirements.txt` -- sadece production deps
  - `portfolio-project/backend/requirements-dev.txt` -- test/lint deps (yeni dosya)
  - `portfolio-project/backend/Dockerfile` -- `requirements.txt` kalir (zaten dev olmayacak)
  - `.github/workflows/ci.yml` -- `pip install -r requirements.txt -r requirements-dev.txt`
  - `.github/workflows/deploy-production.yml` -- sadece `requirements.txt`
- **Sorun:** pytest, black, flake8 production image'a giriyor
- **Cozum:**
  ```
  # requirements-dev.txt
  -r requirements.txt
  pytest>=8.0.0,<9.0.0
  pytest-asyncio>=0.24.0,<1.0.0
  pytest-cov>=6.0.0,<7.0.0
  black>=24.0.0,<25.0.0
  isort>=5.0.0,<6.0.0
  flake8>=7.0.0,<8.0.0
  ```

### 1.10 CORS Methods Daraltma (Opsiyonel ama Onerilen)
- **Dosya:** `portfolio-project/backend/app/main.py`
- **Satirlar:** ~84-85
- **Sorun:** `allow_methods=["*"]`, `allow_headers=["*"]`
- **Cozum:**
  ```python
  allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allow_headers=["Authorization", "Content-Type", "X-Skip-Language", "X-Skip-Global-Error"],
  ```

### 1.11 GitHub Error Detail Leaki
- **Dosya:** `portfolio-project/backend/app/api/v1/github.py`
- **Satir:** ~99
- **Sorun:** `detail=f"GitHub sync failed: {str(e)}"` internal hata detayi donuyor
- **Cozum:**
  ```python
  logger.error(f"GitHub sync failed: {str(e)}")
  raise HTTPException(status_code=500, detail="GitHub sync failed")
  ```

---

## FAZ 2: Commit, PR ve CI Dogrulama

> Faz 1 tamamlandiktan sonra yapilir.

### 2.1 Degisiklikleri Commit Et
```bash
git add -A
git commit -m "security: production hardening - secret validation, HTML escape, CORS, admin RBAC, ErrorBoundary"
```

### 2.2 PR Ac
```bash
git push origin Codex_Implementation
gh pr create --base main --head Codex_Implementation \
  --title "Production Go-Live: Security Hardening & Deploy Pipeline" \
  --body "## Summary
- Auth hardening (refresh rotation, token blacklist, rate limiting)
- CAPTCHA integration for contact form
- Production deploy pipeline with smoke tests
- Security fixes: SECRET_KEY validation, HTML escape, CORS, admin RBAC
- ErrorBoundary, dev deps separation, Sonar config fix

## Test Plan
- [ ] Backend tests pass (85%+ coverage)
- [ ] Frontend lint + test + build pass
- [ ] Sonar PR gate pass
- [ ] Manual CAPTCHA test after deploy"
```

### 2.3 CI Dogrulama
- [ ] `Backend Quality` check yesil
- [ ] `Frontend Quality` check yesil
- [ ] `Sonar PR Gate` check yesil (SONAR_TOKEN set edilmis olmali)

---

## FAZ 3: GitHub & Altyapi Konfigurasyonu

> PR CI'dan gectikten sonra, merge ETMEDEN yapilir.
> Bu fazda kod degisikligi yok, tamamen platform konfigurasyonu.

### 3.1 Main Branch Protection / Ruleset
GitHub UI veya `gh api` ile:
- PR zorunlu
- Min approval: 1 (tek kisilik proje) veya 2
- Include administrators: evet
- Dismiss stale reviews: evet
- Require conversation resolution: evet
- Up-to-date requirement: evet
- Force push: kapali
- Branch deletion: kapali
- Required status checks:
  - `Backend Quality`
  - `Frontend Quality`
  - `Sonar PR Gate`

### 3.2 GitHub Production Environment
```powershell
# Environment olustur
gh api repos/TurkishKEBAB/Site/environments/production -X PUT
```
- Deployment branches: sadece `main`
- Required reviewers: yok (auto deploy)

### 3.3 GitHub Production Secrets & Variables
```powershell
cd portfolio-project
.\set-production-env-github.ps1 -Repo TurkishKEBAB/Site
```
**Secrets (7 adet):**
| Secret | Aciklama |
|--------|----------|
| `RAILWAY_PRODUCTION_MIGRATION_HOOK_URL` | Railway migration webhook |
| `RAILWAY_PRODUCTION_DEPLOY_HOOK_URL` | Railway deploy webhook |
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `PRODUCTION_SMOKE_ADMIN_EMAIL` | Smoke test icin admin email |
| `PRODUCTION_SMOKE_ADMIN_PASSWORD` | Smoke test icin admin sifre |

**Variables (2 adet):**
| Variable | Format | Ornek |
|----------|--------|-------|
| `PRODUCTION_API_ROOT_URL` | `https://...` (trailing slash yok) | `https://api.yigitokur.com` |
| `PRODUCTION_FRONTEND_URL` | `https://...` (trailing slash yok) | `https://yigitokur.com` |

### 3.4 Sonar Secrets (Repo/Org Scope)
Eger henuz set edilmediyse:
```powershell
gh secret set SONAR_TOKEN --repo TurkishKEBAB/Site
gh variable set SONAR_ORGANIZATION --body "turkishkebab" --repo TurkishKEBAB/Site
```

### 3.5 Railway Runtime Environment
Railway Dashboard'undan veya CLI'dan set edilecek:

**Zorunlu:**
| Key | Deger |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | `postgresql+psycopg://user:pass@host:5432/db` |
| `SECRET_KEY` | Min 32 karakter, random olustur: `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `FRONTEND_URL` | `https://yigitokur.com` (veya gercek domain) |
| `ADMIN_EMAILS` | `yigitokur@ieee.org` |
| `SMTP_USERNAME` | Gmail/SMTP kullanici |
| `SMTP_PASSWORD` | Gmail App Password |
| `REDIS_URL` | `redis://...` veya `rediss://...` (TLS) |
| `CAPTCHA_ENABLED` | `true` |
| `CAPTCHA_PROVIDER` | `turnstile` |
| `CAPTCHA_SECRET_KEY` | Cloudflare Turnstile secret key |

**Onerilen:**
| Key | Varsayilan |
|-----|-----------|
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `14` |
| `AUTH_LOGIN_RATE_LIMIT` | `5/minute` |
| `CONTACT_RATE_LIMIT` | `5/minute` |
| `CORS_EXTRA_ORIGINS` | bos (sadece FRONTEND_URL yeterli) |
| `GITHUB_API_TOKEN` | GitHub personal access token |
| `LOG_LEVEL` | `INFO` |

### 3.6 Vercel Environment
Vercel Dashboard'undan:
| Key | Deger |
|-----|-------|
| `VITE_API_BASE_URL` | `https://api.yigitokur.com/api/v1` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `VITE_GITHUB_USERNAME` | `TurkishKEBAB` |

### 3.7 Cloudflare Turnstile Kurulumu
1. https://dash.cloudflare.com/ -> Turnstile
2. Site ekle, domain'leri gir
3. Site Key -> Vercel env'e (`VITE_TURNSTILE_SITE_KEY`)
4. Secret Key -> Railway env'e (`CAPTCHA_SECRET_KEY`)

---

## FAZ 4: Merge & Deploy Dogrulama

### 4.1 PR Merge
- Tum CI check'ler yesil
- PR'i maine merge et (squash merge oneriyorum)

### 4.2 Otomatik Deploy Kontrolu
```bash
# Deploy workflow baslamis mi?
gh run list --workflow deploy-production.yml --limit 1

# Canlidan takip et
gh run watch <run-id>
```

### 4.3 Smoke Test Dogrulama
Deploy workflow icindeki smoke adimi soyle kontrol eder:
- [x] `GET /live` -> 200
- [x] `GET /health` -> 200
- [x] `GET /ready` -> 200
- [x] `POST /api/v1/auth/login/json` -> 200 (admin credentials)
- [x] `GET /api/v1/admin/stats` -> 200 (admin token)
- [x] Frontend root page -> 200

### 4.4 Manuel CAPTCHA Testi
Smoke'tan cikarildigi icin manuel yapilacak:
1. Frontend'ten contact form ac
2. Turnstile widget gorunuyor mu?
3. Gecerli token ile submit -> 201
4. Token olmadan submit -> 400/422

### 4.5 Backup-Restore Drill
```bash
gh workflow run backup-restore-drill.yml --ref main
gh run list --workflow backup-restore-drill.yml --limit 1
```
Artifact'leri indirip drill basarisini dogrula.

---

## FAZ 5: Post-Launch Operasyonel Gorevler

> Canliya ciktiktan sonraki ilk hafta.

### 5.1 Token Cleanup Job
- `token_blacklist` ve `refresh_tokens` tablolari sinirli buyuyecek
- Periyodik cleanup: `DELETE FROM token_blacklist WHERE expires_at < NOW()`
- Railway Cron Job veya GitHub Actions cron ile haftada 1

### 5.2 Monitoring
- Railway built-in metrics (CPU/RAM/request count)
- Vercel Analytics (frontend)
- Sonar kalite gormesi

### 5.3 Secret Rotasyonu
- 90 gunde bir deploy/smoke secret'lari dondur
- Donus sonrasi `gh workflow run deploy-production.yml`
- CI_CD_SETUP.md'deki rotasyon politikasina uy

### 5.4 Iyilestirmeler (Post-launch, Non-blocking)
- [ ] Multi-stage Docker build (gcc'yi runtime'dan cikar)
- [ ] Gunicorn process manager (multi-worker)
- [ ] Redis TLS (`rediss://`)
- [ ] Database SSL (`sslmode=require`)
- [ ] GitHub API pagination (>100 repo)
- [ ] Contact message count query optimizasyonu
- [ ] Alembic migration framework entegrasyonu
- [ ] File upload content-type dogrulama

---

## Dosya Degisiklik Haritasi (Faz 1)

| # | Dosya | Degisiklik |
|---|-------|-----------|
| 1 | `portfolio-project/backend/app/config.py` | SECRET_KEY insecure default check + ADMIN_EMAILS default fix |
| 2 | `portfolio-project/backend/app/services/email_service.py` | HTML escape |
| 3 | `portfolio-project/frontend/src/services/api.ts` | localhost fallback kaldir |
| 4 | `portfolio-project/frontend/.env.example` | VITE_API_BASE_URL zorunlu notu |
| 5 | `portfolio-project/backend/app/schemas/user.py` | `is_admin` field |
| 6 | `portfolio-project/backend/app/api/v1/auth.py` | `/me` admin bilgisi |
| 7 | `portfolio-project/frontend/src/contexts/AuthContext.tsx` | `isAdmin` state |
| 8 | `portfolio-project/frontend/src/components/ProtectedRoute.tsx` | `requireAdmin` prop |
| 9 | `portfolio-project/frontend/src/App.tsx` | ErrorBoundary + requireAdmin |
| 10 | `.github/workflows/deploy-production.yml` | cancel-in-progress: false |
| 11 | `portfolio-project/sonar-project.properties` | python.version=3.13 |
| 12 | `portfolio-project/backend/requirements.txt` | dev deps cikar |
| 13 | `portfolio-project/backend/requirements-dev.txt` | dev deps (yeni dosya) |
| 14 | `.github/workflows/ci.yml` | requirements-dev.txt ekle |
| 15 | `portfolio-project/backend/app/main.py` | CORS daralt |
| 16 | `portfolio-project/backend/app/api/v1/github.py` | error detail leak |

---

## Kabul Kriterleri (Go-Live Checklist)

### Kod
- [ ] Faz 1 tum maddeler tamamlandi
- [ ] Backend testler yesil (85%+ coverage)
- [ ] Frontend lint + test + build yesil
- [ ] Sonar PR gate yesil

### Altyapi
- [ ] Main branch protection aktif (required checks baglanmis)
- [ ] GitHub `production` environment olusturuldu
- [ ] Production secrets/vars set edildi (7 secret + 2 var)
- [ ] Railway runtime env'ler set edildi (10+ zorunlu key)
- [ ] Vercel production env set edildi (3 key)
- [ ] Cloudflare Turnstile kuruldu (site key + secret key)
- [ ] Sonar secrets set edildi (SONAR_TOKEN + SONAR_ORGANIZATION)

### Dogrulama
- [ ] PR CI check'leri gecti
- [ ] PR main'e merge edildi
- [ ] Deploy Production workflow otomatik basladi ve basarili
- [ ] Smoke testleri gecti (live/health/ready/login/admin/frontend)
- [ ] Manuel CAPTCHA testi gecti
- [ ] Backup-restore drill en az 1 kez basarili

---

## Notlar

1. **Tek kisilik proje:** Branch protection'da 2 approval zorunlulugu pratikte blokleyici olabilir. 1 approval veya sadece required checks yeterli olabilir.
2. **Domain:** Railway ve Vercel'de custom domain konfigurasyonu bu planda yok. DNS ayarlari ayrica yapilmali.
3. **SSL:** Railway ve Vercel otomatik SSL sagliyorlar, ekstra konfigurasyon gerekmez.
4. **Codex'in isleri:** Auth, CAPTCHA, deploy pipeline, backup drill, production validation gibi buyuk parcalar tamamlanmis durumda. Kalan is buyuk olcude hardening ve konfigurasyon.
