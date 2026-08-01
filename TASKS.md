# ClinicHub Backend — 100% tayyorlash rejasi

Ushbu fayl backend'ni production'ga tayyorlash uchun qilinishi kerak bo'lgan barcha ishlarni ustuvorlik bo'yicha ro'yxatlaydi. Har bir band bajarilgach `[ ]` ni `[x]` ga o'zgartiring.

---

## 1-BOSQICH — KRITIK (xavfsizlik)

- [x] **Registratsiyada `role` escalation** — `users/serializers.py` `RegisterSerializers`dan `role`ni olib tashlash yoki `read_only=True` qilish, default `'patient'`. Hozir har kim `role: "admin"` yuborib to'liq admin bo'lib oladi (real HTTP orqali tasdiqlangan). ✅ Tekshirildi: `role` yuborilsa ham e'tiborga olinmaydi, DB'da `patient` bo'lib qoladi, dashboard 403 qaytaradi.
- [x] **Parol validatsiyasi** — `RegisterSerializers`da `validate_password` qo'shib, Django'ning `django.contrib.auth.password_validation.validate_password()` funksiyasini chaqirish (`AUTH_PASSWORD_VALIDATORS` settings'da bor, lekin hech qachon ishlamayapti). ✅ Tekshirildi: `"12345"` 400 bilan rad etiladi.
- [x] **Parol hash'ini javobdan yashirish** — `RegisterSerializers`даги `password` maydoniga `write_only=True` qo'shish. ✅ Tekshirildi.
- [x] **`CORS_ALLOW_ALL_ORIGINS = True`** — `config/settings.py`да faqat frontend domenini ruxsat berish (`CORS_ALLOWED_ORIGINS = [...]`). ✅ Tekshirildi: `evil.com` rad etiladi, `localhost:5173` ruxsat etiladi.
- [x] **Throttling** — `login`/`register` endpoint'lari uchun DRF `DEFAULT_THROTTLE_CLASSES`/`RATES` sozlash (brute-force himoyasi). ✅ Tekshirildi: 20 ta so'rovdan keyin `429 Too Many Requests` qaytadi.

## 2-BOSQICH — To'lov tizimi (Stripe)

- [ ] ⏸ **KEYINGA QOLDIRILDI** — `STRIPE_WEBHOOK_SECRET`ni `config/settings.py` va `.env`ga qo'shish (`stripe login` + `stripe listen` kerak bo'ladi; Stripe CLI o'rnatilgan, lekin login qilinmagan).
- [x] `stripe` paketini `requirements.txt`ga qo'shish (fayl nomi ham `requiremets.txt` dan `requirements.txt`ga to'g'irlandi — bonus). ✅ Tekshirildi: `pip install -r requirements.txt --dry-run` xatosiz o'tdi.
- [x] `payments/models.py`даги `provider` (payme/click/uzum → stripe) o'zgarishi uchun migratsiya yaratish va qo'llash (`makemigrations payments` + `migrate`). ✅ Tekshirildi: `0003_alter_payment_provider.py` qo'llangan, pending o'zgarish qolmagan.
- [x] `payments/serializers.py`даги `stripe_charge_id`ни `read_only_fields`ga qo'shish (mijoz tomonidan yozilmasin). ✅ Tekshirildi: `read_only=True`, mijoz yuborgan qiymat e'tiborga olinmaydi.
- [x] Valyuta nomuvofiqligi — `Payment.currency` default `UZS`, lekin `CreateStripeIntentView`да qattiq `usd` yozilgan. **Qaror:** Stripe UZS'ni qo'llab-quvvatlamaydi, shuning uchun to'liq USD'ga o'tildi. ✅ Tekshirildi: `currency` default → `'USD'`, migratsiya (`0004_alter_payment_currency`) qo'llangan.

## 3-BOSQICH — Validatsiya

- [x] Ism maydonlari (`name_uz`/`name_ru` — `doctors`, `patients`, va h.k.) uchun `RegexValidator` (faqat harflar, bo'shliq, tire, tutuq belgisi). ✅ Tekshirildi: raqamli/belgili ism ikkala app'da ham rad etiladi, to'g'ri ism qabul qilinadi.
- [x] `Rating.score` uchun `MinValueValidator(1)`, `MaxValueValidator(5)`. ✅ Tekshirildi: `0`,`-5`,`6`,`100` rad etiladi; `1`,`3`,`5` qabul qilinadi.
- [x] `Patient.phone_number`, `Patient.national_id`, `Doctor.telegram_username` uchun format validatorlari (`RegexValidator`). ✅ Tekshirildi: noto'g'ri formatlar rad etiladi, to'g'ri format va bo'sh qiymat qabul qilinadi.
- [x] `Payment.amount`, `Invoice.amount`, `DoctorPayout.amount` uchun `MinValueValidator(0)` (manfiy summa kirmasin). ✅ Tekshirildi: uchala maydonda ham manfiy qiymat rad etiladi.
- [x] `AppointmentSerializers`да `validate()` — `end_time > start_time` tekshiruvi. ✅ Tekshirildi: `end_time <= start_time` rad etiladi.
- [x] `AppointmentSerializers`да bitta doktorga bir vaqtda bir nechta appointment (double-booking) tekshiruvi. ✅ Tekshirildi: kesishuvchi vaqt rad etiladi, chegara-chegaraga tegib turgan slot va o'z-o'ziga PATCH (faqat `status`) to'g'ri o'tadi.
- [x] Appointment yaratishda `DoctorSchedule` (ish jadvali) bilan solishtirish — doktor ishlamaydigan vaqtga appointment ochilmasin. ✅ Tekshirildi: doktor ishlamaydigan kun va ish soatidan tashqari vaqt rad etiladi.
- [x] `prescriptions/serializers.py`даги `create()`/`update()`ни `PrescriptionItemSerializer` orqali o'tkazish (hozir xom `request.data` to'g'ridan-to'g'ri `.objects.create()`ga uzatilyapti — noto'g'ri ma'lumot 500 xato beradi, 400 emas). ✅ Tekshirildi: bir nechta dori bilan create/update to'g'ri saqlanadi, itemssiz PATCH boshqa maydonlarni to'g'ri yangilaydi, noto'g'ri item ma'lumoti 400 (500 emas) beradi, `transaction.atomic()` bilan qisman saqlanish oldi olingan.

## 4-BOSQICH — Testlar

- [x] Har bir app'dagi `tests.py` endi to'ldirilgan — barcha 10 app uchun testlar yozilgan. ✅ Tekshirildi (2026-08-01, `manage.py test` bilan): **barcha 87 ta test o'tadi** (`OK`). 2026-07-28'da 2 tasi (`billing.test_patient_cannot_list_invoice`, `payments.test_non_admin_cannot_list_payments`) 9-bosqichdagi ataylab qilingan ruxsat o'zgarishi tufayli FAIL berayotgan edi — endi yangilangan (pastga qarang, `test_patient_can_list_own_invoice_only`/`test_patient_can_list_own_payments_only`).
  - [x] Registratsiya / login oqimi — `users/tests.py` (`role` escalation blokini ham tekshiradi).
  - [x] To'lov oqimi — `payments/tests.py` (Stripe intent yaratish mock bilan, webhook signature tekshiruvi).

### `appointments/tests.py` — `AppointmentViewSetTestCase`

Permission testlari — tugallandi:

- [x] `test_appointment_list`
- [x] `test_permission_dendied_for_anonymous_create`
- [x] `test_anonymous_cannot_retrieve`
- [x] `test_owner_can_retrieve`
- [x] `test_other_patient_cannot_retrieve`
- [x] `test_owner_doctor_can_update`
- [x] `test_admin_can_update_any_appointment`

Shu jarayonda topilib tuzatilgan bug'lar: `permissions.py`даги `SAFE_METHODS` bypass (retrieve hammaga ochiq edi) va `views.py`даги filtrlanmagan `get_queryset()` (istalgan patient hamma appointment'ni ko'ra olardi).

Validatsiya testlari (`serializers.py`) — tugallandi:

- [x] `end_time <= start_time` bo'lsa xato ("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak")
- [x] Bir xil doktorga bir vaqtda ikkinchi appointment — "Doktor bu vaqt band"
- [x] `DoctorSchedule` umuman yo'q kunga appointment — "Doktor bu kun ishlamaydi"
- [x] `DoctorSchedule` ish vaqtidan tashqariga appointment — "Vaqt doktorning ish jadvalidan tashqarida"
- [x] Hammasi to'g'ri bo'lganda appointment muvaffaqiyatli yaratilishi (`201`)

### `billing/tests.py` — `Invoice` va `DoctorPayout`

Permission testlari — tugallandi:

- [x] `test_admin_can_list_invoices`
- [x] `test_patient_can_list_own_invoice_only` (2026-08-01'da `test_patient_cannot_list_invoice`ning o'rniga yangilandi — 9-bosqich ruxsat o'zgarishiga mos)
- [x] `test_owner_patient_can_retrieve_invoice`
- [x] `test_admin_can_list_payouts`
- [x] `test_doctor_cannot_list_payouts`
- [x] `test_owner_doctor_can_retrieve_payout`
- [x] `test_other_doctor_cannot_retrieve_payout`
- [x] `test_admin_can_update_payouts_status`
- [x] `test_owner_doctor_cannot_update_payout`

Rejada bo'lgan, lekin hali yozilmagan (bo'sh qolgan) holatlar:

- [ ] `test_other_patient_cannot_retrieve_invoice` — begona patient invoice'ni `GET` qila olmasligi (`403`)
- [ ] `test_patient_cannot_update_invoice` — hech kim (hatto egasi ham) invoice'ni yangilay olmasligi
- [ ] `test_admin_can_update_invoice` — admin `status`ni `paid`ga o'zgartira olishi
- [x] ~~`test_patient_cannot_list_invoice` FAIL beryapti~~ — ✅ **Tuzatildi va tekshirildi (2026-08-01).** `test_patient_can_list_own_invoice_only`ga almashtirildi: patient endi `200` oladi, va boshqa bemorning invoice'i ro'yxatida chiqmasligi (`len == 1`, faqat o'zinikisi) real so'rov bilan tasdiqlandi.

### `catalog/tests.py` — `Speciality`, `RankType`, `RankPrice`

Permission testlari (`Speciality` uchun) — tugallandi:

- [x] `test_anonymous_can_list_specialities`
- [x] `test_anonymous_cannot_create_specilaty`
- [x] `test_non_admin_create_specilaty`
- [x] `test_admin_can_create_specilatiy`

- [ ] Xuddi shu 4 ta naqsh `RankType` va `RankPrice` uchun ham qo'llanadi (hali yozilmagan, ixtiyoriy)

### `clinics/tests.py` — `MedicalCenter`, `ClinicType`, `Clinic`

Permission testlari — tugallandi:

- [x] `test_anonymous_can_list_medicalcenters`
- [x] `test_anonymous_cannot_create_medicalcenter`
- [x] `test_patient_cannot_create_medicalcenter`
- [x] `test_admin_can_create_medicalcenter`
- [x] `test_anonymous_can_list_clinics`
- [x] `test_anonymous_cannot_create_clinics`
- [x] `test_patient_cannot_create_clinic`
- [x] `test_admin_can_create_clinic`

- [ ] `test_clinic_list_includes_doctors_count` — `ClinicViewSet.get_queryset()`даги `annotate(doctors_count=...)` to'g'ri hisoblanganini tekshirish (hali yozilmagan)

### `doctors/tests.py` — `Doctor`, `DoctorSchedule`

Permission testlari (`Doctor` uchun) — tugallandi:

- [x] `test_anonymous_cannot_list_doctor`
- [x] `test_patient_can_list_doctors`
- [x] `test_anonymous_cannot_retrieve_doctor`
- [x] `test_authenticated_can_retrieve_doctor`
- [x] `test_anonymous_cannot_create_doctor`
- [x] `test_patient_cannot_create_doctor`
- [x] `test_admin_can_create_doctor`
- [x] `test_patient_cannot_delete_doctor`
- [x] `test_admin_can_delete_doctor`
- [x] `test_owner_doctor_can_update`
- [x] `test_other_doctor_cannot_update`
- [x] `test_patient_cannot_update_doctor`
- [x] `test_admin_can_update_any_doctor`

`DoctorSchedule` uchun rejadagi testlar hali yozilmagan:

- [ ] `test_authenticated_can_list_doctor_schedules`
- [ ] `test_doctor_can_create_own_schedule`
- [ ] ⚠️ `test_doctor_cannot_create_schedule_for_other_doctor` — **potentsial bug**: `IsAdminOrOwnerSchedule.has_permission`да `POST` uchun faqat `request.user.role in ('admin','doctor')` tekshiriladi, `has_object_permission` esa `create`da umuman chaqirilmaydi — ya'ni istalgan doktor so'rov tanasida **boshqa doktorning `doctor` ID'sini** yuborib, o'ziga tegishli bo'lmagan schedule yarata olishi mumkin (appointments'dagi `patient` maydoni muammosiga o'xshash IDOR). Test hozirgi (buzuq) xatti-harakatni tasdiqlaydi — keyin `views.py`/`permissions.py`ni appointments'dagidek tuzatish kerak bo'ladi.
- [ ] `test_duplicate_schedule_same_weekday_rejected` — `unique_together=('doctor','weekday')` ikkinchi marta yaratishga urinilganda `400` qaytarishi

### `notifications/tests.py` — `NotificationTemplate`, `NotificationLog`

Permission testlari — tugallandi:

- [x] `test_anonymous_cannot_access_template`
- [x] `test_patient_cannot_create_template`
- [x] `test_admin_can_create_template`
- [x] `test_admin_can_delete_template`
- [x] `test_anonymous_cannot_access_log`
- [x] `test_patient_cannot_retrieve_log` — log egasi bo'lsa ham (`IsAdmin`da owner-check yo'qligi sababli) ko'ra olmasligini tasdiqlaydi
- [x] `test_admin_can_list_log`
- [x] `test_admin_can_create_log`

### `patients/tests.py` — `Patient`

Permission testlari — tugallandi (10/10, barchasi ✅ o'tdi):

- [x] `test_admin_or_doctor_can_list_patient` — `list` uchun `IsAdminOrDoctor`
- [x] `test_patient_cannot_list_patients` — oddiy patient `list`ga kira olmaydi (`403`)
- [x] `test_anonymous_cannot_retrieve_patient` — ✅ IDOR bug tuzatilgan: anonim endi `401` oladi (avval `200` bo'lib, jiddiy xavfsizlik muammosi edi)
- [x] `test_other_patient_cannot_retrieve_patient` — ✅ tuzatilgan: begona patient endi `404` oladi (avval `200`)
- [x] `test_owner_can_retrieve_own_patient` — egasi o'zinikini ko'radi (`200`)
- [x] `test_owner_ccan_update_own_patient` — egasi o'zinikini yangilaydi (`200`)
- [x] `test_other_patient_cannot_update_patient` — begona patient yangilay olmaydi (`404`)
- [x] `test_non_admin_cannot_create_patient` — faqat `IsAdmin` yarata oladi (`create` action, `403`)
- [x] `test_admin_can_create_patient` — muvaffaqiyatli (`201`)
- [x] `test_doctor_cannot_retrieve_single_patient` — bonus: doktor boshqa patient'ni `retrieve` qila olmaydi (`403`)

### `payments/tests.py` — `Payment`, `PaymentTransaction`, Stripe

Permission va validatsiya testlari — tugallandi (8/8, barchasi ✅ o'tdi):

- [x] `test_patient_can_list_own_payments_only` (2026-08-01'da `test_non_admin_cannot_list_payments`ning o'rniga yangilandi — 9-bosqich ruxsat o'zgarishiga mos)
- [x] `test_admin_can_list_payments` — muvaffaqiyatli
- [x] `test_create_payment_amount_mismatch_rejected` — `serializers.py:31-34` — `amount != invoice.amount` bo'lsa `400`
- [x] `test_create_payment_for_already_paid_invoice_rejected` — `serializers.py:27-28` — invoice `status='paid'` bo'lsa `400`
- [x] `test_create_payment_valid_succeeds` — to'g'ri summa + to'lanmagan invoice — `201`
- [x] `test_create_stripe_intent_for_own_payment` — `CreateStripeIntentView` (`stripe.PaymentIntent.create`ни `@patch('payments.views.stripe.PaymentIntent.create')` bilan mock qilingan) — o'z to'lovi uchun `client_secret` qaytishi tasdiqlandi
- [x] `test_create_stripe_intent_for_other_patient_payment_returns_404` — `views.py:22`даги `patient__user=request.user` filtri to'g'ri ishlayotganini tasdiqlaydi (bu yerda IDOR himoyasi allaqachon to'g'ri yozilgan — regression testi sifatida foydali)
- [x] `test_stripe_webhook_invalid_signature_rejected` — `Stripe-Signature` header yuborilmasa `stripe.Webhook.construct_event` `SignatureVerificationError` chiqarib `400` qaytishi tasdiqlandi
- [x] ~~`test_non_admin_cannot_list_payments` FAIL beryapti~~ — ✅ **Tuzatildi va tekshirildi (2026-08-01).** `test_patient_can_list_own_payments_only`ga almashtirildi: patient endi `200` oladi, va boshqa patientning to'lovi ro'yxatda chiqmasligi (`len == 1`, faqat o'zinikisi) real so'rov bilan tasdiqlandi.

### `prescriptions/tests.py` — `Prescription`, `PrescriptionItem`

Tugallandi (7/7, barchasi ✅ o'tdi — tasdiqlandi 2026-07-28, `manage.py test`):

- [x] `test_owner_doctor_can_create_prescription_with_items` — `serializers.py:22-36`даги custom `create()` — bir nechta dori bilan yaratish
- [x] `test_prescription_list_filtered_to_own_patient` — patient faqat o'ziga tegishli retseptlarni ko'radi (`views.py:18-19`)
- [x] `test_prescription_list_filtered_to_own_doctor` — doktor faqat o'zi yozgan retseptlarni ko'radi (`views.py:20-21`)
- [x] `test_other_doctor_cannot_retrieve_prescription` — `403`
- [x] `test_patient_cannot_update_prescription` — `permissions.py:12`даги non-safe tekshiruv faqat doktor/adminga ruxsat beradi, patient (hatto egasi bo'lsa ham) yoza olmaydi
- [x] `test_update_with_invalid_item_data_returns_400_not_500` — 3-bosqichda tuzatilgan bug uchun regression testi (`serializers.py:39-59`)
- [x] `test_update_replaces_items_when_items_provided` — eski itemlar o'chirilib, yangilari yozilishi
- [x] `test_update_without_items_keeps_existing_items` — `items` yuborilmasa mavjudlari saqlanib qolishi

### `users/tests.py` — Registratsiya, `UserListView`, `DashboardView`

Tugallandi (7/7, barchasi ✅ o'tdi — tasdiqlandi 2026-07-28, `manage.py test`):

- [x] `test_register_creates_patient_role_regardless_of_payload` — `role: "admin"` yuborilsa ham DB'da `role='patient'` bo'lib qolishi (1-bosqichdagi tuzatish uchun regression testi)
- [x] `test_register_rejects_weak_password` — `"12345"` kabi zaif parol `400`
- [x] `test_register_response_does_not_include_password` — javobda `password` maydoni chiqmasligi
- [x] `test_non_admin_cannot_list_users` — `UserListView` — `403`
- [x] `test_admin_can_list_users` — muvaffaqiyatli
- [x] `test_non_admin_cannot_access_dashboard` — `DashboardView` — `403`
- [x] `test_admin_can_access_dashboard` — statistikalar to'g'ri qaytishi

## 5-BOSQICH — Infratuzilma / deploy

- [ ] **`ALLOWED_HOSTS = []`** — production domenini/IP'ni qo'shish (`DEBUG=False` bo'lganda bu bo'sh bo'lsa hamma so'rov `DisallowedHost` xatosi beradi). Hozircha `DEBUG=True` bo'lgani uchun ta'siri yo'q — haqiqiy domen aniq bo'lgach qo'shiladi.
- [x] SQLite'dan PostgreSQL'ga o'tish — ✅ Tekshirildi (2026-08-01): `DATABASES` allaqachon Postgres'ga sozlangan (`config/settings.py`, `os.environ.get(...)` orqali `.env`dan), `psycopg2-binary` o'rnatilgan. `manage.py check --database default` xatosiz, `manage.py showmigrations` — barcha app'lar uchun barcha migratsiyalar qo'llangan holatda real Postgres'ga ulanib tasdiqlandi.
- [x] `requiremets.txt` fayl nomini `requirements.txt`ga to'g'irlash (ko'p hosting platformalari aynan shu nomni qidiradi). ✅ Bajarildi (2-bosqichda tasodifan). UTF-16 kodировкани UTF-8'ga o'tkazish ham ✅ bajarildi va tekshirildi (2026-08-01) — fayl endi ASCII/UTF-8, `pip install -r requirements.txt` (Docker build ichida) muvaffaqiyatli o'tdi.
- [x] **Dockerfile va docker-compose.yml — to'liq tuzatildi va amaliy sinovdan o'tkazildi (2026-08-01):**
  - `Dockerfile` — `CMD`даги `manag.py` yozuv xatosi `manage.py`ga to'g'irlandi (avval `docker run` konteynerni darhol qulatardi).
  - `docker-compose.yml` — bir nechta muammo tuzatildi: `db` volume yo'lidagi typo (`/var/lib.postgresql/data` → to'g'ri yo'l), `web` xizmatiga `depends_on: db` qo'shildi, `web` volume mount'i Dockerfile'dagi `WORKDIR /app` bilan mos qilib (`.:/app`) to'g'irlandi, `web`ga `environment: DB_HOST=db` qo'shildi (`.env`dagi `DB_HOST=localhost` faqat lokal/venv ishga tushirish uchun to'g'ri, Docker tarmog'ida `db` xizmat nomi kerak), `postgres:latest` → `postgres:18` (lokal Postgres 18.3 bilan mos), va Postgres 18+ image'ining yangi talabi bo'yicha volume mount `/var/lib/postgresql/data` → `/var/lib/postgresql`ga o'zgartirildi (18+ image endi to'g'ridan-to'g'ri `.../data` mount'ini qo'llab-quvvatlamaydi — bo'sh volume bilan ham sinab tasdiqlandi).
  - ✅ **Amaliy sinov (2026-08-01)**: `docker compose up -d --build` — `db` (`PostgreSQL 18.4 ... ready to accept connections`) va `web` (`Starting development server at http://0.0.0.0:8000/`, `OperationalError` yo'q) ikkalasi ham sog'lom ishga tushdi, `curl http://localhost:8000/` → `200 OK`. `docker compose down` bilan tozalandi.
- [ ] Statik fayllarni production'da xizmat qilish sozlamasi (`STATIC_ROOT`, masalan whitenoise).
- [ ] `LOGGING` konfiguratsiyasini qo'shish (production'da xatolarni kuzatish uchun).
- [ ] `notifications` (Infobip SMS) app'ining haqiqatda ishlashini tekshirish.
- [x] **CI (`.github/workflows/django-ci.yml`)** — ✅ Tekshirildi (2026-08-01): Postgres 16 service container, kerakli secret/env'lar to'g'ri sozlangan, `manage.py test` ishga tushadi. Eslatma: bu faqat **CI** (test) — build/push/deploy (**CD**) bosqichi hali yo'q.

## 6-BOSQICH — KRITIK: Login/autentifikatsiya nosozligi (2026-07-13 audit)

- [x] **Frontend "Email" maydoni aslida `username` yuboradi** — `clinichub_fronted/src/pages/Login.jsx` (label `t('auth.email')` + mail ikonka, lekin state `username`, backendga `{username, password}` yuboriladi). Backend `USERNAME_FIELD` — `email` emas, `username`. Foydalanuvchi pochta manzilini kiritsa, har qanday rol (patient/doctor/admin) uchun 401 qaytadi — **rolga bog'liq emas**, umumiy field-mismatch. Real repro bilan tasdiqlangan: `username` bilan → 200, xuddi shu account `email` bilan → 401 "No active account found". ✅ **Faqat frontend'da tuzatildi** (backend o'zgarmadi — backend username bilan to'g'ri ishlagan): label/placeholder/ikonka `t('auth.username')`ga o'zgartirildi (`Mail`→`User` ikonka), `auth.error` tarjimasi ham "email" so'zisiz qayta yozildi (uz/ru).
- [x] **Login.jsx'dagi `catch` bloki real xatoni yashiradi** — 401, CORS bloklanishi va 429 (throttle) barchasi bitta umumiy "login yoki parol xato" xabarida chiqadi. ✅ Tuzatildi: `catch (err)` backend javobidagi `err.response?.data?.detail`ni ko'rsatadi, topilmasa umumiy xabarga qaytadi.
- [ ] **"Doctor" roli uchun ishlaydigan yaratish oqimi yo'q** — ⚠️ **Bu backend tarafda** (`doctors`/`users` app'lardagi model/serializer/signal logikasi), frontend fix'i emas. — DB'dagi `role='doctor'` foydalanuvchilarning (`Rashid`, `test_doctor`) `doctors_doctor` jadvalida mos yozuvi yo'q (qo'lda yaratilgan). Hech qanday signal/serializer `User.role`ni `'doctor'`ga o'zgartirmaydi. Doctor yaratilganda tegishli User'ning role'i ham to'g'irlanishi yoki admin-panel orqali Doctor+User bitta oqimda yaratilishi kerak.

## 7-BOSQICH — Audit'da topilgan qo'shimcha nosozliklar

- [ ] **`django-cors-headers` `requirements.txt`da yo'q** — venv'da o'rnatilgan va `INSTALLED_APPS`/`MIDDLEWARE`da ishlatiladi, lekin requirements.txt'da qatori yo'q. Toza serverda `pip install -r requirements.txt` qilinsa `ModuleNotFoundError: corsheaders` bilan ishga tushmaydi.
- [ ] **`STRIPE_WEBHOOK_SECRET` sozlamada umuman mavjud emas** (na `.env`, na `settings.py`) — `payments/views.py`da `settings.STRIPE_WEBHOOK_SECRET` `try/except`dan tashqarida chaqiriladi. Hozir real Stripe webhook kelsa 400 emas, `AttributeError` bilan qulaydi. 2-bosqichdagi "keyinga qoldirilgan" bandi shunchaki sozlanmagan emas — hozir ishlab tursa serverni buzadi.
- [ ] **Superuser (`createsuperuser`) roli bo'sh string bo'lib qoladi** — `User.role`da `default` yo'q, shuning uchun Django admin-panel orqali yaratilgan superuser custom `IsAdmin`/rolga asoslangan permission'lardan o'tolmaydi (Django admin va API "admin" tushunchasi hozircha ikki xil narsa).

## 8-BOSQICH — Guide bilan funksional parity (ixtiyoriy, "100% mahsulot" uchun)

Telecare Plus qo'llanmasi (`TELECARE_TENANT_GUIDE.md`) bilan solishtirilganda backendda hech qanday model/app topilmagan funksiyalar:

- [ ] **Organization / Tenant modeli** — multi-klinika ajratish yo'q (bitta instance = bitta klinika guruhi).
- [ ] **Coupons** — model/app yo'q.
- [ ] **Banners** — model/app yo'q.
- [ ] **Insurance Claims / NPHIES** — bir marta qo'shilib keyin butunlay o'chirilgan (`billing/migrations/0004_delete_insuranceclaim.py`), qayta qurish kerak bo'lsa noldan.
- [ ] **Provider Settings** (doktor uchun IBAN/bank/revenue-share/avtomatik payout) — hech qayerda yo'q.
- [ ] **Forgot-password / reset-password** — backendda faqat JWT login/refresh bor, email orqali parol tiklash endpoint'lari yo'q.
- [ ] **Payouts to'liq holat-mashinasi** — hozir faqat `pending`/`paid`; guide'dagi Draft→Processing→Completed/Failed/Cancelled + Execute/Export Excel yo'q.
- [ ] Frontend tomonda mos keladigan: Select Organization, Apps/Integrations, Messages (SMS/email/WhatsApp shablonlari) sahifalari — hozircha route/stub darajasida ham yo'q.

## 9-BOSQICH — Bemorlar uchun veb-portal (mobil ilova emas, sayt)

Hozirgi `clinichub_fronted` — faqat **tenant admin dashboard** (klinika xodimlari uchun). Bemorlar uchun alohida, mustaqil **veb-sayt** (React/Vite, admin panel'dan alohida loyiha/papka) qilinadi — mobil ilova emas.

### ⏭️ Keyingi navbatdagi ishlar (2026-07-28 holatiga ko'ra, ustuvorlik tartibida)

1. ✅ ~~`POST`/`PATCH /patients/patient/me/`~~ — **Bajarildi va tekshirildi (2026-07-28).**
2. ✅ ~~Appointment `create` — `patient` maydonini avtomatik biriktirish~~ — **Bajarildi va tekshirildi (2026-07-28).**
3. ✅ ~~`GET /me/` (`users` app, rol qaytaruvchi)~~ — **Bajarildi va tekshirildi (2026-07-28).** Barcha 3 ta BLOKER band yopildi — patient-portal endi ro'yxatdan o'tish→profil→booking→to'lov zanjiri bo'yicha to'liq ishlashi kerak.
4. ✅ ~~**Rating yaratish cheklovi** (IDOR)~~ — **Bajarildi va tekshirildi (2026-08-01).** Pastga qarang.
5. ✅ ~~**2 ta eski unit test'ni yangilash**~~ — **Bajarildi va tekshirildi (2026-08-01).** `billing.test_patient_can_list_own_invoice_only` va `payments.test_patient_can_list_own_payments_only` — barcha 87 test `OK`.
6. *(ixtiyoriy, keyinroq)* **Bildirishnomalar** — `notifications` app tayyor turibdi, lekin hech narsa uni chaqirmaydi va patient-portalda ko'rsatilmaydi.

### Backend (mavjud `clinichub` loyihasiga qo'shimcha/tuzatish)

- [x] **Patient self-registratsiya — `me` action to'liq tuzatildi (2026-07-28).** `users/serializers.py`даги `RegisterSerializers` faqat `User` yaratadi (`role='patient'`), lekin `patients/views.py`даги `PatientViewSet.me` orqali endi bemor o'zi darhol Patient profilini yaratadi.
  - [x] `GET /patients/patient/me/` — ✅ Tekshirildi: `200`, o'zining `Patient`ini qaytaradi (profil bo'lmasa `400`).
  - [x] `POST /patients/patient/me/` — ✅ Tekshirildi (2026-07-28, real so'rov bilan): yangi profil `201` bilan yaratiladi, ikkinchi marta urinilsa `400` "allaqachon mavjud". **Yo'lda 1 ta bug topilib tuzatildi:** birinchi versiyada `PatientSerializers`даги `fields='__all__'` tufayli `user` maydoni majburiy/yozib bo'ladigan bo'lib qolgan edi — client `user` yubormasa (haqiqiy frontend holati) `400 "user maydoni to'ldirilishi shart"`, yuborsa esa DRF'ning o'z unique-tekshiruvi ishga tushib chalkash xato berardi. Tuzatish: `serializer.fields.pop('user', None)` — `is_valid()`dan oldin, so'ng `serializer.save(user=request.user)` bilan majburlash.
  - [x] `PATCH /patients/patient/me/` — ✅ Tekshirildi: `address` kabi maydonlarni yangilaydi, `user`ni boshqa foydalanuvchiga o'zgartirishga urinish e'tiborsiz qoldiriladi.
  - [x] **IDOR himoyasi tasdiqlandi** — POST/PATCH'да so'rov tanasida `"user": <boshqa_patient_id>` yuborib ko'rildi — ikkala holatda ham haqiqiy egasi so'rov yuborgan userning o'zi bo'lib qoldi (client yuborgan qiymat e'tiborsiz qoldirildi).
  - [x] `IsAdminOrOwnerPatient`даги eski IDOR bug'i — ✅ **Tekshirildi (2026-08-02): bug topilmadi, allaqachon tuzatilgan edi** (`8beac3` commitida). `has_permission()`да `SAFE_METHODS` uchun hech qanday bypass yo'q (har doim `is_authenticated` talab qiladi), `get_queryset()` non-admin/doctor uchun `Patient.objects.filter(user=user)`ga cheklaydi. `python manage.py test patients` — 10/10 test o'tdi (`test_anonymous_cannot_retrieve_patient` → 401, `test_other_patient_cannot_retrieve_patient` → 404, `test_doctor_cannot_retrieve_single_patient` → 403).
  - `patients` app testlari (10/10) regressiyasiz o'tdi (2026-07-28).
- [ ] **Doktor/klinika ro'yxatini ochiq ko'rish qarori** — `doctors/views.py`даги `DoctorViewSet`да `list`/`retrieve` uchun `IsAuthenticated()` talab qilinadi (login qilmasdan doktor qidirib bo'lmaydi). Qaror kerak: patientlar ro'yxatdan o'tishdan oldin doktor/narx/klinikalarni ko'ra olishi kerakmi (marketing uchun foydali) yoki faqat login qilgandan keyin ko'rinsinmi. `catalog`/`clinics` app'lari (`IsAdminOrReadOnly`) allaqachon anonim `GET`ga ochiq — shunga moslashtirish mumkin.
- [x] **Appointment yaratishda `patient` maydoni** — ✅ **Tuzatildi va tekshirildi (2026-07-28).** `AppointmentViewSet.create()` override qilindi: patient roli uchun `patient` maydoni serializer'dan olib tashlanadi (`serializer.fields.pop('patient', None)`) va `request.user.patient` bilan majburlanadi; admin/doktor uchun eski xatti-harakat (client `patient`ni o'zi yuboradi) saqlanib qoldi. Yo'lda 2 ta bug topilib tuzatildi: (1) `raise_exception=Ture` — yozuv xatosi, `NameError` bilan `500` berardi; (2) `is_valid()`/`save()`/`return` qatorlari dastlab faqat `if role=='patient'` bloki ichida edi — natijada admin/doktor uchun funksiya `None` qaytarib, `AssertionError` berardi (admin panel orqali appointment yaratish butunlay buzilgan edi). ✅ Tekshirildi (real so'rov bilan, to'liq `DoctorSchedule` bilan): patient `patient`siz booking qiladi (`201`, to'g'ri egasi bilan), `patient=<boshqa_id>` IDOR urinishi e'tiborsiz qoldiriladi (baribir o'ziniki saqlanadi), admin `patient`ni ochiq yuborib booking qiladi (`201`, buzilmagan), profilsiz patient booking qilsa toza `400` (`500` emas). `appointments` app testlari (12/12) regressiyasiz o'tdi.
- [x] **"Faqat o'zinikini ko'rish" auditi** — Appointment/Prescription/Invoice/Rating viewset'larida patient roli uchun queryset `request.user`ga filtrlanganini (`get_queryset()`) tasdiqlash. ✅ Tekshirildi (2026-07-25, real so'rov bilan): `Appointment` va `Prescription` to'g'ri filtrlangan. `Invoice` va `Payment` ham to'g'ri filtrlangan (2026-07-28). `Rating` ham endi to'g'ri filtrlangan (2026-08-01, pastga qarang) — audit to'liq yopildi.
- [x] **Rating yaratish cheklovi** — ✅ **Tuzatildi va tekshirildi (2026-08-01, real so'rov bilan).** `RatingSerializers`ga (`appointments/serializers.py`) `validate()` qo'shildi: patient faqat o'zi borgan (`appointment.patient_id == request.user.patient.id`) va yakunlangan (`status='completed'`) appointment uchun baho qoldira oladi; `Meta.read_only_fields = ['patient', 'doctor']` — bu ikkalasi client'dan hech qachon qabul qilinmaydi, `RatingViewSet.create()`да (`appointments/views.py`) `appointment.patient`/`appointment.doctor`dan majburan olinadi. `RatingViewSet`ga `get_queryset()` ham qo'shildi (`Appointment`dagi kabi naqsh) — patient faqat o'zi yozgan, doktor faqat o'zi haqidagi sharhlarni ko'radi, admin — hammasini.
  - Yo'lda birinchi versiyada 4 ta bug topilib tuzatildi: `read_only_fields`даги `'patients'` yozuv xatosi (`patient` maydonini himoyasiz qoldirgan edi — PATCH orqali boshqa bemorga rating'ni "o'tkazib yuborish" mumkin bo'lardi), `validate()` parametri `atrrs` deb yozilgan bo'lsa-da funksiya oxirida `attrs` qaytarilgan (`NameError`, **har qanday, hatto to'g'ri so'rovda ham** crash berardi), `patient_id` aniqlanmagan o'zgaruvchi ishlatilgan (to'g'risi `patient.id`), va indentatsiya xatosi tufayli admin uchun `validate()` `None` qaytarardi.
  - ✅ Real so'rov bilan tekshirildi (fixture yaratib, JWT bilan): egasi o'z yakunlangan tashrifiga baho qo'yadi (`201`), ikkinchi marta urinsa (`400` "allaqachon mavjud"), begona bemor boshqasining tashrifiga baho qo'ymoqchi bo'lsa (`400` "Bu tashrifga baho qo'yish huquqingiz yo'q"), yakunlanmagan (`pending`) tashrifga baho qo'ymoqchi bo'lsa (`400`), soxta `patient`/`doctor` ID yuborilsa e'tiborsiz qoldiriladi, `GET /rating/` har bir patient faqat o'zinikini ko'radi, PATCH orqali `patient`ni boshqasiga o'tkazishga urinish e'tiborsiz qoldiriladi.
  - ⚠️ Kichik imlo xatosi qoldi (funksional emas): xato xabarida `"...baho qoldirish mumkun"` → to'g'risi `"mumkin"`.
- [x] **To'lov (Stripe) patient oqimi** — ✅ **Tuzatildi va tekshirildi (2026-07-28, real so'rov bilan, Django test client orqali) — patient uchun endi to'liq ishlaydi:**
  - `billing/views.py`даги `InvoiceViewSet` — `get_queryset()` qo'shildi (non-admin uchun `patient__user=request.user`), `get_permissions()`даги `list` endi admin-only emas (`IsAdminOrOwnerInvoice`). ✅ `GET /billing/invoice/` patient uchun `200`, faqat o'zinikini qaytaradi.
  - `payments/views.py`даги `PaymentViewSet` — class-darajasidagi `permission_classes = [IsAuthenticated, IsAdmin]` olib tashlandi, `get_permissions()` (`list`/`create`/`retrieve` → `IsAuthenticated`, qolgani → `IsAdmin`) va `get_queryset()` (non-admin uchun `patient__user=request.user`) qo'shildi. ✅ `POST /payments/payment/` o'z invoice'i uchun `201`.
  - `payments/serializers.py`даги `PaymentSerializer.validate()`га IDOR himoyasi qo'shildi — `request.user.role != 'admin'` bo'lsa, `invoice.patient.user`/`patient.user` so'rov yuborgan userga teng emasligini tekshiradi. ✅ Boshqa patientning invoice/patient ID'si bilan yuborilgan so'rov `400 "Bu invoice sizga tegishli emas"` bilan rad etiladi (3 xil variant sinaldi: begona invoice+patient, faqat begona invoice, faqat begona patient — barchasi bloklandi).
  - `CreateStripeIntentView` (`payments/views.py:17-31`) — o'zgarishsiz, allaqachon to'g'ri edi (`patient__user=request.user`), endi yuqoridagilar tufayli haqiqatda ishlatib ko'rish mumkin bo'ldi.
  - ✅ 2 ta eski unit test (`billing`/`payments`) yangilandi va tekshirildi (2026-08-01) — 4-bosqichdagi tegishli bo'limlarga qarang.
  - `patient-portal/src/pages/Payments.jsx` — invoice ro'yxati, to'lov yaratish endi ishlaydi. Stripe Card orqali tasdiqlash (`@stripe/stripe-js`) uchun hali ham `VITE_STRIPE_PUBLISHABLE_KEY` (`.env`) va `STRIPE_WEBHOOK_SECRET` (2-bosqich, "keyinga qoldirilgan") kerak bo'ladi — bular sozlanmaguncha karta orqali real to'lovni oxirigacha sinab bo'lmaydi.
- [x] **`GET /me/` endpoint** — ✅ **Qo'shildi va tekshirildi (2026-07-28).** `users/views.py`га `MeView(APIView, permission_classes=[IsAuthenticated])` qo'shildi, `users/urls.py`да `path('me/', MeView.as_view())`. `{id, username, role}` qaytaradi. Yo'lda 1 ta bug topilib tuzatildi: birinchi versiyada `request.user_id` yozilgan edi (`request.user.id` o'rniga) — bu atribut umuman mavjud emas, har qanday login qilgan foydalanuvchi uchun `500 AttributeError` berardi. ✅ Tekshirildi (real so'rov bilan): patient/doctor/admin uchun `200` va to'g'ri `role`, anonim uchun `401`. `users` app testlari (7/7) regressiyasiz o'tdi. Endi `patient-portal/src/context/AuthContext.jsx`даги admin/doctor'ni patient-portaldan avtomatik chiqarib yuborish himoyasi ishlaydi.
- [ ] **Forgot-password / reset-password** — 8-bosqichda admin panel uchun ham flag qilingan, patient portal uchun ham zarur (email orqali parol tiklash endpoint'i hali yo'q).
- [ ] **Bildirishnomalar** — `notifications` (Infobip SMS) va/yoki email: ro'yxatdan o'tish tasdig'i, appointment eslatmasi, "doktor band qildi/bekor qildi" xabarlari patient uchun ham ishga tushirilishi kerak. `notifications` app (model + Infobip SMS kodi) allaqachon tayyor, lekin hech qanday signal uni chaqirmaydi va patient-portalda ko'rsatuvchi sahifa yo'q.
- [x] **CORS** — `localhost:5174` (`patient-portal`) `config/settings.py`даги `CORS_ALLOWED_ORIGINS`ga qo'shildi va tekshirildi (login endi ishlayapti).

### Frontend (yangi, mustaqil loyiha — admin panel kodidan alohida)

- [x] Yangi papka — `clinichub_fronted/patient-portal/` (alohida repo emas, admin panel bilan bitta repo ichida qo'shni papka bo'lishga qaror qilindi). React + Vite + Tailwind, admin panel bilan bir xil stack, `dev` porti `5174` (admin `5173` bilan to'qnashmasin uchun).
- [ ] **Login / Register** — asosiy oqim tayyor (`patient-portal/src/pages/Login.jsx`, `Register.jsx`; Register'da rol tanlash yo'q, doim `patient`). "Parolni unutdim" oqimi hali yo'q (backendda ham yo'q, 8-bosqichga bog'liq).
- [x] **Bosh sahifa** — tayyor (`patient-portal/src/pages/Home.jsx`): ism bo'yicha qidiruv, mutaxassislik/klinika filtri.
- [ ] **Doktor profili** — tayyor (`patient-portal/src/pages/DoctorProfile.jsx`): narx (`rank_price`) va haftalik ish jadvali ko'rsatiladi. **Aniq bo'sh slot hisoblash yo'q** — patient istalgan sana/vaqtni tanlaydi, band/ish vaqtidan tashqari bo'lsa backend validatsiyasi (`AppointmentSerializers.validate()`) xato qaytaradi. Soddalashtirilgan yechim, keyin kerak bo'lsa slot-calc qo'shiladi.
- [x] **Appointment (tashrif) band qilish** — tayyor, xuddi shu sahifada (`DoctorProfile.jsx` → `handleBook`). ✅ **Endi ishlaydi (2026-07-28)** — backend `create()` tuzatilgach real so'rov bilan tasdiqlandi.
- [x] **"Mening tashriflarim"** — ro'yxat + bekor qilish + **qayta rejalashtirish** tayyor (`patient-portal/src/pages/MyAppointments.jsx`). Qayta rejalashtirish sana/vaqt tanlab, `PATCH start_time`/`end_time` yuboradi — bu allaqachon ishlaydi (`IsAdminOrOwnerAppointments` patientning o'z appointment'ini yangilashiga ruxsat beradi), backend bloker yo'q.
- [x] **Retseptlar** — tayyor (`patient-portal/src/pages/Prescriptions.jsx`): `GET /prescriptions/prescription/` orqali o'z retseptlari + dorilar ro'yxatini ko'rsatadi. Real so'rov bilan tekshirildi — patient uchun to'g'ri filtrlangan, backend bloker yo'q. **Laboratoriya buyurtmalari** backendda mos model yo'qligi sababli qo'shilmadi (kerak bo'lsa yangi model/app kerak bo'ladi).
- [x] **To'lov sahifasi** — kod tayyor (`patient-portal/src/pages/Payments.jsx`, Stripe Card orqali; `@stripe/stripe-js` + `@stripe/react-stripe-js` qo'shildi, `VITE_STRIPE_PUBLISHABLE_KEY` `.env`ga kerak — `.env.example`га qarang). ✅ **Endi ishlaydi (2026-07-28)** — backend bo'limidagi Invoice/Payment permission tuzatishlari qo'llangach, invoice ro'yxati va to'lov yaratish real so'rov bilan tasdiqlandi. Karta orqali to'liq to'lovni tugatish uchun hali `VITE_STRIPE_PUBLISHABLE_KEY` va `STRIPE_WEBHOOK_SECRET` sozlanishi kerak.
- [x] **Reyting/sharh qoldirish** — tayyor (`patient-portal/src/pages/Reviews.jsx`): tugallangan, hali baholanmagan tashriflar ro'yxati + yulduzcha/izoh formasi, va patientning o'z sharhlari ro'yxati. ✅ Backend `/appointments/rating/` endi ham to'g'ri filtrlangan (2026-08-01, yuqoridagi "Rating yaratish cheklovi" bandiga qarang) — frontenddagi qo'lda filtrlash endi ortiqcha, lekin zararsiz.
- [x] **Profil** — tayyor (`patient-portal/src/pages/Profile.jsx`): ism/jins/tug'ilgan sana/telefon/JSHSHIR/manzil ko'rish va tahrirlash. ✅ **Endi to'liq ishlaydi (2026-07-28)** — ko'rish, yaratish va tahrirlash (`GET`/`POST`/`PATCH /patients/patient/me/`) barchasi real so'rov bilan tekshirildi.
- [x] Auth: admin/doctor hisobi bilan kirilsa, patient portalga ruxsat berilmasin — frontend tayyor (`App.jsx`даги `Protected`, `AuthContext.jsx`). ✅ **Endi ishlaydi (2026-07-28)** — `GET /me/` (`users` app) qo'shilgach real so'rov bilan tasdiqlandi.
- [x] Responsive dizayn — grid/flex Tailwind bilan mobil ekranga moslashtirilgan (asosiy sahifalarda tekshirildi).

## 10-BOSQICH — Doktorlar uchun portal

`clinichub_fronted/doctor-portal/` — bemorlar portali (`patient-portal/`) bilan bir xil stack (React + Vite + Tailwind + lucide-react + axios + react-router), admin panel/patient-portal kodidan alohida, `dev` porti `5175` (admin `5173`, patient-portal `5174` bilan to'qnashmasin uchun). Doktorlar admin tomonidan yaratiladi (6-bosqichga qarang), shuning uchun Register sahifasi yo'q — faqat Login.

- [x] **Loyiha skeleti** — `package.json`, `vite.config.js`, `index.html`, `eslint.config.js`, Tailwind. Stripe/recharts kiritilmadi (kerak emas).
- [x] **Umumiy infratuzilma** — `api/axios.js` (`fetchAll` pagination helper), `AuthContext.jsx` (`/me/` orqali rol, so'ng — backendda `/doctors/doctor/me/` action yo'qligi sababli — `/doctors/doctor/` ro'yxatidan `user`ga qarab o'z `Doctor` yozuvini topib, kontekstda saqlaydi), `LangContext.jsx`, `i18n/translations.js` (uz/ru), `Layout.jsx`/`Sidebar.jsx` (teal rang sxemasi, patient-portal indigo'sidan farqlash uchun).
- [x] **Login** — doktor-only gate, boshqa rol bilan kirilsa avtomatik chiqariladi (`App.jsx`даги `Protected`, patient-portal bilan bir xil naqsh).
- [x] **Bosh sahifa (Dashboard)** — statistik kartalar (bugungi tashriflar, kutilayotgan, shu oy yakunlangan, jami bemorlar) + bugungi jadval ro'yxati.
- [x] **Tashriflar** — `/appointments/appointment/` (backend allaqachon `doctor__user=request.user`ga filtrlangan), status bo'yicha filtr, tasdiqlash/yakunlash/bekor qilish tugmalari (`PATCH status`).
- [x] **Bemorlar** — alohida "mening bemorlarim" endpoint yo'qligi sababli, o'z tashriflaridan noyob bemorlar ro'yxati mijoz tomonida hisoblanadi (`/patients/patient/` orqali to'liq ma'lumot bilan boyitiladi — `IsAdminOrDoctor` doktorga to'liq ro'yxatni ko'rishga ruxsat beradi).
- [x] **Retseptlar** — ro'yxat (`doctor__user=request.user`ga filtrlangan) + yakunlangan, hali retseptsiz tashriflar uchun yangi retsept yozish formasi (tashxis + bir nechta dori, `POST /prescriptions/prescription/`).
- [x] **Ish jadvali** — `DoctorSchedule` uchun to'liq CRUD (hafta kuni bo'yicha boshlanish/tugash vaqti, qo'shish/tahrirlash/o'chirish).
- [x] **Sharhlar** — qabul qilingan baholarni ko'rish (o'rtacha ball + ro'yxat). Backend `RatingViewSet.get_queryset()` (shu kunda tuzatilgan) tufayli allaqachon to'g'ri filtrlangan holda keladi.
- [x] **Profil** — `Doctor` yozuvini tahrirlash (ism, jins, bio, avatar, tajriba, telegram, bank/IBAN). Mutaxassislik/klinika/toifa — faqat ko'rish (admin boshqaradi).
- [x] **Amaliy sinov (2026-08-01)** — Chrome kengaytmasi mavjud bo'lmagani uchun vizual emas, to'liq HTTP darajasida tekshirildi: demo doktor (`doctor_demo`) + 2 bemor + tashriflar + jadval + 1 retsept + 1 sharh bilan real backend'ga (Postgres) ulanib, har bir sahifaning har bir so'rovi (login, `/me/`, o'z `Doctor` yozuvini topish, tashriflar/bemorlar/retseptlar/jadval/sharhlar ro'yxati va filtrlanishi, status o'zgartirish, retsept yozish, profil va jadval tahriri/o'chirish) alohida-alohida `curl` bilan chaqirib tasdiqlandi — barchasi kutilganidek ishladi. `npm run build` va `npx eslint .` xatosiz o'tdi (2 ta "Fast Refresh" ogohlantirishi bundan mustasno — bu patient-portal'da ham bor, konventsiyaga mos).
  - ⚠️ **Vizual/UI sinov hali qilinmadi** — brauzerda haqiqatan ochib, ko'rinishni tasdiqlash kerak. `npm run dev` (`doctor-portal/`) ishga tushirilgan, `http://localhost:5175` da ochiq turibdi.
- [ ] **Bildirishnomalar/eslatmalar** — doktor uchun ham (yangi booking, bekor qilingan tashrif) hali ulanmagan, 9-bosqichdagi bandga bog'liq.
- [ ] **Payouts (to'lovlar tarixi)** — ataylab **qo'shilmadi**: `billing/views.py`даги `DoctorPayoutViewSet.get_permissions()`да `list` action hali ham faqat `IsAdmin()` (`appointments`/`billing` invoice/paymentда bo'lgani kabi patient/doctor uchun ochilmagan) — doktor hozircha o'z to'lovlarini ro'yxat ko'rinishida ko'ra olmaydi (faqat bitta yozuvni ID bilan ochsa ko'radi). Backend tuzatilgach (`Appointment`/`Invoice`/`Payment`даги patient uchun qilingan tuzatishga o'xshash `get_queryset()` + `get_permissions()`) qo'shiladi.

**Demo login ma'lumotlari (faqat lokal test uchun, real Postgres devbazaga yozilgan):** `doctor_demo` / `Demo12345!` (2 ta demo bemor, 5 ta tashrif, 3 kunlik ish jadvali, 2 ta retsept, 1 ta sharh bilan birga).

---

**Ishlash tartibi:** Backend — har bir bandni siz yozasiz, men tekshirib/tasdiqlab boraman (kerak bo'lsa real so'rov yuborib sinab ko'raman). Frontend (`patient-portal`, `doctor-portal`) — men to'g'ridan-to'g'ri yozaman, siz tekshirasiz.
