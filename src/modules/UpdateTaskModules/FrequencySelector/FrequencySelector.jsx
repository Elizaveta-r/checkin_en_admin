import styles from "./FrequencySelector.module.scss";
import CustomSelect from "../../../ui/CustomSelect/CustomSelect";
import DaysGrid from "../../../components/DaysGrid/DaysGrid";
import { Calendar } from "react-date-range";
import CustomInput from "../../../ui/CustomInput/CustomInput";
import { enUS } from "date-fns/locale";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeadlineTime,
  setDisposableDate,
  setStartTime,
  setTimeType,
  setWeekDays,
} from "../../../store/slices/tasksSlice";
import { HintWithPortal } from "../../../ui/HintWithPortal/HintWithPortal";

const frequency = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "onetime", label: "One-time" },
];

const weekDays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export const FrequencySelector = () => {
  const dispatch = useDispatch();

  const { task_type, week_days, start_time, deadline_time, onetime_date } =
    useSelector((state) => state?.tasks?.draftTask);

  return (
    <div className={styles.wrapper}>
      <div className={styles.section} data-tour="form.tasks.frequency">
        <HintWithPortal hintContent="Set how often the task should repeat: every day, on specific weekdays, once a month, or one time only">
          <p className={styles.label}>Frequency</p>
        </HintWithPortal>
        <CustomSelect
          options={frequency}
          value={task_type}
          onChange={(selectedOption) => dispatch(setTimeType(selectedOption))}
          placeholder="Select frequency"
          dataTourHeader="form.tasks.frequency.header"
          dataTourId="form.tasks.frequency"
        />
      </div>

      <div
        className={styles.timeSection}
        data-tour="form.tasks.frequency-selectors"
      >
        {task_type.value === "weekly" && (
          <div
            className={styles.section}
            data-tour="form.tasks.weekdays"
            data-selected={week_days?.length > 0 ? "true" : "false"}
          >
            <p className={styles.label}>Select weekdays</p>
            <div className={styles.weekDays}>
              {weekDays?.map((day) => (
                <div
                  className={`${styles.day} ${
                    week_days.some((d) => d.value === day.value)
                      ? styles.selected
                      : ""
                  }`}
                  data-selected={
                    week_days.some((d) => d.value === day.value)
                      ? "true"
                      : "false"
                  }
                  key={day.value}
                  onClick={() => {
                    const exists = week_days?.some(
                      (d) => d.value === day.value,
                    );
                    if (exists) {
                      dispatch(
                        setWeekDays(
                          week_days.filter((d) => d.value !== day.value),
                        ),
                      );
                    } else {
                      dispatch(setWeekDays([...(week_days || []), day]));
                    }
                  }}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {task_type.value === "monthly" && (
          <div className={styles.section} data-tour="form.tasks.monthdays">
            <p className={styles.label}>Select days of the month</p>
            <DaysGrid />
          </div>
        )}

        {task_type.value === "onetime" && (
          <div
            className={styles.section}
            data-tour="form.tasks.onetime.calendar"
            data-has-value={onetime_date ? "true" : "false"}
          >
            <p className={styles.label}>Select the execution date</p>
            <Calendar
              date={onetime_date}
              onChange={(date) => {
                const dateUTC = new Date(
                  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
                );
                dispatch(setDisposableDate(dateUTC.toISOString()));
              }}
              minDate={new Date()}
              locale={enUS}
              color={"#16a34a"}
              dateDisplayFormat="MM/dd/yyyy"
            />
          </div>
        )}
        <div className={styles.section} data-tour="form.tasks.start-time">
          <p className={styles.label}>Task start time</p>
          <CustomInput
            type="time"
            name="startTime"
            placeholder="Task start time"
            value={start_time}
            onChange={(e) => dispatch(setStartTime(e.target.value))}
          />
        </div>

        <div className={styles.section} data-tour="form.tasks.deadline-time">
          <HintWithPortal hintContent="The time by which the task must be completed">
            <p className={styles.label}>Task deadline</p>
          </HintWithPortal>
          <CustomInput
            type="time"
            name="deadline"
            placeholder="Task deadline"
            value={deadline_time}
            onChange={(e) => dispatch(setDeadlineTime(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
