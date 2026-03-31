export const timeZoneOptions = [
  // UTC-12 to -11 (Океания)
  { value: "Etc/GMT+12", label: "UTC-12:00 (International Date Line West)" },
  {
    value: "Pacific/Pago_Pago",
    label: "UTC-11:00 (Pago Pago, American Samoa)",
  },

  // Северная Америка
  { value: "Pacific/Honolulu", label: "UTC-10:00 (Honolulu, Hawaii)" },
  { value: "America/Anchorage", label: "UTC-09:00 (Anchorage, Alaska)" },
  {
    value: "America/Los_Angeles",
    label: "UTC-08:00 (Los Angeles, Pacific Time)",
  },
  { value: "America/Denver", label: "UTC-07:00 (Denver, Mountain Time)" },
  { value: "America/Chicago", label: "UTC-06:00 (Chicago, Central Time)" },
  { value: "America/New_York", label: "UTC-05:00 (New York, Eastern Time)" },
  { value: "America/Halifax", label: "UTC-04:00 (Halifax, Atlantic Time)" },
  { value: "America/St_Johns", label: "UTC-03:30 (St. John's, Newfoundland)" },

  // Южная Америка / Атлантика
  { value: "America/Sao_Paulo", label: "UTC-03:00 (Brasília, Buenos Aires)" },
  { value: "Atlantic/Azores", label: "UTC-01:00 (Azores)" },

  // Западная Европа
  { value: "Europe/London", label: "UTC±00:00 (London, Dublin, Lisbon)" },

  // Центральная Европа / Африка
  { value: "Europe/Berlin", label: "UTC+01:00 (Berlin, Paris, Madrid, Lagos)" },

  // Восточная Европа / Ближний Восток
  {
    value: "Europe/Athens",
    label: "UTC+02:00 (Athens, Helsinki, Cairo, Jerusalem)",
  },

  // Россия / Азия / Африка
  { value: "Europe/Moscow", label: "UTC+03:00 (Moscow, Istanbul, Nairobi)" },

  // Персидский залив / Индия
  { value: "Asia/Dubai", label: "UTC+04:00 (Dubai)" },
  { value: "Asia/Kolkata", label: "UTC+05:30 (New Delhi, Chennai, Mumbai)" }, // Индия
  {
    value: "Asia/Yekaterinburg",
    label: "UTC+05:00 (Yekaterinburg, Islamabad)",
  },

  // Юго-Восточная Азия
  { value: "Asia/Dhaka", label: "UTC+06:00 (Dhaka, Omsk)" },
  { value: "Asia/Bangkok", label: "UTC+07:00 (Bangkok, Jakarta, Krasnoyarsk)" },

  // Восточная Азия / Австралия
  {
    value: "Asia/Shanghai",
    label: "UTC+08:00 (Beijing, Hong Kong, Singapore, Perth)",
  },
  { value: "Asia/Tokyo", label: "UTC+09:00 (Tokyo, Seoul, Yakutsk)" },

  // Австралия / Тихий океан
  { value: "Australia/Adelaide", label: "UTC+09:30 (Adelaide, Darwin)" }, // Центральная Австралия
  {
    value: "Australia/Sydney",
    label: "UTC+10:00 (Sydney, Brisbane, Vladivostok)",
  },

  // Дальний Восток / Океания
  { value: "Pacific/Noumea", label: "UTC+11:00 (Noumea, Magadan)" },
  {
    value: "Pacific/Auckland",
    label: "UTC+12:00 (Auckland, Wellington, Kamchatka)",
  },
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
    (option) => option.value === timeZoneValue,
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
