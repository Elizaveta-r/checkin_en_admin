export const parseFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) {
    return { surname: "", firstname: "", patronymic: "" };
  }

  if (parts.length === 1) {
    return { surname: parts[0], firstname: "", patronymic: "" };
  }

  if (parts.length === 2) {
    return { surname: parts[0], firstname: parts[1], patronymic: "" };
  }

  const [surname, firstname, ...rest] = parts;
  return {
    surname,
    firstname,
    patronymic: rest.join(" "),
  };
};
