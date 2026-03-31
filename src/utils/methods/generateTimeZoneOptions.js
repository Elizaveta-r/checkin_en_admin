export const timeZoneOptions = [
  // ----------------------------------------------------------------------
  // ЗАПАДНАЯ ЧАСТЬ РОССИИ И МЕСТНОЕ ВРЕМЯ
  // ----------------------------------------------------------------------

  { value: "Europe/Kaliningrad", label: "UTC+2:00 (Калининград)" },

  // ✅ МОСКОВСКОЕ ВРЕМЯ (МСК)
  { value: "Europe/Moscow", label: "UTC+3:00 (Москва, Санкт-Петербург)" },

  { value: "Europe/Samara", label: "UTC+4:00 (Самара, Ижевск)" },

  // ----------------------------------------------------------------------
  // УРАЛ И СИБИРЬ
  // ----------------------------------------------------------------------

  { value: "Asia/Yekaterinburg", label: "UTC+5:00 (Екатеринбург, Пермь)" },
  { value: "Asia/Omsk", label: "UTC+6:00 (Омск, Новосибирск)" },
  { value: "Asia/Krasnoyarsk", label: "UTC+7:00 (Красноярск, Кемерово)" },
  { value: "Asia/Irkutsk", label: "UTC+8:00 (Иркутск, Улан-Удэ)" },

  // ----------------------------------------------------------------------
  // ДАЛЬНИЙ ВОСТОК
  // ----------------------------------------------------------------------

  { value: "Asia/Yakutsk", label: "UTC+9:00 (Якутск, Благовещенск)" },
  { value: "Asia/Vladivostok", label: "UTC+10:00 (Владивосток, Хабаровск)" },
  { value: "Asia/Magadan", label: "UTC+11:00 (Магадан, Сахалин)" },
  { value: "Asia/Kamchatka", label: "UTC+12:00 (Камчатка, Анадырь)" },
];

/**
 * Ищет форматированное имя часового пояса (label) по его значению (value)
 * и удаляет всё, что находится в скобках.
 * * @param {string} timeZoneValue - Значение часового пояса, полученное с сервера.
 * @returns {string} Упрощенное имя (например, "UTC+12:00 (Камчатка") или пустая строка.
 */
export const getFormattedTimeZoneLabel = (timeZoneValue) => {
  if (!timeZoneValue) {
    return "";
  }

  const foundOption = timeZoneOptions.find(
    (option) => option.value === timeZoneValue
  );

  if (!foundOption) {
    return "";
  }

  const fullLabel = foundOption.label;

  // 1. Находим индекс первой открывающейся скобки
  const bracketIndex = fullLabel.indexOf("(");

  // 2. Если скобка не найдена, возвращаем полный лейбл
  if (bracketIndex === -1) {
    return fullLabel;
  }

  // 3. Извлекаем подстроку до скобки и удаляем пробел перед ней
  // Например: "UTC+12:00 " (обрезаем по bracketIndex)
  return fullLabel.slice(0, bracketIndex).trim();
};
