import { useEffect, useMemo, useState } from "react";
import styles from "./FilterModuleStaffingTable.module.scss";
import { getTableData } from "../../utils/api/actions/staffingTable";
import { useDispatch, useSelector } from "react-redux";
import { RingLoader } from "react-spinners";
import { Calendar, Trash2 } from "lucide-react";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import { toISODate } from "../../utils/methods/dateFormatter";

// Получить начало месяца и текущую дату
const getDefaultDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  return { start: startOfMonth, end: today };
};

// Проверка, является ли диапазон дефолтным
const isDefaultRange = (dateRange) => {
  if (!dateRange?.[0]?.startDate || !dateRange?.[0]?.endDate) return true;

  const { start, end } = getDefaultDateRange();
  const selectedStart = new Date(dateRange[0].startDate);
  const selectedEnd = new Date(dateRange[0].endDate);

  selectedStart.setHours(0, 0, 0, 0);
  selectedEnd.setHours(0, 0, 0, 0);

  return (
    selectedStart.getTime() === start.getTime() &&
    selectedEnd.getTime() === end.getTime()
  );
};

export const FilterModuleStaffingTable = ({ dateRange, setDateRange }) => {
  const dispatch = useDispatch();

  const { loadingTable } = useSelector((state) => state?.table);

  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const isFilterActive =
    dateRange?.[0]?.startDate &&
    dateRange?.[0]?.endDate &&
    dateRange[0].startDate instanceof Date &&
    dateRange[0].endDate instanceof Date &&
    !isNaN(dateRange[0].startDate.getTime()) &&
    !isNaN(dateRange[0].endDate.getTime());

  const showResetButton = isFilterActive && !isDefaultRange(dateRange);

  const rangeText = useMemo(() => {
    if (isFilterActive) {
      return `${dateRange[0].startDate.toLocaleDateString(
        "ru-RU"
      )} — ${dateRange[0].endDate.toLocaleDateString("ru-RU")}`;
    }
    const { start, end } = getDefaultDateRange();
    return `${start.toLocaleDateString("ru-RU")} — ${end.toLocaleDateString(
      "ru-RU"
    )}`;
  }, [isFilterActive, dateRange]);

  useEffect(() => {
    if (showCalendar) setTempDateRange(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCalendar]);

  const handleApplyDateFilter = () => {
    const { startDate, endDate } = tempDateRange[0] || {};
    if (!startDate || !endDate) return;

    dispatch(
      getTableData(toISODate(startDate), toISODate(endDate), "Europe/Moscow")
    ).then((res) => {
      if (res.status == 200) {
        setDateRange(tempDateRange);
        setShowCalendar(false);
      }
    });
  };

  const handleReset = () => {
    const { start, end } = getDefaultDateRange();

    const reset = [
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ];

    setDateRange(reset);
    setTempDateRange(reset);

    dispatch(
      getTableData(toISODate(start), toISODate(end), "Europe/Moscow")
    ).then((res) => {
      if (res.status == 200) {
        setShowCalendar(false);
      }
    });
  };

  return (
    <div>
      <div className={styles.calendarControls}>
        <div className={styles.filterButtonWrapper}>
          {showResetButton && (
            <button
              className={styles.resetButton}
              onClick={handleReset}
              title="Сбросить фильтр"
              disabled={loadingTable}
            >
              {loadingTable ? <RingLoader size={18} /> : <Trash2 size={18} />}
            </button>
          )}

          <button
            className={`${styles.filterButton} ${
              showResetButton ? styles.active : ""
            }`}
            onClick={() => setShowCalendar((p) => !p)}
            disabled={loadingTable}
          >
            <Calendar size={18} />
            <span>{rangeText}</span>
          </button>
        </div>

        {showCalendar && (
          <div className={styles.calendarModal}>
            <DateRange
              editableDateInputs={false}
              onChange={(item) => setTempDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={tempDateRange}
              direction="vertical"
              locale={ru}
              color="#16a34a"
              maxDate={new Date()}
            />

            <button
              className={styles.applyFilterButton}
              onClick={handleApplyDateFilter}
              disabled={loadingTable}
            >
              {loadingTable && <RingLoader color="white" size={12} />}
              {loadingTable ? "Загрузка..." : "Применить и закрыть"}
            </button>

            <button
              className={styles.resetFilterButton}
              onClick={handleReset}
              disabled={loadingTable}
            >
              Сбросить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
