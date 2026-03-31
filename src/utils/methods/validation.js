// Валидация email
export const validateEmail = (email) => {
  if (!email) {
    return "Введите email";
  }

  // RFC 5322 compliant, но упрощённый вариант
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Введите корректный email";
  }

  return "";
};

// Валидация пароля
export const validatePassword = (password) => {
  if (!password) {
    return "Введите пароль";
  }

  if (password.length < 8) {
    return "Пароль должен содержать минимум 8 символов";
  }

  // хотя бы 1 цифра
  if (!/\d/.test(password)) {
    return "Пароль должен содержать хотя бы одну цифру";
  }

  // хотя бы один спецсимвол
  if (!/[!@#$%^&*(),.?":{}|_<>]/.test(password)) {
    return "Пароль должен содержать хотя бы один спецсимвол";
  }

  return "";
};
