export const getEmailName = (email) => {
  if (typeof email !== "string") return "";
  const index = email.indexOf("@");
  return index !== -1 ? email.slice(0, index) : email;
};
