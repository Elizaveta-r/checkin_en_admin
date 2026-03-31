export function formatMoneyDynamic(input, currency = "RUB") {
  const value =
    typeof input === "number" ? input : Number(input.replace(",", "."));

  if (!isFinite(value)) return "—";

  if (value === 0) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }

  const abs = Math.abs(value);
  let dynamicPrecision = 2;

  if (abs < 1) {
    const str = abs.toFixed(20);
    const match = str.match(/^0\.(0*)([1-9])/);
    if (match) {
      const zeros = match[1].length;
      dynamicPrecision = zeros + 1;
    }
  }

  const rounded = Number(value.toFixed(dynamicPrecision));

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: dynamicPrecision,
    maximumFractionDigits: dynamicPrecision,
  }).format(rounded);
}
