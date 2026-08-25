import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // patient-portal/ va doctor-portal/ — alohida Vite loyihalari (o'z serverlarida
  // ishlaydi). Ular bu loyihaning ichki papkalari bo'lgani uchun, ularsiz bu
  // sozlash bo'lmasa Vite ularning ichidagi o'zgarishlarni (masalan `npm run build`
  // paytida yaratiladigan dist/) ham "shu loyihaning fayli o'zgardi" deb qabul qilib,
  // admin panelni keraksiz to'liq qayta yuklab yuboradi — natijada ochiq turgan
  // sahifadagi barcha vaqtinchalik ma'lumot (forma, ro'yxat) yo'qolib qoladi.
  server: {
    watch: {
      ignored: ['**/patient-portal/**', '**/doctor-portal/**'],
    },
  },
})