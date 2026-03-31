export const validateEmail = (email) => {
  if (!email) {
    return "Enter your email";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Enter a valid email address";
  }

  return "";
};

export const validatePassword = (password) => {
  if (!password) {
    return "Enter your password";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }

  if (!/[!@#$%^&*(),.?":{}|_<>]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return "";
};
