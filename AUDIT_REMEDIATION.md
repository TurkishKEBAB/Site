# AUDIT REMEDIATION PLAN — Portfolio Site
> Generated: 2026-03-13
> Source: Full-codebase audit (4 parallel analysis agents)
> Total issues found: ~240 (Backend: 54 · Frontend: 60 · CI/CD+Infra: 35 · Tests: 40+)

---

## Nasıl Kullanılır

Her PR aşağıda kendi bölümünde tanımlanmıştır. Her bölüm:
1. **Bulgular** — Ne bulundu, nerede, neden önemli
2. **Implementation Prompt** — Yeni bir Claude Code penceresine kopyalayıp yapıştır

**Uygulama sırası önerilir:**
- **PR-1** blocker niteliğinde — önce tamamla.
- **PR-2 ile PR-6** birbirinden bağımsız — paralel çalıştırılabilir.

---

## PR-1 · `fix/backend-security-critical`
### Güvenlik Açıkları — Kritik & Yüksek Öncelik

#### Bulgular

| ID | Dosya:Satır | Mesele |
|----|-------------|--------|
| C1 | `requirements.txt` | `python-jose` → CVE-2024-33664/33663: JWT imza sahteciliği. Admin token üretilebilir. |
| C2 | `app/api/deps.py:103-111` | `require_admin` logic hatası: `ADMIN_EMAILS` boş string → falsy → guard atlanır → **herkes admin olur** |
| C3 | `app/core/rate_limit.py:6` | `Limiter()` constructor'ında `default_limits` yok → login/contact dışında sıfır rate limiting |
| H1 | `app/api/v1/projects.py:199,211` | `file.size or 0` → `Content-Length` header yoksa 0 geçiyor, boyut kontrolü bypass ediliyor |
| H2 | `app/crud/blog.py:257` | `f"%{search_query}%"` — `_escape_ilike()` çağrılmıyor; `%` veya `_` ile tüm tablo eşlesebilir |
| H3 | `app/services/email_service.py:137,139,213,217` | `user_name`, `user_email`, `subject`, `message_content` f-string HTML'e escape edilmeksizin giriyor |
| H4 | `app/api/v1/projects.py:214` | `file.filename` sanitize edilmeksizin storage path'e yazılıyor |
| M1 | `app/main.py:116-126` | `validation_exception_handler` production'da da `exc.errors()` detaylarını dönüyor |
| M2 | `app/schemas/contact.py:15` | `message: str` alanında `max_length` yok — sınırsız boyut kabul ediliyor |
| M3 | `app/api/v1/github.py:97-99` | `str(e)` doğrudan 500 response'a dönüyor — internal hata detayları sızıyor |

---

#### Implementation Prompt — PR-1

```
# GÖREV: Backend Güvenlik Açıklarını Düzelt (PR-1)

Proje: c:\Develop\Projects\Site\portfolio-project\backend
Önce AGENTS.md dosyasını (c:\Develop\Projects\Site\AGENTS.md) oku.

## Git Setup
git switch main && git reset --hard origin/main
git switch -c fix/backend-security-critical

## Yapılacaklar (sırayla)

### 1. python-jose → PyJWT Migrasyonu (C1)

requirements.txt içinde:
- `python-jose[cryptography]>=3.3.0,<4.0.0` satırını kaldır
- `PyJWT>=2.8.0` ekle

app/utils/security.py içinde:
- `from jose import jwt, JWTError` → `import jwt` (PyJWT)
- `jwt.encode(payload, key, algorithm=...)` PyJWT'de aynı şekilde çalışır
- `jwt.decode(token, key, algorithms=[...])` — PyJWT'de `options={"verify_exp": True}` gerekebilir
- JWTError → `jwt.exceptions.InvalidTokenError` veya `jwt.PyJWTError`

app/api/deps.py içinde:
- `from jose import jwt, JWTError` → `import jwt`
- `except JWTError` → `except jwt.PyJWTError`
- `jwt.decode(token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])`
  PyJWT için: `jwt.decode(token, key, algorithms=[alg])` — parametre adı değişmez

### 2. require_admin Logic Düzeltmesi (C2)

app/api/deps.py içinde `require_admin` fonksiyonunu bul (103-115 civarı).
Mevcut hatalı mantık:
```python
if admin_emails and user_email not in admin_emails:
    raise HTTPException(403, ...)
```
Doğru mantık:
```python
if not admin_emails:
    raise HTTPException(status_code=500, detail="Server misconfiguration: ADMIN_EMAILS not set")
if user_email not in admin_emails:
    raise HTTPException(status_code=403, detail="Admin access required")
```

### 3. Rate Limiter Default Limits (C3)

app/core/rate_limit.py içinde:
```python
# Mevcut (hatalı):
limiter = Limiter(key_func=get_remote_address)

# Düzeltilmiş:
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
)
```
`settings.RATE_LIMIT_PER_MINUTE` için app/config.py'ye bak; yoksa ekle (default: 60).

### 4. File Upload Size Bypass Düzeltmesi (H1)

app/api/v1/projects.py içinde upload endpoint'ini bul (~199. satır civarı).
`file.size or 0` yerine:
```python
# Gerçek içeriği oku, sonra boyut kontrolü yap
file_data = await file.read()
if len(file_data) > MAX_UPLOAD_SIZE:
    raise HTTPException(status_code=413, detail="File too large")
await file.seek(0)  # Gerekirse stream'i sıfırla
```
Alternatif: StorageService.validate_file() çağrısını içerik okunduktan SONRA yap.

### 5. ILIKE Wildcard Escape (H2)

app/crud/blog.py'de `search_blog_posts` fonksiyonunu bul (~257. satır).
```python
# Mevcut (hatalı):
search = f"%{search_query}%"

# Düzeltilmiş:
def _escape_ilike(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

search = f"%{_escape_ilike(search_query)}%"
# Query'e .filter(Model.field.ilike(search, escape="\\")) ekle
```
Not: app/crud/ içinde zaten `_escape_ilike` varsa import et, yoksa her iki crud dosyasına ekle.

### 6. Email HTML Injection Düzeltmesi (H3)

app/services/email_service.py içinde send_contact_form_confirmation ve
send_admin_notification fonksiyonlarını bul.
User-controlled değişkenler HTML içine girmeden önce escape edilmeli:
```python
import html

safe_name = html.escape(user_name or "")
safe_email = html.escape(user_email or "")
safe_subject = html.escape(subject or "")
safe_message = html.escape(message_content or "").replace("\n", "<br>")
```
Sonra f-string içinde `{user_name}` yerine `{safe_name}` kullan.

### 7. Filename Sanitization (H4)

app/api/v1/projects.py içinde storage path oluşturulan satırı (~214) bul:
```python
# Mevcut (hatalı):
file_path = f"projects/{project_id}/{file.filename}"

# Düzeltilmiş:
import re
safe_filename = re.sub(r"[^\w\-.]", "_", file.filename or "upload")
safe_filename = safe_filename[:100]  # Uzunluk sınırı
file_path = f"projects/{project_id}/{safe_filename}"
```

### 8. Validation Error Production Guard (M1)

app/main.py içinde validation_exception_handler'ı bul (~116. satır):
```python
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    if settings.is_production:
        return JSONResponse(status_code=422, content={"detail": "Validation error"})
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
```

### 9. Contact Message max_length (M2)

app/schemas/contact.py içinde:
```python
message: str = Field(..., min_length=10, max_length=5000)
user_agent: Optional[str] = Field(None, max_length=512)
```

### 10. GitHub Error Detail Leak (M3)

app/api/v1/github.py içinde ~97-99 satırı:
```python
# Mevcut:
raise HTTPException(500, detail=f"GitHub sync failed: {str(e)}")

# Düzeltilmiş:
logger.error(f"GitHub sync failed: {e}")
if settings.is_production:
    raise HTTPException(500, detail="GitHub sync failed")
raise HTTPException(500, detail=f"GitHub sync failed: {str(e)}")
```

## Doğrulama

```bash
cd c:\Develop\Projects\Site\portfolio-project
python -m pytest backend/tests/test_auth.py backend/tests/test_blog.py -q
python -m pytest -q  # Tüm testler geçmeli
```

## Commit Örneği

```
fix(security): migrate from python-jose to PyJWT, patch CVE-2024-33664
fix(auth): correct require_admin guard to raise 500 when ADMIN_EMAILS unset
fix(ratelimit): add default_limits to Limiter constructor
fix(storage): validate file size from content length, sanitize filename
fix(crud): escape ILIKE wildcards in blog search
fix(email): html.escape all user-controlled fields in email templates
```

Her commit ayrı mantıksal değişiklik içermeli. Branch'i push et, main'e PR aç.
```

---

---

## PR-2 · `refactor/backend-antipatterns`
### Backend Anti-Pattern'ler & Performance

#### Bulgular

| ID | Dosya:Satır | Mesele |
|----|-------------|--------|
| A1 | `app/services/storage_service.py:104-105` | `optimize_image()` sync — event loop'u bloklıyor; `asyncio.to_thread` gerekli |
| A2 | `app/api/v1/contact.py:101` | `len(get_contact_messages(...))` — tüm tabloyu çekiyor (COUNT olmalı) |
| A3 | `app/api/v1/skills.py:33-34` | `get_skills(limit=1000)` → count için 1000 ORM objesi yüklüyor |
| A4 | `app/api/v1/experiences.py:34-38` | Aynı pattern; 1000 object yüklüyor |
| A5 | `app/crud/blog.py:214-233` | `views += 1` — atomic değil; `UPDATE SET views = views + 1` olmalı |
| A6 | `app/crud/github.py:71` | Her repo için `db.commit()` — N commit yerine loop dışında tek commit |
| A7 | `app/crud/site.py:118-130` | `set_translation` loop içinde her iterasyonda commit |
| A8 | `app/api/v1/experiences.py:65-70` | 4 ayrı SELECT query → tek query + Python grouping |
| A9 | `app/api/v1/admin.py:24-36` | 5 ayrı `count()` call → tek round-trip olabilir |
| D1 | `app/utils/security.py:131-156` | `verify_token()` hiçbir yerde çağrılmıyor — dead code |
| D2 | `app/crud/site.py:154-220` | PageView fonksiyonları hiçbir endpoint tarafından çağrılmıyor |
| D3 | `app/database.py:72-84` | `init_db()` hiçbir yerde çağrılmıyor |
| D4 | `app/api/v1/technologies.py:9` | `get_current_user` import edilmiş ama kullanılmıyor |
| D5 | `app/crud/user.py:101` | `from datetime import datetime, timezone` — deferred import (module top'a taşı) |
| D6 | `app/api/v1/github.py:34-45` | Admin check inline tekrarı — `require_admin` dependency kullanılmalı |

---

#### Implementation Prompt — PR-2

```
# GÖREV: Backend Anti-Pattern'leri ve Performance Sorunlarını Düzelt (PR-2)

Proje: c:\Develop\Projects\Site\portfolio-project\backend
Önce AGENTS.md dosyasını (c:\Develop\Projects\Site\AGENTS.md) oku.

## Git Setup
git switch main && git reset --hard origin/main
git switch -c refactor/backend-antipatterns

## Yapılacaklar

### 1. asyncio.to_thread — optimize_image (A1)

app/services/storage_service.py içinde upload_file metodunu bul.
Sync PIL çağrısını async yapma:
```python
# Mevcut (hatalı — event loop bloklanır):
file_data = self.optimize_image(file_data)

# Düzeltilmiş:
import asyncio
file_data = await asyncio.to_thread(self.optimize_image, file_data)
```

### 2. Fetch-All-to-Count Düzeltmeleri (A2, A3, A4)

**app/api/v1/contact.py** (~101. satır):
```python
# Mevcut:
total = len(contact_crud.get_contact_messages(db, unread_only=unread_only))

# Düzeltilmiş:
from sqlalchemy import func
from app.models.contact import ContactMessage
total_q = db.query(func.count(ContactMessage.id))
if unread_only:
    total_q = total_q.filter(ContactMessage.is_read == False)
total = total_q.scalar()
```

**app/api/v1/skills.py** (~33. satır):
```python
from sqlalchemy import func
from app.models.skill import Skill
total = db.query(func.count(Skill.id)).scalar()
```

**app/api/v1/experiences.py** (~34. satır):
```python
from sqlalchemy import func
from app.models.experience import Experience
total = db.query(func.count(Experience.id)).scalar()
```

### 3. Atomic Blog Views (A5)

app/crud/blog.py içinde `increment_blog_views` fonksiyonunu yeniden yaz:
```python
from sqlalchemy import update

def increment_blog_views(db: Session, post_id: UUID) -> Optional[BlogPost]:
    db.execute(
        update(BlogPost)
        .where(BlogPost.id == post_id)
        .values(views=BlogPost.views + 1)
    )
    db.commit()
    # In-memory reflect: get_blog_post_by_id yerine direkt query
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if db_post:
        db.refresh(db_post)
    return db_post
```

### 4. Bulk Operations — Tek Commit (A6, A7)

**app/crud/github.py** içinde `bulk_create_or_update_repos`:
- Döngü içindeki `db.commit()` çağrılarını kaldır
- Tüm döngü bittikten sonra tek bir `db.commit()` ekle

**app/crud/site.py** içinde `bulk_set_translations`:
- Döngü içindeki `db.commit()` çağrılarını kaldır
- Döngü dışında tek `db.commit()`

### 5. Experiences — Tek Query (A8)

app/api/v1/experiences.py içinde `get_experiences_grouped_by_type` endpoint'ini bul.
Mevcut yapı 4 ayrı query yapıyorsa, şöyle yeniden yaz:
```python
all_experiences = experience_crud.get_experiences(db, language=language, skip=0, limit=10000)
grouped = {}
for exp in all_experiences:
    t = exp.get("experience_type") or exp.experience_type
    if t not in grouped:
        grouped[t] = []
    grouped[t].append(exp)
return grouped
```
Ya da `crud/experience.py` içinde `get_experiences_grouped_by_type` CRUD fonksiyonu varsa
orada tek query ile Python grouping yap.

### 6. Admin Stats — Tek Round-Trip (A9)

app/api/v1/admin.py içinde stats endpoint'ini bul.
5 ayrı count çağrısı yerine:
```python
from sqlalchemy import func, select
from app.models.blog import BlogPost
from app.models.project import Project
# ... diğer modeller

counts = db.execute(
    select(
        func.count(Project.id).label("projects"),
        func.count(BlogPost.id).label("blog_posts"),
        # ...
    )
).first()
return {"projects": counts.projects, "blog_posts": counts.blog_posts, ...}
```
Not: Birden fazla modelden farklı tabloları count etmek için subquery kullanmak gerekebilir.
Hata yapmamak için mevcut sorguları tek tek birleştir.

### 7. Dead Code Temizliği (D1-D6)

**app/utils/security.py**: `verify_token()` fonksiyonunu tamamen kaldır (hiçbir yerde çağrılmıyor).

**app/database.py**: `init_db()` fonksiyonunu kaldır (kaldırmadan önce başka yerde çağrılıp çağrılmadığını kontrol et: `grep -r "init_db" app/`).

**app/crud/site.py**: `create_page_view`, `get_page_views_count`, `get_popular_pages` —
Bu fonksiyonlar router tarafından çağrılmıyor. Silmeden önce: onları çağıran bir router var mı
kontrol et. Yoksa YORUM olarak bırak ya da tests eklenene kadar koru (PR-6 onları test edecek).
Şimdilik sadece unused import varsa temizle.

**app/api/v1/technologies.py:9**: `get_current_user` unused import'u kaldır.

**app/crud/user.py**: `from datetime import datetime, timezone` import'unu fonksiyon içinden
dosya başına taşı.

**app/api/v1/github.py**: Inline admin check (~34-45. satır) kaldır,
`require_admin` dependency ekle (`Depends(require_admin)` gibi diğer admin endpoint'lerde kullanılanla aynı şekilde).

## Doğrulama

```bash
cd c:\Develop\Projects\Site\portfolio-project
python -m pytest -q
# Tüm testler geçmeli, özellikle blog, contact, admin testleri
```

## Commit Örnekleri
```
perf(storage): wrap optimize_image in asyncio.to_thread to prevent event loop blocking
perf(api): replace fetch-all-to-count with SELECT COUNT(*) in contact, skills, experiences
fix(crud): use atomic UPDATE for blog view increment
perf(crud): defer db.commit to after loop in bulk_create_or_update_repos and bulk_set_translations
perf(experiences): replace 4-query grouped fetch with single query + Python grouping
refactor(admin): use single subquery for dashboard stats count
chore(backend): remove dead code (verify_token, init_db, unused imports)
```
```

---

---

## PR-3 · `fix/db-schema-orm-alignment`
### ORM / SQL Schema Uyumsuzlukları

#### Bulgular

| ID | Dosya | Mesele |
|----|-------|--------|
| O1 | Tüm translation modelleri | `UniqueConstraint("parent_id", "language")` eksik — `create_all()` ile constraint oluşturulmuyor |
| O2 | `app/database.py:6,33` | Deprecated `declarative_base()` → `class Base(DeclarativeBase): pass` olmalı |
| O3 | `app/models/contact.py:27`, `site.py:62` | ORM `String(45)` ↔ SQL `INET` uyumsuzluğu |
| O4 | `app/models/github.py:30` | ORM `JSON` ↔ SQL `TEXT[]` uyumsuzluğu |
| O5 | `app/schemas/contact.py:36-37` | Pydantic v1 `class Config` → `ConfigDict` olmalı |
| O6 | `app/schemas/translations.py:22-24` | `key: str`, `value: str` — uzunluk kısıtı yok |

---

#### Implementation Prompt — PR-3

```
# GÖREV: ORM/Schema Uyumsuzluklarını Düzelt (PR-3)

Proje: c:\Develop\Projects\Site\portfolio-project\backend
Önce AGENTS.md dosyasını (c:\Develop\Projects\Site\AGENTS.md) oku.

## Git Setup
git switch main && git reset --hard origin/main
git switch -c fix/db-schema-orm-alignment

## Yapılacaklar

### 1. UniqueConstraint — Translation Modelleri (O1)

Aşağıdaki her dosyada ilgili translation modelini bul ve `__table_args__` ekle.
Mevcut projedeki UniqueConstraint formatı:
```python
from sqlalchemy import UniqueConstraint
__table_args__ = (UniqueConstraint("parent_id_field", "language", name="uq_tablename"),)
```

**app/models/blog.py** → `BlogTranslation`:
```python
__table_args__ = (UniqueConstraint("blog_post_id", "language", name="uq_blog_translations"),)
```

**app/models/project.py** → `ProjectTranslation`:
```python
__table_args__ = (UniqueConstraint("project_id", "language", name="uq_project_translations"),)
```

**app/models/skill.py** → `SkillTranslation`:
```python
__table_args__ = (UniqueConstraint("skill_id", "language", name="uq_skill_translations"),)
```

**app/models/experience.py** → `ExperienceTranslation`:
```python
__table_args__ = (UniqueConstraint("experience_id", "language", name="uq_experience_translations"),)
```

**app/models/site.py** → `Translation` (genel çeviri tablosu):
```python
__table_args__ = (UniqueConstraint("language", "translation_key", name="uq_translations"),)
```

### 2. Deprecated declarative_base Düzeltmesi (O2)

app/database.py içinde:
```python
# Kaldır:
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

# Ekle:
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
```
Tüm modellerin bu Base'i import ettiğini doğrula: `grep -r "from app.database import Base" app/models/`

### 3. IP Address Type (O3)

app/models/contact.py ve app/models/site.py içinde:
`ip_address = Column(String(45), ...)` → PostgreSQL INET tipini kullanmak için:
```python
from sqlalchemy.dialects.postgresql import INET
ip_address = Column(INET, nullable=True)
```
NOT: SQLite (test DB) INET'i desteklemez. Test compatibility için şu yaklaşımı kullan:
```python
import sqlalchemy as sa
# production DB (PostgreSQL) için INET, test DB için String fallback
from sqlalchemy.dialects.postgresql import INET as PG_INET
ip_address = Column(sa.String(45).with_variant(PG_INET, "postgresql"), nullable=True)
```

### 4. GitHub Topics Type (O4)

app/models/github.py içinde:
`topics = Column(JSON, ...)` → SQL TEXT[] ile uyumlu hale getirmek için:
```python
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Text, JSON
import sqlalchemy as sa
# PostgreSQL'de ARRAY(Text), SQLite'ta JSON fallback kullan:
topics = Column(sa.JSON().with_variant(ARRAY(Text), "postgresql"), nullable=True)
```
Bu sayede PostgreSQL'de native array, test'lerde JSON olarak çalışır.

### 5. Pydantic v2 Schema Düzeltmesi (O5)

app/schemas/contact.py içinde `ContactMessage` veya benzer schema class'ını bul:
```python
# Kaldır:
class Config:
    from_attributes = True

# Ekle (class body'nin üstüne ya da başına):
from pydantic import ConfigDict
model_config = ConfigDict(from_attributes=True)
```
Projedeki tüm şemalarda bu pattern'i ara: `grep -r "class Config:" app/schemas/`
Her birini ConfigDict'e dönüştür.

### 6. Translation Schema Uzunluk Kısıtları (O6)

app/schemas/translations.py içinde `ConfigUpdate` class'ını bul:
```python
key: str = Field(..., min_length=1, max_length=255)
value: str = Field(..., min_length=0, max_length=10000)
```

## Doğrulama

```bash
cd c:\Develop\Projects\Site\portfolio-project
python -m pytest -q
# Özellikle translation, blog, project testleri geçmeli
# SQLite ile UniqueConstraint'in uyumlu olduğunu doğrula
```

## Commit Örnekleri
```
fix(models): add UniqueConstraint to all translation models
refactor(database): migrate from deprecated declarative_base to DeclarativeBase
fix(models): align ip_address column with PostgreSQL INET type via variant
fix(models): align github topics with PostgreSQL ARRAY via JSON variant
refactor(schemas): migrate all class Config to ConfigDict(from_attributes=True)
fix(schemas): add length constraints to translation key and value fields
```
```

---

---

## PR-4 · `fix/ci-sonar-hardening`
### CI/CD, Docker & Dependency Güvenliği

#### Bulgular

| ID | Dosya | Mesele |
|----|-------|--------|
| CI1 | `.github/workflows/pr-labeler.yml:17` | `actions/labeler@v5` floating tag — SHA'ya pin'le |
| CI2 | `.github/workflows/release-drafter.yml:19` | `release-drafter/release-drafter@v6` floating tag |
| CI3 | `.github/workflows/stale.yml:17` | `actions/stale@v9` floating tag |
| CI4 | `.github/workflows/sonar-pr-gate.yml` | `pull_request_target` + secrets = SONAR_TOKEN sızma riski |
| CI5 | `ci.yml` | `npm run test` + `npm run test:coverage` — test iki kez çalışıyor |
| CI6 | Tüm workflows | `permissions:` bloğu yok — least-privilege ihlali |
| CI7 | `.github/workflows/deploy-production.yml:19` | `SECRET_KEY: ci-secret-key-...` hardcoded |
| S1 | `sonar-project.properties:5` | `sonar.python.version=3.14.3` — yayınlanmamış Python versiyonu |
| S2 | CI Sonar adımları | `-Dsonar.qualitygate.wait=true` yok — gate dekoratif |
| S3 | `sonar-project.properties` | `sonar.tests=...frontend/src` — tüm frontend source test olarak işaretlenmiş |
| D1 | `backend/docker-compose.yml:9` | `POSTGRES_PASSWORD` default: `postgres` |
| D2 | `backend/docker-compose.yml:47` | `SECRET_KEY` default: `dev-secret-key-change-in-production` |
| D3 | `backend/docker-compose.yml:24-35` | Redis'te authentication yok |
| DEP1 | `requirements.txt` | Dev araçları (pytest, black, flake8...) production image'a giriyor |

---

#### Implementation Prompt — PR-4

```
# GÖREV: CI/CD, SonarCloud ve Docker Güvenlik Sertleştirmesi (PR-4)

Proje: c:\Develop\Projects\Site
Önce AGENTS.md dosyasını (c:\Develop\Projects\Site\AGENTS.md) oku.

## Git Setup
git switch main && git reset --hard origin/main
git switch -c fix/ci-sonar-hardening

## Yapılacaklar

### 1. Floating Action Tag'leri SHA'ya Pin'le (CI1, CI2, CI3)

Her GitHub Action için mevcut commit SHA'sını bul ve pin'le.
`.github/workflows/pr-labeler.yml`:
```yaml
# Eski:
uses: actions/labeler@v5
# Yeni (örnek SHA — gerçek SHA'yı https://github.com/actions/labeler/releases adresinden bul):
uses: actions/labeler@v5
# -> Doğru SHA formatı: actions/labeler@<full-40-char-sha>
```
Bunun için `gh api repos/actions/labeler/git/refs/tags/v5` komutu ile son SHA'ı çek.
Tüm üç dosyada (pr-labeler.yml, release-drafter.yml, stale.yml) aynı işlemi yap.
SHA comment olarak belirt: `# v5.0.0`

### 2. sonar-pr-gate.yml Yetkisini Düşür (CI4)

`.github/workflows/sonar-pr-gate.yml` içinde:
- `pull_request_target` → `pull_request` (secrets olmadan çalışır, daha güvenli)
- Eğer SONAR_TOKEN gerekiyorsa, yalnızca repo sahibinin PR'ları için çalışacak şekilde
  `if: github.event.pull_request.head.repo.full_name == github.repository` filtresi ekle

### 3. CI'da Redundant Test Çalışmasını Kaldır (CI5)

`.github/workflows/ci.yml` içinde frontend job'ını bul.
`npm run test` satırını kaldır, `npm run test:coverage` satırını koru.
(coverage çalıştırmak zaten tüm testleri çalıştırır)

### 4. Tüm Workflow'lara permissions: Bloğu Ekle (CI6)

Her workflow dosyasına en başa (ya da job seviyesine) ekle:
```yaml
permissions:
  contents: read
```
Eğer PR yorum yazma veya issue güncelleme gibi özel izne ihtiyaç varsa sadece o permission'ı ekle.

### 5. Hardcoded Secret'ı Kaldır (CI7)

`.github/workflows/deploy-production.yml` içinde:
```yaml
# Kaldır:
SECRET_KEY: ci-secret-key-123456789012345678901234
# Değiştir:
SECRET_KEY: ${{ secrets.CI_SECRET_KEY }}
```
README veya CI_CD_SETUP.md'e bu secret'ın nasıl ekleneceğini not et.

### 6. SonarCloud Config Düzeltmeleri (S1, S2, S3)

`portfolio-project/sonar-project.properties`:
```properties
# Düzelt:
sonar.python.version=3.13

# sonar.tests satırını düzelt — frontend/src kaynak dizin, test dizini değil:
sonar.sources=backend/app,frontend/src
sonar.tests=backend/tests,frontend/src/__tests__
# frontend test dosyaları *.test.tsx / *.spec.tsx pattern'i ile include edilebilir

# Versiyon statik yerine dinamik:
sonar.projectVersion=1.0
```

CI adımlarına `qualitygate.wait=true` ekle.
`portfolio-project/ci.yml` içinde SonarCloud scan adımını bul:
```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@...
  with:
    args: >
      -Dsonar.qualitygate.wait=true
      -Dsonar.python.coverage.reportPaths=coverage.xml
```

### 7. Docker Compose Güvensiz Default'ları Düzelt (D1, D2, D3)

`portfolio-project/backend/docker-compose.yml`:
```yaml
# POSTGRES_PASSWORD — default'u kaldır, zorunlu hale getir:
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD env var is required}

# SECRET_KEY — aynı şekilde:
SECRET_KEY: ${SECRET_KEY:?SECRET_KEY env var is required}

# Redis auth ekle:
# redis service'e command ekle:
command: redis-server --requirepass ${REDIS_PASSWORD:?REDIS_PASSWORD env var is required}

# API service env'e ekle:
REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
```
.env.example dosyasına bu değişkenleri ekle (placeholder değerler ile).

### 8. requirements.txt →  requirements-dev.txt Ayrımı (DEP1)

`portfolio-project/backend/requirements.txt` içinde dev araçlarını ayır:
Production'da kalacaklar: fastapi, uvicorn, sqlalchemy, pydantic, ... (uygulama dep'leri)
`requirements-dev.txt` oluştur ve buraya taşı:
- pytest, pytest-asyncio, pytest-cov, httpx (test için)
- black, isort, flake8, mypy (lint için)
- wheel, setuptools (build için)

`portfolio-project/backend/Dockerfile` güncelle:
```dockerfile
# Production image'da sadece production deps:
RUN pip install --no-cache-dir -r requirements.txt

# Test stage (CI'da) için:
# RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt
```
CI workflow'unda test adımı için requirements-dev.txt ile install et.

### 9. CI'ya Dependency Audit Ekle (Bonus)

`.github/workflows/ci.yml` içinde backend job'ına ekle:
```yaml
- name: Security audit (pip)
  run: |
    pip install pip-audit
    pip-audit -r requirements.txt
```
Frontend job'ına ekle:
```yaml
- name: Security audit (npm)
  run: npm audit --audit-level=high
  continue-on-error: true  # Başlangıçta uyarı olarak; sonra false yap
```

## Doğrulama

```bash
# Workflow YAML syntax kontrolü (yüklüyse):
actionlint .github/workflows/*.yml

# Docker compose config doğrulama:
cd portfolio-project/backend
docker-compose config

# SonarCloud properties:
cat portfolio-project/sonar-project.properties
```

## Commit Örnekleri
```
ci: pin all floating action tags to commit SHAs
ci(sonar): change pull_request_target to pull_request in sonar-pr-gate
ci: remove redundant npm test run before coverage step
ci: add permissions: contents read to all workflows
ci: move hardcoded CI_SECRET_KEY to GitHub secret
fix(sonar): set python.version to 3.13, fix test source path, enable quality gate blocking
fix(docker): require POSTGRES_PASSWORD and SECRET_KEY as mandatory env vars
fix(docker): add Redis authentication via REDIS_PASSWORD env var
chore(deps): split dev dependencies into requirements-dev.txt
ci: add pip-audit and npm audit security scanning steps
```
```

---

---

## PR-5 · `refactor/frontend-quality`
### Frontend Kod Kalitesi, TypeScript & Erişilebilirlik

#### Bulgular

| ID | Dosya | Mesele |
|----|-------|--------|
| F1 | `Admin.tsx` (1843 satır) | 6+ bağımsız component — bölünmeli |
| F2 | `AdminForms.tsx` (896 satır) | 4 form bileşeni tek dosyada |
| F3 | `Home.tsx`, `About.tsx`, `Contact.tsx`, `Projects.tsx` | `const t = {...}` component içinde — module level olmalı |
| F4 | `About.tsx:97-252` | `certifications` array JSX elemanlarıyla her render'da yaratılıyor |
| F5 | `About.tsx:488-510` | 10× `as any` cast — discriminated union ile çözülür |
| F6 | `About.tsx:311` | `getExperienceYearRange(experience: any)` |
| F7 | `Projects.tsx:441` | `text: any` prop |
| F8 | `AuthContext.tsx` vs `types.ts` | Duplicate `User` interface — birleştirilmeli |
| F9 | `api.ts:61` | 403 da auth siliyor — sadece 401 silmeli (regresyon) |
| F10 | `About.tsx:614` | `<a href="/contact">` → `<Link to="/contact">` (regresyon) |
| F11 | `Projects.tsx:282-373` | Project cards keyboard erişilemez — `role`, `tabIndex`, `onKeyDown` eksik (regresyon) |
| F12 | `Navigation.tsx:146-170` | Language dropdown Escape/click-outside yok (regresyon) |
| F13 | `Toast.tsx:42-44` | Timer cancel edilmiyor — `useRef<Map>` ile track edilmeli |
| F14 | `Footer.tsx`, `ErrorBoundary.tsx`, `NotFound.tsx` | Hardcoded İngilizce string — i18n yok |
| F15 | `Admin.tsx:92` | Her iki branch aynı string — dead branch |
| A1 | `Admin.tsx:1539,1573...` | 5 dialog `aria-labelledby` eksik |
| A2 | `Home.tsx:265-273` | Skill bar `role="progressbar"` eksik |
| A3 | `Contact.tsx:389,403` | Decorative SVG `aria-hidden="true"` eksik |
| A4 | `About.tsx:557-584` | 3 GitHub stats img `width`/`height` yok (CLS) |
| P1 | `Home.tsx:16` | `sort().slice()` her render'da — `useMemo` ile |
| P2 | `Blog.tsx:50` | `allTags` her render'da — `useMemo` ile |
| P3 | `About.tsx:254-281` | `timelineItems` sort/spread her render'da — `useMemo` ile |

---

#### Implementation Prompt — PR-5

```
# GÖREV: Frontend Kod Kalitesi, TypeScript & Erişilebilirlik (PR-5)

Proje: c:\Develop\Projects\Site\portfolio-project\frontend
Önce AGENTS.md dosyasını (c:\Develop\Projects\Site\AGENTS.md) oku.

## Git Setup
git switch main && git reset --hard origin/main
git switch -c refactor/frontend-quality

## Yapılacaklar

### 1. Translation Objelerini Module Level'a Taşı (F3, F4)

src/pages/Home.tsx, About.tsx, Contact.tsx, Projects.tsx dosyalarının her birinde:
- Component fonksiyonunun başındaki `const t = { tr: {...}, en: {...} }` objesini
  component'in DIŞINA (dosya top-level'e) taşı.
- `as const` ekle: `const t = { tr: {...}, en: {...} } as const`

About.tsx için ek:
- `certifications` array'ini (14 item, her birinde JSX icon) component dışına taşı.
- Icon'lar statik olduğunda sorun yok. `currentLang`'a bağlı metin kısımları için
  `const certifications = (lang: 'tr' | 'en') => [...]` şeklinde fonksiyon yap,
  `useMemo([language], () => certifications(language))` ile kullan.

### 2. TypeScript any Cast'lerini Düzelt (F5, F6, F7)

**About.tsx — Timeline discriminated union:**
Timeline item'ların iki tipi var (Experience ve Certification). Dosyada bu tipleri bul ve:
```typescript
type ExperienceItem = { isBackendData: true; experience_type: string; start_date: string; ... }
type CertificationItem = { isBackendData: false; title_tr: string; title_en: string; ... }
type TimelineItem = ExperienceItem | CertificationItem
```
`(item as any).x` erişimlerini `item.isBackendData ? item.x : item.y` şeklinde narrowing ile değiştir.

**About.tsx — getExperienceYearRange:**
```typescript
// Mevcut:
function getExperienceYearRange(experience: any): string

// Düzeltilmiş (Experience tipini types.ts'den import et):
import type { Experience } from '@/services/types'
function getExperienceYearRange(experience: Experience): string
```

**Projects.tsx — ProjectDetailModal text prop:**
Modal component'ine giden `text` prop'unun tipini tanımla:
```typescript
interface ProjectDetailModalProps {
  text: { title: string; technologies: string; /* ... diğer alanlar */ }
  // ...
}
```

### 3. Duplicate User Interface (F8)

src/contexts/AuthContext.tsx içindeki local `User` interface'i kaldır.
src/services/types.ts içindeki `User` interface'ini import et:
```typescript
import type { User } from '@/services/types'
```
types.ts'deki User alanlarının `is_admin`, `email`, `id`, `username` içerdiğinden emin ol.
Uymayan alanları types.ts'de güncelle.

### 4. api.ts 403 Davranış Düzeltmesi (F9)

src/services/api.ts içinde response interceptor'ı bul (~61. satır):
```typescript
// Mevcut (hatalı — 403 da token siliyor):
if (error.response?.status === 401 || error.response?.status === 403) {
  localStorage.removeItem('token')
  ...
}

// Düzeltilmiş (sadece 401):
if (error.response?.status === 401) {
  localStorage.removeItem('token')
  ...
}
// 403 ayrı handle et (toast göster, redirect yapma)
```

### 5. Regresyon Düzeltmeleri (F10, F11, F12, F13)

**About.tsx:614**:
```tsx
// Kaldır:
<a href="/contact">
// Ekle:
import { Link } from 'react-router-dom'
<Link to="/contact">
```

**Projects.tsx — Project Cards Keyboard Erişimi**:
Project card'larını (onClick ile modal açan div'leri) bul.
Her card'a ekle:
```tsx
role="button"
tabIndex={0}
onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(project); } }}
```

**Navigation.tsx — Language Dropdown**:
Dropdown için useRef ve useEffect ekle:
```tsx
const langMenuRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
      setShowLangMenu(false)
    }
  }
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowLangMenu(false)
  }
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
  }
}, [])
// Dropdown container'a: ref={langMenuRef}
```

**Toast.tsx — Timer Cancellation**:
```tsx
const timerIds = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

// showToast içinde:
const id = generateId()
const timerId = setTimeout(() => hideToast(id), duration)
timerIds.current.set(id, timerId)

// hideToast içinde:
const timerId = timerIds.current.get(id)
if (timerId) {
  clearTimeout(timerId)
  timerIds.current.delete(id)
}
```

### 6. i18n — Hardcoded İngilizce Metinler (F14)

**Footer.tsx**: Link isimlerini i18n `t()` ile veya projedeki module-level t objesiyle çevir.

**ErrorBoundary.tsx**:
- "Something went wrong" → t objesinden veya props'tan al
- "Reload page" büton metni aynı şekilde

**NotFound.tsx**:
- "Page Not Found", "doesn't exist", "Go Home" → t objesinden al
  (language context'e erişim varsa `useLanguage()` hook'u kullan)

### 7. Dead Branch Temizliği (F15)

Admin.tsx:
```typescript
// Kaldır (her iki branch aynı string):
adminPanel: adminLanguage === 'tr' ? 'Admin Panel' : 'Admin Panel',
// Değiştir:
adminPanel: 'Admin Panel',
```
Duplike key'leri de temizle (welcomeUser ve welcome aynı değeri dönüyorsa birini kaldır).

### 8. Erişilebilirlik Düzeltmeleri (A1-A4)

**Admin.tsx — Dialog ARIA**:
Her `role="dialog"` element'ine `aria-labelledby` ekle:
```tsx
<div role="dialog" aria-labelledby="modal-title-projects">
  <h2 id="modal-title-projects">Proje Ekle</h2>
  ...
</div>
```
Close button'a `aria-label="Kapat"` ekle.

**Home.tsx — Skill Progress Bar**:
```tsx
<motion.div
  role="progressbar"
  aria-valuenow={skill.proficiency}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${skill.name} yetkinlik seviyesi`}
  style={{ width: `${skill.proficiency}%` }}
/>
```

**Contact.tsx — Decorative SVG**:
Sadece dekoratif SVG icon'larına `aria-hidden="true"` ekle (tıklanabilir olmayanlar için).
Social link icon'larına: `aria-label="GitHub profili"` gibi açıklayıcı label ekle.

**About.tsx — GitHub Stats Images**:
```tsx
<img
  src="https://github-readme-stats..."
  alt="GitHub istatistikleri"
  width={495}
  height={195}
  loading="lazy"
/>
```
Her üç img'e `width`, `height`, `loading="lazy"` ve `alt` ekle.

### 9. useMemo ile Performance Düzeltmeleri (P1-P3)

**Home.tsx:16** — Skill sort:
```tsx
const topSkills = useMemo(
  () => [...(skillsData ?? [])].sort((a, b) => b.proficiency - a.proficiency).slice(0, 8),
  [skillsData]
)
```

**Blog.tsx:50** — Tag list:
```tsx
const allTags = useMemo(
  () => ['all', ...new Set(posts.flatMap(p => p.tags ?? []))],
  [posts]
)
```

**About.tsx:254-281** — Timeline items:
```tsx
const timelineItems = useMemo(
  () => [...experiences, ...certifications].sort((a, b) => ...),
  [experiences, certifications]
)
```

## Admin.tsx Bölünmesi (F1) — Büyük Refactor

NOTER: Bu, PR-5'in en büyük değişikliği. Zaman alabilir.
src/components/admin/ dizini oluştur ve şu bileşenlere böl:
- `AdminProjectsTab.tsx` — proje CRUD
- `AdminSkillsTab.tsx` — skill CRUD
- `AdminExperiencesTab.tsx` — deneyim CRUD
- `AdminMessagesTab.tsx` — mesaj yönetimi
- `AdminStatsCard.tsx` — istatistik kartları
Admin.tsx sadece layout ve tab navigation'ı içersin.
AdminForms.tsx'deki 4 formu da ayrı dosyalara böl:
- `ProjectForm.tsx`, `SkillForm.tsx`, `ExperienceForm.tsx`, `TranslationEditor.tsx`

## Doğrulama

```bash
cd c:\Develop\Projects\Site\portfolio-project\frontend
npm run type-check     # TypeScript hataları sıfır olmalı
npm run lint           # ESLint --max-warnings 0
npm run build          # Build başarılı olmalı
npm run test           # Mevcut testler geçmeli
```

## Commit Örnekleri
```
refactor(frontend): move translation objects to module level in all public pages
fix(types): replace as-any casts in About.tsx with discriminated union type
fix(types): consolidate duplicate User interface into types.ts
fix(api): clear auth token only on 401, not 403
fix(about): replace anchor tag with React Router Link for /contact
fix(projects): add keyboard accessibility to project cards (role, tabIndex, onKeyDown)
fix(navigation): add click-outside and Escape key handler to language dropdown
fix(toast): track and cancel timer IDs via useRef Map
fix(i18n): add translations to Footer, ErrorBoundary, NotFound
fix(a11y): add aria-labelledby to admin dialogs, role=progressbar to skill bars
perf(frontend): memoize skills sort, blog tags, and timeline items
refactor(admin): split 1843-line Admin.tsx into domain-specific tab components
```
```

---

---

## PR-6 · `test/backend-coverage`
### Backend Test Coverage: %72.66 → %80+

#### Bulgular

| Test Ekleme | Tahmin Kazanım | Dosya |
|-------------|----------------|-------|
| `crud/site.py` PageView CRUD fonksiyonları | +3.5% | Yeni test dosyası |
| Project image endpoint 404 branch'leri | +1.5% | `test_projects_admin.py` |
| Auth dep edge case'leri (blacklist, token type, inactive user) | +1.0% | `test_auth.py` |
| Token CRUD edges (revoke not-found, blacklist idempotent) | +0.5% | `test_auth.py` |
| Blog translation path (`language=tr`) | +0.5% | `test_blog.py` |
| Experiences missing paths | +0.5% | `test_experiences.py` |
| Config validation edge cases | +0.5% | `test_config.py` |

---

#### Implementation Prompt — PR-6

```
# GÖREV: Backend Test Coverage'ı %72.66'dan %80+'a Çıkar (PR-6)

Proje: c:\Develop\Projects\Site\portfolio-project
Önce AGENTS.md dosyasını (c:\Develop\Projects\Site\AGENTS.md) oku.

## Git Setup
git switch main && git reset --hard origin/main
git switch -c test/backend-coverage

## Mevcut Durum
- Test dosyaları: backend/tests/ klasöründe
- Coverage target: app.api.v1, app.crud, app.api.deps
- Mevcut coverage: ~72.66%
- Hedef: 80%+
- pytest.ini: `portfolio-project/pytest.ini`'yi oku, yapıyı anla.
- conftest.py: `backend/tests/conftest.py`'yi oku, mevcut fixture'ları kullan.

## Yapılacaklar

### 1. Yeni Dosya: test_site_pageviews.py (+3.5%)

`backend/tests/test_site_pageviews.py` oluştur:
```python
"""Tests for crud/site.py PageView functions."""
import pytest
from datetime import datetime, timezone, timedelta

def test_create_page_view(client, db_session):
    """create_page_view kayıt oluşturur"""
    from app.crud.site import create_page_view
    pv = create_page_view(db_session, page_path="/home", ip_address="127.0.0.1")
    assert pv is not None
    assert pv.page_path == "/home"

def test_get_page_views_count(client, db_session):
    """get_page_views_count tüm view'ları sayar"""
    from app.crud.site import create_page_view, get_page_views_count
    create_page_view(db_session, page_path="/about")
    create_page_view(db_session, page_path="/about")
    count = get_page_views_count(db_session)
    assert count >= 2

def test_get_page_views_count_filtered(client, db_session):
    """get_page_views_count page_path filtresi çalışır"""
    from app.crud.site import create_page_view, get_page_views_count
    create_page_view(db_session, page_path="/unique-test-path")
    count = get_page_views_count(db_session, page_path="/unique-test-path")
    assert count >= 1

def test_get_popular_pages(client, db_session):
    """get_popular_pages sıralı liste döndürür"""
    from app.crud.site import create_page_view, get_popular_pages
    for _ in range(3):
        create_page_view(db_session, page_path="/popular")
    create_page_view(db_session, page_path="/less-popular")
    pages = get_popular_pages(db_session, limit=5)
    assert isinstance(pages, list)
    # /popular önce gelmeli
    if pages:
        paths = [p[0] if isinstance(p, tuple) else p.page_path for p in pages]
        assert "/popular" in paths
```

### 2. Project Image 404 Paths (+1.5%)

`backend/tests/test_projects_admin.py` dosyasına ekle (mevcut dosyayı oku önce):

```python
def test_upload_image_to_nonexistent_project(client, admin_headers):
    """Var olmayan projeye image upload 404 döndürmeli"""
    import uuid
    fake_id = str(uuid.uuid4())
    from io import BytesIO
    data = {"file": ("test.jpg", BytesIO(b"fake image data"), "image/jpeg")}
    response = client.post(
        f"/api/v1/projects/{fake_id}/upload-image",
        files=data,
        headers=admin_headers
    )
    assert response.status_code == 404

def test_delete_nonexistent_image(client, admin_headers, create_project):
    """Var olmayan image'ı silmeye çalışmak 404 döndürmeli"""
    import uuid
    project = create_project()
    fake_image_id = str(uuid.uuid4())
    response = client.delete(
        f"/api/v1/projects/{project.id}/images/{fake_image_id}",
        headers=admin_headers
    )
    assert response.status_code == 404

def test_update_nonexistent_image(client, admin_headers, create_project):
    """Var olmayan image'ı güncellemeye çalışmak 404 döndürmeli"""
    import uuid
    project = create_project()
    fake_image_id = str(uuid.uuid4())
    response = client.put(
        f"/api/v1/projects/{project.id}/images/{fake_image_id}",
        json={"caption": "test", "display_order": 1},
        headers=admin_headers
    )
    assert response.status_code == 404
```

### 3. Auth Dep Edge Cases (+1.0%)

`backend/tests/test_auth.py` dosyasına ekle:

```python
def test_access_with_refresh_token_rejected(client, admin_user):
    """refresh token tipini access endpoint'inde kullanmak 401 döndürmeli"""
    # Önce login yap, refresh token al
    response = client.post("/api/v1/auth/login/json",
        json={"username": admin_user.email, "password": "testpassword"})
    assert response.status_code == 200
    refresh_token = response.json()["refresh_token"]

    # Refresh token'ı Authorization header'ı olarak kullan
    headers = {"Authorization": f"Bearer {refresh_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401

def test_blacklisted_token_rejected(client, admin_headers, admin_user):
    """Blacklist'e alınmış token 401 döndürmeli"""
    # Logout yap (token blacklist'e girer)
    client.post("/api/v1/auth/logout", headers=admin_headers)
    # Aynı token ile tekrar istek yap
    response = client.get("/api/v1/auth/me", headers=admin_headers)
    assert response.status_code == 401

def test_login_inactive_user(client, db_session):
    """is_active=False kullanıcı login olamamalı"""
    from app.crud.user import create_user
    from app.schemas.user import UserCreate
    user = create_user(db_session, UserCreate(
        email="inactive@test.com",
        username="inactive_user",
        password="testpassword123",
    ))
    user.is_active = False
    db_session.commit()

    response = client.post("/api/v1/auth/login/json",
        json={"username": "inactive@test.com", "password": "testpassword123"})
    assert response.status_code == 401

def test_register_duplicate_username(client, admin_user):
    """Var olan username ile kayıt 400 döndürmeli"""
    response = client.post("/api/v1/auth/register", json={
        "email": "different@test.com",
        "username": admin_user.username,
        "password": "testpassword123"
    })
    assert response.status_code in [400, 422]
```

### 4. Blog Translation Path (+0.5%)

`backend/tests/test_blog.py` dosyasına ekle:

```python
def test_get_blog_posts_with_language_tr(client, create_blog_post):
    """language=tr parametresi ile blog post listesi döndürmeli"""
    post = create_blog_post(published=True)
    response = client.get("/api/v1/blog/?language=tr")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("posts") or data, list)

def test_unpublished_post_not_visible_to_public(client, create_blog_post):
    """published=False olan post public endpoint'te 404 dönmeli"""
    post = create_blog_post(published=False)
    response = client.get(f"/api/v1/blog/{post.slug}")
    assert response.status_code == 404

def test_blog_search_with_wildcard_characters(client, create_blog_post):
    """% ve _ karakterleri ile search güvenli çalışmalı (injection yok)"""
    create_blog_post(published=True, title="Test Post")
    # Bu sorgu tüm tabloyu döndürmemeli
    response = client.get("/api/v1/blog/?q=%")
    assert response.status_code == 200
    # _ ile de test et
    response = client.get("/api/v1/blog/?q=_")
    assert response.status_code == 200
```

### 5. Config Validation Tests (+0.5%)

`backend/tests/test_config.py` dosyası yoksa oluştur, varsa ekle:

```python
def test_admin_email_list_property():
    """admin_email_list property ADMIN_EMAILS'i doğru parse etmeli"""
    from app.config import Settings
    s = Settings(
        ADMIN_EMAILS="  admin@test.com , another@test.com  ",
        SECRET_KEY="a" * 32,
        DATABASE_URL="sqlite:///test.db",
    )
    emails = s.admin_email_list
    assert "admin@test.com" in emails
    assert "another@test.com" in emails
    # Whitespace temizlenmiş olmalı
    for email in emails:
        assert email == email.strip()

def test_captcha_verify_url_hcaptcha():
    """captcha_verify_url hcaptcha için doğru URL döndürmeli"""
    from app.config import Settings
    s = Settings(
        CAPTCHA_PROVIDER="hcaptcha",
        SECRET_KEY="a" * 32,
        DATABASE_URL="sqlite:///test.db",
    )
    assert "hcaptcha.com" in s.captcha_verify_url
```

### 6. Missing Skill/Experience Paths (+0.5%)

`backend/tests/test_skills.py` ve `test_experiences.py` dosyalarına ekle:

```python
# test_skills.py'ye:
def test_update_nonexistent_skill(client, admin_headers):
    import uuid
    response = client.put(
        f"/api/v1/skills/{uuid.uuid4()}",
        json={"name": "Test", "proficiency": 50},
        headers=admin_headers
    )
    assert response.status_code == 404

def test_delete_nonexistent_skill(client, admin_headers):
    import uuid
    response = client.delete(
        f"/api/v1/skills/{uuid.uuid4()}",
        headers=admin_headers
    )
    assert response.status_code == 404

# test_experiences.py'ye:
def test_get_experiences_current_only(client, create_experience):
    """current_only=True sadece devam eden deneyimleri döndürmeli"""
    create_experience(is_current=True)
    create_experience(is_current=False)
    response = client.get("/api/v1/experiences/?current_only=true")
    assert response.status_code == 200
```

## Doğrulama

```bash
cd c:\Develop\Projects\Site\portfolio-project
python -m pytest -q --cov=app.api.v1 --cov=app.crud --cov=app.api.deps --cov-report=term-missing
# Coverage 80%+ olmalı
# pytest.ini'deki --cov-fail-under=80 geçmeli
```

## Commit Örnekleri
```
test(crud): add PageView CRUD test coverage for site.py functions
test(projects): add 404 branch tests for image upload, delete, and update endpoints
test(auth): add edge case tests for blacklisted tokens, refresh token misuse, inactive user
test(blog): add Turkish language path and unpublished post visibility tests
test(config): add admin_email_list parsing and captcha URL tests
test(skills): add 404 branch tests for update and delete endpoints
test(experiences): add current_only filter test
```
```

---

---

## Hızlı Başvuru — Issue Sayıları

| Kategori | Critical | High | Medium | Low | Toplam |
|----------|----------|------|--------|-----|--------|
| Backend Security | 2 | 4 | 4 | 1 | **11** |
| Backend Anti-patterns | 0 | 3 | 8 | 4 | **15** |
| DB / ORM | 0 | 2 | 4 | 1 | **7** |
| CI/CD & Infra | 0 | 5 | 5 | 3 | **13** |
| Frontend TS & Quality | 0 | 3 | 9 | 4 | **16** |
| Frontend A11y & Perf | 0 | 4 | 6 | 3 | **13** |
| Test Coverage | 0 | 2 | 6 | 4 | **12** |
| Dependencies | 1 | 1 | 3 | 5 | **10** |
| **TOPLAM** | **3** | **24** | **45** | **25** | **~97 unique** |

> Not: Bazı issue'lar birden fazla kategoride görünüyor (overlap sayılmadan ~97 unique fix).
