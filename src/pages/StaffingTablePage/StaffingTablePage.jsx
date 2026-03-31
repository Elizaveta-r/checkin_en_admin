import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./StaffingTablePage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { getTableData } from "../../utils/api/actions/staffingTable";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FilterModuleStaffingTable } from "../../modules/FilterModuleStaffingTable/FilterModuleStaffingTable";
import { useMediaQuery } from "react-responsive";
import * as XLSX from "xlsx-js-style";

import { Button } from "../../ui/Button/Button";
import { FileDown, FileSpreadsheet } from "lucide-react";

const pad2 = (n) => String(n).padStart(2, "0");

const toISODate = (d) => {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const formatHM = (totalMinutes) => {
  const mins = Number(totalMinutes) || 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${pad2(m)}`;
};

const buildMinutesMap = (stats = []) => {
  const map = new Map();
  for (const s of stats) {
    const minutes =
      (Number(s.hours_worked) || 0) * 60 + (Number(s.minutes_worked) || 0);
    map.set(`${s.month}-${s.month_day}`, minutes);
  }
  return map;
};

// Получить начало месяца и текущую дату
const getDefaultDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  return { start: startOfMonth, end: today };
};

const buildDaysInRange = (start, end) => {
  const days = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);

  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  const fmt = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  });

  while (cur <= last) {
    days.push({
      key: toISODate(cur),
      day: cur.getDate(),
      month: cur.getMonth() + 1,
      year: cur.getFullYear(),
      label: fmt.format(cur),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

export default function StaffingTablePage() {
  const dispatch = useDispatch();

  const { tableData: mappedData } = useSelector((state) => state?.table);

  // Инициализируем с начала месяца до текущего дня
  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultRange.start,
      endDate: defaultRange.end,
      key: "selection",
    },
  ]);

  const isPhone = useMediaQuery({ query: "(max-width: 480px)" });
  const isTinyPhone = useMediaQuery({ query: "(max-width: 360px)" });

  const colEmployee = isTinyPhone ? 160 : isPhone ? 190 : 280;
  const colDay = isTinyPhone ? 42 : isPhone ? 52 : 70;
  const colTotal = isTinyPhone ? 60 : isPhone ? 70 : 90;
  const colDaysWorked = isTinyPhone ? 50 : isPhone ? 60 : 80;

  // Проверяем, что обе даты установлены и валидны
  const isFilterActive =
    dateRange?.[0]?.startDate &&
    dateRange?.[0]?.endDate &&
    dateRange[0].startDate instanceof Date &&
    dateRange[0].endDate instanceof Date &&
    !isNaN(dateRange[0].startDate.getTime()) &&
    !isNaN(dateRange[0].endDate.getTime());

  const effectiveRange = useMemo(() => {
    if (isFilterActive) {
      return {
        start: dateRange[0].startDate,
        end: dateRange[0].endDate,
      };
    }
    return defaultRange;
  }, [isFilterActive, dateRange, defaultRange]);

  const daysInRange = useMemo(() => {
    return buildDaysInRange(effectiveRange.start, effectiveRange.end);
  }, [effectiveRange]);

  const renderHeader = useMemo(() => {
    return [
      "Подразделение / Сотрудник",
      ...daysInRange.map((d) => d.label),
      "Итог",
      "Дней",
    ];
  }, [daysInRange]);

  const hasData = mappedData && mappedData.length > 0;

  const exportToExcel = () => {
    const aoa = [];
    aoa.push(renderHeader);

    for (const dep of mappedData || []) {
      aoa.push([dep.title, ...Array(daysInRange.length).fill(""), "", ""]);

      for (const emp of dep.employees || []) {
        const minutesMap = buildMinutesMap(emp.stats || []);

        const dayCells = daysInRange.map((d) => {
          const key = `${d.month}-${d.day}`;
          return minutesMap.has(key) ? formatHM(minutesMap.get(key)) : "–";
        });

        const totalMinutes = daysInRange.reduce(
          (sum, d) => sum + (minutesMap.get(`${d.month}-${d.day}`) || 0),
          0
        );

        const workedDays = daysInRange.reduce((cnt, d) => {
          const mins = minutesMap.get(`${d.month}-${d.day}`) || 0;
          return cnt + (mins > 0 ? 1 : 0);
        }, 0);

        aoa.push([
          emp.fullname,
          ...dayCells,
          formatHM(totalMinutes),
          workedDays,
        ]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const totalCols = 1 + daysInRange.length + 2;

    const firstColMaxLen = aoa.reduce((max, row) => {
      const v = row?.[0];
      return Math.max(max, v ? String(v).length : 0);
    }, 0);

    const firstColWpx = Math.min(520, Math.max(160, firstColMaxLen * 8 + 24));

    ws["!cols"] = [
      { wpx: firstColWpx },
      ...Array(daysInRange.length).fill({ wpx: 56 }),
      { wpx: 80 }, // Итог
      { wpx: 55 }, // Дней
    ];

    ws["!rows"] = Array.from({ length: aoa.length }, (_, r) =>
      r === 0 ? { hpx: 28 } : { hpx: 22 }
    );

    ws["!merges"] = ws["!merges"] || [];
    const isDeptRow = (r) =>
      aoa[r]?.[0] && aoa[r].slice(1).every((x) => x === "" || x == null);

    for (let r = 1; r < aoa.length; r++) {
      if (isDeptRow(r)) {
        ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: totalCols - 1 } });
      }
    }

    const baseCellStyle = {
      font: { sz: 14 },
      alignment: { vertical: "center" },
    };

    const headerStyle = {
      font: { bold: true, sz: 14 },
      fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "D9D9D9" } },
        bottom: { style: "thin", color: { rgb: "D9D9D9" } },
        left: { style: "thin", color: { rgb: "D9D9D9" } },
        right: { style: "thin", color: { rgb: "D9D9D9" } },
      },
    };

    const deptStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
      fill: { patternType: "solid", fgColor: { rgb: "2F5597" } },
      alignment: { vertical: "center" },
    };

    const zebraA = {
      fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
    };
    const zebraB = {
      fill: { patternType: "solid", fgColor: { rgb: "FAFAFA" } },
    };

    const setCellStyle = (r, c, s) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) return;
      ws[addr].s = { ...(ws[addr].s || {}), ...s };
    };

    for (let c = 0; c < totalCols; c++) {
      setCellStyle(0, c, { ...headerStyle });
    }

    let zebra = 0;
    for (let r = 1; r < aoa.length; r++) {
      if (isDeptRow(r)) {
        setCellStyle(r, 0, { ...deptStyle });
        zebra = 0;
      } else {
        const rowFill = zebra % 2 === 0 ? zebraA : zebraB;
        for (let c = 0; c < totalCols; c++) {
          setCellStyle(r, c, { ...baseCellStyle, ...rowFill });
        }
        zebra++;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Штатное расписание");
    XLSX.writeFile(
      wb,
      `staffing_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Загружаем данные при изменении диапазона дат
  useEffect(() => {
    if (isFilterActive) {
      const startISO = toISODate(dateRange[0].startDate);
      const endISO = toISODate(dateRange[0].endDate);

      if (startISO && endISO) {
        dispatch(getTableData(startISO, endISO, "Europe/Moscow"));
      }
    }
  }, [dispatch, dateRange, isFilterActive]);

  // Начальная загрузка с начала месяца до текущего дня
  useEffect(() => {
    const { start, end } = defaultRange;
    dispatch(getTableData(toISODate(start), toISODate(end), "Europe/Moscow"));
  }, [dispatch, defaultRange]);

  return (
    <div className={styles.page}>
      <div className={styles.tableHeader}>
        <div className={styles.headerTop}>
          <PageTitle title="Штатное расписание" />
          {hasData && (
            <Button
              title="Экспорт в Excel"
              onClick={exportToExcel}
              secondary
              leftIcon={<FileDown size={18} />}
            />
          )}
        </div>

        <FilterModuleStaffingTable
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      <div className={styles.tableContainer}>
        {!hasData ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FileSpreadsheet size={64} />
            </div>
            <h3 className={styles.emptyTitle}>Нет данных для отображения</h3>
            <p className={styles.emptyDescription}>
              {isFilterActive
                ? "По выбранному периоду данные отсутствуют. Попробуйте изменить фильтры."
                : "Данные по штатному расписанию ещё не добавлены. Начните добавлять сотрудников и их рабочее время."}
            </p>
          </div>
        ) : (
          <div className={styles.scrollWrapper}>
            <div
              className={styles.grid}
              style={{
                gridTemplateColumns: `${colEmployee}px repeat(${daysInRange.length}, ${colDay}px) ${colTotal}px ${colDaysWorked}px`,
              }}
            >
              {renderHeader.map((h, index) => {
                const isLast = index === renderHeader.length - 1; // "Дней"
                const isPrevLast = index === renderHeader.length - 2; // "Итог"

                return (
                  <div
                    key={`${h}-${index}`}
                    className={`${styles.headerCell} ${
                      index === 0 ? styles.stickyEmployee : ""
                    } ${isPrevLast ? styles.stickyTotal : ""} ${
                      isLast ? styles.stickyDays : ""
                    }`}
                    title={h}
                  >
                    {h}
                  </div>
                );
              })}

              {mappedData?.map((dep) => (
                <React.Fragment key={dep.id}>
                  <div
                    className={styles.departmentCell}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <p style={{ position: "sticky", left: "14px" }}>
                      {dep.title}
                    </p>
                  </div>

                  {dep.employees.map((emp) => {
                    const minutesMap = buildMinutesMap(emp.stats || []);

                    const totalMinutes = daysInRange.reduce((sum, d) => {
                      return sum + (minutesMap.get(`${d.month}-${d.day}`) || 0);
                    }, 0);

                    const workedDays = daysInRange.reduce((cnt, d) => {
                      const mins = minutesMap.get(`${d.month}-${d.day}`) || 0;
                      return cnt + (mins > 0 ? 1 : 0);
                    }, 0);

                    return (
                      <React.Fragment key={emp.id}>
                        <div
                          className={`${styles.employeeCell} ${styles.stickyEmployee}`}
                        >
                          <div className={styles.name}>{emp.fullname}</div>
                        </div>

                        {daysInRange.map((d) => {
                          const key = `${d.month}-${d.day}`;
                          const has = minutesMap.has(key);
                          const mins = has ? minutesMap.get(key) : null;

                          return (
                            <div
                              key={`${emp.id}-${d.key}`}
                              className={styles.dayCell}
                            >
                              {has ? formatHM(mins) : "–"}
                            </div>
                          );
                        })}

                        <div
                          className={`${styles.totalCell} ${styles.stickyTotal}`}
                        >
                          {formatHM(totalMinutes)}
                        </div>
                        <div
                          className={`${styles.daysCell} ${styles.stickyDays}`}
                        >
                          {workedDays}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
