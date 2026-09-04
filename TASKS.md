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

- [x] **`STRIPE_WEBHOOK_SECRET`ni `config/settings.py` va `.env`ga qo'shish** — ✅ **Tekshirildi (2026-08-02): allaqachon bajarilgan ekan.** `.env`da `STRIPE_WEBHOOK_SECRET` qiymati bor, `config/settings.py:177`да `os.environ.get('STRIPE_WEBHOOK_SECRET')` orqali to'g'ri o'qiladi, `payments/views.py:43`даги `settings.STRIPE_WEBHOOK_SECRET` endi `AttributeError` bermaydi.
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

Rejada bo'lgan holatlar — endi yozilgan va tekshirilgan:

- [x] `test_other_patient_cannot_retrieve_invoice` — begona patient invoice'ni `GET` qila olmasligi. ✅ Tekshirildi (2026-08-04): `get_queryset()` non-admin uchun `patient__user`ga filtrlanganligi sababli natija `403` emas, `404` (obyekt umuman queryset'da yo'q — `test_other_doctor_cannot_retrieve_payout`даги naqsh bilan bir xil).
- [x] `test_patient_cannot_update_invoice` — hech kim (hatto egasi ham) invoice'ni yangilay olmasligi. ✅ Tekshirildi: `IsAdminOrOwnerInvoice.has_object_permission()` non-admin uchun faqat `SAFE_METHODS`ga ruxsat beradi, `PATCH` → `403`.
- [x] `test_admin_can_update_invoice` — admin `status`ni `paid`ga o'zgartira olishi. ✅ Tekshirildi: `200`, `invoice.status == 'paid'`.

`manage.py test billing --keepdb` — 12/12 test o'tdi, to'liq `manage.py test` — 90/90 test o'tdi (regressiyasiz). Kod: foydalanuvchining o'zi yozgan, Claude faqat topib/tekshirib/tasdiqladi.
- [x] ~~`test_patient_cannot_list_invoice` FAIL beryapti~~ — ✅ **Tuzatildi va tekshirildi (2026-08-01).** `test_patient_can_list_own_invoice_only`ga almashtirildi: patient endi `200` oladi, va boshqa bemorning invoice'i ro'yxatida chiqmasligi (`len == 1`, faqat o'zinikisi) real so'rov bilan tasdiqlandi.

### `catalog/tests.py` — `Speciality`, `RankType`, `RankPrice`

Permission testlari (`Speciality` uchun) — tugallandi:

- [x] `test_anonymous_can_list_specialities`
- [x] `test_anonymous_cannot_create_specilaty`
- [x] `test_non_admin_create_specilaty`
- [x] `test_admin_can_create_specilatiy`

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

`DoctorSchedule` uchun bug topilib tuzatilgan:

- [x] ⚠️ ~~`test_doctor_cannot_create_schedule_for_other_doctor` — potentsial bug~~ — ✅ **Tuzatildi va tekshirildi (2026-08-02).** `IsAdminOrOwnerSchedule.has_permission`да `POST` uchun faqat rol tekshirilib, `has_object_permission` `create`da chaqirilmasligi sababli har qanday doktor boshqa doktor nomidan schedule yarata olishi mumkin edi (appointments'dagi `patient` muammosiga o'xshash IDOR). `doctors/views.py`даги `DoctorScheduleViewSet`га `AppointmentViewSet.create()` naqshiga o'xshab `create()` override qo'shildi: `role == 'doctor'` bo'lsa serializer'dan `doctor` maydoni olib tashlanadi va `request.user.doctor`дан majburlanadi, admin uchun eski xatti-harakat (client `doctor`ni ochiq yuboradi) saqlanib qoldi. Real so'rov bilan tasdiqlandi (tranzaksiya rollback qilingan, real Postgres devbazaga yozilmagan): doktor A `doctor: <B ID>` yuborib ko'rdi — `201` qaytdi, lekin saqlangan yozuvda `doctor_id` haqiqatda A'nikiga teng chiqdi (IDOR bloklandi); doktor `doctor`siz o'z jadvalini yaratdi (`201`); admin `doctor`ni ochiq yuborib yaratdi (`201`, buzilmagan); profilsiz doktor urinib ko'rsa toza `400` (`500` emas). `manage.py test doctors` — 13/13 test regressiyasiz o'tdi. Kod: foydalanuvchining o'zi yozgan, Claude faqat topib/tekshirib/tasdiqladi (bir necha yozuv xatosi va indentatsiya bug'i ketma-ket 2 marta topilib, foydalanuvchi tomonidan tuzatildi).

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
- [x] **Statik fayllarni production'da xizmat qilish sozlamasi (whitenoise)** — ✅ **Bajarildi va tekshirildi (2026-08-03).** `requirements.txt`ga `whitenoise==6.12.0` qo'shildi, `config/settings.py`даги `MIDDLEWARE`ga `whitenoise.middleware.WhiteNoiseMiddleware` (`SecurityMiddleware`dan keyin) qo'shildi, `STATIC_ROOT = BASE_DIR / 'staticfiles'` va `STORAGES` (`whitenoise.storage.CompressedManifestStaticFilesStorage`) qo'shildi. Yo'lda 2 ta yozuv xatosi topilib tuzatildi: `MIDDLEWARE`даги qatorlar orasida vergul tushib qolgani (Python ikkita string literalni birlashtirib, `SessionMiddleware`ni ro'yxatdan yo'qotib qo'ygan edi — `manage.py check` `admin.E410` xatosi berardi) va `STORAGES`даги `CompressedManifestStaticFilesStirage` imlo xatosi (`collectstatic` `InvalidStorageError` berardi). ✅ Tekshirildi: `manage.py check` — muammosiz, `DEBUG=False` bilan `collectstatic --noinput` — `192 static files copied, 550 post-processed`, real so'rov bilan `/admin/` (`200`, hash'langan static havolalar bilan) va hash'langan CSS faylning o'zi (`200`, to'liq kontent) `DEBUG=False` holatda tasdiqlandi. Kod: foydalanuvchining o'zi yozgan, Claude faqat topib/tekshirib/tasdiqladi.
- [x] **`LOGGING` konfiguratsiyasini qo'shish** — ✅ **Bajarildi va tekshirildi (2026-08-03).** `config/settings.py`ga `LOGS_DIR = BASE_DIR / 'logs'` (`mkdir(exist_ok=True)` bilan avtomatik yaratiladi), `console` (`StreamHandler`) va `file` (`RotatingFileHandler`, 5MB/5 nusxa) handler'lar, `root` logger (`INFO`) va `django.request` logger (`ERROR`, Django'ning o'z 500 xatolari avtomatik shu orqali o'tadi) qo'shildi. `.gitignore`da `logs`/`*.log` allaqachon bor edi — fayl git'ga tushmaydi. ✅ Tekshirildi: `manage.py check` muammosiz, `logs/django.log` avtomatik yaratildi, qasddan `django.request` va oddiy logger orqali yozib ko'rilganda ikkalasi ham to'g'ri formatda (`vaqt LEVEL logger_nomi xabar`) faylga tushgani tasdiqlandi. Kod: foydalanuvchining o'zi yozgan, Claude faqat topib/tekshirib/tasdiqladi.
- [ ] `notifications` (Infobip SMS) app'ining haqiqatda ishlashini tekshirish.
- [x] **CI (`.github/workflows/django-ci.yml`)** — ✅ Tekshirildi (2026-08-01): Postgres 16 service container, kerakli secret/env'lar to'g'ri sozlangan, `manage.py test` ishga tushadi. Eslatma: bu faqat **CI** (test) — build/push/deploy (**CD**) bosqichi hali yo'q.

## 6-BOSQICH — KRITIK: Login/autentifikatsiya nosozligi (2026-07-13 audit)

- [x] **Frontend "Email" maydoni aslida `username` yuboradi** — `clinichub_fronted/src/pages/Login.jsx` (label `t('auth.email')` + mail ikonka, lekin state `username`, backendga `{username, password}` yuboriladi). Backend `USERNAME_FIELD` — `email` emas, `username`. Foydalanuvchi pochta manzilini kiritsa, har qanday rol (patient/doctor/admin) uchun 401 qaytadi — **rolga bog'liq emas**, umumiy field-mismatch. Real repro bilan tasdiqlangan: `username` bilan → 200, xuddi shu account `email` bilan → 401 "No active account found". ✅ **Faqat frontend'da tuzatildi** (backend o'zgarmadi — backend username bilan to'g'ri ishlagan): label/placeholder/ikonka `t('auth.username')`ga o'zgartirildi (`Mail`→`User` ikonka), `auth.error` tarjimasi ham "email" so'zisiz qayta yozildi (uz/ru).
- [x] **Login.jsx'dagi `catch` bloki real xatoni yashiradi** — 401, CORS bloklanishi va 429 (throttle) barchasi bitta umumiy "login yoki parol xato" xabarida chiqadi. ✅ Tuzatildi: `catch (err)` backend javobidagi `err.response?.data?.detail`ni ko'rsatadi, topilmasa umumiy xabarga qaytadi.
- [x] **"Doctor" roli uchun ishlaydigan yaratish oqimi** — ✅ **Tekshirildi (2026-08-02): allaqachon tuzatilgan ekan.** `doctors/signals.py`даги `sync_user_role_to_doctor` (`post_save` signal, `Doctor` uchun) `Doctor` yozuvi yaratilganda/saqlanganda tegishli `User.role`ni avtomatik `'doctor'`ga o'zgartiradi. Real HTTP so'rov bilan tasdiqlandi: yangi ro'yxatdan o'tgan user (`role='patient'`) uchun `Doctor` yaratilgach, `GET /users/`да uning `role`i `'doctor'`ga aylangani ko'rindi.

## 7-BOSQICH — Audit'da topilgan qo'shimcha nosozliklar

- [x] **`django-cors-headers` `requirements.txt`da** — ✅ **Tekshirildi (2026-08-02): allaqachon bor ekan** (`django-cors-headers==4.9.0`).
- [x] **`STRIPE_WEBHOOK_SECRET` sozlamada** — ✅ 2-bosqichdagi bandga qarang, allaqachon `.env`/`settings.py`да mavjud va to'g'ri ulangan (2026-08-02 tekshirildi).
- [x] **Superuser (`createsuperuser`) roli** — ✅ **Tekshirildi (2026-08-02): allaqachon tuzatilgan ekan.** `users/models.py`даги custom `UserManager.create_superuser()` `extra_fields.setdefault('role', 'admin')` qiladi, shuning uchun `manage.py createsuperuser` orqali yaratilgan akkaunt avtomatik `role='admin'` bilan yaratiladi. Real muhitda ikki marta tasdiqlandi (`qwerty` va vaqtinchalik test admin — ikkalasi ham `role='admin'` bilan yaratildi, admin panelga to'liq kira oldi).

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
- [x] **Doktor/klinika ro'yxatini ochiq qilish** — ✅ **Bajarildi va tekshirildi (2026-08-05).** `doctors/views.py`даги `DoctorViewSet.get_permissions()`да `list`/`retrieve` uchun `IsAuthenticated()` o'rniga `users/permissions.py`даги `IsAdminOrReadOnly` qo'llanadi — `SAFE_METHODS` uchun har doim `True`, `POST`/`PATCH`/`DELETE` faqat admin uchun (o'zgarishsiz). Yo'lda 2 ta eski test (`test_anonymous_cannot_list_doctor`, `test_anonymous_cannot_retrieve_doctor`) yangi (ochiq) xatti-harakatga moslab yangilandi (`test_anonymous_can_list_doctor`/`test_anonymous_can_retrieve_doctor`, `401` o'rniga `200` kutadi) — `billing`/`payments`даги oldingi naqshga o'xshab. ✅ Tekshirildi: `manage.py test doctors --keepdb` — 17/17 `OK`; to'liq `manage.py test --keepdb` — 94 testdan 93 tasi o'tdi, qolgan 1 tasi (`appointments`) bizning o'zgarishimizga aloqasi yo'q — mock qilinmagan real Infobip SMS chaqiruvi tarmoq timeout berdi (alohida, oldindan mavjud muammo, 4-vazifada ko'rib chiqiladi).
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
- [x] **Patient uchun parolsiz autentifikatsiya (SMS OTP) — backend** — ✅ **Bajarildi va tekshirildi (2026-08-05).** `users/models.py`га `OTPCode` (phone_number, code, expires_at, is_used, attempts, `is_valid()`), `users/serializers.py`га `OTPRequestSerializers`/`OTPVerifySerializers` (oddiy `Serializer`, `OTPCode` maydonlarini to'g'ridan-to'g'ri client'ga ochmaydi), `users/views.py`га `RequestOTPView`/`VerifyOTPView`, `users/urls.py`га `otp/request/`/`otp/verify/` qo'shildi. Yo'lda 2 ta bug topilib tuzatildi: `OTPCode.phone_numebr` yozuv xatosi (rename migratsiya bilan to'g'irlandi) va `OTPRequestSerializers`/`OTPVerifySerializers`ning `Meta`siz `ModelSerializer`дан meros olishi (har qanday so'rovda `AssertionError` berardi — `Serializer`ga almashtirildi). ✅ Real so'rov bilan (`transaction.atomic()` + majburiy rollback, real Postgres'ga yozilmagan) to'liq tekshirildi: OTP so'rash → SMS (mock) chaqirildi; darhol qayta so'rash → `429`; noto'g'ri kod → `400`, `attempts` oshdi; to'g'ri kod (yangi raqam) → `200`, JWT qaytdi, `User.has_usable_password() == False` (haqiqatan parolsiz); ishlatilgan kodni qayta ishlatish → `400`; mavjud patient bilan qayta kirish → `is_new_user=False`; muddati o'tgan kod → `400`; bir xil telefon raqamli **doctor** mavjud bo'lganda — doctor akkauntiga tegilmadi, alohida yangi **patient** User yaratildi (rol-aralashuv yo'q, chunki `User.objects.filter(phone_number=..., role='patient')` bilan qidiriladi). `manage.py test users --keepdb` — 7/7 regressiyasiz.
  - [x] Ro'yxatdan o'tish: telefon → OTP → yangi `User` (parolsiz, `role='patient'`) yaratiladi. `Patient` profili alohida qadamda — patient-portal login'dan keyin mavjud `POST /patients/patient/me/`ni chaqiradi (qo'shimcha backend kodi shart emas).
  - [x] Kirish: telefon → OTP → mavjud `User.phone_number`+`role='patient'` topilsa JWT qaytariladi (yangi User yaratilmaydi).
  - [x] OTP saqlash/tekshirish — `OTPCode` modeli: 5 daqiqalik muddat, 5 marta noto'g'ri urinishdan keyin bloklash.
  - [x] Rate-limit — shu telefon raqamiga oxirgi 60 soniyada OTP so'ralgan bo'lsa `429` (cache/Redis yo'qligi sababli DB orqali, loyihaning qolgan qismi bilan izchil).
  - [x] SMS yuborish — mavjud `notifications/services.py`даги `send_sms()` qayta ishlatildi, qo'shimcha xizmat kerak bo'lmadi.
  - [x] Uzoq muddatli refresh token — ✅ alohida ish kerak bo'lmadi, `SIMPLE_JWT` sozlamasida allaqachon `REFRESH_TOKEN_LIFETIME=30 kun` bor edi.
  - [x] Eski username+parol bilan ro'yxatdan o'tgan patientlar bilan moslik — ✅ muammo yo'q: qidiruv `username` emas, `User.phone_number` maydoni bo'yicha (eski `RegisterSerializers`да `phone_number` allaqachon bor edi), alohida migratsiya/moslashtirish kerak bo'lmadi.
- [x] **Bildirishnomalar (SMS, patient + doctor)** — ✅ **Bajarildi va tekshirildi (2026-08-06).** Ko'lam qaror qilindi: faqat SMS (in-app "Bildirishnomalar" sahifasi yo'q), appointment eslatmasi (scheduler/Celery talab qilardi) — keyingi safarga qoldirildi. Ro'yxatdan o'tish tasdig'i alohida SMS sifatida kerak emas — OTP kodining o'zi tasdiqlash vazifasini bajaradi. Yo'lda topilib tuzatilgan **kritik ishonchlilik xatosi**: `notifications/services.py`даги `send_sms()`да `timeout` yo'q edi va `appointments/signals.py`даги chaqiruv `try/except`siz edi — shu sabab 2-band tekshiruvida bitta test 3 daqiqa osilib qolgan edi (Infobip `ReadTimeout`). Tuzatildi: `send_sms()`га `timeout=10` + `try/except` (xato bo'lsa `{'error': ...}` qaytaradi, yiqilmaydi), `appointments/signals.py`даги `_log_and_send()` yana bir qatlam `try/except` bilan — **SMS xatosi endi appointment yaratish/yangilashni hech qachon yiqitmaydi**. Yangi trigger'lar qo'shildi: yangi booking'da endi doktorga ham SMS boradi (avval faqat bemorga edi), status `pending→confirmed`да bemorga, status `→cancelled`да **kim bekor qilganiga qarab** (`cancelled_by`) qarama-qarshi tomonga xabar boradi. Har bir urinish endi `NotificationLog`ga yoziladi (`is_sent` bilan) — model birinchi marta haqiqatan ishlatildi. ✅ Real so'rov bilan (`transaction.atomic()` + majburiy rollback, SMS mock qilingan) 5 stsenariy tasdiqlandi: yangi booking → 2 log (bemor+doktor); SMS `Exception` chiqarsa ham status yangilash qulamadi (`is_sent=False` bilan log yozildi); bemor bekor qilsa → doktorga; doktor bekor qilsa → bemorga; status o'zgarmagan save'da ortiqcha log/SMS yo'q. `manage.py test appointments notifications --keepdb` — 20/20, 23.5s (avval 3 daq. osilardi). To'liq `manage.py test` — **94/94, `OK`**, regressiyasiz (~6 daqiqa — endi ba'zi testlar real Infobip'ga `timeout=10` bilan chiqadi, kelajakda mock qilib tezlashtirish mumkin, bloker emas).
- [x] **CORS** — `localhost:5174` (`patient-portal`) `config/settings.py`даги `CORS_ALLOWED_ORIGINS`ga qo'shildi va tekshirildi (login endi ishlayapti).

### Frontend (yangi, mustaqil loyiha — admin panel kodidan alohida)

- [x] Yangi papka — `clinichub_fronted/patient-portal/` (alohida repo emas, admin panel bilan bitta repo ichida qo'shni papka bo'lishga qaror qilindi). React + Vite + Tailwind, admin panel bilan bir xil stack, `dev` porti `5174` (admin `5173` bilan to'qnashmasin uchun).
- [x] **Login / Register — SMS OTP'ga o'tish** — ✅ **Bajarildi va tekshirildi (2026-08-05).** `Login.jsx` to'liq qayta yozildi: telefon raqami kiritish ekrani (`POST /otp/request/`) → SMS kodni kiritish ekrani (`POST /otp/verify/`) → tasdiqlangach `login(access, refresh)` va `is_new_user`ga qarab yangi patientlar `/profile`ga (profilni to'ldirish uchun), mavjudlar `/`ga (Bosh sahifa) yo'naltiriladi. 60 soniyalik "qayta yuborish" cooldown backenddagi rate-limit bilan mos. `Register.jsx` endi shunchaki `/login`ga yo'naltiradi (alohida forma kerak emas — `otp/verify/` topilmagan raqam uchun o'zi yangi patient yaratadi). `AuthContext.jsx`даги `login()` endi access bilan birga refresh token'ni ham saqlaydi. `translations.js`даги eski username/parol kalitlari OTP kalitlariga almashtirildi (uz/ru). ✅ Tekshirildi: `npx eslint .` — yangi fayllarda 0 xato (faqat oldindan mavjud, aloqasiz 2 ta "Fast Refresh" xatosi qoldi), `npm run build` — muvaffaqiyatli. ⚠️ Vizual/UI sinov hali qilinmadi (brauzer avtomatizatsiyasi yo'q, doctor-portal'dagi kabi).
- [x] **Bosh sahifa** — tayyor (`patient-portal/src/pages/Home.jsx`): ism bo'yicha qidiruv, mutaxassislik/klinika filtri.
- [x] **Doktor profili — bo'sh slot hisoblash** — ✅ **Bajarildi va tekshirildi (2026-08-06).** Arxitektura muammosi topildi va hal qilindi: patient boshqa bemorlarning appointment'larini ko'ra olmasligi kerak (xavfsizlik), lekin shu sabab frontend qaysi soatlar band ekanini bilolmasdi. Yechim — yangi, maxfiylikni buzmaydigan backend endpoint: `GET /appointments/busy-slots/?doctor=<id>&date=YYYY-MM-DD` (`appointments/views.py`даги `DoctorBusySlotsView`, `permission_classes=[AllowAny]` — 1-banddagi "doktor ro'yxati ochiq" qaroriga mos) — faqat `start_time`/`end_time` qaytaradi, bemor ma'lumoti umuman chiqmaydi (`cancelled` appointment'lar chiqarib tashlanadi). ✅ Backend real so'rov bilan (`transaction.atomic()` + majburiy rollback) tekshirildi: parametrsiz/noto'g'ri sana → `400`; to'g'ri so'rov → faqat bekor qilinmagan appointment, bemor maydonisiz; boshqa sana → bo'sh ro'yxat; login qilmasdan ham ishlaydi. `manage.py test appointments --keepdb` — 12/12 regressiyasiz. Frontend (`DoctorProfile.jsx`) to'liq qayta qurildi: vaqt input'i o'rniga **slot-tanlash grid'i** — `DoctorSchedule` (ish jadvali) + `busy-slots` (band vaqtlar) + tanlangan xizmat davomiyligi (`rank_price.duration_min`) asosida har bir slot hisoblanadi va band/o'tib ketgan/bo'sh holatda ko'rsatiladi (band — kulrang chizilgan, bo'sh — bosish mumkin, tanlangan — indigo). Doktor ishlamaydigan kunda ogohlantirish, bo'sh joy qolmaganda alohida xabar. Yo'lda ESLint'ning yangi `react-hooks/set-state-in-effect` qoidasiga moslashtirish kerak bo'ldi — "loading" holatini alohida state sifatida emas, so'rov key'ini solishtirish orqali hisoblab chiqarildi (effect ichida sinxron `setState` chaqiruvi umuman yo'q). ✅ Tekshirildi: `npx eslint .` — `DoctorProfile.jsx`да 0 xato/ogohlantirish (faqat oldindan mavjud, aloqasiz 2 ta "Fast Refresh" xatosi qoldi), `npm run build` — muvaffaqiyatli. ⚠️ Vizual/UI sinov hali qilinmadi (brauzer avtomatizatsiyasi yo'q).
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
- [x] **Bildirishnomalar/eslatmalar** — ✅ **Bajarildi (2026-08-06), 9-bosqichdagi "Bildirishnomalar" bandi bilan birga.** `appointments/signals.py`даги yangilanish tufayli doktor endi ham SMS oladi: yangi booking yaratilganda (avval faqat bemorga edi), va bemor tashrifni bekor qilganda. Batafsili 9-bosqichdagi tegishli bandga qarang.
- [x] **Payouts (to'lovlar tarixi)** — ✅ **Bajarildi va tekshirildi (2026-08-06).** Backend tekshirilganda ushbu eski band'даги taxmin **noto'g'ri chiqdi**: `DoctorPayoutViewSet.get_permissions()`да `list` allaqachon `IsAdmin()`-only emas edi (faqat `create` uchun admin talab qilinadi, `list`/`retrieve` uchun `IsAdminOrOwnerPayout()` — bu esa faqat autentifikatsiyani tekshiradi, `get_queryset()` esa non-admin uchun `doctor__user=request.user`ga allaqachon cheklangan edi) — ya'ni backend allaqachon to'g'ri ishlagan, hech qanday o'zgarish kerak bo'lmadi. ✅ Real so'rov bilan (`transaction.atomic()` + majburiy rollback) tasdiqlandi: doktor `GET /billing/doctorpayout/` — `200`, faqat o'zinikini ko'radi; boshqa doktorning payout'ini ID bilan ochishga urinsa — `404`; `status`ni o'zi o'zgartirishga urinsa — `403`. `manage.py test billing` — regressiyasiz. Faqat **frontend** qismi yetishmayotgan edi — endi qo'shildi: `doctor-portal/src/pages/Payouts.jsx` (jami to'langan/kutilayotgan summalar kartochkalari + ro'yxat, holat belgisi bilan), `Sidebar.jsx`/`App.jsx`ga yo'l va navigatsiya qo'shildi, tarjimalar (uz/ru). ✅ Tekshirildi: `npx eslint .` — 0 xato (faqat oldindan mavjud, aloqasiz 2 ta "Fast Refresh" xatosi qoldi), `npm run build` — muvaffaqiyatli. ⚠️ Vizual/UI sinov hali qilinmadi.

**Demo login ma'lumotlari (faqat lokal test uchun, real Postgres devbazaga yozilgan):** `doctor_demo` / `Demo12345!` (2 ta demo bemor, 5 ta tashrif, 3 kunlik ish jadvali, 2 ta retsept, 1 ta sharh bilan birga).

## Admin panel — 2026-08-02'da topilgan va tuzatilgan bug

- [x] **Pagination'ni noto'g'ri qayta ishlash (dropdown crash)** — ✅ **Topildi va tuzatildi (2026-08-02).** Backend barcha list endpoint'larida global pagination qaytaradi (`{count, next, previous, results}`), lekin quyidagi 8 ta fayl `api.get(...).then(r => setX(r.data))` orqali `r.data`ni to'g'ridan-to'g'ri array deb ishlatib, `.map()` chaqirardi — natijada dropdown'lar ishlamay, sahifa qulardi: `pages/GettingStarted.jsx`, `pages/ClinicCreate.jsx`, `pages/DoctorCreate.jsx`, `pages/DoctorEdit.jsx`, `pages/RankPriceCreate.jsx`, `components/AppointmentCreateModal.jsx`, `components/ClinicEditModal.jsx`, `components/RankPriceEditModal.jsx`. Hammasi loyihada allaqachon mavjud bo'lgan `fetchAll()` helper'iga (`src/api/axios.js`) o'tkazildi. ✅ Tekshirildi: `npx eslint` (0 xato), `npm run build` (muvaffaqiyatli), va to'liq real HTTP zanjiri (Medical Center → Clinic Type → Speciality → Rank Type → Clinic → Doctor → Rank Price) — barchasi ishladi; foydalanuvchi keyinchalik admin panelda qo'lda ma'lumot kiritib, patient-portalgacha to'liq zanjirni muvaffaqiyatli sinab ko'rdi. Commit: `32aa66e`.

---

## Uch portal auditi (admin, patient-portal, doctor-portal) — 2026-08-18

3 nafar agent orqali admin panel (`src/`, 25 sahifa + 18 komponent), `patient-portal/` (10 sahifa) va `doctor-portal/` (9 sahifa) sahifama-sahifa o'qib chiqildi — marshrutlar/oqimlar to'g'riligi, API izchilligi, CRUD to'liqligi, tarjima qamrovi va `eslint` tekshirildi. Topilgan aniq xato/nomuvofiqliklar shu yerda tuzatildi; mahsulot qaroriga bog'liq topilmalar quyida alohida ro'yxatlangan (tuzatilmagan, sizning qararingizga qoldirilgan).

### Admin panel (`src/`)

- [x] **8 ta faylda ishlatilmayotgan `api` importi (`no-unused-vars` xatosi)** — `Appointments.jsx`, `DoctorSettings.jsx`, `Invoices.jsx`, `MedicalCenters.jsx`, `Patients.jsx`, `Payouts.jsx`, `Ratings.jsx`, `Users.jsx` — hammasi faqat `fetchAll` ishlatadi, `api`ning o'zi hech qayerda chaqirilmagan edi. ✅ Tekshirildi: `npx eslint src` — avval 11 xato bor edi, endi 2 taga tushdi (qolgan 2 tasi `AuthContext.jsx`/`LangContext.jsx`даги oldindan mavjud, aloqasiz `react-refresh` ogohlantirishi).
- [x] **`Dashboard.jsx` — istalgan tarmoq xatosida adminni majburan chiqarib yuborardi** — `/dashboard/` so'rovi vaqtincha 500/tarmoq xatosi bersa ham, `catch()` har doim `logout()` chaqirardi. Endi faqat `401`/`403` bo'lganda chiqariladi.
- [x] **`Dashboard.jsx` — haqiqiy `0` soxta raqam bilan niqoblangan edi** — `completed_appointments || 18` va `cancelled_appointments || 4` — agar backend haqiqatan `0` qaytarsa ham, chart doim soxta `18`/`4`ni ko'rsatardi. `?? 0`ga almashtirildi.
- [x] **`DataTable.jsx` — jadval "Loading..." matni tarjima qilinmagan edi** (yagona lokalizatsiya qilinmagan matn, qolgan hammasi `t()` orqali) — endi `t('common.loading')`. Yo'lda ishlatilmayotgan `useState` importi ham olib tashlandi.
- [x] **`DoctorCreate.jsx`/`DoctorEdit.jsx` — majburiy select'larda HTML `required` yo'q edi** — `user`/`clinic`/`speciality`/`rank_type` `Field required` bilan qizil `*` ko'rsatadi, lekin brauzer bo'sh qoldirib yuborishga ruxsat berardi (xato faqat umumiy `alert()` bilan chiqardi). Endi 4 tasiga ham `required` qo'shildi (ikkala faylda).
- [x] **`Register.jsx` — ochiq ro'yxatdan o'tish formasi "Admin" rolini tanlash imkonini berardi, lekin bu hech narsaga ta'sir qilmasdi** — `/register/` backend'i (1-bosqichda tuzatilgan `role` escalation himoyasi tufayli) yuborilgan `role`ni e'tiborsiz qoldirib, doim `patient` yaratadi. Ya'ni "Admin"ni tanlab yuborgan odam aslida jim-jit oddiy bemor bo'lib qolar edi — hech qanday xato yoki ogohlantirishsiz. Rol select'i butunlay olib tashlandi (funksional yo'qotish yo'q, chunki u allaqachon hech narsaga ta'sir qilmasdi).
- ✅ Tekshirildi (2026-08-18): `npx eslint src` — 2 xato (oldindan mavjud, aloqasiz), 26 ogohlantirish (tizimli `exhaustive-deps` naqshi, hammasi `token`ni effect dependency'dan ataylab tashlab ketgan — mavjud konventsiya, o'zgartirilmadi). `npm run build` — muvaffaqiyatli.

### `patient-portal/`

- [x] **`api/axios.js` — token muddati tugaganda sessiya jimgina "o'lib qolardi"** — hech qanday response interceptor yo'q edi, `401` xatolari har bir sahifaning o'z `.catch()`ida yutilib, foydalanuvchi sababsiz bo'sh ekranga qolib ketardi. Endi global interceptor qo'shildi: `401` kelsa token tozalanadi va `/login`ga qaytariladi.
- [x] **`Login.jsx` — yangi bemor profilsiz Bosh sahifaga tushib qolardi** — muvaffaqiyatli kirgandan keyin har doim `/` ga yo'naltirardi, garchi bemorning hali `Patient` profili bo'lmasa ham (keyin Reviews/booking kabi joylarda kutilmagan xatoga duch kelardi). Endi login'dan keyin `GET /patients/patient/me/` tekshiriladi — `400` (profil yo'q) bo'lsa `/profile`ga, aks holda `/`ga yo'naltiradi.
- ⚠️ **Audit noto'g'ri signal berdi, tekshirib chiqildi, tuzatilmadi:** `DoctorProfile.jsx`даги `busy-slots` so'rovida `Authorization` header yo'qligi bug sifatida ko'rsatilgan edi. Bu **noto'g'ri chiqdi** — `9-BOSQICH`da tasdiqlanganidek, bu endpoint ataylab `permission_classes=[AllowAny]` va login qilmasdan ham ishlashi real so'rov bilan tekshirilgan. Header qo'shilmadi.
- ✅ Tekshirildi (2026-08-18): `npm run build` — muvaffaqiyatli. `npx eslint src` — faqat 2 ta oldindan mavjud, aloqasiz `AuthContext.jsx`/`LangContext.jsx` xatosi (o'zgarishsiz).

### `doctor-portal/`

- [x] **`AuthContext.jsx` — login paytida "poyga sharti" (race condition)** — `login()` sahifa qayta yuklanmasa `roleLoading`ni qayta `true` qilmas edi, natijada `Protected` sahifani `/me/` orqali rol tasdiqlanishidan oldin ko'rsatib yuborardi (har bir kirishda "Doktor profili topilmadi" degan ogohlantirish bir lahza yaltirab o'tardi). `login()`ga `setRoleLoading(true)` qo'shildi.
- [x] **`Prescriptions.jsx` — yarim to'ldirilgan dori qatorlari jim-jit tashlab ketilardi, bo'sh retsept yuborish mumkin edi** — dori qatoridagi maydonlarda HTML `required` yo'q edi, va kamida bitta to'liq qator borligi hech qachon tekshirilmasdi (faqat diagnoz bilan, `items: []` bilan ham retsept saqlanardi). Endi 4 ta maydon (`medication_name_uz`, `dosage`, `frequency_uz`, `duration_days`) `required`, va yuborishdan oldin kamida bitta to'liq qator borligi tekshiriladi (yo'q bo'lsa aniq xato xabari).
- [x] **`Schedule.jsx` — boshlanish/tugash vaqti tartibi tekshirilmasdi** — doktor tugash vaqtini boshlanishdan oldin qo'yib saqlashi mumkin edi, bu esa patient-portal'dagi bo'sh-slot hisoblashini jimgina buzardi. Endi saqlashdan oldin `endTime <= startTime` tekshiriladi. Yo'lda tugma'larga `title` qo'shildi va `schedule.add`/`schedule.save`/`schedule.saving`/`schedule.delete` (avval hech qayerda ishlatilmagan tarjima kalitlari) endi haqiqatan foydalanilmoqda.
- [x] **`Appointments.jsx`/`Patients.jsx`/`Reviews.jsx`/`Payouts.jsx` — "doktor profili topilmadi" holati ko'rsatilmasdi** — `Dashboard`/`Prescriptions`/`Schedule`/`Profile`da bu holat aniq ogohlantirish bilan ko'rsatiladi, qolgan 4 sahifada esa jim-jit oddiy "ma'lumot yo'q" bo'sh holatini ko'rsatardi — sababi noaniq qolardi. Endi hammasida bir xil `auth.no_doctor_profile` ogohlantirishi izchil ko'rsatiladi.
- ✅ Tekshirildi (2026-08-18): `npx eslint src` — 2 xato (oldindan mavjud, aloqasiz), 0 ogohlantirish. `npm run build` — muvaffaqiyatli.

### Tuzatilmagan, mahsulot qaroriga bog'liq topilmalar (sizning qararingiz kerak)

- [ ] **Admin panelda doktor/admin uchun `User` akkaunt yaratishning ishlaydigan yo'li yo'q — QAROR QILINDI, ISH REJALASHTIRILDI (2026-08-18).** `DoctorCreate.jsx` yangi doktor yaratishda mavjud `User`ni tanlashni talab qiladi, lekin uni yaratadigan joy yo'q (ochiq `/register` doim `patient` yaratadi, `Users.jsx`da "Create" yo'q).
  - **Qaror:** admin doktor/admin uchun `User`ni o'zi yaratadi, `username` + **vaqtinchalik parol**ni o'zi kiritadi (yoki tizim generatsiya qiladi); yangi foydalanuvchi keyin parolni o'zi almashtiradi. (SMS-havola orqali parolsiz oqim — SMS OTP qayta yoqilgandagina ko'rib chiqiladi, hozircha emas.)
  - **Bajarilishi kerak — Backend (siz):** `Users.jsx`даги "Create" formasidan chaqiriladigan, faqat admin uchun ruxsat etilgan `User` yaratish endpoint'i (`username`, `password`, `role`, `phone_number` qabul qiladigan; mavjud `/register/`ni emas — u ochiq va doim `patient` yaratadi, shu holicha qolishi kerak).
  - **Bajarilishi kerak — Frontend (men):**
    1. Admin panelning `AuthContext.jsx`/`Login.jsx`siga rol-tekshiruvi qo'shish (hozir umuman yo'q — `patient-portal`/`doctor-portal`dagi `/me/` + rol-gate naqshiga mos, faqat `role==='admin'` kirsin). Bu backend'siz, sof frontend ishi.
    2. `Users.jsx`ga "Create" tugmasi/formasi (`username`, vaqtinchalik parol, `role` tanlovi, `phone_number`) — yuqoridagi yangi backend endpoint tayyor bo'lgach ulanadi.
  - Backend endpoint tayyor bo'lgach davom ettirish uchun ayting.
- [ ] **`Dashboard.jsx`даги "Finance & Payments" kartalari, oylik chart va "Top Doctors"/"Top Patients" ro'yxati to'liq qattiq kodlangan (hardcoded), API'ga bog'lanmagan.** Haqiqiy statistikaga o'xshab ko'rinadi, lekin doim bir xil raqamlarni ko'rsatadi. Real endpoint bormi (yoki qo'shish kerakmi), yoki hozircha "demo data" deb belgilab qo'yish yetarlimi — qaror kerak.
- [ ] **Admin panelda 3 xil tahrirlash UX naqshi bir vaqtda ishlatiladi** — Doctors alohida sahifa, ko'pchilik resurslar (Specialities/Clinics/RankTypes/RankPrices/Patients/DoctorSettings) modal, Medical Centers esa "create sahifasini `?edit=`query bilan qayta ishlatish" trikini ishlatadi. Bittasiga birlashtirish kerakmi (masalan hammasi modal)?
- [ ] **Medical Centers'da delete, Patients'da create/delete yo'q** — qo'shni resurslarga (Clinics, Doctors) qaraganda kam imkoniyat. Ataylab shundaymi (masalan markazni o'chirib bo'lmasligi biznes qoidasi) yoki haqiqiy bo'shliqmi?

---

## 12-BOSQICH — Chat funksiyasi (bemor ↔ doktor real-vaqt xabar almashish)

**Boshlang'ich audit (2026-08-23):** hozircha chat mutlaqo yo'q — na backendda (`channels`/websocket/`Message` modeli yo'q), na frontendda (uchala portalda ham socket/chat komponenti yo'q). `catalog`/`appointments`даги `consultation_type` allaqachon `video`/`voice`/`chat`ni narxlanadigan variant sifatida modellagan, lekin uchalasi ham amalda faqat bitta ochiq Jitsi video-xona havolasiga olib keladi (`videoCall.js`) — ya'ni "chat" hozircha sotib olinadi, lekin ta'minlanmaydi. Admin paneldagi `/messages` route ham `Placeholder` ("under construction")ga ulangan.

**Qamrov qarori (MVP):** chat har bir `Appointment`ga bog'langan (xuddi `prescriptions`/`rating` kabi — patternga mos, oddiy). Bir doktor-bemor juftligi orasidagi appointment'lardan tashqari umumiy/doimiy suhbat MVP'ga kirmaydi — kerak bo'lsa keyingi bosqichda kengaytiriladi. Boshida real-vaqt uchun **Django Channels** (WebSocket) tanlangan edi.

**Qaror o'zgardi (2026-08-26):** websocket qismi (`consumers.py`/`routing.py`/`middleware.py`/`config/asgi.py`) hali yozilmagan bosqichda, murakkablikni kamaytirish uchun **oddiy REST polling**ga o'tildi — frontend `ChatWindow` ochiq turganda `GET /chat/message/?appointment_id=`ni har necha soniyada (masalan 3-5 sek) qayta so'rab turadi, alohida websocket ulanish/qayta ulanish logikasi kerak emas. `channels` paketi va uning `settings.py` sozlamalari (quyida `[x]`) shu holicha, ishlatilmasa ham, qoldirildi — zarari yo'q, kelajakda real-vaqtga qaytish kerak bo'lsa tayyor turadi. Xuddi shu sababdan yozib bo'lingan `chat/middleware.py` ham hozircha ishlatilmaydi, lekin fayl saqlanib qoldi.

### Bajarilishi kerak — Backend (siz yozasiz, men tekshirib/tasdiqlab boraman)

- [x] **Paketlar** — `requirements.txt`ga `channels` (va ixtiyoriy `daphne` ASGI server uchun) qo'shish, `pip install`.
  ✅ Tekshirildi (2026-08-25): `requirements.txt`да `channels==4.3.2`; venv'da `import channels; channels.__version__` → `4.3.2` haqiqatan o'rnatilgan. (2026-08-26: REST polling'ga o'tilgani sabab bu paket amalda ishlatilmaydi, lekin qoldirilishi zararsiz.)
- [x] **`config/settings.py`** — `INSTALLED_APPS`ga `'channels'`, `ASGI_APPLICATION = 'config.asgi.application'`, `CHANNEL_LAYERS = {'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}}`.
  ✅ Tekshirildi (2026-08-25): `manage.py check` — 0 xato; `get_channel_layer()` real chaqirilganda `<channels.layers.InMemoryChannelLayer object>` qaytardi (dastlab `'channels.;ayers.InMemoryChannellayer'` deb ikki marta yozuv xatosi bilan yozilgan edi — `InvalidChannelLayerError` bilan sinib qolgan; foydalanuvchi tuzatgach qayta tekshirildi, endi ishlaydi).
- [x] **Yangi `chat` app** (`python manage.py startapp chat`) — to'liq yozilgan va real so'rov bilan tekshirilgan:
  - `models.py` — `Conversation` (`appointment` — `Appointment`ga `OneToOneField`, `created_at`), `Message` (`conversation` FK, `sender` — `User`ga FK, `text`, `created_at`, `is_read=False`).
  - `serializers.py` — `MessageSerializers` (`fields='__all__'`, `sender`/`conversation` read-only).
  - `permissions.py` — `IsAppointmentParticipant`: faqat shu appointment'ning o'z doktori/bemori (va admin) kira oladi; `appointment_id`ni `kwargs`/query-param/body'dan navbat bilan oladi.
  - `views.py` — `MessageViewSet(viewsets.ModelViewSet)`: `appointment_id`ni URL yo'lida emas, query-param (`GET`) va body (`POST`)dan oladi; `perform_create`da `Conversation.objects.get_or_create` bilan birinchi xabarda suhbat avtomatik yaratiladi.
  - `urls.py` — `DefaultRouter` bilан (`prescriptions`/`appointments`даги naqshga mos), `config/urls.py`ga `path('api/v1/chat/', include('chat.urls'))` qilib ulangan.
  - `admin.py` — `ConversationAdmin` (`MessageInline` bilan) va `MessageAdmin`, `prescriptions/admin.py`даги naqshga mos.
  - `tests.py` — `ChatMessageTestCase` (`APITestCase`, `prescriptions/tests.py`даги naqshga mos): login qilmasdan rad etilishi, ishtirokchi (bemor/doktor) kira olishi, begona foydalanuvchi 403 olishi, xabar yozish + `Conversation` avtomatik yaratilishi, tarix faqat so'ralgan appointment'ga filtrlanishi — 7 ta test.
  - ~~`consumers.py`, `middleware.py`, `routing.py`~~ — yozib ko'rilgan (`middleware.py`), keyin REST polling qarori sabab MVP'dan chiqarildi va o'chirildi (yuqoridagi qaror izohiga qarang).
  ✅ Tekshirildi (2026-08-26): `manage.py check` — 0 xato (yo'lda `config/urls.py`да `include('chaturls')` deb yozuv xatosi topilib, `include('chat.urls')`ga tuzatildi — shu xato butun loyiha URL konfiguratsiyasini sindirib turgan edi). Real so'rov bilan (`django.test.Client` + `simplejwt` token, keyin tozalangan): login qilmasdan `GET` → `401`; bemor `GET` → `200`; `POST` → `201`, `Conversation` avtomatik yaratildi; qayta `GET`da xabar ko'rindi; begona foydalanuvchi `GET` → `403`. Admin sahifalari (`/admin/chat/conversation/`, `/admin/chat/message/`) superuser bilan real so'rovda `200`. `manage.py test chat --keepdb` → **7/7 test yashil**. Test ma'lumotlari tozalandi, real DB'ga tegilmadi.
- [ ] ~~`config/asgi.py`ni qayta yozish~~ — REST polling qarori sabab kerak emas.
- [x] **Migratsiya** — `chat/migrations/0001_initial.py`, `0002_alter_message_options.py` mavjud va ishlangan.
- [ ] ~~Xavfsizlik eslatmasi (`OriginValidator`)~~ — websocket ishlatilmagani sabab kerak emas.
- [x] `manage.py test chat` — yashil (7/7).
  ✅ Tekshirildi (2026-08-26): `manage.py test --keepdb` (to'liq to'plam, 101 ta test = oldingi 94 + yangi 7) → 4 ta xato, lekin ularning barchasi `patients/tests.py` va `prescriptions/tests.py`да (chat'ga aloqasi yo'q) — `git status` bilan tasdiqlandi, bu ishda faqat `chat/*` va `config/urls.py` o'zgargan, `patients`/`prescriptions` fayllariga tegilmagan. Demak bu **oldindan mavjud, chat bilan bog'liq bo'lmagan xatolar** — regressiya emas, alohida band sifatida keyin ko'rib chiqiladi.
- Backend qismi tayyor va tasdiqlangan — endi frontend qismini boshlayman.

### Bajarilishi kerak — Frontend (men to'g'ridan-to'g'ri yozaman, backend tayyor bo'lgach)

- [x] `patient-portal/src/lib/chatApi.js` va `doctor-portal/src/lib/chatApi.js` — `fetchMessages`/`sendMessage`, mavjud `fetchAll` (paginatsiya, `PAGE_SIZE=6`) va `api`dan foydalanadi.
- [x] `ChatWindow` komponenti (ikkala portalda, `src/components/ChatWindow.jsx`) — xabarlar ro'yxati (bubble'lar, o'z/begona `userId` bo'yicha farqlanadi), input+yuborish, avtomatik scroll (`bottomRef`), vaqt belgisi. Ochilganda tarix yuklanadi, so'ng `setInterval` (4 sek) bilan qayta so'raladi (websocket o'rniga REST polling — yuqoridagi 2026-08-26 qaror).
- [x] Kirish nuqtasi: `MyAppointments.jsx`/`Appointments.jsx`da "confirmed" holatdagi appointment qatoriga video tugmasi yonida "Chat" (`MessageCircle`) tugmasi, `/chat/:appointmentId` route (`Chat.jsx` sahifasi, `App.jsx`ga qo'shildi).
- [x] Tarjimalar (uz/ru) — `translations.js`да `chat.*` va `appointments.open_chat`.
- [x] `patient-portal/src/context/AuthContext.jsx`ga `userId` qo'shildi (`doctor-portal`да allaqachon bor edi) — bubble'larni "o'z/begona" ajratish uchun zarur edi.
  ✅ Tekshirildi (2026-08-26): ikkala portalda ham `npx eslint src/` — yangi/o'zgargan fayllarda (`ChatWindow.jsx`, `chatApi.js`, `Chat.jsx`, `App.jsx`, `AuthContext.jsx`, `MyAppointments.jsx`, `Appointments.jsx`, `translations.js`) xato yo'q (qolgan 2 ta xato `AuthContext.jsx`/`LangContext.jsx`даги `react-refresh` qoidasi — bu ishdan oldin ham mavjud edi, aloqasi yo'q); `npm run build` — ikkalasi ham muvaffaqiyatli. Vizual/UI sinov brauzer avtomatizatsiyasi yo'qligi sababli qilinmadi (loyiha qoidasiga ko'ra ochiq aytilyapti).
- Admin paneldagi `/messages` (`Placeholder`) — bu bosqichga kirmaydi (admin doktor-bemor chatiga aralashmaydi deb qaralmoqda; agar admin moderatsiya/ko'rish imkoniyati kerak bo'lsa, alohida band sifatida keyin qo'shiladi).

---

## To'rt portal auditi (admin, patient-portal, doctor-portal, backend bog'lanishi) — 2026-08-28

4 nafar agent orqali login/CRUD (admin, doctor-portal), patient↔doctor ma'lumot oqimi
(booking, status, retsept, rating) va chat funksiyasi end-to-end tekshirildi. 2 ta real
muammo topildi:

- [ ] **Rating (baho) yaratish backend'da butunlay buzilgan (regressiya)** —
  `appointments/serializers.py`даги `RatingSerializers.Meta.read_only_fields` ichida
  `'appointment'` borligi sabab, `POST /appointments/rating/` har doim `500
  Internal Server Error` (`KeyError: 'appointment'`, `views.py`даги
  `RatingViewSet.create()`да `serializer.validated_data['appointment']` qatorida)
  beradi — `appointment` maydoni `read_only` bo'lgani uchun `validated_data`ga
  umuman kirmaydi. Bu 2026-08-18'dagi `a538175` commitida ("lock rating's
  appointment on update") kirib qolgan regressiya — maqsad faqat *update*ni
  bloklash edi, lekin *create*ni ham buzib qo'ygan. Natijada patient-portal va
  doctor-portal'dagi Reviews sahifalari o'zi to'g'ri yozilgan, lekin backend
  hech qanday yangi reyting qabul qilmaydi. **Tuzatish (backend, foydalanuvchi
  o'zi yozadi):** `read_only_fields`dan `'appointment'`ni olib tashlab,
  `update()`да uni qo'lda `validated_data.pop('appointment', None)` bilan
  bloklash (`AppointmentSerializers.update()`даги patient/doctor pop naqshiga
  o'xshab).
- [x] **doctor-portal chatida "o'z xabar/begona xabar" ajratilmasdi** —
  `doctor-portal/src/context/AuthContext.jsx`да `userId` state bor edi
  (`/me/`dan olinadi), lekin `AuthContext.Provider`ning `value`iga qo'shilmagan
  edi. Natijada `ChatWindow.jsx`даги `const own = m.sender === userId` doim
  `false` bo'lib, doktor tomonida o'zi yozgan xabarlar ham "begona" (chap,
  kulrang) bubble sifatida chiqardi — funksional (yuborish/o'qish) ishlagan,
  faqat vizual ajratish buzilgan edi. ✅ **Tuzatildi va tekshirildi
  (2026-08-28):** `AuthContext.jsx:72`даги Provider `value`ga `userId`
  qo'shildi. `npx eslint src` — 2 xato (oldindan mavjud,
  `AuthContext.jsx`/`LangContext.jsx`даги `react-refresh` qoidasi, aloqasiz),
  `npm run build` — muvaffaqiyatli (`✓ built in 251ms`). Vizual sinov
  brauzer avtomatizatsiyasi yo'qligi sababli qilinmadi.

---

## Besh agentli to'liq audit — backend, admin, patient-portal, doctor-portal (2026-08-30)

Backend xavfsizligi, uch portalning har biri va cross-portal frontend bo'yicha
5 ta agent parallel ishlatildi, ustiga real HTTP so'rovlar bilan asosiy
oqimlar (login, doctor yaratish, appointment, rating, chat) qo'lda sinaldi va
backend'ning haqiqiy test suite'i ishga tushirildi. Quyida hech qayerda
oldin yozilmagan yangi topilmalar (Rating-500 bug va RankPrice/consultation_type
nomuvofiqligidan tashqari — ular alohida eslatilgan).

**TDD / CI-CD holati:**
- Backend: `python manage.py test` — **101 ta test, 4 tasi FAIL** (pastdagi
  3 va 13-bandlar bilan bog'liq). `.github/workflows/django-ci.yml` to'g'ri
  sozlangan (real Postgres bilan har push/PR'da test ishga tushiradi), lekin
  hozir shu testlar bilan **CI qizil (FAIL) bo'lardi**.
- Frontend: uchala ilovada ham (admin, patient-portal, doctor-portal)
  **CI/CD umuman yo'q** (`.github/workflows` yo'q) va **hech qanday test
  framework/test yo'q** (Jest/Vitest o'rnatilmagan, `package.json`da `test`
  skripti yo'q). Tekshiruv faqat `eslint`+`build`+qo'lda real-so'rov
  testlari bilan cheklangan.

**KRITIK (backend, foydalanuvchi yozadi):**

- [ ] **Video-konsultatsiyaga begona kirishi mumkin** —
  `patient-portal/src/lib/videoCall.js:5-12` va
  `doctor-portal/src/lib/videoCall.js:5-12`da Jitsi xona nomi faqat
  `appointment.id` (kichik ketma-ket son) va `start_time`dan hosil qilinadi.
  `GET /appointments/busy-slots/?doctor=&date=` (`AllowAny`) har bir
  shifokorning barcha uchrashuvi uchun aniq `start_time`ni
  autentifikatsiyasiz qaytaradi. Bu ikkisi birgalikda begona odamga
  `meet.jit.si` xona nomini qayta tiklab, bemor-shifokor konsultatsiyasiga
  jim kirish imkonini beradi (meet.jit.si xonalari parolsiz). **Tuzatish:**
  `Appointment`ga tasodifiy `video_room_token` (UUID) qo'shib xona nomida
  shundan foydalanish, va/yoki busy-slots aniq vaqt o'rniga faqat band/bo'sh
  holatini qaytarishi kerak.
- [ ] **Bemor o'z `Patient` yozuvini boshqa userga "ko'chirib" yubora oladi
  (IDOR)** — `patients/serializers.py:5-8`даги `PatientSerializers`da `user`
  maydoni yozish uchun ochiq (`fields='__all__'`, `read_only_fields`/`update()`
  yo'q). `patients/permissions.py`даги `IsAdminOrOwnerPatient` bemorga o'z
  yozuvini PATCH qilishga ruxsat beradi, standart router endpoint
  (`PATCH /patients/patient/<id>/`) esa `user`ni tozalamaydi (faqat maxsus
  `me` action tozalaydi). Bemor `{"user": <boshqa_id>}` yuborib boshqa
  userning profilini "egallab olishi" mumkin. `Doctor`da xuddi shu himoya
  (`SENSITIVE_FIELDS` bilan `user`) allaqachon bor, `Patient`da yo'q.
  **Tuzatish:** `PatientSerializers.Meta`ga `read_only_fields = ['user']`
  qo'shish.
- [ ] **Har qanday shifokor har qanday bemorning to'liq yozuvini (JSHSHIR,
  manzil) ko'ra oladi — real testda tasdiqlandi** —
  `patients/permissions.py`даги `IsAdminOrOwnerPatient.has_object_permission`:
  `if request.method in SAFE_METHODS and request.user.role == 'doctor':
  return True` — bemorning o'zi bilan bog'liqligini tekshirmasdan. Backend
  test suite'da `test_doctor_cannot_retrieve_single_patient` aynan shuni
  kutadi (403), lekin kod 200 qaytaradi — **bu hozir FAIL bo'layotgan real
  test**. **Tuzatish:** faqat shu bemor bilan appointment/prescription
  orqali bog'liq shifokorga ruxsat berish kerak, hammasiga emas.

**YUQORI:**

- [ ] **[backend] Rating (baho) yaratish — 500 xato** — yuqorida
  ("To'rt portal auditi") allaqachon yozilgan, 2026-08-30'da real so'rov
  bilan qayta tasdiqlandi: `appointments/serializers.py`даги
  `RatingSerializers.Meta.read_only_fields`da `'appointment'` borligi sabab
  `RatingViewSet.create()`даги `serializer.validated_data['appointment']`
  KeyError beradi. Hali tuzatilmagan.
- [ ] **[backend] JWT tokenlar juda uzoq muddatli, bekor qilib bo'lmaydi** —
  `config/settings.py:188-191`: `ACCESS_TOKEN_LIFETIME=7 kun`,
  `REFRESH_TOKEN_LIFETIME=30 kun`. `token_blacklist` o'rnatilmagan, logout
  endpointi yo'q. Token o'g'irlansa, uni bekor qilib bo'lmaydi. **Tuzatish:**
  `rest_framework_simplejwt.token_blacklist` qo'shish, logout view yaratish,
  `ACCESS_TOKEN_LIFETIME`ni daqiqalarga tushirish.
- [ ] **[backend] Chatda ishtirokchi boshqasining xabarini o'chira/tahrirlay
  oladi** — `chat/permissions.py`даги `IsAppointmentParticipant` faqat
  `has_permission` (appointmentga tegishlilik) tekshiradi,
  `has_object_permission` yo'q — `obj.sender == request.user` hech qachon
  tekshirilmaydi. **Tuzatish:** xabar egasiga tegishli tekshiruv qo'shish
  yoki PATCH/DELETE'ni butunlay olib tashlash (chat append-only bo'lishi
  kerak).
- [ ] **[backend+admin] To'lov (billing) zanjiri butunlay yetib
  bo'lmaydigan holatda** — hech qanday portalda `Invoice` yaratish UI'si
  yo'q (`src/pages/Invoices.jsx` faqat ro'yxat, `/invoices/create` route
  yo'q), `Appointment` yakunlanganda avtomatik invoice yaratadigan signal
  ham yo'q. `DoctorPayout` yaratish/`paid` qilish uchun ham hech qanday UI
  yo'q (`src/pages/Payouts.jsx` faqat ko'rish). Natija: "bemor hisob oladi
  va to'laydi" oqimini demo qilib bo'lmaydi — faqat Django admin/shell
  orqali qo'lda qatorlar kiritilsa ishlaydi. Qaror kerak: avtomatik invoice
  yaratish signalimi, yoki admin panelga qo'lda yaratish formasi kerakmi.
- [ ] **[frontend, Claude yozadi] Admin panel va doctor-portalda tokenning
  muddati tugashi ushlanmaydi** — `src/api/axios.js` va
  `doctor-portal/src/api/axios.js`da 401 interceptor yo'q (patient-portalda
  2026-08-18'da tuzatilgan xuddi shu muammo). Doctor-portalda oqibati
  yanada yomonroq: `AuthContext.jsx:14-20`да `/me/` 401 bersa `role=null`
  bo'ladi, `App.jsx:24`даги `Protected` esa faqat `role && role!=='doctor'`
  da bloklaydi — `null` buni ishga tushirmaydi, natijada foydalanuvchi
  login sahifasiga qaytarilmasdan, barcha sahifalarda "Hisobingizga hali
  doktor profili biriktirilmagan" degan **noto'g'ri** xabar ko'radi.
- [ ] **[frontend, Claude yozadi] Doktor Profile sahifasidan bank/IBAN
  ma'lumotini hech qachon saqlay olmaydi, lekin UI "saqlandi" deb
  ko'rsatadi** — `doctor-portal/src/pages/Profile.jsx` bank_name/iban
  maydonlarini PATCH qiladi, lekin backend `doctors/serializers.py`даги
  `DoctorSerializers.update()` bu maydonlarni admin bo'lmagan har bir
  so'rovchi uchun jimgina o'chirib tashlaydi (`SENSITIVE_FIELDS`). Frontend
  xatoni ko'rmaydi, "Ma'lumotlar saqlandi" deb ko'rsataveradi. Qaror kerak:
  bu qasddan shundaymi (faqat admin o'zgartirsin, firibgarlikdan himoya) —
  agar shunday bo'lsa, Profile formasidan bu maydonlarni butunlay olib
  tashlash kerak, aks holda backendda ruxsat berish kerak.

**O'RTA:**

- [ ] **[backend] OTP so'rovini cheklovsiz qayta yuborish mumkin +
  kriptografik bo'lmagan RNG** — `users/views.py:69-77` faqat 60 soniyalik
  cooldown tekshiradi, kunlik/soatlik limit yo'q (SMS-bombing xavfi).
  `users/views.py:79`da `random.randint` ishlatilgan, `secrets` moduli emas.
- [ ] **[backend] Production uchun HTTPS/xavfsiz-cookie sozlamalari yo'q** —
  `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE` va h.k.
  `config/settings.py`da yo'q. DEBUG=True bo'lgani uchun hozircha
  shoshilinch emas.
- [ ] **[backend] To'liq API sxemasi (`drf_yasg` Swagger/Redoc) `/` da
  hech kimga cheklanmagan holda ochiq** — `config/urls.py:16-30,58-60`,
  `AllowAny`. **Tuzatish:** admin-only qilish yoki DEBUG bilan cheklash.
- [ ] **[backend] Retsept yangilashda "faqat completed appointment"
  tekshiruvi yangi testlarni buzmoqda** — `prescriptions/serializers.py`даги
  `validate()` har bir PATCH'da ham `appointment.status=='completed'`ni
  talab qiladi, bu 3 ta testni FAIL qilyapti
  (`test_owner_doctor_can_create_prescription_with_items`,
  `test_update_replaces_items_when_items_provided`,
  `test_update_without_items_keeps_existing_items`) — testlar uchrashuvni
  'completed' qilib sozlamagan. Qaror kerak: testlar eskirganmi (fixture'ga
  `status='completed'` qo'shish kerak) yoki validatsiya yangilashda
  ortiqcha qattiqmi (faqat yaratishda kerak).
- [ ] **[data, backend] `RankPrice` ma'lumotlari eskirgan
  `consultation_type` bilan — booking formasida "narx aniqlanmagan"
  chiqadi** — bazadagi barcha 3 ta RankPrice yozuvi
  `consultation_type="in_person"`, dastur esa endi faqat
  `video`/`voice`/`chat` qo'llaydi (masofaviy qabul). Har bir
  rank_type+clinic uchun video/voice/chat narxlari qo'shish kerak.
- [ ] **[frontend, Claude yozadi] Refresh token olinadi, lekin hech qachon
  ishlatilmaydi** — barcha 3 portalda ham. `patient-portal`da saqlanadi-yu
  ishlatilmaydi, `doctor-portal`da hatto saqlanmaydi ham (`Login.jsx:40`
  faqat access tokenni oladi). Backend 30 kunlik sessiya bersa ham, amalda
  token tugashi bilanoq majburiy qayta login.
- [ ] **[frontend, Claude yozadi] API manzili barcha 3 ilovada qattiq
  kodlangan** (`http://127.0.0.1:8000/api/v1`) — `src/api/axios.js:4`,
  `patient-portal/src/api/axios.js:4`, `doctor-portal/src/api/axios.js:4`.
  Env-o'zgaruvchi orqali sozlanmaydi — production'ga chiqarish uchun 3
  joyni qo'lda o'zgartirib qayta build qilish kerak bo'ladi.
- [ ] **[frontend, Claude yozadi] Patient-portal to'lovi faqat optimistik
  UI — Stripe webhook bilan hech qachon solishtirilmaydi** —
  `patient-portal/src/pages/Payments.jsx:42-50,100-103` Stripe.js
  client-side "succeeded" javobiga qarab darhol `status:'paid'` qo'yadi,
  lekin backend `Invoice.status`ni faqat webhook (`payments/signals.py`)
  o'zgartiradi. Webhook kechiksa/kelmasa, bemor "to'landi" ko'radi, sahifani
  yangilasa "kutilmoqda"ga qaytadi — chalkashlik yoki qayta to'lov xavfi.
- [ ] **[frontend, Claude yozadi] CheckoutForm `PaymentIntent`ning
  "processing" kabi oraliq holatlarida hech qanday xabar bermaydi** —
  `Payments.jsx:46-50` faqat `succeeded`/xato holatlarini kutadi, boshqa
  holatda forma jim "Pay" holatiga qaytadi.
- [ ] **[backend+frontend] Chatda uchrashuv holati (status) tekshirilmaydi**
  — bekor qilingan yoki hali tasdiqlanmagan appointment uchun ham chat
  to'liq ishlayveradi (`chat/permissions.py` va ikkala portalning
  `Chat.jsx`/`ChatWindow.jsx`da status tekshiruvi yo'q).
- [ ] **[frontend, Claude yozadi] Telefon validatsiyasi frontendda
  backenddan yumshoqroq** — `patient-portal/src/lib/validators.js:1`:
  `/^\+?\d{9,13}$/` — `+998` prefiksini talab qilmaydi, backend
  `patients/models.py:10-13` esa qat'iy talab qiladi. Noto'g'ri raqam
  frontendda xatosiz o'tadi, submit qilgandagina umumiy xato ko'rsatiladi.
- [ ] **[frontend, Claude yozadi] Admin panelda ~15 ro'yxat sahifasida
  fetch xatosi va "haqiqatan bo'sh ro'yxat" bir xil ko'rinadi, retry
  tugmasi yo'q** — `Appointments.jsx`, `Clinics.jsx`, `Doctors.jsx`,
  `DoctorSettings.jsx`, `Invoices.jsx`, `MedicalCenters.jsx`,
  `Patients.jsx`, `Payouts.jsx`, `RankPrices.jsx`, `RankTypes.jsx`,
  `Ratings.jsx`, `Specialities.jsx`, `Users.jsx` — barchasi
  `.catch(() => setLoading(false))`, xato holati yo'q. `DoctorView.jsx`
  yagona to'g'ri qilingan misol.
- [ ] **[frontend, Claude yozadi] `GettingStarted.jsx` onboarding
  tekshiruvi vaqtinchalik tarmoq xatosini "bajarilmagan" deb noto'g'ri
  ko'rsatadi** — `pages/GettingStarted.jsx:271-276`даги har bir qadam
  tekshiruvi `.catch(() => false)` — server vaqtincha ishlamasa, admin
  allaqachon bajargan qadamga qaytarib yuboriladi.
- [ ] **[frontend, Claude yozadi] ~21 admin forma/modalda backend'ning
  aniq validatsiya xabari umumiy `alert()` bilan yashiriladi** — masalan
  `AppointmentCreateModal.jsx:55-57` backend'ning "Doktor bu vaqt band"/
  "Vaqt jadvaldan tashqarida" kabi aniq sabablarini ko'rsatmasdan, faqat
  umumiy "xatolik" deydi. `Login.jsx`/`Register.jsx`da to'g'ri naqsh
  (`err.response?.data?.detail`) allaqachon bor, boshqa joylarga
  qo'llanmagan.
- [ ] **[backend+frontend] Admin panelning `DoctorScheduleModal.jsx`da ish
  vaqti boshi<tugashi tekshiruvi yo'q** — na frontendda, na backendda
  (`DoctorScheduleSerializers`da `validate()` yo'q). Xuddi shu xato turi
  doctor-portal'da 2026-08-18'da tuzatilgan, admin panelga ko'chirilmagan.

**PAST:**

- [ ] **[frontend, Claude yozadi] `GettingStarted.jsx`даги RankPrice
  qadamida `consultation_type` maydoni yo'q** — onboarding orqali
  yaratilgan narx doim backend default'i (`video`) bilan qoladi,
  voice/chat tanlab bo'lmaydi.
- [ ] **[frontend, Claude yozadi] doctor-portal bemorlar qidiruv
  maydonining `aria-label`i noto'g'ri** — `Patients.jsx:54-55`,
  nusxa-joylash xatosi (sahifa sarlavhasi ishlatilgan).
- [ ] **[frontend] JWT barcha 3 ilovada `localStorage`da saqlanadi** — XSS
  orqali o'g'irlanish xavfi, arxitektura darajasidagi masala, tezkor
  tuzatish yo'q.
- [ ] **[backend] `requirements.txt`da ishlatilmayotgan paketlar** —
  `social-auth-app-django`, `social-auth-core`, `python3-openid`,
  `oauthlib`, `requests-oauthlib` — kodda hech qayerda ishlatilmaydi.

**Umumiy xulosa:** Loyiha **100% topshirilishga tayyor emas**. 3 ta kritik
(video-qo'ng'iroq xavfsizligi, Patient IDOR, shifokorning bemor ma'lumotiga
haddan tashqari kirishi — oxirgisi real FAIL testda tasdiqlangan) va
to'liq ishlamaydigan billing zanjiri bor. Ichki demo/taqdimot uchun "yuqori"
va "o'rta" toifadagi bandlarni yopish bilan 1-2 kunda ancha ishonchli
holatga kelish mumkin; real ishga tushirish uchun xavfsizlik bandlarining
barchasi ham shart.

---

## Uch portal auditi (admin, patient-portal, doctor-portal) — 2026-09-04

3 nafar agent orqali admin panel (`src/`), `patient-portal/` va `doctor-portal/`
qayta audit qilindi — bu safar avvalgi 4 ta audit (2026-08-18/08-28/08-30)da
qayd etilmagan yangi topilmalarga e'tibor berildi. Topilgan hammasi tasdiqdan
so'ng shu yerda to'g'ridan-to'g'ri tuzatildi.

### Admin panel (`src/`)

- [x] **Retsept modal — retsept mavjud bo'lsa ham "yo'q" ko'rsatardi** — `AppointmentDetailModal.jsx`даги so'rov backend paginatsiyasini (`{results: [...]}`) hisobga olmay `res.data[0]` deb o'qir edi. Endi `res.data.results?.[0] || null`.
- [x] **5 ta Edit-modalda majburiy maydonlarda HTML `required` yo'q edi** — `RankPriceEditModal.jsx`, `RankTypeEditModal.jsx`, `SpecialityEditModal.jsx`, `ClinicEditModal.jsx`, `PatientEditModal.jsx` — UI'da qizil `*` bor edi, brauzer bo'sh qoldirib yuborishga ruxsat berardi (tegishli Create sahifalarida esa `required` bor edi). Hammasiga qo'shildi.
- [x] **`DoctorCreate.jsx`/`DoctorEdit.jsx` — `name_uz`/`name_ru`da `required` yo'q edi** (2026-08-18'da faqat 4 ta select'ga qo'shilgan, matn maydonlari qolib ketgan). Endi qo'shildi.
- [x] **`Login.jsx` — username/parolda `required` yo'q edi** (Register.jsx'da bor, nomuvofiqlik). Endi qo'shildi.
- [x] **`Layout.jsx` — sarlavha matni "tugma" sifatida belgilangan (hover/klaviatura fokus), lekin `onClick` yo'q edi** — o'lik interaktiv element. `role="button"`/`tabIndex`/`cursor-pointer`/`hover:underline` olib tashlandi (oddiy matn).
- [x] **`Specialities.jsx` — delete tasdiq/xato xabarlari `Doctors` sahifasidan "qarz olingan" edi** — maxsus `specialities.delete_confirm`/`specialities.delete_error` tarjima kalitlari (uz+ru) qo'shildi va ulandi.
- [x] **`AppointmentRescheduleModal.jsx` — vaqtni qayta rejalashtirishda `endTime <= startTime` tekshiruvi yo'q edi** — frontendda oldindan tekshiruv (aniq xato xabari bilan) qo'shildi.
- [x] **`Dashboard.jsx:78` — `total_clinics ?? 1` soxta-raqam bilan niqoblangan qolib ketgan edi** (2026-08-18'da shu faylda boshqa 2 maydon `?? 0`ga o'tkazilgan, bu birini unutib ketishgan). Endi `?? 0`.
- [x] **`GettingStarted.jsx` — onboarding'dagi ~20 ta maydonning birortasida ham haqiqiy `required` yo'q edi** (faqat `Field required` prop, DOM elementda emas). `inp()`/`sel()` helperlariga `required` parametri qo'shilib, barcha majburiy maydonlarga ulandi.
- ✅ Tekshirildi (2026-09-04): `npm run lint` — 6 xato/26 ogohlantirish (oldindan mavjud, `git stash` bilan solishtirilib tasdiqlandi — bizning o'zgarishimiz yangi xato qo'shmadi). `npm run build` — muvaffaqiyatli.

### `patient-portal/`

- [x] **`AuthContext.jsx` — login paytida "poyga sharti" (race condition)** — doctor-portal'da 2026-08-18'da tuzatilgan bug patient-portal'ga ko'chirilmagan edi. `login()`ga `setRoleLoading(true)` qo'shildi (xuddi doctor-portal naqshiga mos).
- [x] **Forma label'lari inputga dasturiy bog'lanmagan edi (`htmlFor`/`id` yo'q)** — `Field.jsx`, `DoctorProfile.jsx`даги `BookField`, `TimeSlotPicker.jsx` — screen reader inputning nomini e'lon qilmasdi. Markazlashtirilgan yechim: yangi `lib/withFieldId.js` helper + `useId()`, `Field`/`BookField`ga ulandi (bu avtomatik `Login`/`Register`/`Profile`ni ham tuzatadi); `TimeSlotPicker`даги vaqt tugmalari guruhiga `role="group"`+`aria-labelledby`.
- [x] **`TimeSlotPicker.jsx`/`MyAppointments.jsx` — UTC/local vaqt zonasi nomuvofiqligi** — `toISOString().slice(0,10)` UTC bo'yicha "bugun"ni hisoblardi, UTC+5'da tunda (00:00-05:00) noto'g'ri sana berardi. Yangi `lib/dateUtils.js`даги `toLocalDateStr()` bilan almashtirildi.
- [x] **`Profile.jsx` — ism maydonlarida (`name_uz`/`name_ru`) client-side validatsiya yo'q edi** — tayyor `validation.letters_only` tarjima kaliti ishlatilmasdan turgan edi. `validators.js`ga `nameError()` qo'shildi va ulandi.
- [x] **`Profile.jsx` — JSHSHIR (`national_id`) formatida tekshiruv yo'q edi** — `validators.js`ga `nationalIdError()` (14 xonali) qo'shildi va ulandi, `validation.national_id` tarjima kaliti qo'shildi.
- [x] **`Layout.jsx` — sidebar faqat yig'ilishga avtomoslashardi, kengayishga yo'q** — `resize` listener'ga `else setCollapsed(false)` qo'shildi (simmetrik).
- [ ] **`chatApi.js` — har 4 soniyada butun chat tarixi qayta yuklanadi (samarasiz, funksional xato emas)** — ataylab tuzatilmadi: backend `/chat/message/` endpointida `after_id`/`since`/tartib parametri qo'llab-quvvatlanishi tasdiqlanmagan (TASKS.md'da yozilmagan), noto'g'ri faraz bilan chat tarixini birlashtirish mantig'ini buzish xavfi yuqori. **Backend (siz):** endpoint filtr/tartib imkoniyati aniqlansa, aytib qoling — shunga mos optimallashtiraman.
- ✅ Tekshirildi (2026-09-04): `npm run lint` — 2 xato (oldindan mavjud, aloqasiz `AuthContext.jsx`/`LangContext.jsx` `react-refresh` ogohlantirishi — `git stash` bilan solishtirilib tasdiqlandi). `npm run build` — muvaffaqiyatli.

### `doctor-portal/`

- [x] **`Dashboard.jsx` — "bugungi tashriflar" UTC bilan hisoblanardi** — Toshkent vaqtida (UTC+5) tunda (00:00-05:00) noto'g'ri kun ko'rsatardi (real simulyatsiya bilan tasdiqlangan). `toLocaleDateString('en-CA')`ga o'tkazildi.
- [x] **`Appointments.jsx` — "Video chatga qo'shilish" tugmasi `consultation_type`ni tekshirmasdi** — klinikaga borib qabul (`in_person`) uchun ham video-havola tugmasi chiqardi. Shartga `consultation_type === 'video' || 'voice'` qo'shildi.
- [x] **7 ta sahifada (`Dashboard`, `Appointments`, `Patients`, `Prescriptions`, `Schedule`, `Reviews`, `Payouts`) tarmoq xatosi "bo'sh ro'yxat" bilan bir xil ko'rsatilardi** — `error`/`loadError` state qo'shilib, mavjud `ErrorState` komponenti (loyihada `ChatWindow.jsx`да to'g'ri ishlatilgan naqsh) hammasiga ulandi.
- [x] **`ConfirmDialog.jsx` — halokatli (`danger`) amallarda ham tasdiqlash tugmasi avtomatik fokusda edi** — tasodifiy Enter bosilsa qaytarilmaydigan amal bajarilish xavfi bor edi. Endi `danger` bo'lsa fokus "Bekor qilish"ga o'tadi.
- [x] **8 ta ishlatilmayotgan tarjima kaliti tozalandi** (`translations.js`) — 2 tasi (`patients.phone`/`patients.birth_date`) haqiqatan foydali bo'lgani uchun `Patients.jsx`даги telefon/tug'ilgan sana qatorlariga label sifatida ulandi, qolgan 6 tasi olib tashlandi.
- [x] **`ChatWindow.jsx` — poll-xato bannerida ARIA roli yo'q edi** — `role="status"` qo'shildi.
- [x] **`Profile.jsx` — avatar rasmida mazmunli `alt` yo'q edi** — `alt={form.name_uz || t('profile.avatar')}`.
- [x] **`Payouts.jsx` — pul summalari tilga (`lang`) bog'lanmagan formatlanardi** (sanalar formatlanadi, summalar yo'q — nomuvofiqlik) — `Prescriptions.jsx`даги naqshga mos `lang === 'ru' ? 'ru-RU' : 'uz-UZ'` ulandi.
- ✅ Tekshirildi (2026-09-04): `npm run lint` — 2 xato (oldindan mavjud, aloqasiz, `git stash` bilan tasdiqlandi). `npm run build` — muvaffaqiyatli.

---

**Ishlash tartibi:** Backend — har bir bandni siz yozasiz, men tekshirib/tasdiqlab boraman (kerak bo'lsa real so'rov yuborib sinab ko'raman). Frontend (`patient-portal`, `doctor-portal`) — men to'g'ridan-to'g'ri yozaman, siz tekshirasiz.
