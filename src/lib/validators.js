// Shared field-level validators. Each returns an i18n-translated error string
// (empty string = valid). Empty/untouched values never fail here — pairing
// with the `required` attribute already covers "must be filled".

const LETTERS_REGEX = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳIʻʼ'`\s-]+$/;
const PHONE_DIGITS_REGEX = /^\+?\d{9,13}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;

export const lettersOnlyError = (value, t) => {
  if (!value) return '';
  return LETTERS_REGEX.test(value) ? '' : t('validation.letters_only');
};

export const phoneError = (value, t) => {
  if (!value) return '';
  return PHONE_DIGITS_REGEX.test(value.replace(/[\s()-]/g, '')) ? '' : t('validation.phone');
};

export const emailFormatError = (value, t) => {
  if (!value) return '';
  return EMAIL_REGEX.test(value) ? '' : t('validation.email');
};

export const urlFormatError = (value, t) => {
  if (!value) return '';
  return URL_REGEX.test(value) ? '' : t('validation.url');
};

export const digitsOnlyError = (value, t) => {
  if (!value) return '';
  return /^\d+$/.test(value) ? '' : t('validation.digits_only');
};

export const positiveNumberError = (value, t) => {
  if (value === '' || value === null || value === undefined) return '';
  return Number(value) > 0 ? '' : t('validation.positive_number');
};

export const nonNegativeNumberError = (value, t) => {
  if (value === '' || value === null || value === undefined) return '';
  return Number(value) >= 0 ? '' : t('validation.non_negative');
};

// rules: { fieldName: (value, t) => errorString }
export function validateForm(values, rules, t) {
  const errors = {};
  Object.entries(rules).forEach(([field, fn]) => {
    const err = fn(values[field], t);
    if (err) errors[field] = err;
  });
  return errors;
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
