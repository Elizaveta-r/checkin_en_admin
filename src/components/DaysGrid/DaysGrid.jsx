import { useDispatch, useSelector } from "react-redux";
import styles from "./DaysGrid.module.scss";
import { setMonthDays } from "../../store/slices/tasksSlice";

const DaysGrid = () => {
  const dispatch = useDispatch();

  const { month_days = [] } = useSelector((state) => state?.tasks?.draftTask);

  const handleDateClick = (date) => {
    let newMonthDays;

    if (month_days.includes(date)) {
      newMonthDays = month_days.filter((d) => d !== date);
    } else {
      newMonthDays = [...month_days, date];
    }

    dispatch(setMonthDays(newMonthDays));
  };

  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div
      className={styles.calendar}
      data-selected={month_days?.length > 0 ? "true" : "false"}
    >
      <div className={styles.calendarGrid}>
        {dates?.map((date) => (
          <div
            key={date}
            className={`${styles.dateCell} ${
              month_days?.includes(date) ? styles.selected : ""
            }`}
            onClick={() => handleDateClick(date)}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaysGrid;
