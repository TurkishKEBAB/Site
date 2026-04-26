# Audit Implementation Plan

Kaynak rapor: [`../planlama.md`](../planlama.md)

Bu dosya, teknik denetim raporundaki bulguları uygulanabilir fazlara ve takip edilebilir TODO listesine dönüştürür. Rapor kanıt envanteri olarak kalsın; bu dosya ise her oturumda işaretlenecek yaşayan uygulama planı olsun.

## Kısa Değerlendirme

Rapor bulgu kapsamı açısından güçlü ve uygulamaya başlamak için yeterli. Rapordaki veriler, test sonuçları ve doğrulama notları geçerli kaynak gerçekliği olarak kabul edilir; eksik alanlar olabilir, fakat mevcut bulguların tekrar kanıtlanması bu planın ön koşulu değildir. Eksik olan kısım implementasyon sırası, bağımlılıklar, kabul kriterleri ve iş takibi formatıydı.

Planı aşağıdaki sırayla yürütmek daha güvenli:

1. Önce mevcut test/audit çalışma durumunu kaydet.
2. Kullanıcıyı veya CI'ı doğrudan etkileyen P0/P1 regresyonları kapat.
3. Veritabanı şeması gerektiren işleri Alembic temeli kurulduktan sonra yap.
4. Büyük frontend refactorlarını güvenlik ve CI kapıları stabil olduktan sonra ele al.
5. Test, gözlemlenebilirlik ve dokümantasyon kalitesini fazlar boyunca artır.

## Takip Kuralları

- Her iş tamamlandığında ilgili checkbox `[x]` yapılır.
- Her faz sonunda `Faz Durumu` ve `Notlar` güncellenir.
- Bir PR bir reviewable problemi çözmelidir; backend ve frontend değişiklikleri yalnızca zorunluysa aynı PR'a girer.
- Branch isimleri `AGENTS.md` ve `GIT_WORKFLOW.md` kurallarına uygun olmalıdır.
- Commit mesajları Conventional Commits formatında ve İngilizce yazılmalıdır.
- Her faz için hedefli testler, mümkünse `./quality.ps1`, çalıştırılmalıdır.

## Faz 0 - Baseline Durum Kaydı

Faz Durumu: `done`

Amaç: Rapordaki bulguları yeniden kanıtlamak değil; ilk PR'lardan önce mevcut test, build ve audit komutlarının bugünkü kırmızı/yeşil durumunu kaydetmek. Rapor verileri doğru kabul edilir, bu faz yalnızca implementasyon sırasında regresyonları ayırt etmeyi kolaylaştırır.

TODO:

- [x] `git status --short --branch` ve `git fetch origin` ile branch/working tree durumunu kaydet.
- [x] Backend testlerini çalıştır: `cd portfolio-project && python -m pytest -q`.
- [x] Frontend lint çalıştır: `cd portfolio-project/frontend && npm run lint`.
- [x] Frontend type-check çalıştır: `cd portfolio-project/frontend && npm run type-check`.
- [x] Frontend test çalıştır: `cd portfolio-project/frontend && npm run test`.
- [x] Frontend build çalıştır: `cd portfolio-project/frontend && npm run build`.
- [x] Güncel audit durumunu ölç: `cd portfolio-project/frontend && npm audit --audit-level=high`.
- [x] Ölçüm sonuçlarını ilgili PR açıklamasına veya bu dosyanın faz notuna ekle.
- [x] Rapordaki doğru kabul edilen başlangıç verileriyle komut çıktıları arasında yeni bir fark varsa bunu ayrıca not et.

Kabul kriteri:

- Başlangıç test/audit durumu biliniyor.
- İlk implementasyon fazı için hangi komutların zaten kırmızı olduğu açıkça not edilmiş.
- Rapor bulguları tekrar tartışmaya açılmadan implementasyon için kaynak kabul edilmiş.

Notlar:

- `npm audit` çıktısı değişken olduğu için Faz 1'e başlamadan tekrar ölçülmelidir.
- Rapor eksik olabilir; bu nedenle yeni bulgu çıkarsa ilgili faza ek TODO olarak işlenmelidir.

Faz 0 ölçüm notu (2026-04-25):

- Git başlangıç durumu: `## main...origin/main`, working tree temiz; `git fetch origin` başarıyla tamamlandı. Çalışma dalı: `chore/repo-audit-phase-0`.
- Backend test: `python -m pytest -q` başarılı; `75 passed`, toplam coverage `%85.60`, `6 warnings`. Ek olarak kapanışta SQLite bağlantısı için `ResourceWarning` görüldü.
- Frontend lint: `npm run lint` başarılı.
- Frontend type-check: `npm run type-check` başarılı.
- Frontend test: `npm run test` başarılı; `3 passed` test dosyası, `11 passed` test. `ContactForm` negatif senaryolarında beklenen `backend unavailable` stderr logları üretildi.
- Frontend build: `npm run build` başarılı; Next.js `16.2.1` Turbopack build tamamlandı. `Browserslist` verisinin 6 ay eski olduğuna dair bakım uyarısı verdi.
- Frontend audit: `npm audit --audit-level=high` başarısız; `19 vulnerabilities` bulundu (`7 moderate`, `12 high`). High bulgular: `axios`, `flatted`, `glob`, `minimatch`, `next`, `picomatch`, `rollup`.
- Rapor farkı: planlama raporundaki önceki audit ölçümü `18 toplam / 12 high` idi; güncel ölçüm `19 toplam / 12 high`. High sayısı aynı, toplam açık sayısı +1.

## Faz 1 - P0 Stabilizasyon ve CI Güvenlik Kapısı

Faz Durumu: `done`

Amaç: Kullanıcı oturumunu bozan aktif frontend regresyonunu ve CI'da güvenlik açığı geçmesine izin veren kapıyı kapatmak.

TODO:

- [x] `frontend/src/services/api.ts` içinde token temizleme koşulunu yalnızca `401` için çalışacak hale getir.
- [x] `403` davranışı için frontend servis testi ekle: 403 localStorage tokenlarını silmemeli.
- [x] `401` davranışı için regresyon testi ekle: 401 tokenları silmeli ve admin sayfasında login'e yönlendirmeli.
- [x] Güncel `npm audit --audit-level=high` çıktısını sınıflandır.
- [x] High severity açıkları kapatacak dependency upgrade PR'ını hazırla.
- [x] Upgrade sonrası `npm audit --audit-level=high` sıfır high açık ile geçmeli.
- [x] `.github/workflows/ci.yml` içinde `npm audit` için `continue-on-error: true` kaldır.
- [x] `deploy-vercel-preview.yml` ve `deploy-railway-staging.yml` içindeki stale `Codex_Implementation` referanslarını güncelle.

Kabul kriteri:

- 403 artık kullanıcıyı oturumdan atmıyor.
- CI high severity frontend audit açığında başarısız oluyor.
- Staging/preview workflow'ları ölü branch ismine bağlı değil.
- Hedefli frontend testler, lint, type-check ve build geçiyor.

Önerilen PR bölümü:

- PR 1: `fix(frontend): preserve session on forbidden responses`
- PR 2: `fix(frontend): clear high severity audit findings`
- PR 3: `ci(github): enforce frontend audit gate`
- PR 4: `ci(github): remove stale deployment branch references`

Notlar:

- Audit gate, dependency açıkları kapatılmadan aktive edilirse CI bilinçli olarak kırmızıya döner. Bu yüzden dependency upgrade ve gate kaldırma aynı PR'da veya ardışık PR'larda planlanmalıdır.

Faz 1 ölçüm notu (2026-04-26):

- Başlangıç audit durumu: `npm audit --audit-level=high --json` başarısız; `19 vulnerabilities` (`7 moderate`, `12 high`). High sınıflandırması: `axios`, `next`, `@typescript-eslint/*` zinciri, `minimatch`, `flatted`, `glob`, `picomatch`, `rollup`.
- Dependency düzeltmeleri: `axios` `1.15.2`, `next`/`@next/bundle-analyzer` `16.2.4`, `@typescript-eslint/eslint-plugin` ve `@typescript-eslint/parser` `8.59.0`, `eslint` `8.57.1`; lockfile audit fix ile güvenli transitive sürümlere güncellendi.
- Son audit durumu: `npm audit --audit-level=high` başarılı; high açık `0`. Kalan audit notu: `4 moderate` (`vite`/`esbuild` ve Next iç `postcss` zinciri); npm bunlar için breaking/yanlış major öneriyor, Faz 1 high gate kabul kriterini etkilemiyor.
- Hedefli doğrulama: `npm run test -- src/services/api.test.ts`, `npm run test`, `npm run lint`, `npm run type-check` başarılı.
- CI/deploy düzeltmeleri: frontend npm audit adımındaki `continue-on-error: true` kaldırıldı; preview/staging workflow'larında `Codex_Implementation` branch referansları çıkarılıp `main`, `develop` ve ilgili frontend/backend task branch pattern'ları eklendi.

## Faz 2 - Düşük Riskli Backend Güvenlik Sıkılaştırma

Faz Durumu: `done`

Amaç: Şema değişikliği gerektirmeyen veya düşük riskli backend güvenlik açıklarını kapatmak.

TODO:

- [x] `backend/app/api/deps.py` içindeki admin email/user email debug loglarını kaldır veya PII içermeyen hale getir.
- [x] İlgili auth/admin dependency testlerini ekle veya güncelle.
- [x] `backend/app/config.py` içinde `ADMIN_EMAILS` default kişisel email değerini kaldır.
- [x] Production validation içinde boş `ADMIN_EMAILS` için fail-fast davranışı doğrula.
- [x] Test fixture/env ayarlarının explicit `ADMIN_EMAILS` set ettiğini doğrula.
- [x] `backend/seed_data.py` içinde env yokken parola üretip stdout'a basma davranışını kaldır.
- [x] `SEED_ADMIN_PASSWORD` yoksa seed işlemini `RuntimeError` ile durdur.
- [x] Seed davranışı için test veya en azından manuel doğrulama ekle.
- [x] `backend/app/main.py` CORS method listesini explicit whitelist yap.
- [x] CORS davranışını mevcut frontend istekleriyle smoke test et.

Kabul kriteri:

- Admin yetki kontrolünde PII loglanmıyor.
- Prod varsayılan admin email ile ayağa kalkmıyor.
- Seed script admin parolasını terminale yazmıyor.
- CORS method whitelist mevcut uygulama akışını bozmuyor.

Önerilen PR bölümü:

- PR 1: `fix(security): remove admin authorization email logging`
- PR 2: `fix(config): require explicit admin emails in production`
- PR 3: `fix(seed): require explicit admin seed password`
- PR 4: `fix(api): whitelist allowed cors methods`

Notlar:

- Faz 1 değişiklikleri `main` içindedir: PR #23 `2026-04-26` tarihinde squash merge edildi ve `origin/main` üzerinde `f749f9e fix(frontend): complete audit phase 1 stabilization (#23)` commit'i bulunuyor.
- Admin authorization logları artık user email veya admin email listesini yazmıyor; regresyon testi log mesajlarında `user@test.com` ve `admin@test.com` bulunmadığını doğruluyor.
- `ADMIN_EMAILS` default'u boşaltıldı; production validation boş admin listesiyle fail-fast hata üretiyor. Test fixture, CI env, Docker Compose env geçişi ve `.env.example` explicit `ADMIN_EMAILS` kullanıyor.
- Seed script `SEED_ADMIN_PASSWORD` yokken parola üretmiyor ve stdout'a parola yazmıyor; `RuntimeError` ile duruyor.
- CORS method listesi `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` olarak sınırlandı; preflight testleri frontend CRUD methodlarını kabul edip `TRACE` methodunu reddediyor.
- Doğrulama: `python -m pytest -c pytest.ini backend/tests/test_config.py backend/tests/test_admin_security.py backend/tests/test_seed_data.py backend/tests/test_system_health.py -q --no-cov` başarılı (`13 passed`); `python -m pytest -q` başarılı (`83 passed`, coverage `%85.64`).

## Faz 3 - Migration Temeli ve Admin Yetkilendirme Modeli

Faz Durumu: `done`

Amaç: Prod şema değişikliklerini güvenli hale getirmek ve admin yetkisini email listesi yerine veritabanı modeliyle yönetmek.

TODO:

- [x] Alembic klasörünü ve `alembic.ini` yapılandırmasını ekle.
- [x] Mevcut SQLAlchemy modellerinden baseline migration üret.
- [x] Migration komutlarını local SQLite ve CI/deploy akışlarıyla doğrula.
- [x] Deploy pipeline'a `alembic upgrade head` adımını ekle.
- [x] `User.is_admin` kolonu için migration ekle.
- [x] `ADMIN_EMAILS` değerini yalnızca bootstrap/grant mekanizması olarak sınırla.
- [x] `require_admin` dependency'sini `User.is_admin` kontrolüne geçir.
- [x] Admin grant/revoke veya bootstrap kararını dokümante et.
- [x] Admin action audit log tablosu için tasarım yap.
- [x] Kritik admin CRUD işlemlerine audit log yaz.
- [x] Login lockout için `failed_login_count` ve `locked_until` alanlarını tasarla.
- [x] Login lockout backend testlerini ekle.

Kabul kriteri:

- Şema değişiklikleri migration ile versionlanıyor.
- Admin yetkisi DB kolonu üzerinden okunuyor.
- Email listesi kalıcı yetki kaynağı değil.
- Audit log en azından kritik admin aksiyonlarında kayıt üretiyor.
- Login brute-force denemeleri lockout ile sınırlandırılıyor.

Önerilen PR bölümü:

- PR 1: `feat(backend): add alembic migration baseline`
- PR 2: `feat(auth): authorize admins with user role flag`
- PR 3: `feat(admin): record audit log for admin actions`
- PR 4: `feat(auth): lock accounts after repeated login failures`

Notlar:

- Faz 1 ve Faz 2 değişiklikleri `main` içindedir: PR #23 `f749f9e` ve PR #24 `b035674` squash merge commit'leri `origin/main` üzerinde bulunuyor.
- Alembic temeli `backend/alembic/` ve `backend/alembic.ini` ile eklendi; baseline migration mevcut SQLAlchemy modellerini `create_all(checkfirst=True)` ile güvenli şekilde versionlıyor.
- `20260426_0002_admin_auth_audit_lockout` migration'ı `users.is_admin`, `users.failed_login_count`, `users.locked_until` ve `admin_action_logs` şemasını ekliyor; mevcut `ADMIN_EMAILS` değerleri yalnızca bootstrap sırasında DB admin flag'ine taşınıyor.
- `require_admin` artık email listesi yerine `User.is_admin` okuyor; `ADMIN_EMAILS` kalıcı yetki kaynağı değil, bootstrap/grant mekanizması olarak dokümante edildi.
- Kritik admin create/update/delete/sync/clear işlemleri `AdminActionLog` kaydı üretiyor; `project.create` akışı regresyon testiyle doğrulandı.
- Login brute-force denemeleri `LOGIN_MAX_FAILED_ATTEMPTS` ve `LOGIN_LOCKOUT_MINUTES` ile sınırlandırılıyor; başarısız giriş lockout'u ve başarılı giriş reset'i test edildi.
- Migration çalıştırma hattı Docker image başlangıcına, CI backend quality job'una ve production deploy workflow'una `python -m alembic upgrade head` olarak eklendi.
- Doğrulama: `python -m alembic upgrade head` SQLite test DB ile başarılı; Docker daemon çalışmadığı için yerel Postgres container doğrulaması bu oturumda çalıştırılamadı. `python -m pytest -c pytest.ini backend/tests/test_auth.py backend/tests/test_admin_security.py backend/tests/test_admin_audit.py backend/tests/test_projects_admin.py backend/tests/test_github.py -q --no-cov` başarılı (`36 passed`); `python -m pytest -q` başarılı (`86 passed`, coverage `%86.35`).

## Faz 4 - Upload Güvenliği ve Frontend Security Headers

Faz Durumu: `done`

Amaç: Dosya upload içeriğini gerçek dosya türüne göre doğrulamak ve frontend güvenlik başlıklarını netleştirmek.

TODO:

- [x] `filetype` veya uygun alternatif kütüphane seçimini yap.
- [x] `backend/app/services/storage_service.py` içine `validate_file_content(bytes)` ekle.
- [x] Upload akışında uzantı/boyut kontrolüne ek olarak magic-byte kontrolü çalıştır.
- [x] `.jpg` uzantılı ama geçersiz binary payload için backend test ekle.
- [x] Geçerli image upload akışının regresyonsuz olduğunu test et.
- [x] `frontend/next.config.mjs` için güvenlik header tasarımını yap.
- [x] CSP eklenirse inline theme bootstrap script için nonce/hash stratejisini belirle.
- [x] Security headers için build ve smoke doğrulaması yap.

Kabul kriteri:

- Sahte image upload 400/uygun hata ile reddediliyor.
- Geçerli image upload çalışmaya devam ediyor.
- Security header eklemeleri mevcut Next.js runtime ve theme script ile çakışmıyor.

Önerilen PR bölümü:

- PR 1: `fix(storage): validate uploaded file content type`
- PR 2: `feat(frontend): add baseline security headers`

Notlar:

- Faz 1, 2 ve 3 değişiklikleri `main` içindedir: PR #23 `f749f9e`, PR #24 `b035674` ve PR #25 `8bc098b` squash merge commit'leri `origin/main` üzerinde bulunuyor.
- `filetype>=1.2.0,<2.0.0` Pillow ile aynı bölümde `requirements.txt` içine eklendi; sistem bağımlılığı yok (python-magic alternatifinin libmagic gereksinimini import zorunluluğu olmadığı için tercih edildi).
- `StorageService.validate_file_content(file_data, allowed_mimes=None)` magic-byte tabanlı kontrol uyguluyor; varsayılan allow-list `image/jpeg`, `image/png`, `image/gif`, `image/webp`. Boş payload ve allow-list dışındaki tüm tipler `(False, açıklayıcı mesaj)` ile reddediliyor.
- `api/v1/projects.py` upload akışı `validate_file()` (uzantı + boyut) sonrasında `validate_file_content()` (magic-byte) çağırıyor; redirect/path güvenlik bütünlüğü için `validate_file_content` `validate_file` ile aynı 400 hata yüzeyine bağlanıyor.
- `tests/test_storage_validation.py` (yeni) gerçek StorageService üstünde 5 birim test çalıştırıyor: gerçek PNG/JPEG kabul, text payload ret, boş payload ret, custom allow-list davranışı.
- `tests/test_projects_admin.py::test_upload_project_image_rejects_disguised_payload` (yeni) `.jpg` uzantılı arbitrary HTML payload'unu API üzerinden 400 ile reddediyor; mevcut upload regresyon testi gerçek 1x1 PNG bytes'ı (Pillow ile üretilen) kullanıyor.
- DummyStorage mock'larına `validate_file_content` metodu eklendi (regresyon testleri için her zaman `(True, "")` döndürüyor).
- `frontend/next.config.mjs` `headers()` async fonksiyonu üzerinden tüm path'lere baseline güvenlik header'ları uyguluyor: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/microphone/geolocation/interest-cohort kapalı), `X-DNS-Prefetch-Control: on`, `Strict-Transport-Security` 2-yıl preload.
- CSP bilinçli olarak ertelendi: inline theme bootstrap script (`app/layout.tsx:42-53`) ve Next.js'in kendi runtime inline injectionları nonce/hash stratejisi gerektiriyor; bu iş Faz 7 observability/security follow-up'ında ele alınacak. Karar config dosyasında inline yorum olarak dokümante edildi.
- Doğrulama: `python -m pytest -q` başarılı (`92 passed`, coverage `%86.25`); frontend `npm run lint`, `npm run type-check`, `npm run test` (4 dosya / 13 test), `npm run build` başarılı.

## Faz 5 - Dokümantasyon ve DX Temizliği

Faz Durumu: `todo`

Amaç: Yeni katkıcıların doğru dokümandan başlamasını sağlamak ve tarihsel doküman karmaşasını azaltmak.

TODO:

- [ ] Root `README.md` dosyasını gerçek proje giriş sayfası haline getir.
- [ ] `portfolio-project/README.md` içindeki eski React 18/Vite bilgilerini Next 16 + React 19 stack'iyle güncelle.
- [ ] `portfolio-project/` kökündeki tarihsel MD dosyalarını sınıflandır.
- [ ] Güncel olmayan tarihsel dosyaları `portfolio-project/docs/_archive/` altına taşı.
- [ ] Canonical doküman listesini belirt: root README, AGENTS, GIT_WORKFLOW, QUICKSTART, docs.
- [ ] Backend/frontend çalışma komutlarını tek yerde doğrula.
- [ ] PowerShell-only akışlara alternatif cross-platform notu ekle veya bilinçli kısıt olarak dokümante et.

Kabul kriteri:

- Yeni geliştirici hangi dosyadan başlayacağını biliyor.
- Stack dokümantasyonu mevcut package/script gerçekliğiyle uyumlu.
- Tarihsel raporlar kaybolmadan arşivlenmiş durumda.

Önerilen PR bölümü:

- PR 1: `docs(repo): refresh project onboarding guide`
- PR 2: `docs(repo): archive historical status documents`

## Faz 6 - Frontend Kalite ve Performans Temeli

Faz Durumu: `todo`

Amaç: Frontend regresyonlarını görünür kılmak, LCP riskini azaltmak ve büyük bileşenleri güvenli şekilde parçalamaya başlamak.

TODO:

- [ ] `vite.config.ts` coverage threshold değerlerini düşük ama gerçekçi başlangıç seviyesinde ekle.
- [ ] `npm run test:coverage` çıktısına göre kırılmaları triage et.
- [ ] `.eslintrc.cjs` içinde `react-hooks/exhaustive-deps` kuralını önce `warn`, sonra mümkünse `error` yap.
- [ ] `@typescript-eslint/no-explicit-any` kuralını önce `warn`, sonra mümkünse `error` yap.
- [ ] `jsx-a11y` plugin ihtiyacını doğrula ve kademeli olarak ekle.
- [ ] Tüm raw `<img>` kullanımlarını envanterle.
- [ ] `next.config.mjs` image `remotePatterns` ihtiyacını belirle.
- [ ] LCP etkisi yüksek görsellerden başlayarak `next/image` dönüşümünü yap.
- [ ] `Admin.tsx` için mevcut state, form ve CRUD akışlarını haritala.
- [ ] `Admin.tsx` içinden bağımsız tab bileşenlerini çıkar: Projects, Skills, Experiences, Messages.
- [ ] Focus trap/helper gibi tekrar eden davranışları `src/lib/admin/` altına taşı.
- [ ] `site.ts` monolitini domain bazlı parçalara ayırma tasarımını yap.
- [ ] Basit `*Client.tsx` wrapper indirection'larını azaltma stratejisini belirle.

Kabul kriteri:

- Coverage ve lint regresyonları CI'da görünür hale geliyor.
- Kritik görseller `next/image` kullanıyor.
- `Admin.tsx` tek dosya riskinden çıkmaya başlıyor.
- Refactorlar public/admin davranışını değiştirmeden geçiyor.

Önerilen PR bölümü:

- PR 1: `test(frontend): add coverage thresholds`
- PR 2: `chore(frontend): tighten lint rules incrementally`
- PR 3: `refactor(frontend): render key images with next image`
- PR 4: `refactor(frontend): split admin route tabs`
- PR 5: `refactor(frontend): split site content modules`

## Faz 7 - Observability, API Contract ve Data Fetching

Faz Durumu: `todo`

Amaç: Prod hatalarını izlenebilir hale getirmek ve frontend/backend contract drift riskini azaltmak.

TODO:

- [ ] Backend Sentry entegrasyonunu tasarla ve env gereksinimlerini dokümante et.
- [ ] Frontend Sentry entegrasyonunu tasarla.
- [ ] Release tag stratejisini belirle: git SHA veya deploy-provided release id.
- [ ] Backend error response contract'ını standartlaştır.
- [ ] Frontend merkezi `parseApiError` helper'ı ekle.
- [ ] OpenAPI schema üretim akışını doğrula.
- [ ] `openapi-typescript` ile generated API types dosyası üret.
- [ ] CI'da generated type drift kontrolünü ekle.
- [ ] TanStack Query kullanımını değerlendir.
- [ ] Query key factory ve ilk public list endpoint hooklarını ekle.

Kabul kriteri:

- Prod hataları release bilgisiyle izlenebiliyor.
- API response/error contract'ı tek yerde tanımlı.
- Frontend servis tipleri backend schema değişimlerine karşı drift sinyali veriyor.

Önerilen PR bölümü:

- PR 1: `feat(observability): add backend error reporting`
- PR 2: `feat(observability): add frontend error reporting`
- PR 3: `feat(api): standardize error responses`
- PR 4: `build(frontend): generate api contract types`
- PR 5: `refactor(frontend): introduce query hooks for public data`

## Faz 8 - Test Kapsamı ve E2E Güvence

Faz Durumu: `todo`

Amaç: Kritik kullanıcı akışlarını uçtan uca güvenceye almak ve coverage hedeflerini kademeli yükseltmek.

TODO:

- [ ] Backend coverage scope'unu genişletme planı yap.
- [ ] Auth refresh rotation ve blacklist testlerini genişlet.
- [ ] Admin authorization testlerini DB tabanlı admin modeline göre güncelle.
- [ ] Upload validation testlerini kalıcı hale getir.
- [ ] Contact captcha testlerini provider mock ile güçlendir.
- [ ] Frontend `AuthContext` testlerini token lifecycle için genişlet.
- [ ] Frontend `LanguageContext` testlerini cookie/localStorage senaryolarıyla genişlet.
- [ ] `services/api.test.ts` içine 401/403/language param davranışlarını ekle.
- [ ] Playwright kurulumunu ekle.
- [ ] Public smoke E2E yaz: Home, About, Projects, Contact.
- [ ] Admin smoke E2E yaz: Login, create/edit/delete, logout.
- [ ] Blog E2E yaz: list, detail, markdown render.
- [ ] i18n E2E yaz: TR/EN toggle, persistence.
- [ ] CI'da E2E için PR veya nightly stratejisini belirle.

Kabul kriteri:

- Kritik auth/admin/contact/blog/project akışları otomatik testle korunuyor.
- Coverage threshold değerleri gerçekçi şekilde yükseltilebiliyor.
- E2E testler stabil ve CI stratejisi net.

Önerilen PR bölümü:

- PR 1: `test(backend): expand auth and upload coverage`
- PR 2: `test(frontend): cover auth and api service behavior`
- PR 3: `test(e2e): add public route smoke tests`
- PR 4: `test(e2e): add admin workflow smoke tests`

## İlk Başlanacak Sıra

Bu planı adım adım uygularken önerilen ilk sıra:

1. Faz 0 baseline doğrulama.
2. `api.ts` 401/403 regresyon düzeltmesi.
3. Frontend audit dependency upgrade.
4. `npm audit` CI gate aktivasyonu.
5. Deploy workflow stale branch referansları.
6. Backend PII log ve seed password düzeltmeleri.
7. Alembic baseline.

Bu sıra hızlı geri dönüş sağlar ve sonraki büyük işleri daha az riskli hale getirir.

## Fazlar Arası Bağımlılıklar

- `User.is_admin`, audit log ve login lockout işleri Alembic baseline'dan sonra yapılmalıdır.
- `npm audit` gate, high severity açıkları kapatılmadan zorunlu hale getirilirse CI kırmızı kalır.
- CSP eklenmeden önce inline theme bootstrap script davranışı netleştirilmelidir.
- `Admin.tsx` parçalama başlamadan önce mevcut admin CRUD akışları test veya smoke senaryolarıyla korunmalıdır.
- `next/image` dönüşümü remote image domainleri netleşmeden tamamlanmamalıdır.

## Genel Definition of Done

Bir iş tamamlanmış sayılmadan önce:

- [ ] İlgili kod/doküman değişiklikleri sınırlı ve reviewable olmalı.
- [ ] Hedefli testler çalıştırılmış olmalı.
- [ ] Riskli frontend işlerinde `npm run lint`, `npm run type-check`, `npm run test` ve `npm run build` çalıştırılmalı.
- [ ] Riskli backend işlerinde `python -m pytest -q` çalıştırılmalı.
- [ ] CI veya deploy davranışı değişiyorsa workflow etkisi PR açıklamasında yazılmalı.
- [ ] Bu dosyadaki ilgili TODO checkbox güncellenmeli.
