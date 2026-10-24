# 🎯 MagangHub Screener

> **Smart Internship Matcher** — Tool screening cerdas yang mencocokkan CV kamu dengan lowongan magang di [MagangHub Kemnaker RI](https://maganghub.kemnaker.go.id) secara otomatis.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Fitur

- 🔍 **Smart Matching** — Algoritma matching otomatis berdasarkan jurusan, posisi, pendidikan, dan kuota
- 📄 **Upload CV sendiri** — Setiap orang bisa upload CV mereka dalam format JSON
- 📊 **Dashboard visual** — Statistik, chart distribusi, dan ranking rekomendasi
- ⭐ **Bookmark** — Simpan lowongan favorit
- 🔎 **Filter & Search** — Filter berdasarkan lokasi, jurusan, dan skor kecocokan
- ⚖️ **Custom Weights** — Atur prioritas kriteria matching sesuai keinginan
- 📥 **Export hasil** — Download hasil screening dalam format JSON
- 💾 **Offline & Private** — Berjalan 100% di browser lokal, data tidak dikirim ke server manapun

---

## 🚀 Cara Menggunakan

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/maganghub-screener.git
cd maganghub-screener
```

### 2. Buat File CV Kamu

Salin template CV dan isi dengan data kamu:

```bash
cp data/cv-template.json data/my-cv.json
```

Buka file `data/my-cv.json` dengan text editor (VS Code, Notepad++, dll) lalu isi semua field.

> ⚠️ **Field yang WAJIB diisi:** `name`, `education` (minimal 1), `skills`, dan `matchKeywords`

### 3. Jalankan di Browser

**Cara termudah** — buka langsung `index.html` di browser:

```
Klik kanan file index.html → Open With → Browser favorit kamu
```

**Atau** gunakan Live Server (rekomendasi):

```bash
# Jika sudah punya Node.js
npx http-server -p 8080

# Atau jika pakai VS Code, install extension "Live Server" lalu klik "Go Live"
```

### 4. Upload CV & Jalankan Screening

1. Saat pertama kali dibuka, akan muncul pop-up **Onboarding**
2. Klik tombol **"Upload CV (JSON)"** dan pilih file CV kamu
3. Di halaman **Dashboard**, klik tombol **"Jalankan Screening"**
4. Lihat hasilnya! 🎉

---

## 📄 Format CV (JSON)

File CV harus dalam format JSON dengan struktur sebagai berikut. Lihat [`data/cv-template.json`](data/cv-template.json) untuk contoh lengkap.

```json
{
  "name": "Nama Lengkap",
  "phone": "+62 8xx-xxxx-xxxx",
  "email": "email@example.com",
  "website": "",
  "linkedin": "",
  "location": "Kota, Provinsi",
  "about": "Deskripsi singkat tentang diri kamu...",

  "education": [
    {
      "institution": "Nama Universitas",
      "location": "Kota, Indonesia",
      "degree": "S-1 Informatika",
      "gpa": 3.50,
      "year": "2021 – 2025"
    }
  ],

  "workExperience": [
    {
      "company": "Nama Perusahaan",
      "role": "Posisi",
      "period": "Jan 2024 – Jun 2024",
      "location": "Kota, Indonesia"
    }
  ],

  "projects": [
    {
      "name": "Nama Proyek",
      "type": "Web App / ML / dsb",
      "skills": ["React", "Node.js"]
    }
  ],

  "skills": {
    "software": ["Python", "Excel", "VS Code"],
    "technical": ["Data Analysis", "Machine Learning"],
    "soft": ["Problem-Solving", "Communication"],
    "languages": ["Indonesian", "English"]
  },

  "certifications": [
    {
      "name": "Nama Sertifikasi",
      "issuer": "Lembaga",
      "type": "Bootcamp",
      "year": "2024"
    }
  ],

  "matchKeywords": [
    "data analyst",
    "python",
    "machine learning",
    "informatika"
  ]
}
```

### 🔑 Penjelasan `matchKeywords`

Field `matchKeywords` adalah **kunci utama** dari algoritma matching. Isilah dengan:

- **Posisi yang kamu incar** → `"data analyst"`, `"web developer"`, `"ui/ux designer"`
- **Skill utama kamu** → `"python"`, `"javascript"`, `"figma"`
- **Nama jurusan kamu (huruf kecil)** → `"informatika"`, `"akuntansi"`, `"manajemen"`
- **Bidang yang diminati** → `"machine learning"`, `"digital marketing"`, `"finance"`

Semakin banyak keyword yang relevan, semakin akurat hasil matchingnya.

---

## 📊 Cara Kerja Algoritma Matching

Setiap lowongan akan diberi **Match Score (0-100%)** berdasarkan 4 kriteria:

| Kriteria | Default Weight | Penjelasan |
|----------|:---:|-------------|
| 🎓 Kesesuaian Jurusan | 35% | Apakah jurusan kamu ada di daftar jurusan yang dibutuhkan |
| 💼 Relevansi Posisi | 30% | Seberapa cocok judul lowongan dengan `matchKeywords` kamu |
| 📚 Pendidikan | 20% | Apakah tingkat pendidikan kamu sesuai (S1, D3, dll) |
| 👥 Kuota | 15% | Semakin banyak kuota, semakin besar peluang diterima |

Kamu bisa mengubah bobot ini di halaman **Pengaturan**.

### Kategori Hasil

- 🟢 **Sangat Cocok (≥70%)** — Prioritaskan lowongan ini!
- 🟡 **Potensial (50-69%)** — Masih layak dicoba
- 🔴 **Kurang Cocok (<50%)** — Kurang sesuai dengan profil kamu

---

## 🗂 Struktur Proyek

```
maganghub-screener/
├── index.html              # Halaman utama SPA
├── css/
│   └── styles.css          # Stylesheet (dark theme)
├── js/
│   ├── app.js              # Logic utama + CV upload
│   ├── matcher.js          # Algoritma matching (dinamis)
│   ├── renderer.js         # Rendering UI / DOM
│   └── storage.js          # localStorage wrapper
├── data/
│   ├── listings.json       # Database 200+ lowongan magang
│   ├── cv-template.json    # Template CV kosong (contoh)
│   └── cv-profile.json     # (opsional) CV default
└── README.md
```

---

## 🔄 Ingin Update Data Lowongan?

Data lowongan (`data/listings.json`) adalah snapshot dari MagangHub. Jika ingin mengupdate:

1. Scrape ulang dari [maganghub.kemnaker.go.id](https://maganghub.kemnaker.go.id) menggunakan script scraping
2. Simpan hasilnya ke `data/listings.json`
3. Atau gunakan fitur **Import Lowongan** di halaman Pengaturan untuk mengupload file JSON baru

Format setiap item lowongan:

```json
{
  "id": 1,
  "title": "Data Analyst Intern",
  "company": "PT Contoh Indonesia",
  "location": "Jakarta Selatan",
  "majors": ["Teknik Informatika", "Sistem Informasi"],
  "quota": 5,
  "education": ["Sarjana"],
  "workDays": "Senin - Jumat",
  "url": "https://maganghub.kemnaker.go.id/lowongan/..."
}
```

---

## 🛡️ Privasi & Keamanan

- ✅ Semua data **tersimpan di browser lokal** (`localStorage`) — tidak ada server
- ✅ Tidak ada data yang dikirim ke internet
- ✅ CV kamu **tidak diupload ke server manapun** — hanya dibaca oleh browser
- ⚠️ Jika kamu fork/push ke GitHub, **jangan commit file CV pribadi** yang berisi nomor HP atau alamat rumah

---

## 📝 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.

---

## 💡 Kontribusi

Pull request dan issue sangat diterima! Jika kamu punya ide fitur atau menemukan bug, silakan buat issue.

---

Made with ❤️ by **Muhammad Ramdhani Subagio**
