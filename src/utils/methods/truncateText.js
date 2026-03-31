/**
 * Усекает строку текста до максимальной длины, добавляя многоточие (...),
 * если строка была длиннее.
 *
 * @param {string} text Исходная строка текста.
 * @param {number} [maxLength=80] Максимально допустимая длина строки.
 * @returns {string} Усеченная строка.
 */
export const truncateText = (text, maxLength = 80) => {
  if (typeof text !== "string" || !text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
};
