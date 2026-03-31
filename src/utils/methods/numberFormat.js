/**
 * Умное округление:
 * - >= 1  → 2 знака
 * - <  1  → до первой значащей цифры + ещё 2 знака (но не больше maxDecimals)
 * - сохраняет знак числа
 */
export function smartRound(input, maxDecimals = 8) {
  if (input === null || input === undefined) return NaN;

  // Заменяем запятую на точку (если вдруг "0,123")
  const num =
    typeof input === "number" ? input : Number(String(input).replace(",", "."));
  if (!Number.isFinite(num)) return NaN;

  const abs = Math.abs(num);
  if (abs === 0) return 0;

  if (abs >= 1) return Number(num.toFixed(2));

  const str = abs.toFixed(maxDecimals); // гарантированная десятичная запись
  const match = str.match(/0\.(0*)([1-9])/);
  let decimals = 2;
  if (match) {
    const leadingZeros = match[1].length;
    decimals = leadingZeros + 2;
  }
  decimals = Math.min(decimals, maxDecimals);

  return Number(num.toFixed(decimals));
}

export function formatSmartNumber(value) {
  const v = smartRound(value);
  if (!Number.isFinite(v)) return "—";

  return v.toLocaleString("ru-RU", {
    minimumFractionDigits: String(v).includes(".") ? 2 : 0,
    maximumFractionDigits: 8,
  });
}

export function formatSmartMoney(value) {
  const formatted = formatSmartNumber(value);
  if (formatted === "—") return "—";
  return `${formatted} ₽`;
}
