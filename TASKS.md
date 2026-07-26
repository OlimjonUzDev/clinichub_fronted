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

- [ ] Har bir app'dagi `tests.py` bo'sh stub — kamida quyidagilar uchun test yozish:
  - [ ] Registratsiya / login oqimi (shu jumladan `role` escalation endi bloklanganini tekshiruvchi test)
  - [ ] To'lov oqimi (Stripe intent yaratish, webhook idempotency)

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
- [x] `test_patient_cannot_list_invoice`
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

- [x] `test_non_admin_cannot_list_payments` — `PaymentViewSet` — `IsAuthenticated` + `IsAdmin` ikkalasi ham talab qilinadi
- [x] `test_admin_can_list_payments` — muvaffaqiyatli
- [x] `test_create_payment_amount_mismatch_rejected` — `serializers.py:31-34` — `amount != invoice.amount` bo'lsa `400`
- [x] `test_create_payment_for_already_paid_invoice_rejected` — `serializers.py:27-28` — invoice `status='paid'` bo'lsa `400`
- [x] `test_create_payment_valid_succeeds` — to'g'ri summa + to'lanmagan invoice — `201`
- [x] `test_create_stripe_intent_for_own_payment` — `CreateStripeIntentView` (`stripe.PaymentIntent.create`ни `@patch('payments.views.stripe.PaymentIntent.create')` bilan mock qilingan) — o'z to'lovi uchun `client_secret` qaytishi tasdiqlandi
- [x] `test_create_stripe_intent_for_other_patient_payment_returns_404` — `views.py:22`даги `patient__user=request.user` filtri to'g'ri ishlayotganini tasdiqlaydi (bu yerda IDOR himoyasi allaqachon to'g'ri yozilgan — regression testi sifatida foydali)
- [x] `test_stripe_webhook_invalid_signature_rejected` — `Stripe-Signature` header yuborilmasa `stripe.Webhook.construct_event` `SignatureVerificationError` chiqarib `400` qaytishi tasdiqlandi

### `prescriptions/tests.py` — `Prescription`, `PrescriptionItem`

- [ ] `test_owner_doctor_can_create_prescription_with_items` — `serializers.py:22-36`даги custom `create()` — bir nechta dori bilan yaratish
- [ ] `test_prescription_list_filtered_to_own_patient` — patient faqat o'ziga tegishli retseptlarni ko'radi (`views.py:18-19`)
- [ ] `test_prescription_list_filtered_to_own_doctor` — doktor faqat o'zi yozgan retseptlarni ko'radi (`views.py:20-21`)
- [ ] `test_other_doctor_cannot_retrieve_prescription` — `403`
- [ ] `test_patient_cannot_update_prescription` — `permissions.py:12`даги non-safe tekshiruv faqat doktor/adminga ruxsat beradi, patient (hatto egasi bo'lsa ham) yoza olmaydi
- [ ] `test_update_with_invalid_item_data_returns_400_not_500` — 3-bosqichda tuzatilgan bug uchun regression testi (`serializers.py:39-59`)
- [ ] `test_update_replaces_items_when_items_provided` — eski itemlar o'chirilib, yangilari yozilishi
- [ ] `test_update_without_items_keeps_existing_items` — `items` yuborilmasa mavjudlari saqlanib qolishi

### `users/tests.py` — Registratsiya, `UserListView`, `DashboardView`

- [ ] `test_register_creates_patient_role_regardless_of_payload` — `role: "admin"` yuborilsa ham DB'da `role='patient'` bo'lib qolishi (1-bosqichdagi tuzatish uchun regression testi)
- [ ] `test_register_rejects_weak_password` — `"12345"` kabi zaif parol `400`
- [ ] `test_register_response_does_not_include_password` — javobda `password` maydoni chiqmasligi
- [ ] `test_non_admin_cannot_list_users` — `UserListView` — `403`
- [ ] `test_admin_can_list_users` — muvaffaqiyatli
- [ ] `test_non_admin_cannot_access_dashboard` — `DashboardView` — `403`
- [ ] `test_admin_can_access_dashboard` — statistikalar to'g'ri qaytishi

## 5-BOSQICH — Infratuzilma / deploy

- [ ] **`ALLOWED_HOSTS = []`** — production domenini/IP'ni qo'shish (`DEBUG=False` bo'lganda bu bo'sh bo'lsa hamma so'rov `DisallowedHost` xatosi beradi). Hozircha `DEBUG=True` bo'lgani uchun ta'siri yo'q — haqiqiy domen aniq bo'lgach qo'shiladi.
- [ ] SQLite'dan PostgreSQL'ga o'tish (`psycopg2-binary` allaqachon o'rnatilgan, `DATABASES` sozlamasini yangilash kerak).
- [x] `requiremets.txt` fayl nomini `requirements.txt`ga to'g'irlash (ko'p hosting platformalari aynan shu nomni qidiradi). ✅ Bajarildi (2-bosqichda tasodifan). UTF-16 kodировкani UTF-8'ga o'tkazish hali qilinmagan (ixtiyoriy).
- [ ] Statik fayllarni production'da xizmat qilish sozlamasi (`STATIC_ROOT`, masalan whitenoise).
- [ ] `LOGGING` konfiguratsiyasini qo'shish (production'da xatolarni kuzatish uchun).
- [ ] `notifications` (Infobip SMS) app'ining haqiqatda ishlashini tekshirish.

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

### Backend (mavjud `clinichub` loyihasiga qo'shimcha/tuzatish)

- [ ] **Patient self-registratsiya to'liq ishlamayapti** — `users/serializers.py`даги `RegisterSerializers` faqat `User` yaratadi (`role='patient'`), lekin `patients/models.py`даги `Patient` (OneToOneField `user`) yozuvi yaratilmaydi. `patients/views.py`даги `PatientViewSet.get_permissions()` esa `create` action'ini faqat `IsAdmin()`ga ruxsat beradi — demak hozircha ro'yxatdan o'tgan bemor o'zining Patient profilini (ism, tug'ilgan sana, telefon, JSHSHIR) hech qachon to'ldira olmaydi. Kerak: patient o'ziga tegishli Patient'ni yarata olishi (`user=request.user` serializer/view ichida avtomatik biriktirilsin, client `user`/`patient_id` yubormasin — IDOR oldini olish uchun), va OneToOne bo'lgani uchun ikkinchi marta yaratib bo'lmasligi tekshirilsin.
  - ⚠️ **BLOKER — `patient-portal` frontend shunga tayyor kutmoqda:** `PatientViewSet`ga `@action(detail=False, url_path='me')` qo'shish kerak:
    - `GET /patients/patient/me/` — `request.user`ga tegishli `Patient`ni qaytaradi, topilmasa `404`.
    - `POST /patients/patient/me/` — `user=request.user` bilan yangi `Patient` yaratadi (agar allaqachon bor bo'lsa `400`).
    - `PATCH /patients/patient/me/` — o'zinikini yangilaydi.
    - Bu bir yo'la ID-bilmaslik muammosini ham, joriy `IsAdminOrOwnerPatient`даги IDOR bug'ini (SAFE_METHODS uchun auth tekshirilmasligi) ham chetlab o'tadi — patient endi faqat shu action orqali ishlaydi.
    - Frontend allaqachon aynan shu 3 ta so'rovni yuboradi: `patient-portal/src/pages/Profile.jsx`.
- [ ] **Doktor/klinika ro'yxatini ochiq ko'rish qarori** — `doctors/views.py`даги `DoctorViewSet`да `list`/`retrieve` uchun `IsAuthenticated()` talab qilinadi (login qilmasdan doktor qidirib bo'lmaydi). Qaror kerak: patientlar ro'yxatdan o'tishdan oldin doktor/narx/klinikalarni ko'ra olishi kerakmi (marketing uchun foydali) yoki faqat login qilgandan keyin ko'rinsinmi. `catalog`/`clinics` app'lari (`IsAdminOrReadOnly`) allaqachon anonim `GET`ga ochiq — shunga moslashtirish mumkin.
- [ ] **Appointment yaratishda `patient` maydoni** — patient tomonidan yuborilganda boshqa bemor nomidan yozib qo'yish (IDOR) mumkin emasligini tekshirish/ta'minlash — `patient` avtomatik `request.user.patient` bo'lishi kerak, client tanlay olmasligi kerak.
  - ⚠️ **BLOKER — `patient-portal` shunga tayyor kutmoqda:** `AppointmentViewSet`да `perform_create()`ni override qilib, `request.user.role == 'patient'` bo'lsa `serializer.save(patient=request.user.patient)` qilish kerak (client yuborgan `patient`ni butunlay e'tiborsiz qoldirib). Frontend (`patient-portal/src/pages/DoctorProfile.jsx`, `handleBook`) `patient` maydonini umuman yubormaydi — aynan shuni kutadi.
- [ ] **"Faqat o'zinikini ko'rish" auditi** — Appointment/Prescription/Invoice/Rating viewset'larida patient roli uchun queryset `request.user`ga filtrlanganini (`get_queryset()`) tasdiqlash — hozir ba'zilari admin-panel ehtiyoji uchun yozilgan, patient uchun sinalmagan. ✅ Tekshirildi (2026-07-25, real so'rov bilan): `Appointment` va `Prescription` to'g'ri filtrlangan (patient faqat o'zinikini ko'radi). `Rating` (`appointments/views.py:32-41`) `list`/`retrieve` uchun hech qanday `get_queryset()` filtri yo'q — istalgan login qilgan user `/appointments/rating/` orqali **hamma bemorning** sharhini (comment matni bilan) ko'ra oladi. `Invoice` esa aksincha — `list` action patient uchun butunlay yopiq (pastga qarang).
- [ ] **Rating yaratish cheklovi** — patient faqat o'zi borgan va yakunlangan (`status='completed'`) appointment uchun baho qoldira olishi, boshqa birovning yoki tugallanmagan appointment uchun yoza olmasligi kerak. Hozir `RatingSerializers` (`appointments/serializers.py:36-39`) oddiy `ModelSerializer`, `validate()` yo'q — client istalgan `appointment`/`doctor` ID yuborib begona appointment'ga baho qo'yishi mumkin (IDOR). `patient-portal/src/pages/Reviews.jsx` frontendda faqat o'z tugallangan appointment'larini tanlash imkonini beradi, lekin bu faqat UI cheklovi — backend hali ham himoyasiz.
- [x] **To'lov (Stripe) patient oqimi** — ⚠️ **Tekshirildi (2026-07-25, real so'rov bilan) — patient uchun hozircha butunlay ishlamaydi:**
  - `billing/views.py`даги `InvoiceViewSet.get_permissions()` — `list`/`create` faqat `IsAdmin()`. Patient hatto o'zining invoice'lari ro'yxatini ko'ra olmaydi (`GET /billing/invoice/` → `403`, real so'rov bilan tasdiqlangan). Kerak: `list` uchun ham `IsAuthenticated` ruxsat berish, `get_queryset()`да non-admin uchun `patient__user=request.user` bilan filtrlash.
  - `payments/views.py`даги `PaymentViewSet.permission_classes = [IsAuthenticated, IsAdmin]` — bu barcha action (`list`/`retrieve`/`create`) uchun class-darajasida qattiq belgilangan, patient hech qachon o'z to'lovini yarata/ko'ra olmaydi (`POST /payments/payment/` → `403`, tasdiqlangan). Kerak: `get_permissions()`ga o'tish (`InvoiceViewSet`dagidek), patient uchun `create`da `patient`ni `request.user.patient`dan avtomatik olish (client yubormasin — IDOR oldini olish uchun, appointment'dagi tuzatish bilan bir xil naqsh), `list`/`retrieve`ni `patient__user=request.user`ga filtrlash.
  - `CreateStripeIntentView` (`payments/views.py:17-31`) — bu allaqachon to'g'ri ishlaydi (`patient__user=request.user` bilan filtrlangan), lekin yuqoridagi ikkita bloker tufayli patient unga yetib bora olmaydi (avval `Payment` yozuvi yaratish kerak, buning uchun esa `create` yopiq).
  - ⚠️ **BLOKER — `patient-portal/src/pages/Payments.jsx` shu uchta tuzatishni kutib qurilgan:** invoice ro'yxati, to'lov yaratish, Stripe Card orqali tasdiqlash — barchasi frontendda tayyor (`@stripe/stripe-js` + `@stripe/react-stripe-js` bilan), lekin yuqoridagi permission tuzatishlarsiz sahifa doim `403` qaytaradi.
- [ ] **`GET /me/` endpoint yo'q** — ⚠️ **BLOKER — `patient-portal` shunga tayyor kutmoqda:** joriy login qilgan foydalanuvchining `role`ini (va xohlasa `username`ni) qaytaruvchi oddiy `IsAuthenticated` endpoint kerak (masalan `users/views.py`га `MeView(APIView)`, `users/urls.py`да `path('me/', MeView.as_view())`). Hozir JWT token payload'da (`TokenObtainPairView` standart, custom claim yo'q) va boshqa hech qanday endpoint'da rol ma'lumoti yo'q — frontend admin/doctor hisoblarini patient portaldan bloklay olmayapti, chunki rolni bilishning imkoni yo'q. `patient-portal/src/context/AuthContext.jsx` login'dan keyin `GET /me/`ni chaqirib `role`ni saqlaydi va admin/doctor bo'lsa avtomatik chiqarib yuboradi — hozircha endpoint yo'qligi sababli (`404`, tasdiqlangan) bu himoya ishlamayapti.
- [ ] **Forgot-password / reset-password** — 8-bosqichda admin panel uchun ham flag qilingan, patient portal uchun ham zarur (email orqali parol tiklash endpoint'i hali yo'q).
- [ ] **Bildirishnomalar** — `notifications` (Infobip SMS) va/yoki email: ro'yxatdan o'tish tasdig'i, appointment eslatmasi, "doktor band qildi/bekor qildi" xabarlari patient uchun ham ishga tushirilishi kerak.
- [x] **CORS** — `localhost:5174` (`patient-portal`) `config/settings.py`даги `CORS_ALLOWED_ORIGINS`ga qo'shildi va tekshirildi (login endi ishlayapti).

### Frontend (yangi, mustaqil loyiha — admin panel kodidan alohida)

- [x] Yangi papka — `clinichub_fronted/patient-portal/` (alohida repo emas, admin panel bilan bitta repo ichida qo'shni papka bo'lishga qaror qilindi). React + Vite + Tailwind, admin panel bilan bir xil stack, `dev` porti `5174` (admin `5173` bilan to'qnashmasin uchun).
- [ ] **Login / Register** — asosiy oqim tayyor (`patient-portal/src/pages/Login.jsx`, `Register.jsx`; Register'da rol tanlash yo'q, doim `patient`). "Parolni unutdim" oqimi hali yo'q (backendda ham yo'q, 8-bosqichga bog'liq).
- [x] **Bosh sahifa** — tayyor (`patient-portal/src/pages/Home.jsx`): ism bo'yicha qidiruv, mutaxassislik/klinika filtri.
- [ ] **Doktor profili** — tayyor (`patient-portal/src/pages/DoctorProfile.jsx`): narx (`rank_price`) va haftalik ish jadvali ko'rsatiladi. **Aniq bo'sh slot hisoblash yo'q** — patient istalgan sana/vaqtni tanlaydi, band/ish vaqtidan tashqari bo'lsa backend validatsiyasi (`AppointmentSerializers.validate()`) xato qaytaradi. Soddalashtirilgan yechim, keyin kerak bo'lsa slot-calc qo'shiladi.
- [x] **Appointment (tashrif) band qilish** — tayyor, xuddi shu sahifada (`DoctorProfile.jsx` → `handleBook`). **Backend bloker:** yuqoridagi `perform_create` tuzatilmaguncha ishlamaydi (frontend `patient` maydonini yubormaydi).
- [x] **"Mening tashriflarim"** — ro'yxat + bekor qilish + **qayta rejalashtirish** tayyor (`patient-portal/src/pages/MyAppointments.jsx`). Qayta rejalashtirish sana/vaqt tanlab, `PATCH start_time`/`end_time` yuboradi — bu allaqachon ishlaydi (`IsAdminOrOwnerAppointments` patientning o'z appointment'ini yangilashiga ruxsat beradi), backend bloker yo'q.
- [x] **Retseptlar** — tayyor (`patient-portal/src/pages/Prescriptions.jsx`): `GET /prescriptions/prescription/` orqali o'z retseptlari + dorilar ro'yxatini ko'rsatadi. Real so'rov bilan tekshirildi — patient uchun to'g'ri filtrlangan, backend bloker yo'q. **Laboratoriya buyurtmalari** backendda mos model yo'qligi sababli qo'shilmadi (kerak bo'lsa yangi model/app kerak bo'ladi).
- [x] **To'lov sahifasi** — kod tayyor (`patient-portal/src/pages/Payments.jsx`, Stripe Card orqali; `@stripe/stripe-js` + `@stripe/react-stripe-js` qo'shildi, `VITE_STRIPE_PUBLISHABLE_KEY` `.env`ga kerak — `.env.example`га qarang). **Ishlamaydi** — yuqoridagi backend bo'limidagi uchta bloker (Invoice list, Payment permissions, `/me/`dan mustaqil) tuzatilmaguncha `403` qaytaveradi.
- [x] **Reyting/sharh qoldirish** — tayyor (`patient-portal/src/pages/Reviews.jsx`): tugallangan, hali baholanmagan tashriflar ro'yxati + yulduzcha/izoh formasi, va patientning o'z sharhlari ro'yxati (backend `/appointments/rating/`ni filtrlamagani uchun frontendda o'zinikiga cheklab ko'rsatiladi). Ishlaydi, lekin yuqoridagi "Rating yaratish cheklovi" bandi backendda hali tuzatilmagan (IDOR xavfi qoladi).
- [x] **Profil** — tayyor (`patient-portal/src/pages/Profile.jsx`): ism/jins/tug'ilgan sana/telefon/JSHSHIR/manzil ko'rish va tahrirlash. **Backend bloker:** yuqoridagi `/patients/patient/me/` action qo'shilmaguncha ishlamaydi (404 qaytadi).
- [x] Auth: admin/doctor hisobi bilan kirilsa, patient portalga ruxsat berilmasin — frontend tayyor (`App.jsx`даги `Protected`, `AuthContext.jsx`). **Backend bloker:** yuqoridagi `GET /me/` endpoint qo'shilmaguncha rolni bilib bo'lmagani uchun bloklash ishlamaydi.
- [x] Responsive dizayn — grid/flex Tailwind bilan mobil ekranga moslashtirilgan (asosiy sahifalarda tekshirildi).

---

**Ishlash tartibi:** Backend — har bir bandni siz yozasiz, men tekshirib/tasdiqlab boraman (kerak bo'lsa real so'rov yuborib sinab ko'raman). Frontend (`patient-portal`) — men to'g'ridan-to'g'ri yozaman, siz tekshirasiz.
