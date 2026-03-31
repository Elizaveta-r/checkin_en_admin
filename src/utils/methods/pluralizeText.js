export const pluralizeEmployees = (n) => {
  const abs = Math.abs(n);
  const last = abs % 10;
  const lastTwo = abs % 100;

  if (lastTwo >= 11 && lastTwo <= 14) return "сотрудников";
  if (last === 1) return "сотрудник";
  if (last >= 2 && last <= 4) return "сотрудника";
  return "сотрудников";
};
