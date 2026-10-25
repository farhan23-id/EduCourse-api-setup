# EduCourse API

Backend REST API untuk aplikasi kursus online **EduCourse**. Proyek ini berisi autentikasi (register, verifikasi email, login), manajemen user dan course dengan hak akses berbasis role, pencarian/filter/pengurutan course, serta unggah gambar.

## Fitur

- Register dan login dengan password ter-hash (bcryptjs) dan token JWT
- Verifikasi email lewat link yang dikirim saat registrasi (nodemailer)
- Middleware autentikasi (`verifyToken`) dan otorisasi berdasarkan role (`ADMIN`, `STUDENT`)
- CRUD user dan CRUD course
- Query params pada daftar course: **search**, **filter**, dan **sort**
- Unggah gambar (multer) dengan batas tipe dan ukuran file
- Validasi request dengan Zod dan penanganan error terpusat

## Teknologi

| Kebutuhan      | Yang dipakai                       |
| -------------- | ---------------------------------- |
| Runtime        | Node.js (20.19+, 22.12+, atau 24+) |
| Framework      | Express 5 + TypeScript             |
| Database & ORM | PostgreSQL + Prisma 7              |
| Autentikasi    | jsonwebtoken, bcryptjs             |
| Validasi       | Zod                                |
| Upload file    | multer                             |
| Email          | nodemailer, uuid                   |

## Prasyarat

- Node.js (sesuai versi di atas) dan npm
- PostgreSQL yang sudah berjalan
- Untuk menguji email: salah satu dari Mailpit (lokal), akun Ethereal, atau SMTP lain (lihat bagian [Konfigurasi email](#konfigurasi-email))

## Instalasi dan menjalankan

```bash
# 1. Install dependency
npm install

# 2. Salin file environment, lalu isi nilainya (lihat tabel di bawah)
cp .env.example .env

# 3. Buat database di PostgreSQL, misalnya bernama course_api
createdb course_api

# 4. Jalankan migrasi dan generate Prisma Client
npm run db:migrate
npm run db:generate

# 5. Isi data awal (admin, kategori, tutor, course contoh)
npm run db:seed

# 6. Jalankan server (mode pengembangan)
npm run dev
```

Server berjalan di `http://localhost:3000`. Cek dengan membuka `http://localhost:3000/health`.

### Scripts

| Perintah              | Fungsi                                                      |
| --------------------- | ----------------------------------------------------------- |
| `npm run dev`         | Menjalankan server dengan auto-reload                       |
| `npm run build`       | Mengompilasi TypeScript ke folder `dist/`                   |
| `npm start`           | Menjalankan hasil build (`dist/server.js`)                  |
| `npm run db:migrate`  | Membuat/menjalankan migrasi database (`prisma migrate dev`) |
| `npm run db:generate` | Membuat Prisma Client dari skema                            |
| `npm run db:seed`     | Mengisi data awal                                           |

## Konfigurasi environment

Salin `.env.example` menjadi `.env`. File `.env` berisi data rahasia dan tidak boleh di-commit.

| Variabel         | Keterangan                                                           | Contoh                                                 |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `PORT`           | Port server                                                          | `3000`                                                 |
| `DATABASE_URL`   | Koneksi PostgreSQL                                                   | `postgresql://user:password@localhost:5432/course_api` |
| `JWT_SECRET`     | Kunci rahasia penanda tangan token (panjang dan acak)                | lihat catatan di bawah                                 |
| `JWT_EXPIRES_IN` | Masa berlaku token login                                             | `1d`                                                   |
| `APP_URL`        | URL publik backend, dipakai untuk link di email dan URL hasil upload | `http://localhost:3000`                                |
| `SMTP_HOST`      | Alamat server SMTP                                                   | `localhost`                                            |
| `SMTP_PORT`      | Port server SMTP                                                     | `1025`                                                 |
| `SMTP_USER`      | Username SMTP (kosongkan jika tidak perlu login)                     | `""`                                                   |
| `SMTP_PASS`      | Password SMTP (kosongkan jika tidak perlu login)                     | `""`                                                   |
| `MAIL_FROM`      | Nama dan alamat pengirim email                                       | `EduCourse <no-reply@educourse.test>`                  |

Membuat `JWT_SECRET` acak:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Konfigurasi email

Nilai `SMTP_*` berasal dari server email yang menerima email dari aplikasi, bukan dari penerimanya. Untuk pengembangan, gunakan penangkap email agar tidak mengirim email sungguhan:

| Pilihan                           | SMTP_HOST             | SMTP_PORT | SMTP_USER / SMTP_PASS       |
| --------------------------------- | --------------------- | --------- | --------------------------- |
| Mailpit                           | `localhost`           | `1025`    | kosong                      |
| Ethereal (https://ethereal.email) | `smtp.ethereal.email` | `587`     | dari situs Ethereal         |
| Gmail (App Password)              | `smtp.gmail.com`      | `465`     | alamat Gmail / App Password |

Menjalankan Mailpit dengan Docker (opsional), lalu buka kotak masuknya di `http://localhost:8025`:

```bash
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Untuk produksi, ganti dengan layanan pengiriman email sungguhan, gunakan `MAIL_FROM` dari domain milik sendiri, dan ubah `APP_URL` menjadi alamat publik backend.

## Akun seed

Setelah `npm run db:seed`, tersedia akun admin untuk pengujian:

| Email                  | Password   | Role  |
| ---------------------- | ---------- | ----- |
| `admin@educourse.test` | `admin123` | ADMIN |

Seed juga membuat 2 kategori, 2 tutor, dan 6 course (satu di antaranya berstatus `DRAFT`). Akun ini hanya untuk pengembangan, jangan dipakai di produksi.

## Struktur folder

```
course-api/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── uploads/                    # file hasil upload (isinya tidak di-commit)
├── src/
│   ├── config/env.ts           # membaca dan memvalidasi environment
│   ├── generated/prisma/       # hasil prisma generate (tidak di-commit)
│   ├── lib/
│   │   ├── mailer.ts           # konfigurasi nodemailer
│   │   └── prisma.ts           # koneksi database
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # verifyToken, authorize
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── modules/
│   │   ├── auth/               # routes, controller, service, schema, mail
│   │   ├── users/
│   │   ├── courses/
│   │   └── upload/
│   ├── types/express.d.ts
│   ├── utils/parse-id.ts
│   ├── app.ts
│   └── server.ts
├── prisma.config.ts
└── tsconfig.json
```

Alur request: `routes` (URL dan middleware) → `controller` (membaca request dan membalas) → `service` (logika dan query Prisma). Error dari lapisan mana pun ditangkap oleh `error.middleware.ts`.

## Daftar endpoint

Endpoint bertanda "login" membutuhkan header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint                            | Akses  | Keterangan                                                                   |
| ------ | ----------------------------------- | ------ | ---------------------------------------------------------------------------- |
| POST   | `/api/auth/register`                | publik | Body: `fullName`, `username`, `email`, `password`. Mengirim email verifikasi |
| GET    | `/api/auth/verifikasi-email?token=` | publik | Memverifikasi email dengan token dari link di email                          |
| POST   | `/api/auth/login`                   | publik | Body: `email`, `password`. Mengembalikan `token`                             |
| GET    | `/api/auth/me`                      | login  | Profil user yang sedang login                                                |

### Users

| Method | Endpoint         | Akses                                                                   |
| ------ | ---------------- | ----------------------------------------------------------------------- |
| GET    | `/api/users`     | ADMIN                                                                   |
| GET    | `/api/users/:id` | ADMIN atau pemilik akun                                                 |
| PATCH  | `/api/users/:id` | ADMIN atau pemilik akun (`role` dan `isActive` hanya bisa diubah ADMIN) |
| DELETE | `/api/users/:id` | ADMIN                                                                   |

### Courses

| Method | Endpoint           | Akses | Keterangan                                                                                                                   |
| ------ | ------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/courses`     | login | Mendukung query params (lihat di bawah). `STUDENT` hanya melihat course `PUBLISHED`                                          |
| GET    | `/api/courses/:id` | login | `STUDENT` tidak bisa melihat course `DRAFT`                                                                                  |
| POST   | `/api/courses`     | ADMIN | Body: `title`, `slug`, `categoryId`, `tutorId`, opsional `description`, `thumbnailUrl`, `previewVideoUrl`, `price`, `status` |
| PATCH  | `/api/courses/:id` | ADMIN | Semua field opsional                                                                                                         |
| DELETE | `/api/courses/:id` | ADMIN |                                                                                                                              |

Query params untuk `GET /api/courses`:

| Param                  | Jenis  | Keterangan                                               |
| ---------------------- | ------ | -------------------------------------------------------- |
| `search`               | search | Mencari berdasarkan judul (tidak peka huruf besar/kecil) |
| `category`             | filter | Slug kategori, misalnya `web-development`                |
| `tutorId`              | filter | ID tutor                                                 |
| `minPrice`, `maxPrice` | filter | Rentang harga                                            |
| `status`               | filter | `DRAFT` atau `PUBLISHED` (hanya berlaku untuk ADMIN)     |
| `sortBy`               | sort   | `title` (default) atau `price`                           |
| `order`                | sort   | `asc` (default) atau `desc`                              |

### Upload

| Method | Endpoint               | Akses  | Keterangan                                                                            |
| ------ | ---------------------- | ------ | ------------------------------------------------------------------------------------- |
| POST   | `/api/upload`          | login  | `multipart/form-data` dengan field `image`. Format JPG, PNG, atau WEBP, maksimal 2 MB |
| GET    | `/uploads/<nama-file>` | publik | Mengakses file yang sudah diunggah                                                    |

URL hasil upload bisa dipakai di field `thumbnailUrl` (course) atau `avatarUrl` (user).

### Lainnya

| Method | Endpoint  | Keterangan          |
| ------ | --------- | ------------------- |
| GET    | `/health` | Cek server berjalan |

Semua error dibalas dalam format `{ "message": "..." }`. Error validasi (400) juga menyertakan daftar `errors` per field.

## Cara testing

Contoh di bawah memakai `curl` dengan sintaks bash. Di Windows, gunakan Git Bash, atau gunakan Postman / Thunder Client dengan isi yang sama.

### 1. Register dan verifikasi email

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Budi Siswa","username":"budi_siswa","email":"budi@mail.com","password":"secret123"}'
```

Buka kotak masuk penangkap email (misalnya `http://localhost:8025` untuk Mailpit) dan klik link di email. Hasilnya `Email Verified Successfully`. Link yang sama jika dipakai lagi menghasilkan `Invalid Verification Token`.

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@mail.com","password":"secret123"}'
```

Salin nilai `token` dari response, lalu simpan di variabel:

```bash
TOKEN="tempel-token-di-sini"
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

### 3. Daftar course dengan search, filter, dan sort

```bash
# semua course yang PUBLISHED (sebagai student)
curl "http://localhost:3000/api/courses" -H "Authorization: Bearer $TOKEN"

# search
curl "http://localhost:3000/api/courses?search=javascript" -H "Authorization: Bearer $TOKEN"

# filter kategori + sort harga termahal dulu
curl "http://localhost:3000/api/courses?category=data-science&sortBy=price&order=desc" -H "Authorization: Bearer $TOKEN"

# filter rentang harga
curl "http://localhost:3000/api/courses?minPrice=100000&maxPrice=250000" -H "Authorization: Bearer $TOKEN"
```

Tanpa token, endpoint ini membalas `401 Autentikasi gagal`.

### 4. Fitur admin (login sebagai akun seed)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@educourse.test","password":"admin123"}'

ADMIN_TOKEN="tempel-token-admin-di-sini"

# membuat course
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"title":"Node.js untuk Pemula","slug":"nodejs-pemula","categoryId":1,"tutorId":1,"price":120000,"status":"PUBLISHED"}'

# admin juga bisa melihat course DRAFT
curl "http://localhost:3000/api/courses?status=DRAFT" -H "Authorization: Bearer $ADMIN_TOKEN"
```

Token student yang mencoba `POST /api/courses` membalas `403 Akses ditolak`.

### 5. Upload gambar

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./foto.png"
```

Response berisi `url`. Buka URL itu di browser untuk melihat gambarnya. File selain JPG/PNG/WEBP atau lebih dari 2 MB ditolak dengan status 400.

## Catatan

- Login belum mewajibkan email terverifikasi. Status verifikasi tercatat di kolom `is_verified`.
- Token verifikasi email berlaku 24 jam dan hanya bisa dipakai satu kali.
- Gambar disimpan di folder `uploads/` pada server dan yang tersimpan di database hanya URL-nya (di `thumbnailUrl` atau `avatarUrl`). Untuk produksi, pertimbangkan penyimpanan cloud.
- Pengiriman email gagal tidak membatalkan registrasi. Response register akan memberi tahu bahwa email gagal dikirim.
