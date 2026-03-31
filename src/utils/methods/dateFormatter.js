import { isAfter } from "date-fns/isAfter";
import { parseISO } from "date-fns/parseISO";
import { subDays } from "date-fns/subDays";

export function convertGoDateToISO(goDateStr) {
  const [date, time] = goDateStr.split(" ");
  return `${date}T${time}Z`;
}

export const formatDateToISO = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export function formatDateLocal(string) {
  const isoString = convertGoDateToISO(string);
  if (!isoString || isoString.startsWith("0001-01-01")) return "—";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getFormattedDateAndUpdateFlag(goDateStr) {
  const isZeroDate = goDateStr.startsWith("0001-01-01");

  if (isZeroDate) {
    return {
      formattedDate: null,
      wasUpdatedRecently: false,
    };
  }

  const isoString = convertGoDateToISO(goDateStr);
  const parsedDate = parseISO(isoString);

  const sevenDaysAgo = subDays(new Date(), 7);
  const wasUpdatedRecently = isAfter(parsedDate, sevenDaysAgo);

  const formattedDate = parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    formattedDate,
    wasUpdatedRecently,
  };
}

const pad2 = (n) => String(n).padStart(2, "0");

export const toISODate = (d) => {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

export const getMonthBounds = (date = new Date()) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end };
};

export const formatDate = (iso) => {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};
