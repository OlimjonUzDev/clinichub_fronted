# ClinicHub frontend — ishlash tartibi

Bu repo production ClinicHub tizimining frontend qismi: admin panel (`src/`),
`patient-portal/`, `doctor-portal/`. Backend (Django/DRF) alohida repoda.

## Progress tracking

`TASKS.md` — yagona progress jurnali. Bosqichlar (`N-BOSQICH`) bo'yicha
checklist, har bir band qalin sarlavha + tavsif, va tugagandan keyin sana
bilan `✅ Tekshirildi: <aniq dalil>` izoh. Bu qo'lda yuritilgan tarix —
avtomatik qayta yozib tashlama yoki formatini o'zgartirma, faqat mavjud
uslubga mos holda qo'sh.

## Ishlash tartibi

Faylning o'zida ham yozilgan (oxirgi qator):

- **Backend** — har bir bandni foydalanuvchi o'zi yozadi. Claude backend
  fayllarni so'ralmaguncha tahrirlamaydi — faqat tushuntiradi, va
  foydalanuvchi tasdiqlagach real tekshiruv (test/real so'rov) bilan
  tasdiqlaydi.
- **Frontend** (`patient-portal`, `doctor-portal`, admin panel) — Claude
  to'g'ridan-to'g'ri kod yozadi, so'ng `eslint`/`build` bilan o'zi
  tekshiradi (vizual/UI sinov brauzer avtomatizatsiyasi yo'qligi sababli
  qilinmaydi — bu holat izohda ochiq aytiladi).

Hech qachon `TASKS.md`dagi bandni real tekshiruvsiz `[x]` qilib
belgilama.

## Skill'lar

- `task-add` — yangi bandni faylning mavjud uslubiga mos holda, tasdiqdan
  keyin qo'shadi.
- `task-verify` — bir bandni yopadi: frontend bo'lsa yozadi+tekshiradi,
  backend bo'lsa faqat tekshiradi (fayllarga tegmaydi), so'ng dalilli
  `✅ Tekshirildi (sana): ...` izoh bilan `[x]` qiladi.
