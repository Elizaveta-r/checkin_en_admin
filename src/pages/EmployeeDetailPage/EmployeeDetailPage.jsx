import React, { useState, useMemo, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Calendar, Trash2 } from "lucide-react";

import styles from "./EmployeeDetailPage.module.scss";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import PageTitle from "../../components/PageTitle/PageTitle";
import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
import { enUS } from "date-fns/locale";
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
    (state) => state?.employees,
  );

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  const isSmallScreen = useMediaQuery({ query: "(max-width: 400px)" });

  const history = employee?.history;

  const displayedHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];
    if (!isEventMode) return history;

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

    if (!startDate || !endDate) return "All time";

    return (
      startDate.toLocaleDateString("en-US") +
      " — " +
      endDate.toLocaleDateString("en-US")
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

    requestAnimationFrame(() => {
      eventElRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [isEventMode, displayedHistory]);

  return (
    <div className={styles.pageContent}>
      <PageTitle title={"Employee Details"} />

      <div className={styles.mainGrid}>
        <EmployeeDetailsCard employee={employee} />

        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>Task Completion History</h2>

            <div className={styles.calendarControls}>
              <div className={styles.filterButtonWrapper}>
                <div className={styles.btnActionWrapper}>
                  {isEventMode && (
                    <button
                      className={styles.allHistory}
                      onClick={handleShowAllHistory}
                      title="Show full history"
                    >
                      {isSmallScreen ? "Reset task" : "Reset active task"}
                    </button>
                  )}
                  {isFilterActive && (
                    <button
                      className={styles.resetButton}
                      onClick={handleResetToToday}
                      title="Reset to today"
                    >
                      {loadingGetEmployee ? (
                        <RingLoader size={18} />
                      ) : isSmallScreen ? (
                        "Reset filter"
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
                      title="Show full history"
                    >
                      Show all time
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

              {showCalendar && (
                <div className={styles.calendarModal}>
                  <DateRange
                    editableDateInputs={false}
                    onChange={(item) => setTempDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={tempDateRange}
                    direction="vertical"
                    locale={enUS}
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
                    {loadingGetEmployee ? "Loading..." : "Apply and Close"}
                  </button>
                  <button
                    className={styles.resetFilterButton}
                    onClick={handleResetToToday}
                  >
                    Reset filter
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.historyList}>
            {displayedHistory?.map((item) => {
              const isTargetEvent =
                isEventMode && String(item.id) === String(eventId);

              return isMobile ? (
                <div key={item.id} ref={isTargetEvent ? eventElRef : null}>
                  <EmployeeHistoryItemMobile
                    item={item}
                    timezone={employee?.timezone}
                    onPhotoClick={handleOpenPhotoModal}
                  />
                </div>
              ) : (
                <div key={item.id} ref={isTargetEvent ? eventElRef : null}>
                  <EmployeeHistoryItem
                    item={item}
                    timezone={employee?.timezone}
                    onPhotoClick={handleOpenPhotoModal}
                  />
                </div>
              );
            })}
            {displayedHistory?.length === 0 && (
              <p className={styles.noHistory}>
                No employee activity found for the selected date range.
              </p>
            )}
          </div>
        </div>
        <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
      </div>
    </div>
  );
}
