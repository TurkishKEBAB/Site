# Project Dossier Authoring Guide

## Amaç

Bu belge, portfolyodaki beş projenin dossier içeriklerini seed verisinden
kanıta dayalı, görselleri mevcut ve mimarisi gerçekten projeyi anlatan hale
getirmek için kullanılacak çalışma sözleşmesidir.

Dossier yalnızca güzel görünen bir metin veya diagram değildir. Her iddianın
hangi repo, commit, doküman, ekran görüntüsü, test raporu ya da kullanıcı
onayıyla doğrulandığı izlenebilir olmalıdır.

## Mevcut durum ve kapsam

Projeler:

1. `isikschedule-platform` — IsikSchedule Platform
2. `agentic-ide-thesis-project` — Agentic IDE (Thesis Project)
3. `teknofest-sarkan-uav-defense-platform` — Teknofest Sarkan UAV Defense Platform
4. `automated-web-crawler` — Automated Web Crawler
5. `portfolio-platform-web-desktop` — Portfolio Platform (Web + Desktop)

Mevcut seed dosyası `portfolio-project/backend/seed_dossiers.py` her proje
için impact, metrik, C4 seviyeleri, ADR, engineering log, diagram ve galeri
kayıtları içeriyor. Bunlar doğru kabul edilmeyecek; yalnızca araştırmaya
başlamak için ipucu olarak kullanılacak.

Seed toplamda 11 galeri yolu tanımlıyor, fakat mevcut çalışma ağacında
`portfolio-project/frontend/public/projects/` klasörü bulunmuyor. Bu nedenle
galeri kaynakları eklenmeden dossier tamamlanmış sayılmayacak.

Authoritative uygulama sözleşmesi:

- Request/response modeli: `portfolio-project/backend/app/schemas/dossier.py`
- Database modeli: `portfolio-project/backend/app/models/dossier.py`
- Admin dossier API: `PUT /api/v1/dossiers/projects/{project_id}`
- Public dossier API: `GET /api/v1/dossiers/{project_slug}`
- Dossier diagram türleri: `c4`, `sequence`, `schema`, `tiers`, `matrix`
- Gallery `src`: site-relative `/...` veya doğrulanabilir `http(s)` URL olmalı
- Gallery caption, modal içinde görselin `alt` metni olarak da kullanılıyor

## Kanıt politikası

Her içerik aşağıdaki sınıflardan biriyle etiketlenecek:

- `verified`: kaynakta doğrudan görüldü; kaynak yolu/URL ve commit veya tarih yazılır.
- `provided`: proje sahibi tarafından sağlandı; sağlayan kişi ve tarih yazılır.
- `inferred`: birden fazla kanıttan çıkarıldı; çıkarım olduğu açıkça belirtilir.
- `unknown`: doğrulanamadı; dossier’a kesin bilgi olarak yazılmaz.
- `proposed`: mevcut sistem için önerilen gelecek tasarımıdır; gerçek mimari gibi sunulmaz.

Şu kurallar zorunludur:

1. Seed’de bulunan sayı, commit hash, ödül, kullanıcı sayısı, uptime, coverage,
   servis sayısı veya tarih kanıtlanmadan korunamaz.
2. Repo bulunamıyorsa model repo varmış gibi davranamaz. Kullanıcıdan repo,
   teknik rapor, ekran görüntüsü veya toplantı notu istemelidir.
3. Diagram yalnızca doğrulanmış bileşenleri ve ilişkileri göstermelidir.
   `proposed` bileşenler farklı renkte veya açıkça ayrı bir bölümde tutulur.
4. Gerçek olmayan ekran görüntüsü üretilemez. AI ile oluşturulmuş konsept görsel
   kullanılacaksa caption içinde `conceptual / not a production screenshot`
   ifadesi bulunur.
5. Gerçek commit hash’i bilinmiyorsa sahte hash yazılmaz. Log girdisi `source`
   alanında belge, release veya milestone olarak tutulur; mevcut şemaya
   aktarılırken uydurma hash kullanılmaz.
6. Savunma/UAV projesinde hassas frekans, anahtar, zafiyet, operasyonel taktik
   veya kötüye kullanılabilir teknik ayrıntı yayınlanmaz. Dossier yüksek
   seviyeli sistem mimarisi ve doğrulanabilir performans kanıtıyla sınırlıdır.
7. Crawler projesinde hedef domain, credential, gizli header ve kişisel veri
   galeriye veya diagram’a eklenmez; robots ve etik kullanım korunur.

## Her dossier için zorunlu çıktı

### 1. Impact

`impact_en` ve `impact_tr` içinde şu dört soruya kısa ve kanıtlı cevap verilir:

- Problem neydi?
- Kullanıcı veya sistem için etkisi ne oldu?
- Teknik olarak hangi yaklaşım seçildi?
- Sonuç hangi ölçülebilir kanıtla destekleniyor?

### 2. Metrikler

Tercihen 4–6 metrik. Her metrik için değer, label, note, kaynak, ölçüm tarihi
ve ölçüm yöntemi tutulur. API payload’ında kaynak alanı olmadığı için kaynak
ledger’ı ayrı dosyada tutulur.

Metrik örnekleri: coverage, latency, throughput, uptime, başarı oranı,
kullanıcı sayısı, algoritma sayısı, endpoint sayısı, build süresi, boyut veya
ödül sıralaması. Kaynaksız pazarlama sayıları kullanılmaz.

### 3. C4 mimarisi

En az:

- Context: kullanıcılar, sistem ve dış sistemler
- Containers: deploy edilebilir uygulama/servis sınırları

Gerçek kaynak izin veriyorsa:

- Components: yalnızca dossier’ın en önemli teknik alt sistemi için
- Her node için doğru `kind`, kısa `title`, açıklayıcı `sub`
- Dış sistemlerde `leaf: true`

### 4. ADR’ler

Her proje için 2–4 gerçek karar:

- Context: hangi problem veya kısıt vardı?
- Decision: ne seçildi?
- Trade-off: hangi bedel kabul edildi?
- Status ve tarih: kaynakla doğrulanmış olmalı

`Accepted`, `Proposed`, `Superseded` gibi durumlar gerçek karar durumunu
yansıtmalı; seed’deki bütün kararlar otomatik olarak kabul edilmiş sayılmaz.

### 5. Engineering log

3–6 gerçek milestone. Her kayıtta commit hash veya doğrulanabilir release/
milestone kimliği, tarih, başlık ve gerekirse sonuç bulunur. Tarih sırası
yeniden eskiye olacak şekilde gösterilir.

### 6. Teknik diagramlar

Her proje için en az üç, tercihen dört–altı diagram. Diagram türü gerçekten
anlattığı ilişkiye göre seçilir:

- `schema`: UML sınıf görünümü veya veri modeli
- `sequence`: bir uçtan uca isteğin zaman akışı
- `tiers`: activity, state, pipeline veya deployment akışı
- `matrix`: rol/yetki veya uyumluluk karşılaştırması
- `c4`: sistemin context/container/component seviyeleri

### 7. Galeri

Her proje için mümkünse 3–5 gerçek görsel:

- Uygulama ekranı veya fiziksel prototip
- Teknik akış/diagram render’ı
- Test, benchmark, CI veya deployment kanıtı
- Kullanıcıya değer sağlayan sonuç ekranı

Önerilen isimlendirme:

```text
/projects/<project-slug>-<short-id>.webp
```

Her görsel için `caption` erişilebilir ve açıklayıcı olmalı; `hint` mevcut
modalın “public path” bilgisini göstermesi için kullanılabilir. Görsel yoksa
placeholder seed path’i yazmak yerine `pending asset` olarak raporlanır.

## Claude/Codex ana promptu

Aşağıdaki prompt, her proje için ilgili brief ile birlikte kullanılacak.

```text
Sen evidence-first çalışan kıdemli bir software architect, technical writer
ve UX documentation reviewer'sın. Görevin, aşağıdaki proje için portfolyo
dossier'ı hazırlamak veya mevcut dossier'ı düzeltmek.

PROJE ADI: {{project_name}}
PROJECT SLUG: {{project_slug}}
ÇALIŞMA DİZİNİ: {{workspace}}
SAĞLANAN KAYNAKLAR: {{repositories_and_documents}}

ÖNEMLİ: seed dossier güvenilir kaynak değildir. Seed içeriğini yalnızca
araştırma ipucu olarak kullan. Repo, commit, test raporu, teknik doküman,
ekran görüntüsü veya proje sahibinin açık onayıyla doğrulanmayan hiçbir
metrik, tarih, ilişki, servis, ödül veya commit hash'ini gerçekmiş gibi yazma.
Kanıt yoksa UNKNOWN olarak raporla ve hangi kaynağın gerektiğini belirt.

Çalışma sırası:
1. Sağlanan repo ve dokümanları oku. Önce README, package/requirements,
   compose/deploy dosyaları, entrypoint'ler, route'lar, domain modelleri,
   testler, CI ve asset klasörlerini incele.
2. Aşağıdaki evidence ledger'ı üret:
   - claim
   - status: verified / provided / inferred / unknown / proposed
   - source path veya URL
   - commit/tag/tarih
   - confidence
   - dossier'da kullanılabilir mi?
3. Gerçek mimariyi seed mimarisiyle karşılaştır. Çelişki varsa gerçek kaynağı
   tercih et, değişikliği ve nedenini açıkla.
4. Context ve container C4 modelini çıkar. Sadece gerçek sınırları göster;
   önerilen bileşenleri `proposed` diye ayır.
5. En önemli kullanıcı akışı için sequence veya activity/state diagram seç.
   Akış; aktör, çağrı, hata/geri dönüş ve kalıcılaştırmayı göstermeli.
6. En önemli veri veya domain ilişkileri için schema diagram oluştur.
7. 2–4 gerçek ADR, 3–6 gerçek engineering log girdisi ve 4–6 ölçülebilir
   metrik seç. Her birinin evidence ledger kaynağını koru.
8. Galeri için gerçek asset listesi hazırla. Her asset için source, dosya adı,
   caption, alt açıklama, hassasiyet kontrolü ve önerilen crop belirt.
9. Dossier API şemasına uyan JSON payload üret. Evidence ledger'ı payload'a
   ait olmayan ayrı bir bölümde tut.
10. Uygulama moduna geçmeden önce eksikleri ve riskleri listele. Kullanıcı
    onayı olmadan mevcut dossier'ı overwrite etme.

ÇIKTI FORMATI:
A. Executive summary
B. Evidence ledger
C. Doğrulanmış mevcut mimari
D. Seed'den kaldırılacak veya düzeltilmesi gereken iddialar
E. Diagram planı: tür, amaç, node/actor listesi, ilişki listesi
F. Görsel planı: gerçek kaynak, dosya adı, caption, alt açıklama
G. ADR listesi
H. Engineering log listesi
I. Metrik listesi ve ölçüm kanıtı
J. ProjectDossierUpsert uyumlu JSON
K. Validation report

JSON üretirken şu kurallara uy:
- diagram.kind ile diagram.data.kind aynı olmalı;
- sequence mesajlarında from/to/label olmalı;
- schema ilişkilerinde from/label/to olmalı;
- tiers içinde boş tier olmamalı;
- gallery src site-relative /path veya doğrulanabilir http(s) URL olmalı;
- duplicate id/hash üretme;
- API limitlerini aşma;
- doğrulanmamış veriyi JSON'a koyma.

Validation report şunları söylemeli:
- hangi kaynaklar okundu;
- hangi iddialar kesin doğrulandı;
- hangi alanlar pending kaldı;
- hangi görseller gerçekten mevcut;
- JSON schema validation sonucu;
- insan incelemesi gereken maddeler.
```

## Proje brief’leri ve ayrıntılı checklist’ler

### 1. IsikSchedule Platform

**Seed’deki başlangıç iddiaları — doğrulanacak:**

- PyQt6 masaüstü ve Next.js web istemcisi olan ortak scheduling platformu
- FastAPI gateway, PostgreSQL, Redis, Celery ve Docker servisleri
- 13 scheduling/optimization algoritması
- yaklaşık 1.000 masaüstü kullanıcısı
- seed metrikleri: `%86.97 coverage`, `13 algorithms`, `~1,000 users`, `6 services`
- seed galeri yolları: `isik-desktop.png`, `isik-web.png`, `isik-gate.png`

Seed’deki mevcut mimari ipuçları: Student ve Department Coordinator aktörleri;
University SIS ve SMTP dış sistemleri; shared solver core; Algorithm Registry,
Constraint Solver, Conflict Validator, Timetable Builder ve Persistence Adapter;
Celery + Redis üzerinden asenkron solve job’ları.

**Önce istenecek kaynaklar:**

- `https://github.com/TurkishKEBAB/isikschedule-core`
- `https://github.com/TurkishKEBAB/isikschedule-web`
- gerçek Docker Compose/deployment dosyaları
- solver algoritmalarının listesi ve ortak interface’i
- gerçek coverage/Sonar raporu
- masaüstü ve web ekran görüntüleri
- kullanıcı sayısı ve performans ölçümünün kaynağı

**Claude/Codex’in cevaplaması gereken sorular:**

- Desktop ve web gerçekten aynı domain/solver paketini mi tüketiyor?
- API solve isteğini nasıl kabul ediyor; job state ve polling endpoint’i nedir?
- Celery broker/result backend ayrımı nasıl yapılmış?
- Redis cache mi, broker mı, yoksa ikisi birden mi?
- Hard/soft constraint modeli ve conflict validation hangi modüllerde?
- 13 algoritmanın gerçek isimleri, ortak interface’i ve seçim mekanizması nedir?
- PostgreSQL tabloları course, section, room, time slot, schedule ve item
  ilişkilerini gerçekten nasıl kuruyor?
- JWT/RBAC rolleri ve yetki sınırları nelerdir?
- CI’da hangi testler ve kalite eşikleri çalışıyor?

**İstenen diagram paketi:**

1. C4 Context: öğrenci, bölüm koordinatörü, IsikSchedule, SIS, SMTP.
2. C4 Containers: Desktop, Web, API Gateway, Scheduling Engine, Worker,
   PostgreSQL, Redis; her bağlantı gerçek protokolle etiketlenmeli.
3. UML/schema: SolverBase, Algorithm Registry, gerçek solver sınıfları,
   Constraint, Timetable ve Conflict ilişkileri.
4. ERD: gerçek tablo/alan isimleri ve foreign key ilişkileri.
5. Sequence: `POST solve → enqueue → job id → worker → engine → persist → poll`.
6. State/flow: queued, running, validating, done, failed, retry/cancel.
7. Auth flow: login, JWT/refresh, role check, 401/403; yalnızca gerçekten varsa.
8. CI/CD: test, quality gate, image build ve deploy; gerçek pipeline adımlarıyla.

**İstenen görseller:**

- gerçek masaüstü timetable görünümü;
- gerçek web istemcisi ve solver başlatma ekranı;
- gerçek sonuç/conflict görünümü;
- gerçek algorithm/constraint debug veya test raporu;
- gerçek Docker/CI/Sonar kalite çıktısı.

Her görsel kaynak repo veya raporla eşleştirilmeli. Seed’deki üç görsel
dosyası mevcut değilse önce üretim/ekleme işi açılmalı; path’i boş placeholder
olarak bırakılmamalı.

**ADR adayları:** shared core, Celery/Redis ile uzun işlerin ayrılması,
JWT/RBAC, solver algorithm registry, PostgreSQL domain modeli. Sadece gerçek
karar belgelenmişse Accepted yapılmalı.

**Kabul kriterleri:** en az iki repo taranmış, solver ve API akışı kodla
doğrulanmış, metriklerin kaynağı eklenmiş, en az üç gerçek görsel eklenmiş,
ERD ve solve sequence gerçek route/model isimleriyle eşleşmiş olmalı.

### 2. Agentic IDE (Thesis Project)

**Seed’deki başlangıç iddiaları — çoğu kaynak bekliyor:**

- TypeScript + Electron + Monaco tabanlı, VS Code fork’u olmayan AI-native IDE
- Observe → Plan → Approve → Apply döngüsü
- prohibited-command policy engine
- local ve cloud LLM backend’leri
- RAG index ile code context
- seed metrikleri: `4 loop stages`, `0 VS Code forks`, `2 LLM backends`,
  `37 requirements`
- seed görselleri: `aide-shell.png`, `aide-diff.png`

Bu proje için mevcut dossier’da public repo URL’si yok. Bu nedenle aşağıdaki
kaynak paketi sağlanmadan kesin mimari veya metrik yazılmayacak:

- thesis proposal/specification PDF veya Markdown;
- repo/archive veya en azından Electron/Monaco prototype source;
- 37 requirement listesinin gerçek dosyası;
- policy engine kuralları ve test çıktısı;
- local/cloud model adapter dokümanı;
- RAG/index yaklaşımı;
- shell, plan, diff approval ve blocked command ekran görüntüleri.

**İstenen diagram paketi:**

1. C4 Context: developer, IDE, local model, cloud model ve dosya sistemi.
2. C4 Containers: Monaco/Electron shell, orchestrator, policy engine,
   approval gate, model adapters, RAG/index, workspace.
3. Activity: observe → plan → policy check → human approval → apply → verify;
   reject ve test failure döngüleri açıkça gösterilmeli.
4. Sequence: Developer → UI → orchestrator → LLM → policy → diff → approval.
5. State: proposed, policy-blocked, awaiting-approval, approved, applied,
   verification-failed, discarded.
6. Security boundary: model output, command execution, workspace ve approval
   sınırları; gerçek implementasyon yoksa `proposed` olarak işaretlenmeli.
7. Context/schema: prompt context, file references, change-set, approval
   record ve verification result; gerçek persistence varsa.

**İstenen görseller:**

- gerçek Monaco/Electron shell;
- gerçek plan/change-set ekranı;
- gerçek diff approval ekranı;
- policy engine’in gerçek block/allow test çıktısı;
- local/cloud model seçimi veya RAG context görünümü.

Konsept ekranı kullanılırsa gerçek ürün ekranı gibi sunulmayacak. Thesis
gereksinimleri ve “37” sayısı kaynaklanamıyorsa metrik kaldırılacak veya
`provided/unknown` olarak kalacak.

**ADR adayları:** Monaco’yu genişletme vs VS Code fork’u, apply öncesi insan
onayı, local/cloud routing, RAG context stratejisi, policy enforcement noktası.

**Kabul kriterleri:** kaynak paketi olmadan yalnızca pending checklist
üretilmiş olacak; kaynak sağlandığında en az bir gerçek prototype ekranı,
policy/approval akışı ve security boundary kanıtlanacak.

### 3. Teknofest Sarkan UAV Defense Platform

**Seed’deki başlangıç iddiaları — özellikle sayılar doğrulanacak:**

- 700+ proje arasında üçüncülük
- anti-jam telemetry ve frequency-hopping link
- saha testinde `%99.2 telemetry uptime`
- 200K TL bütçe, 165K TL TÜBİTAK hibesi
- mekanik, elektronik ve yazılımın birlikte teslimi
- seed görselleri: `sarkan-gs.png`, `sarkan-field.png`

Bu proje için public repo URL’si yok. İstenen kaynaklar: yarışma başvuru/
sonuç dokümanı, teknik rapor, takım sunumu, test log’ları, fotoğraflar,
bütçe/hibe kanıtı ve kullanıcının yayınlanmasına izin verdiği teknik ayrıntı
seviyesi.

**İstenen diagram paketi:**

1. High-level C4/context: ground operator, ground station, UAV, RF environment.
2. Container view: ground UI, telemetry link, anti-jam decision module, flight
   controller bridge; gerçekse sensor/embedded boundary.
3. Sequence: heartbeat/telemetry, quality scoring, degradation, channel hop,
   synchronization, recovery. Frekans veya anahtar gibi hassas değerler yok.
4. State: locked, degraded, hopping, re-locked, fallback; threshold değerleri
   yalnızca yayınlanmasına izin varsa.
5. Data/control-flow: telemetry ve command uplink yönlerini birbirinden ayır.
6. Test evidence flow: test koşulu → ölçüm → uptime/latency sonucu → rapor.

**İstenen görseller:**

- izinli ground-station telemetry ekranı;
- izinli UAV/airframe veya elektronik prototip fotoğrafı;
- saha testinden izinli fotoğraf veya ölçüm ekranı;
- anti-jam state/telemetry grafik çıktısı;
- yarışma derecesi veya hibe kanıtı (kişisel/gizli bilgiler redakte edilmiş).

**Güvenlik ve yayın filtresi:** teknik dossier; operasyonel saldırı talimatı,
frekans planı, kriptografik anahtar, gerçek zafiyet, hedefleme veya askeri
uygulama ayrıntısı içermeyecek. Bilgi doğrulanamıyor ya da yayın izni yoksa
çıkarılacak.

**ADR adayları:** frequency-hopping/fallback seçimi, Python ground station ve
hot-path ayrımı, telemetry reliability stratejisi, test metodolojisi. “Accepted”
yalnızca teknik rapor veya proje sahibinin onayıyla kullanılacak.

**Kabul kriterleri:** yarışma/performans sayıları kaynaklı, hassas detaylar
redakte edilmiş, en az iki gerçek görsel ve telemetry recovery sequence’i
mevcut olmalı.

### 4. Automated Web Crawler

**Seed’deki başlangıç iddiaları — doğrulanacak:**

- Scrapy scheduler/middleware, BeautifulSoup parser ve FastAPI + PostgreSQL
- robots.txt hard enforcement
- domain başına rate budget
- sekiz concurrent worker, üç retry tier
- `%89.9 success rate`
- seed görselleri: `crawler-dash.png`, `crawler-logs.png`

**İstenen kaynaklar:** crawler repo veya archive, Scrapy settings/middleware,
item/pipeline kodu, FastAPI route’ları, PostgreSQL schema/migration, benchmark
raporu, retry/dead-letter log’ları ve robots testleri.

**İstenen diagram paketi:**

1. C4/container: scheduler/frontier, worker pool, fetch middleware, parser,
   pipeline, PostgreSQL ve monitoring/API.
2. Fetch decision flow: frontier pop → robots check → rate budget → fetch →
   2xx check → parse/store veya retry/dead-letter.
3. ERD: domain, page, fetch_log, link ve gerçek ek tablolar.
4. Sequence: scheduler → worker → target → parser → dedupe → store.
5. Retry/state: pending, fetching, parsed, retry tier 1/2/3, dead-letter.
6. Observability: hangi metric/log/alert gerçekten üretiliyor?

**İstenen görseller:**

- gerçek crawl dashboard/run summary;
- gerçek worker logları ve retry cascade;
- gerçek parser/data preview;
- robots/rate-limit test kanıtı;
- benchmark veya başarı oranı grafiği.

Hedef domainler, kişisel veriler, credential’lar ve gizli request ayrıntıları
redakte edilecek. `%89.9`, `8 workers` ve `3 retry tiers` kod/raporla
doğrulanamıyorsa kesin metrik olarak kullanılmayacak.

**ADR adayları:** Scrapy vs hand-rolled asyncio, domain politeness budget,
retry/backoff ve deduplication modeli, PostgreSQL ingestion modeli.

**Kabul kriterleri:** robots gate ve retry davranışı kodla doğrulanmış, ERD
gerçek modelle eşleşmiş, en az iki gerçek operasyon görseli ve benchmark
kaynağı eklenmiş olmalı.

### 5. Portfolio Platform (Web + Desktop)

Bu proje için kaynak kodu mevcut olduğundan dossier’ın ana doğrulama kaynağı
mevcut repository’dir; seed yalnızca başlangıç karşılaştırmasıdır.

**Mevcut seed iddiaları — güncel kodla tekrar ölçülecek:**

- Next.js frontend, FastAPI backend, PostgreSQL, Redis
- JWT/RBAC admin erişimi
- GitHub API cache, Supabase asset storage, SMTP notifications
- Vercel frontend ve Railway backend deployment’ı
- seed metrikleri: `60+ API endpoints`, `24h GitHub cache`, `2 deploy targets`,
  `SonarQube quality gate passed`
- seed görselleri: `pf-home.png`, `pf-admin.png`

**İncelenecek kaynaklar:**

- `portfolio-project/frontend/app` ve `src/routes`
- `portfolio-project/frontend/src/components/nexus`
- `portfolio-project/backend/app/api/v1`
- `portfolio-project/backend/app/models`, `schemas`, `services`
- `.github/workflows`
- `portfolio-project/backend/alembic`
- `portfolio-project/frontend/next.config.mjs`, package manifest ve tests
- gerçek Vercel/Railway/Sonar sonuçları; secret değerleri değil

**İstenen diagram paketi:**

1. C4 Context: visitor, admin, portfolio platform, GitHub, Supabase, SMTP.
2. C4 Containers: Next.js public/admin surfaces, FastAPI API, PostgreSQL,
   Redis, external providers, CI/CD; gerçek deploy boundary’leriyle.
3. Sequence: public home/projects request path ve cache/ISR davranışı.
4. Sequence: GitHub stats → Redis hit/miss → GitHub API fallback.
5. Authorization matrix: visitor/admin için gerçek route scope’ları.
6. CI/CD: push/PR → lint/tests/security/schema checks → preview/prod deploy.
7. Dossier flow: project selection → dossier API → diagram renderer → gallery;
   mevcut frontend davranışıyla eşleşmeli.
8. Schema: Project, ProjectDossier ve dossier child collections; migration’a
   göre hazırlanmalı.

**İstenen görseller:**

- gerçek homepage desktop ve mobile görünümü;
- gerçek Projects index ve hover/selection state’i;
- gerçek dossier modal: overview, architecture, ADR, log, gallery sekmeleri;
- gerçek admin project/dossier düzenleme ekranı;
- gerçek GitHub cache veya API observability çıktısı;
- gerçek CI/Vercel preview/Sonar kalite kanıtı.

Bu repo için ekran görüntüsü alınırken secret, token, e-mail adresi ve kişisel
mesaj içeriği maskelenmeli. Görseller optimize edilerek WebP/AVIF tercih
edilmeli; HTML/JSON içine base64 gömülmemeli.

**ADR adayları:** Vercel/Railway ayrımı, Redis cache süresi, JWT/RBAC,
Supabase asset storage, Next.js server/ISR ve API payload sınırları, CI kalite
gates. Bunlar kod ve workflow’lardan çıkarılabilir; tarih/status yine git veya
deploy kanıtıyla doğrulanmalı.

**Kabul kriterleri:** diagramlar güncel route/model/workflow ile eşleşiyor,
galeri dosyalarının tamamı gerçek ve repo içinde/izinli URL’de mevcut, admin ve
public dossier akışı test edilmiş, metrikler güncel ölçüm tarihi taşıyor.

## JSON teslim şablonu

Araştırma tamamlandıktan sonra API’ye gönderilecek payload yalnızca aşağıdaki
alanları içerir. Kanıt ledger’ı bu JSON’a eklenmez; ayrı Markdown/JSON olarak
saklanır.

```json
{
  "impact_en": "Evidence-backed English impact statement.",
  "impact_tr": "Kanıta dayalı Türkçe etki özeti.",
  "metrics": [
    {
      "value": "verified value",
      "numeric_value": 0,
      "label": "metric label",
      "note": "measurement context",
      "display_order": 0
    }
  ],
  "c4": [
    {
      "label": "Context",
      "note": "verified boundary",
      "tiers": [
        [
          {
            "kind": "person",
            "title": "Actor",
            "sub": "responsibility",
            "leaf": true,
            "tier_order": 0,
            "display_order": 0
          }
        ]
      ],
      "display_order": 0
    }
  ],
  "adrs": [],
  "log": [],
  "diagrams": [],
  "gallery": []
}
```

`numeric_value` yalnızca gerçekten sayısal olan metriklerde kullanılacak.
Metrik `value` alanı her zaman kullanıcıya gösterilecek biçimde korunacak.

## Son doğrulama checklist’i

- [ ] Her claim’in source ve status bilgisi var.
- [ ] Seed ile gerçek kaynak arasındaki farklar raporlandı.
- [ ] `impact_en` ve `impact_tr` aynı gerçeği anlatıyor.
- [ ] C4 node’ları gerçek sistem sınırlarıyla eşleşiyor.
- [ ] Diagram data kind ile dış kind aynı.
- [ ] Sequence actor/message isimleri gerçek akışa dayanıyor.
- [ ] Schema relation’ları gerçek model veya açıkça `proposed`.
- [ ] Duplicate diagram/gallery id yok.
- [ ] ADR context/decision/tradeoff dolu ve status kaynaklı.
- [ ] Log hash/tarih sahte değil.
- [ ] Galeri src’lerinin tümü gerçekten erişilebilir.
- [ ] Caption’lar alt metni olarak anlamlı.
- [ ] Görsellerde secret, kişisel veri veya yayınlanmaması gereken teknik detay yok.
- [ ] API schema validation geçti.
- [ ] Admin PUT sonrası public GET doğru dossier’ı döndürüyor.
- [ ] Frontend modal tüm sekmelerde gerçek içeriği render ediyor.
- [ ] Son değişiklikten sonra ilgili testler ve build çalıştırıldı.

Bu checklist tamamlanmadan dossier “ready” olarak işaretlenmemeli.
