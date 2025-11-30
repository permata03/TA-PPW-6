# 🌦️PermataWeather
PermataWeather adalah aplikasi dashboard cuaca interaktif berbasis web yang menampilkan cuaca saat ini, prakiraan 5 hari, serta menyediakan fitur interaktif seperti pencarian kota, tema gelap/terang, toggle Celsius/Fahrenheit, dan auto-update setiap 5 menit.  
Proyek ini dibuat sebagai Tugas Akhir Praktikum Pemrograman Web.
# 🌤️1. Current Weather Display
- Menampilkan cuaca terkini berdasarkan nama kota.
- Informasi meliputi:
  - Suhu (Celsius / Fahrenheit)
  - Kelembapan
  - Kecepatan angin
  - "Feels like"
  - Kondisi cuaca & icon cuaca
  - Timestamp waktu update
    
# 📅2. 5-Day Forecast
- Prakiraan 5 hari ke depan.
- Ditampilkan dalam format:
  - Prediksi harian
  - Temperatur minimum & maksimum
  - Icon cuaca
  - Deskripsi singkat kondisi cuaca

# 🔍3. Search & Autocomplete
- Cari cuaca berdasarkan nama kota.
- Auto-suggestion city name menggunakan OpenWeather Geo API.
- Error handling jika kota tidak ditemukan.

# ⭐4. Favorite Cities
- Simpan kota favorit ke **localStorage**.
- Klik kota favorit untuk memuat cuacanya.
- Bisa menghapus kota dari daftar favorit.

# 🛠️ Teknologi yang Digunakan
- HTML
- CSS
- JavaScript
- OpenWeather API
  - Current Weather API
  - 5-Day Forecast API
  - Geocoding API
  - LocalStorage(untuk favorit & theme)

# 📡API yang Digunakan
https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid=API_KEY

# Struktur File
permata-weather/
│── index.html        → Struktur halaman utama
│── styles.css        → Style & tema aplikasi
│── script.js         → Logika utama aplikasi
│── README.md         → Dokumentasi project

# Cara Menjalankan Project
Untuk menjalankan aplikasi PermataWeather, cukup lakukan clone atau download repository ini, kemudian buka folder project dan jalankan file index.html menggunakan browser modern seperti Chrome atau melalui ekstensi Live Server di VS Code agar seluruh fitur berjalan optimal. Pastikan Anda telah mengganti nilai API_KEY di file script.js dengan API key OpenWeather milik Anda sendiri. Setelah itu, aplikasi dapat langsung digunakan tanpa proses instalasi tambahan karena seluruh logika dan tampilan berbasis HTML, CSS, dan JavaScript murni.

# Tampilan Web
![9a5f53759e8540f2a33cccb51991ce06](https://github.com/user-attachments/assets/33d84b75-ba7f-454d-ab77-003fcf939ecf)
![9c209dee6bb4487b9980229b3072dc1b](https://github.com/user-attachments/assets/ee798aa7-71ce-4559-bd26-e5800ba1d1d7)
![93b8d952b6d94c7d97bf4d5fa80357f9](https://github.com/user-attachments/assets/21b1d88a-31d4-4a38-8fcd-01851ed1bd81)
![96b4248d7e934a0680e942547eec4bc1](https://github.com/user-attachments/assets/f5e12c4f-8f6e-43d6-8f2a-010f508498a0)
![1439de3db00a4c5f9a700080d6e1d7fc](https://github.com/user-attachments/assets/184c6623-40c2-430f-acde-d49750e69be1)
![4329e57e2d394aefa88343190456a60e](https://github.com/user-attachments/assets/b781ccd2-6899-4788-bb22-d0a3e27e7236)
![cf646d75ac4f4a96b48a0853001b897f](https://github.com/user-attachments/assets/33d93906-b8ad-4bd5-951d-77eeb7f58d9c)


