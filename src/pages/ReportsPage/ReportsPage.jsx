import { useEffect, useMemo, useState } from "react";
import EmployeeHistoryItem from "../../components/EmployeeHistoeyIrem/EmployeeHistoryItem";
import PageTitle from "../../components/PageTitle/PageTitle";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import styles from "./ReportsPage.module.scss";
import { enUS } from "date-fns/locale";
import { DateRange } from "react-date-range";
import { X, Calendar, RefreshCcw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllEmployeesWithHistory,
  getEmployeeWithHistory,
} from "../../utils/api/actions/employees";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { RingLoader } from "react-spinners";
import { useMediaQuery } from "react-responsive";
import EmployeeHistoryItemMobile from "../../components/EmployeeHistoeyIremMobile/EmployeeHistoryItemMobile";
import { useNavigate } from "react-router-dom";

const getTodayRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  },
];

const isSameDay = (date1, date2) =>
  date1?.toDateString() === date2?.toDateString();

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const INITIAL_RANGE = getTodayRange();
const DEFAULT_EMPLOYEE_ID = 0;

export default function ReportsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { employeesWithHistory, employee, loadingGetEmployee } = useSelector(
    (state) => state.employees,
  );

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  const [modalPhotoUrl, setModalPhotoUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState(DEFAULT_EMPLOYEE_ID);
  const [dateRange, setDateRange] = useState(INITIAL_RANGE);
  const [tempDateRange, setTempDateRange] = useState(INITIAL_RANGE);

  const fetchReportsData = (empId = selectedEmployeeId, range = dateRange) => {
    const { startDate, endDate } = range[0];
    const startStr = toISODate(startDate);
    const endStr = toISODate(endDate);

    const startNowDate = toISODate(new Date());
    const endNowDate = toISODate(new Date());

    if (empId === DEFAULT_EMPLOYEE_ID) {
      return dispatch(
        getAllEmployeesWithHistory(1, 1000, startNowDate, endNowDate),
      );
    } else {
      return dispatch(getEmployeeWithHistory(empId, 1, 100, startStr, endStr));
    }
  };

  useEffect(() => {
    fetchReportsData(DEFAULT_EMPLOYEE_ID, INITIAL_RANGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const employeeOptions = useMemo(() => {
    if (!employeesWithHistory?.length) return [];
    const opts = employeesWithHistory.map((e) => ({
      value: e.id,
      label: `${e.surname} ${e.firstname} ${e.patronymic}`,
    }));
    opts.unshift({ value: DEFAULT_EMPLOYEE_ID, label: "All employees" });
    return opts;
  }, [employeesWithHistory]);

  const currentEmployeeValue = useMemo(
    () =>
      employeeOptions.find((opt) => opt.value === selectedEmployeeId) || null,
    [selectedEmployeeId, employeeOptions],
  );

  const handleEmployeeChange = (selectedOption) => {
    const newId = selectedOption ? selectedOption.value : DEFAULT_EMPLOYEE_ID;
    setSelectedEmployeeId(newId);
    fetchReportsData(newId);
  };

  const handleApplyDateFilter = () => {
    setDateRange(tempDateRange);
    setShowCalendar(false);
    fetchReportsData(selectedEmployeeId, tempDateRange);
  };

  const handleReset = () => {
    const fresh = getTodayRange();
    setDateRange(fresh);
    setShowCalendar(false);
    fetchReportsData(selectedEmployeeId, fresh);
  };

  const handleDateReset = () => {
    const fresh = INITIAL_RANGE;
    setDateRange(fresh);
    setShowCalendar(false);
    fetchReportsData(selectedEmployeeId, fresh);
  };

  const handleOpenPhotoModal = (url) => setModalPhotoUrl(url);
  const handleClosePhotoModal = () => setModalPhotoUrl(null);

  const rangeText = useMemo(() => {
    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate) return "All time";
    if (isSameDay(startDate, endDate)) {
      const today = new Date();
      return startDate.toDateString() === today.toDateString()
        ? "Today"
        : startDate.toLocaleDateString("en-US");
    }
    return `${startDate.toLocaleDateString(
      "en-US",
    )} — ${endDate.toLocaleDateString("en-US")}`;
  }, [dateRange]);

  const isDateFilterActive = useMemo(() => {
    const { startDate, endDate } = dateRange[0];
    const today = new Date();
    return !(isSameDay(startDate, today) && isSameDay(endDate, today));
  }, [dateRange]);

  const showDateFilter = currentEmployeeValue?.label !== "All employees";

  const handleGoToEmployee = (id) => {
    dispatch(getEmployeeWithHistory(id, 1, 100)).then((res) => {
      if (res.status === 200) {
        navigate(`/employees/${id}`);
      }
    });
  };

  const renderedEmployees = useMemo(() => {
    if (selectedEmployeeId === DEFAULT_EMPLOYEE_ID) {
      if (!employeesWithHistory?.length) return [];

      return employeesWithHistory
        .map((emp) => ({
          ...emp,
          filteredHistory: [...(emp.employee_history || [])].sort((a, b) => {
            const da = new Date(`${a.done_date}T${a.done_time || "00:00"}:00`);
            const db = new Date(`${b.done_date}T${b.done_time || "00:00"}:00`);
            return db - da;
          }),
        }))
        .filter((e) => e.filteredHistory.length > 0);
    }

    if (!employee) return [];

    const sorted = [...(employee.history || [])].sort((a, b) => {
      const da = new Date(`${a.done_date}T${a.done_time || "00:00"}:00`);
      const db = new Date(`${b.done_date}T${b.done_time || "00:00"}:00`);
      return db - da;
    });

    return sorted.length ? [{ ...employee, filteredHistory: sorted }] : [];
  }, [employeesWithHistory, employee, selectedEmployeeId]);

  return (
    <div className={styles.container}>
      <PageTitle
        title="Employee Reports"
        hasButton
        hint={
          selectedEmployeeId === DEFAULT_EMPLOYEE_ID &&
          "The report for all employees is shown for today."
        }
        buttonTitle="Refresh"
        leftIcon={<RefreshCcw size={16} />}
        onClick={() => fetchReportsData()}
      />

      <div
        className={`${styles.filterBar} ${
          showDateFilter ? styles.filterActive : ""
        }`}
      >
        <CustomSelect
          value={currentEmployeeValue}
          options={employeeOptions}
          onChange={handleEmployeeChange}
          placeholder="Select employee"
          isSearchable
        />

        {showDateFilter && (
          <div className={styles.calendarControls}>
            <button
              className={styles.filterButton}
              onClick={() => {
                setTempDateRange(dateRange);
                setShowCalendar((v) => !v);
              }}
            >
              <Calendar size={18} />
              <span>{rangeText}</span>
            </button>

            {isDateFilterActive && (
              <button
                className={styles.resetDateButton}
                onClick={handleDateReset}
                title="Reset date filter"
              >
                <X size={16} />
              </button>
            )}

            {showCalendar && (
              <div className={styles.calendarModal}>
                <DateRange
                  editableDateInputs
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
                >
                  Apply and close
                </button>
                <button
                  className={styles.resetFilterButton}
                  onClick={handleReset}
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loadingGetEmployee ? (
        <div className={styles.loading}>
          <RingLoader color="#16a34a" />
        </div>
      ) : (
        <div className={styles.employeesContainer}>
          {renderedEmployees?.length > 0 ? (
            renderedEmployees.map((employee) => (
              <div className={styles.employees} key={employee.id}>
                <p
                  className={styles.title}
                  onClick={() => handleGoToEmployee(employee.id)}
                >
                  {`${employee.surname} ${employee.firstname} ${employee.patronymic}`}
                </p>

                <div className={styles.employeeGrid}>
                  {employee.filteredHistory.map((history, index) =>
                    isMobile ? (
                      <EmployeeHistoryItemMobile
                        key={`${employee.id}-${history.id || index}`}
                        item={history}
                        timezone={employee.timezone}
                        onPhotoClick={handleOpenPhotoModal}
                      />
                    ) : (
                      <EmployeeHistoryItem
                        key={`${employee.id}-${history.id || index}`}
                        item={history}
                        timezone={employee.timezone}
                        onPhotoClick={handleOpenPhotoModal}
                      />
                    ),
                  )}

                  {selectedEmployeeId !== DEFAULT_EMPLOYEE_ID &&
                    employee.filteredHistory.length >= 100 && (
                      <button
                        className={styles.loadMoreBtn}
                        onClick={() =>
                          dispatch(
                            getEmployeeWithHistory(
                              selectedEmployeeId,
                              Math.floor(
                                employee.filteredHistory.length / 100,
                              ) + 1,
                              100,
                              toISODate(dateRange[0].startDate),
                              toISODate(dateRange[0].endDate),
                            ),
                          )
                        }
                        disabled={loadingGetEmployee}
                      >
                        {loadingGetEmployee ? "Loading..." : "Show more"}
                      </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noData}>
              No tasks found for your selected filters.
            </p>
          )}
        </div>
      )}

      <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
    </div>
  );
}
