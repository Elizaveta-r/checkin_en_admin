/**
 * Smart rounding:
 * - >= 1  → 2 decimals
 * - <  1  → up to the first significant digit + 2 more decimals (but not more than maxDecimals)
 * - preserves the sign of the number
 */
export function smartRound(input, maxDecimals = 8) {
  if (input === null || input === undefined) return NaN;

  const num =
    typeof input === "number" ? input : Number(String(input).replace(",", "."));
  if (!Number.isFinite(num)) return NaN;

  const abs = Math.abs(num);
  if (abs === 0) return 0;

  if (abs >= 1) return Number(num.toFixed(2));

  const str = abs.toFixed(maxDecimals);
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

  return v.toLocaleString("en-US", {
    minimumFractionDigits: String(v).includes(".") ? 2 : 0,
    maximumFractionDigits: 8,
  });
}

export function formatSmartMoney(value, currency = "USD", locale = "en-US") {
  const v = smartRound(value);
  if (!Number.isFinite(v)) return "—";

  const hasFraction = !Number.isInteger(v);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 8,
  }).format(v);
}
