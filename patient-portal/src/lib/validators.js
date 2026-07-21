const PHONE_DIGITS_REGEX = /^\+?\d{9,13}$/;

export const phoneError = (value, t) => {
  if (!value) return '';
  return PHONE_DIGITS_REGEX.test(value.replace(/[\s()-]/g, '')) ? '' : t('validation.phone');
};
