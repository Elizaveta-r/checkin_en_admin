import React, { useState, useMemo, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Calendar, Trash2 } from "lucide-react";

import styles from "./EmployeeDetailPage.module.scss";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import PageTitle from "../../components/PageTitle/PageTitle";
import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
import { ru } from "date-fns/locale";
import EmployeeHistoryItem from "../../components/EmployeeHistoeyIrem/EmployeeHistoryItem";
import { useDispatch, useSelector } from "react-redux";
import { getEmployeeWithHistory } from "../../utils/api/actions/employees";
import { useParams, useSearchParams } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { useMediaQuery } from "react-responsive";
import EmployeeHistoryItemMobile from "../../components/EmployeeHistoeyIremMobile/EmployeeHistoryItemMobile";

const getTodayRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  },
];

const INITIAL_RANGE = getTodayRange();

// const history = [
//   {
//     date: "2025-10-08 09:05:00",
//     task_title: "Прием рабочего места в начале смены",
//     task_acceptance_criteria:
//       "Рабочее место должно быть чистым, инструменты дезинфицированы.",
//     status: "done",
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1760.jpg",
//     ai_feedback: "OK",
//     comment: "",
//     checkedIn: true,
//   },
//   {
//     date: "2025-10-07 15:30:00",
//     task_title: "Чистота мойки (Дневная проверка)",
//     task_acceptance_criteria:
//       "Мойка должна быть чистой, свободной от остатков пищи и загрязнений.",
//     status: "overdue", // ❌ Провал/Просрочка
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1782.jpg",
//     ai_feedback:
//       "❌ На фото отсутствует мойка. Рекомендации: Сделайте фото мойки на кухне, демонстрируя её чистоту.",
//     comment: "Забыл сфотографировать мойку, исправлю.",
//     checkedIn: true,
//   },
//   {
//     date: "2025-10-06 09:13:50",
//     task_title: "Подготовка зоны выдачи",
//     task_acceptance_criteria:
//       "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
//     status: "done",
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1762.jpg",
//     ai_feedback: "OK",
//     comment: "",
//     checkedIn: true,
//   },
//   {
//     date: "2025-10-05 08:50:00",
//     task_title: "Комментарии приемки рабочего места от прошлой смены",
//     task_acceptance_criteria:
//       "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
//     status: "done",
//     is_photo_required: false,
//     photo_url: "",
//     ai_feedback: "",
//     checkedIn: false,
//     comment: "Быстро проверил, место в порядке. Все заготовки на месте.",
//   },
//   {
//     checkedIn: false,
//     date: "2025-10-04 18:00:00",
//     task_title: "Сдача смены (Уборка)",
//     task_acceptance_criteria:
//       "Полная уборка рабочего места, дезинфекция поверхностей, замена мусорных пакетов.",
//     status: "done_late", // 🟡 Задержка
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1800.jpg",
//     ai_feedback: "OK",
//     comment:
//       "Пришлось задержаться на 15 минут из-за срочного заказа. Сдал в 18:15:22.",
//   },
// ];

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return toISODate(a) === toISODate(b);
};

const TODAY_RANGE = () => [
  { startDate: new Date(), endDate: new Date(), key: "selection" },
];

const ALL_PERIOD_RANGE = () => [
  { startDate: null, endDate: null, key: "selection" },
];

export default function EmployeeDetailPage() {
  const dispatch = useDispatch();

  const eventElRef = useRef(null);

  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get("event_id");
  const isEventMode = !!eventId;

  const { employee, loadingGetEmployee } = useSelector(
    (state) => state?.employees
  );

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  const isSmallScreen = useMediaQuery({ query: "(max-width: 400px)" });

  const history = employee?.history;

  const displayedHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];
    if (!isEventMode) return history;

    // Если у тебя event_id = item.id — оставь так.
    // Если event_id лежит в другом поле, поменяй сравнение.
    return history.filter((x) => String(x.id) === String(eventId));
  }, [history, isEventMode, eventId]);

  const [modalPhotoUrl, setModalPhotoUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState(TODAY_RANGE);
  const [tempDateRange, setTempDateRange] = useState(TODAY_RANGE);

  const isFilterActive = useMemo(() => {
    const { startDate, endDate } = dateRange[0] ?? {};
    const today = new Date();

    if (!startDate || !endDate) return true;
    return !(isSameDay(startDate, today) && isSameDay(endDate, today));
  }, [dateRange]);

  const fetchReportsData = (empId = id, range = dateRange) => {
    const { startDate, endDate } = range[0];

    if (!startDate || !endDate) {
      return dispatch(getEmployeeWithHistory(empId, 1, 1000));
    }

    const startStr = toISODate(startDate);
    const endStr = toISODate(endDate);

    return dispatch(getEmployeeWithHistory(empId, 1, 100, startStr, endStr));
  };

  const handleOpenPhotoModal = (url) => {
    setModalPhotoUrl(url);
  };

  const handleClosePhotoModal = () => {
    setModalPhotoUrl(null);
  };

  const handleApplyDateFilter = () => {
    fetchReportsData(id, tempDateRange).then((res) => {
      if (res.status === 200) {
        setDateRange(tempDateRange);
        setShowCalendar(false);
      }
    });
  };

  const handleResetToToday = () => {
    const todayRange = TODAY_RANGE();
    fetchReportsData(id, todayRange).then((res) => {
      if (res.status === 200) {
        setDateRange(todayRange);
        setShowCalendar(false);
      }
    });
  };

  const handleShowAllPeriod = () => {
    const all = ALL_PERIOD_RANGE();
    fetchReportsData(id, all).then((res) => {
      if (res.status === 200) {
        setDateRange(all);
        setShowCalendar(false);
      }
    });
  };

  const handleShowAllHistory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("event_id");
    setSearchParams(next, { replace: true });
  };

  const rangeText = useMemo(() => {
    const { startDate, endDate } = dateRange[0] ?? {};

    if (!startDate || !endDate) return "Весь период";

    return (
      startDate.toLocaleDateString("ru-RU") +
      " — " +
      endDate.toLocaleDateString("ru-RU")
    );
  }, [dateRange]);

  useEffect(() => {
    fetchReportsData(id, INITIAL_RANGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showCalendar) {
      setTempDateRange(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCalendar]);

  useEffect(() => {
    if (!isEventMode) return;
    if (!displayedHistory?.length) return;

    // ждём, пока DOM нарисуется
    requestAnimationFrame(() => {
      eventElRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [isEventMode, displayedHistory]);

  return (
    <div className={styles.pageContent}>
      <PageTitle title={"Детали сотрудника"} />

      <div className={styles.mainGrid}>
        <EmployeeDetailsCard employee={employee} />

        {/* 2. ПРАВАЯ КОЛОНКА: ИСТОРИЯ ДЕЙСТВИЙ */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>История выполнения задач</h2>

            {/* КНОПКА КАЛЕНДАРЯ */}
            <div className={styles.calendarControls}>
              <div className={styles.filterButtonWrapper}>
                <div className={styles.btnActionWrapper}>
                  {isEventMode && (
                    <button
                      className={styles.allHistory}
                      onClick={handleShowAllHistory}
                      title="Показать всю историю"
                    >
                      {isSmallScreen
                        ? "Сбросить задачу"
                        : "Сбросить активную задачу"}
                    </button>
                  )}
                  {/* Кнопка сброса видна, только если фильтр активен */}
                  {isFilterActive && (
                    <button
                      className={styles.resetButton}
                      onClick={handleResetToToday}
                      title="Сбросить к текущему дню"
                    >
                      {loadingGetEmployee ? (
                        <RingLoader size={18} />
                      ) : isSmallScreen ? (
                        "Сбросить фильтр"
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  )}

                  {!isFilterActive && (
                    <button
                      className={styles.showAllButton}
                      onClick={handleShowAllPeriod}
                      disabled={loadingGetEmployee}
                      title="Показать историю за весь период"
                    >
                      Показать весь период
                    </button>
                  )}
                </div>

                <button
                  className={`${styles.filterButton} ${
                    isFilterActive ? styles.active : ""
                  }`}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar size={18} />
                  <span>{rangeText}</span>
                </button>
              </div>

              {/* МОДАЛКА КАЛЕНДАРЯ */}
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
                    disabled={loadingGetEmployee}
                  >
                    {loadingGetEmployee && (
                      <RingLoader color="white" size={12} />
                    )}
                    {loadingGetEmployee ? "Загрузка..." : "Применить и Закрыть"}
                  </button>
                  <button
                    className={styles.resetFilterButton}
                    onClick={handleResetToToday}
                  >
                    Сбросить фильтр
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.historyList}>
            {displayedHistory?.map((item) => {
              return isMobile ? (
                <EmployeeHistoryItemMobile
                  key={item.id}
                  item={item}
                  timezone={employee?.timezone}
                  onPhotoClick={handleOpenPhotoModal}
                />
              ) : (
                <EmployeeHistoryItem
                  key={item.id}
                  item={item}
                  timezone={employee?.timezone}
                  onPhotoClick={handleOpenPhotoModal}
                />
              );
            })}
            {displayedHistory?.length === 0 && (
              <p className={styles.noHistory}>
                Действий сотрудника не найдено в выбранном диапазоне.
              </p>
            )}
          </div>
        </div>
        <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
      </div>
    </div>
  );
}
