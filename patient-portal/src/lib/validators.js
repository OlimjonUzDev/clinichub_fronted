const PHONE_DIGITS_REGEX = /^\+?\d{9,13}$/;

export const phoneError = (value, t) => {
  if (!value) return '';
  return PHONE_DIGITS_REGEX.test(value.replace(/[\s()-]/g, '')) ? '' : t('validation.phone');
};

// Faqat harflar (kirill + lotin, o'zbek lotin alifbosidagi tutuq belgisi
// variantlari bilan) — probel va tire (masalan ikki qismli familiya/ism) ruxsat etiladi.
const NAME_LETTERS_REGEX = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳʻʼ'’\s-]+$/;

export const nameError = (value, t) => {
  if (!value) return '';
  return NAME_LETTERS_REGEX.test(value) ? '' : t('validation.letters_only');
};

// O'zbekiston JSHSHIR (PINFL) — 14 ta raqam.
const NATIONAL_ID_REGEX = /^\d{14}$/;

export const nationalIdError = (value, t) => {
  if (!value) return '';
  return NATIONAL_ID_REGEX.test(value.replace(/\s/g, '')) ? '' : t('validation.national_id');
};
