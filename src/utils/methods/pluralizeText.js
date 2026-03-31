export const pluralizeEmployees = (n) => {
  const abs = Math.abs(n);
  return abs === 1 ? "employee" : "employees";
};
