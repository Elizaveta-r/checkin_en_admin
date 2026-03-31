const RU_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const parseYMD = (s) => {
  // "2025-12-19" -> local date 00:00
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const startOfWeekMonday = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay(): 0=Вс ... 6=Сб -> сделаем 0=Пн ... 6=Вс
  const mondayIndex = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayIndex);
  return d;
};

export const buildWeekChartData = (day_stats) => {
  const today = new Date();
  const todayYMD = toYMD(today);

  const monday = startOfWeekMonday(today);

  // базовая неделя Пн..Вс с нулями
  const week = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);

    return {
      date: toYMD(dt),
      name: RU_WEEK[i],
      Выполнено: 0,
      Проблемные: 0,
    };
  });

  const idxByDate = new Map(week.map((x, i) => [x.date, i]));

  (day_stats ?? []).forEach((item) => {
    if (!item?.date) return;

    // выкидываем “будущее” относительно сегодня
    if (item.date > todayYMD) return;

    const idx = idxByDate.get(item.date);
    if (idx == null) return; // не текущая неделя

    const key = item.is_done ? "Выполнено" : "Проблемные";
    week[idx][key] += 1;
  });

  return week;
};
