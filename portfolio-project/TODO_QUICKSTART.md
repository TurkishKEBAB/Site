# 🎯 TODO - Hızlı Başlangıç

**Son Güncelleme**: 2 Kasım 2025  
**Proje Durumu**: Backend %100 ✅ | Frontend %55 ⚙️ | DevOps %40 🔄

---

## ⚡ 15 Dakikalık Kontrol Listesi

### 1️⃣ Ortamı Hazırla (2 dk)
```powershell
# Depoya gir
cd C:\Users\PC\Desktop\site\portfolio-project

# İsteğe bağlı: sanal ortamı temiz başlatmak için önce kapat
# ./backend/venv/Scripts/Deactivate.ps1  # açıksa
```

### 2️⃣ Servisleri Başlat (5 dk)
```powershell
# Docker ile tüm bağımlılıkları ayağa kaldır (PostgreSQL + Redis)
cd backend
docker-compose up -d

# Backend'i başlat (ENV dosyası hazır olmalı)
./start_backend.ps1  # uvicorn ve sanal ortamı otomatik başlatır
```

### 3️⃣ Sağlık Kontrolleri (3 dk)
```powershell
# API ayakta mı?
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"

# Deneme datası kontrolü
echo (Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/experiences/").total
# Beklenen: 11
```

### 4️⃣ Frontend'i Başlat (3 dk)
```powershell
cd ..\frontend
npm install  # paketler kuruluysa atlayabilirsin
npm run dev -- --host
```

### 5️⃣ Hızlı Doğrulama (2 dk)

- Tarayıcıdan `http://127.0.0.1:5173` (veya Vite'in gösterdiği port) → Home ve About sayfaları hatasız açılıyor mu?
- Konsol uyarısı yok mu? (F12 → Console)
- `All / Work / Activity` filtreleri doğru çalışan timeline veriyor mu?
- `http://127.0.0.1:5173/admin` korumalı rota Auth akışıyla açılıyor mu?

---

## 🧪 60 Dakikalık Odak Görevleri

1. **Admin Dashboard Verileri**  
   - ✅ `GET /api/v1/admin/stats` endpoint'i eklendi ve `require_admin` ile korundu.  
   - ✅ Dashboard kartları `Admin.tsx` içinde gerçek API çağrısı ve toast tabanlı hata yakalamayla güncellendi.  
   - ↪️ Mesaj detayları için okunmamış/filtre uç noktası planlanacak.

2. **Projeler Sekmesi CRUD**  
   - ✅ `/admin` → Projects sekmesi canlı veri tablosu, oluşturma/düzenleme modalları ve silme akışıyla tamamlandı.  
   - ✅ Formlar `ProjectCreate/Update` şemalarına göre axios istekleri gönderiyor; başarı/hata durumlarında toast gösteriliyor.  
   - ↪️ Çok dilli çeviri modülü ve teknoloji seçimi sonraki iterasyona bırakıldı.

3. **Kimlik Doğrulama ve UX Sertleştirme**  
   - `AuthContext` içinde token yenileme/expire kontrolü ekle (silinen cookie senaryosu).  
   - `ProtectedRoute` yüklenme durumunu skeleton bileşeniyle zenginleştir; hatada kullanıcıyı login'e yönlendir.  
   - Global `ToastProvider` üzerinden CRUD işlemlerinde başarı/başarısızlık mesajlarını tetikle.

4. **Dokümantasyon ve Test**  
   - `PROGRESS.md` ve `COMPREHENSIVE_PROJECT_ANALYSIS.md` dosyalarına admin yol haritasını ve tamamlanan adımları yaz.  
   - Backend için `tests/test_admin_stats.py` altında endpoint testi, frontend için `npm run lint` ve `npm run type-check` scriptlerini doğrula.

---

## � Eksik İmplementasyonlar & Açık İşler (Güncellendi)

Aşağıdaki maddeler repository içindeki dosyaların incelenmesi sonucunda güncellenmiştir. Tamamlananlar ayrı bir bölümde toplanmıştır — buradaki maddeler hâlâ açık / yapılması önerilen işlerdir.

### ✅ Tamamlanan İşler (2 Kasım 2025)

- [x] **Frontend**: `package.json`'a `type-check` scripti eklendi (`tsc --noEmit`).
- [x] **Frontend Admin**: Skills sekmesi backend `skillService` ile entegre edildi (listeleme + silme).
- [x] **Frontend Admin**: Experiences sekmesi backend `experienceService` ile entegre edildi (listeleme + silme + tarih gösterimi).
- [x] **Frontend Admin**: Messages sekmesi backend `contactService` ile entegre edildi (listeleme + okundu işaretleme + silme + durum gösterimi).
- [x] **Backend**: Proje resim upload endpoint'i eklendi (`POST /projects/{project_id}/upload-image`) - StorageService ile Supabase entegrasyonu.
- [x] **Backend**: GET /projects/ endpoint'i artık `images` ve `translations` alanlarını dolduruyor.
- [x] **Backend Contact**: Email servis çağrıları düzeltildi (arg isimleri), `print` yerine `logger.exception` kullanımı.
- [x] **Frontend Admin Skills**: Create/Edit modalları eklendi - tam CRUD desteği (name, category, proficiency slider, icon_url).
- [x] **Frontend Admin Experiences**: Create/Edit modalları eklendi - tam CRUD desteği (title, organization, location, type, dates, is_current, description).
- [x] **Frontend Admin Projects**: Resim yönetim sistemi eklendi - "Resimleri Yönet" butonu, drag & drop upload, grid preview, caption/sıralama düzenleme, silme.
- [x] **Backend Projects**: Resim CRUD endpoint'leri eklendi (`DELETE /projects/{id}/images/{image_id}`, `PUT /projects/{id}/images/{image_id}`).
- [x] **Backend Projects**: Upload endpoint güncellemesi - ProjectImage kaydı oluşturma, caption ve display_order desteği.

### 🔧 Açık İşler

- [ ] Auth: `AuthContext` içinde refresh token / silent re-login akışı ekle; backend tarafında da refresh token uç noktası veya uzun ömürlü refresh mekanizması oluştur (401 yakalandığında önce refresh denenmeli, başarısızsa logout).  
- [ ] ProtectedRoute: Mevcut spinner/skeleton zaten var; ek iş olarak authentication hatalarında kullanıcıyı bilgilendirmek için `useToast` ile toast gösterimi ekle ve yönlendirme davranışını netleştir.  
- [ ] Admin → Skills (frontend): Create/Edit modal CRUD akışlarını ekle (şu an sadece listeleme ve silme var).  
- [ ] Admin → Experiences (frontend): Create/Edit modal CRUD akışlarını ekle (şu an sadece listeleme ve silme var).  
- [ ] Proje formu: Backend `ProjectTranslation`, `ProjectTechnology` ve frontend `projectService` destekli; frontend `ProjectForm` içinde teknoloji çoklu seçici, proje çeviri modalları ve `technology_ids` gönderimini ekle.  
- [ ] Frontend: Proje görseli upload UI'sı ekle - yeni eklenen `/projects/{project_id}/upload-image` endpoint'ini kullanarak dosya yükleme, önizleme ve sıralama yönetimi.  
- [ ] Backend testleri: Test dosyaları ve pytest fixture'ları eksik; `tests/` altında `test_admin_stats.py`, `test_projects_admin.py`, `test_contact_messages.py` gibi JWT korumalı uçları kapsayan hızlı bir test iskeleti oluştur.  
- [ ] Frontend kalite: ESLint zaten konfigüre; admin bileşenlerinde TypeScript hatalarını yakalayacak `type-check` çalıştırılmalı ve form bileşenleri yeniden kullanılabilir modüllere refactor edilmelidir.  
- [ ] CI/CD: GitHub Actions (veya benzeri) için basit bir workflow oluştur — `npm ci && npm run type-check && npm run lint` ve backend için `pytest` çalıştıran adımlar.  
- [ ] E2E: Admin paneli için Playwright veya Cypress altyapısı taslağı ekle (login, proje CRUD, mesaj okuma/yazma, responsive kontroller).  
- [ ] Logging/observability: Endpoint'lerde `print` kullanımını kaldır, tüm hataları `app.utils.logger` üzerinden kaydet ve kritik hatalar için daha görünür telemetri (sentry/otel) düşün.  

---

## �🛠️ Admin Paneli Geliştirme Yol Haritası

- [x] Dashboard kartları gerçek API verileriyle doluyor (yüklenme & hata durumları ele alındı).
- [x] Projeler sekmesinde listeleme + create/update/delete modalları tamam.
- [ ] Beceriler ve deneyimler sekmeleri projelerle aynı CRUD kalıbını kullanıyor.
- [ ] Mesajlar sekmesi `GET /api/v1/contact/messages` uç noktasına bağlandı, okundu/arsivlendi durumunu yönetiyor.
- [ ] Admin paneli bileşenleri için yeniden kullanılabilir form girişleri (`FormInput`, `FormSelect`, `TagInput`).
- [ ] Yetki hataları (401/403) için otomatik logout + yönlendirme akışı.
- [ ] Dark mode uyumluluğu ve mobil kırılım kontrolleri yapıldı.

---
---

## 🎯 Haftalık Hedefler

- [x] Backend admin yetkilendirmesini e-posta allow list ile güçlendir
- [x] Experience API filtrelerini frontend timeline ile eşleştir
- [x] Seed verisindeki ikon ve karakter problemlerini gider
- [ ] Admin paneli CRUD akışlarını tamamla (projects/skills/experiences/messages)
- [x] Admin dashboard istatistik API'si ve frontend tüketimi hazır
- [ ] Blog detayı + arama sonuçları için frontend route ekle
- [ ] CI/CD pipeline taslağı çıkar (GitHub Actions + Railway/Vercel)
- [ ] UX incelemesi: Contact form, Projects filtreleri

---

## 🔍 Sorun Giderme Notları

### Docker Açılmıyor

```powershell
Get-Service | Where-Object { $_.Name -like '*docker*' }
# Servis yoksa Docker Desktop'ı menüden manuel aç
```

### Backend Ayakta Ama Bağlanamıyor

```powershell
# Konsoldaki hataya bak: start_backend.ps1 penceresi
# Redis ve PostgreSQL container'larının çalıştığını doğrula
cd ..\backend
docker ps
```

### TypeScript veya Lint Hatası

```powershell
cd ..\frontend
npm run type-check
npm run lint
```

- Icon-only linkler için `aria-label` ekle  
- API yanıtlarını map ederken `Array.isArray` kontrolü ile koruma sağla

---

## 📂 Referans Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `README.md` | Genel mimari, teknoloji yığını ve kurulum adımları |
| `BACKEND_COMPLETE.md` | Backend bileşenleri ve endpoint özeti |
| `PROGRESS.md` | Güncel sprint / durum raporu |
| `COMPREHENSIVE_PROJECT_ANALYSIS.md` | Detaylı yol haritası |
| `backend/app/config.py` | Ortam değişkenleri ve admin e-posta listesi |
| `frontend/src/pages/About.tsx` | Güncel timeline & filtre uygulaması |

---

## 🏁 Başarı Kriterleri

### Backend

- ✅ Uvicorn çalışıyor (`http://127.0.0.1:8000`)
- ✅ `/api/v1/experiences/` toplam 11 kayıt döndürüyor
- ✅ Admin e-posta listesi `.env` ile güncel

### Frontend

- ✅ `npm run dev` hata vermeden çalışıyor
- ✅ About sayfası filtreleri doğru sayıları gösteriyor
- ✅ Icon-only linkler erişilebilir (aria-label)

---

**Toplam Süre**: ~25 dk hazırlık + 60 dk odak  
**Rota**: Docker → Backend → Frontend → Doğrula → Dokümantasyon 📌
