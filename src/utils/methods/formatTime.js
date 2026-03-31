/**
 * Извлекает время в формате "ЧЧ:ММ" из строки типа "0000-01-01 09:00:00 +0000 UTC".
 *
 * @param {string} dateTimeString - Строка даты и времени.
 * @returns {string} Время в формате "ЧЧ:ММ".
 */
export const formatTime = (dateTimeString) => {
  if (typeof dateTimeString !== "string" || dateTimeString.length < 16) {
    return "-";
  }

  return dateTimeString.slice(11, 16);
};
