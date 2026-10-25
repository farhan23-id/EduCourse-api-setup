# Langkah Pembuatan EduCourse API

Ringkasan urutan pembuatan aplikasi, dari proyek kosong sampai siap dipakai. Setiap step memuat tujuan, file atau perintah utama, alur singkat, dan pesan commit-nya. Kode lengkapnya ada di repositori ini. Cara menjalankan dan menguji aplikasi ada di [README.md](../README.md).

Pembuatan dibagi dua fase:

- **Fase 1: Fondasi.** Setup proyek, database, middleware, auth, dan CRUD versi awal.
- **Fase 2: Penyesuaian ERD dan fitur tugas.** Skema database disesuaikan dengan ERD, struktur modul dirapikan, lalu ditambah query params, upload gambar, dan verifikasi email.

## Alur request (berlaku untuk seluruh aplikasi)

```
Request
  → app.ts                   cors, express.json
  → modules/<fitur>/*.routes.ts   URL + middleware (verifyToken, authorize, validate)
  → *.controller.ts          baca request, panggil service, kirim response
  → *.service.ts             logika bisnis + query Prisma ke database
  → error di mana pun        → error.middleware.ts → JSON { message }
```

---

# Fase 1: Fondasi

## Step 1: Inisialisasi proyek

**Tujuan:** repositori Git bersih dengan file rahasia tidak ikut ter-commit.

- `git init`, `npm init -y`
- `.gitignore` berisi `node_modules`, `dist`, `.env`, `src/generated`

**Commit:** `chore: init project`

## Step 2: Dependency dan TypeScript

**Tujuan:** semua library terpasang dan TypeScript siap dikompilasi.

- Dependency: `express`, `cors`, `dotenv`, `zod`, `bcryptjs`, `jsonwebtoken`, `@prisma/client@7`, `@prisma/adapter-pg@7`
- Dev dependency: `typescript`, `tsx`, `prisma@7`, `@types/node`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`
- `tsconfig.json`: `module: nodenext`, `rootDir: src`, `outDir: dist`, `types: ["node"]`, `strict: true`
- Scripts di `package.json`: `dev`, `build`, `start`, `db:generate`, `db:migrate`

**Catatan:** Prisma ditulis `@7` karena tag `latest` untuk CLI-nya menunjuk ke versi 8 RC (belum stabil).

**Commit:** `chore: setup typescript and dependencies`

## Step 3: Environment dan server dasar

**Tujuan:** server Express menyala dan membaca konfigurasi dari `.env`.

- `.env` dan `.env.example` di root proyek: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `src/config/env.ts`: membaca `process.env`, menolak start jika variabel wajib kosong
- `src/app.ts`: `cors`, `express.json`, route `/health`
- `src/server.ts`: `app.listen`

**Alur:** `.env` → `env.ts` (validasi) → `server.ts` (listen) → `GET /health`.

**Commit:** `feat: basic express server with env config and health check`

## Step 4: Prisma 7 dan PostgreSQL

**Tujuan:** aplikasi terhubung ke database dan tabel pertama terbentuk.

- Buat database, lalu `npx prisma init --datasource-provider postgresql` (tambahkan `--no-skills` agar folder agen AI tidak dibuat)
- `prisma/schema.prisma`: model awal, generator `prisma-client` dengan `moduleFormat = "cjs"`
- `prisma.config.ts`: lokasi skema, migrasi, dan `DATABASE_URL`
- `npx prisma migrate dev` dan `npx prisma generate`
- `src/lib/prisma.ts`: `PrismaClient` dengan adapter `PrismaPg`

**Catatan:** skema model di fase ini masih sederhana dan diganti sesuai ERD di Fase 2 Step 1.

**Commit:** `feat: add prisma 7 schema, config, and initial migration`

## Step 5: Middleware global

**Tujuan:** error dan validasi ditangani di satu tempat.

- `error.middleware.ts`: `HttpError`, `notFound`, `errorHandler` (menerjemahkan error Zod, `HttpError`, dan kode error Prisma `P2025` jadi 404 dan `P2002` jadi 409)
- `validate.middleware.ts`: `validate(schema)` memvalidasi `req.body` dengan Zod
- `utils/parse-id.ts`: memastikan ID di URL adalah bilangan bulat positif
- `app.ts`: `notFound` dan `errorHandler` dipasang paling bawah

**Alur:** error dilempar di mana saja → `errorHandler` → response JSON. Express 5 meneruskan error dari handler `async` secara otomatis.

**Commit:** `feat: add error handler, validation middleware, and id parser`

## Step 6: Middleware autentikasi JWT

**Tujuan:** endpoint bisa dilindungi token dan dibatasi per role.

- `types/express.d.ts`: menambahkan `req.user` (`id` dan `role`)
- `auth.middleware.ts`: `authenticate` (di Fase 2 diganti nama menjadi `verifyToken`) dan `authorize(...roles)`

**Alur:** baca header `Authorization: Bearer <token>` → `jwt.verify` → simpan `id` dan `role` ke `req.user` → `next()`. Gagal → 401.

**Commit:** `feat: add jwt authenticate and role authorize middleware`

## Step 7: Endpoint auth

**Tujuan:** user bisa mendaftar, login, dan melihat profilnya.

- `POST /api/auth/register`: validasi, cek email duplikat, hash password dengan bcryptjs, `INSERT` user
- `POST /api/auth/login`: cari user berdasarkan email, `bcrypt.compare`, `jwt.sign` berisi `id` dan `role`
- `GET /api/auth/me`: profil dari token

**Alur login:** email dan password → user ditemukan? → password cocok? → token dibuat. Email salah dan password salah memakai pesan yang sama.

**Commit:** `feat: add auth register, login, and me endpoints`

## Step 8: CRUD user

**Tujuan:** pengelolaan data user dengan hak akses.

- `GET /api/users` dan `DELETE` hanya ADMIN
- `GET` dan `PATCH` per ID untuk ADMIN atau pemilik akun
- `role` hanya boleh diubah ADMIN

**Commit:** `feat: add user crud with role-based access`

## Step 9: CRUD course

**Tujuan:** pengelolaan data course.

- `GET` bebas untuk publik, `POST`, `PATCH`, `DELETE` untuk ADMIN dan TUTOR
- Tutor hanya boleh mengubah course miliknya

**Catatan:** aturan "tutor adalah user" diganti di Fase 2 karena ERD memisahkan tutor sebagai entitas sendiri.

**Commit:** `feat: add course crud with ownership check`

---

# Fase 2: Penyesuaian ERD dan fitur tugas

## Step 0: Branch fitur

```bash
git switch -c feat/erd-schema-and-query-params
```

Perubahan skema membuat kode lama tidak bisa di-compile sampai Step 6 selesai. Karena itu dikerjakan di branch dan di-merge ke `main` setelah semua selesai.

**Prinsip commit:** satu commit satu perubahan logis, format `tipe(scope): deskripsi` (Conventional Commits), skema selalu satu commit dengan migrasinya.

## Step 1: Skema Prisma sesuai ERD

**Tujuan:** database mengikuti ERD (cakupan secukupnya: `users`, `categories`, `tutors`, `courses`).

- `schema.prisma`: nama kolom dan tabel snake_case lewat `@map` dan `@@map`, nama field di kode tetap camelCase
- `User` mendapat `username`, `fullName`, `passwordHash`, `phoneNumber`, `avatarUrl`, `isActive`
- `Course` terhubung ke `Category` dan `Tutor` (relasi dan `@@index`)
- Enum `Role` (`ADMIN`, `STUDENT`) dan `CourseStatus` (`DRAFT`, `PUBLISHED`)
- `npx prisma migrate dev --name align_schema_with_erd` dan `npx prisma generate`

**Catatan:** `avg_rating` tidak dibuat karena atribut turunan dari tabel `reviews`. Nilai enum adalah asumsi karena ERD tidak menyebutnya.

**Commit:** `feat(db): align prisma schema with erd for users, categories, tutors, and courses`

## Step 2: Seed data

**Tujuan:** data awal untuk menguji filter, sort, dan search.

- `prisma.config.ts`: `migrations.seed = "tsx prisma/seed.ts"`
- `prisma/seed.ts`: 1 admin, 2 kategori, 2 tutor, 6 course (1 berstatus DRAFT), aman dijalankan berulang
- Script `db:seed` di `package.json`

**Commit:** `chore(db): add seed data for admin, categories, tutors, and courses`

## Step 3: Perbarui middleware bersama

**Tujuan:** middleware sesuai kebutuhan soal dan skema baru.

- `authenticate` diganti nama menjadi `verifyToken`, pesan error diganti menjadi "Autentikasi gagal: ..."
- `errorHandler` menambah kode Prisma `P2003` (foreign key tidak ditemukan) jadi 400

**Commit:** `refactor(middleware): rename verifyToken and map prisma foreign key error`

## Step 4: Modul auth (routes, controller, service, schema)

**Tujuan:** auth dengan payload `fullName`, `username`, `email`, `password`, dengan struktur berlapis.

- `auth.routes.ts` → `auth.controller.ts` → `auth.service.ts`, validasi di `auth.schema.ts`
- `users.select.ts`: daftar kolom user yang aman dikirim ke client (tanpa `passwordHash`)
- Register mengecek duplikat email atau username, login juga memeriksa `isActive`

**Commit:** `feat(auth): add register and login with username and full name`

## Step 5: Modul users

**Tujuan:** CRUD user dengan struktur berlapis dan field ERD.

- Aturan akses (ADMIN atau pemilik akun) ditaruh di service
- Non-admin tidak bisa mengubah `role` dan `isActive`

**Commit:** `refactor(users): split controller and service, adapt to erd fields`

## Step 6: Modul courses

**Tujuan:** CRUD course yang wajib login, dengan kategori dan tutor.

- Semua endpoint memakai `verifyToken`
- `GET` tersedia untuk semua user login, `POST`, `PATCH`, `DELETE` hanya ADMIN (tutor bukan user lagi)
- STUDENT hanya melihat course `PUBLISHED`

**Commit:** `feat(courses): add course crud behind verifyToken with category and tutor`

## Step 7: Query params (filter, sort, search)

**Tujuan:** `GET /api/courses` mendukung pencarian, penyaringan, dan pengurutan.

- `courses.schema.ts`: `listCoursesQuerySchema` (Zod mengubah teks jadi angka dan memberi nilai default)
- `courses.service.ts`: menyusun `where` (filter dan search) dan `orderBy` (sort)
- `courses.controller.ts`: memvalidasi `req.query` langsung di controller (di Express 5 `req.query` hanya bisa dibaca)

| Fitur  | Parameter                                               | Setara SQL                 |
| ------ | ------------------------------------------------------- | -------------------------- |
| Search | `search`                                                | `WHERE ... ILIKE '%kata%'` |
| Filter | `category`, `tutorId`, `minPrice`, `maxPrice`, `status` | `WHERE`                    |
| Sort   | `sortBy`, `order`                                       | `ORDER BY`                 |

**Commit:** `feat(courses): add search, filter, and sort query params`

## Step 8: Upload gambar

**Tujuan:** user login bisa mengunggah gambar dan mendapat URL-nya.

- Install `multer` dan `@types/multer`, folder `uploads/` di root (`.gitkeep`, isinya diabaikan Git)
- `upload.service.ts`: konfigurasi multer (tipe JPG, PNG, WEBP, maksimal 2 MB, nama file UUID)
- `upload.controller.ts` dan `upload.routes.ts`: `POST /api/upload` dengan field `image`
- `app.ts`: `express.static` menyajikan `/uploads`
- `errorHandler` menerjemahkan error multer jadi 400
- `APP_URL` ditambahkan ke `.env`

**Alur:** `verifyToken` → multer (cek tipe dan ukuran, simpan ke `uploads/<uuid>.png`) → controller membalas `{ filename, size, url }`.

**Catatan:** file disimpan di disk, database hanya menyimpan URL (di `thumbnailUrl` atau `avatarUrl`).

**Commit:** `feat(upload): add image upload endpoint with multer`

## Step 9: Verifikasi email

**Tujuan:** setelah register, user menerima email berisi link verifikasi.

- Install `nodemailer`, `uuid`, `@types/nodemailer`
- Skema `User` bertambah: `isVerified`, `verificationToken` (unik), `verificationTokenExpiresAt`, lalu migrasi
- `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- `lib/mailer.ts`: `transporter` dan `sendMail`
- `auth.mail.ts`: `sendVerificationEmail` merakit link dari `APP_URL`
- `registerUser`: membuat token `uuid`, menyimpan bersama masa berlaku 24 jam, lalu mengirim email
- `GET /api/auth/verifikasi-email?token=`: mencari user berdasarkan token

**Alur:** register → token disimpan dan email terkirim → user klik link → token ditemukan dan belum kedaluwarsa → `isVerified = true`, token dihapus → "Email Verified Successfully". Token tidak ada atau kedaluwarsa → "Invalid Verification Token".

**Catatan:**

- Gagal kirim email tidak membatalkan registrasi.
- Untuk pengembangan gunakan penangkap email (Mailpit, Ethereal), bukan SMTP sungguhan.
- Login belum mewajibkan email terverifikasi.

**Commit:**

- `feat(db): add email verification fields to users`
- `feat(auth): send verification email on register and add verifikasi-email endpoint`

## Step 10: Finalisasi

**Tujuan:** proyek siap diserahkan.

- `.env.example` berisi semua variabel (tanpa nilai rahasia)
- `README.md`: instalasi, konfigurasi, daftar endpoint, cara testing
- Uji `npm run build` lalu `npm start`
- Merge branch fitur ke `main`

```bash
git switch main
git merge feat/erd-schema-and-query-params
```

**Commit:** `docs: add readme and finalize project setup`

---

## Keputusan teknis yang penting

| Keputusan                                                             | Alasan singkat                                                   |
| --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| PostgreSQL + Prisma 7 (`adapter-pg`)                                  | Pilihan database proyek; Prisma 7 wajib memakai driver adapter   |
| `bcryptjs`, bukan `bcrypt`                                            | JavaScript murni, tanpa kompilasi native; format hash kompatibel |
| Struktur `modules/<fitur>` dengan routes, controller, service, schema | Satu folder per fitur, tanggung jawab tiap file jelas            |
| Nama database snake_case, nama kode camelCase                         | Mengikuti ERD tanpa mengorbankan konvensi TypeScript             |
| Tutor entitas terpisah dari user                                      | Mengikuti ERD, sehingga CRUD course dibatasi untuk ADMIN         |
| Token verifikasi email: `uuid`, berlaku 24 jam, sekali pakai          | Aman dari token tebakan dan token basi                           |
| File upload disimpan di disk, URL di database                         | Cara umum; pindah ke penyimpanan cloud untuk produksi            |
| Conventional Commits dan branch fitur                                 | Riwayat Git mudah dibaca dan `main` tetap bersih                 |

## Belum dikerjakan (ide lanjutan)

- Tabel ERD lain: `modules`, `materials`, `assessments`, `enrollments`, `reviews`, `orders`, `payments`
- Pagination (`page`, `limit`) pada daftar course
- Mewajibkan email terverifikasi saat login, dan endpoint kirim ulang email verifikasi
- Pengiriman email lewat antrean agar response register tidak menunggu SMTP
- Validasi isi file gambar (bukan hanya tipe dari klien) dan penyimpanan cloud
