export const WEEKDAY_LABELS = [
  { uz: 'Dushanba', ru: 'Понедельник' },
  { uz: 'Seshanba', ru: 'Вторник' },
  { uz: 'Chorshanba', ru: 'Среда' },
  { uz: 'Payshanba', ru: 'Четверг' },
  { uz: 'Juma', ru: 'Пятница' },
  { uz: 'Shanba', ru: 'Суббота' },
  { uz: 'Yakshanba', ru: 'Воскресенье' },
];

export const weekdayLabel = (weekday, lang) => WEEKDAY_LABELS[weekday]?.[lang === 'ru' ? 'ru' : 'uz'] ?? `#${weekday}`;
