export const getInitials = (surname, firstname) => {
  const parts = [firstname, surname].filter(
    (part) => part && part.trim().length > 0
  );

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return "?";
};
