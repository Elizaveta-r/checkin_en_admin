import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../HomePage.module.scss";
import { getEmployeeWithHistory } from "../../../utils/api/actions/employees";
import { Clock, ShieldQuestionMark, XCircle } from "lucide-react";

const getStatusLabel = (status) => {
  switch (status) {
    case "not_on_time":
      return "Late";
    case "not_done":
      return "Not completed";
    case "doubt":
      return "Needs review";
    default:
      return;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "not_on_time":
      return <Clock size={14} />;
    case "not_done":
      return <XCircle size={14} />;
    case "doubt":
      return <ShieldQuestionMark size={14} />;
    default:
      return <Clock size={14} />;
  }
};

/*
 EventID      string json:"event_id"
 EventTitle   string json:"event_title"
 EmployeeID   string json:"employee_id"
 EmployeeName string json:"employee_name"
 EventStatus  string json:"event_status"
 */

export const IsProblemEvent = ({ task }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToEmployee = (id) => {
    dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate("/employees/" + id);
      }
    });
  };

  const goToTask = (id, employee_id) => {
    dispatch(getEmployeeWithHistory(employee_id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate("/employees/" + employee_id + "?event_id=" + id);
      }
    });
  };

  return (
    <div key={task.event_id} className={styles.taskRow}>
      <span
        className={styles.taskName}
        onClick={() => goToTask(task.event_id, task.employee_id)}
      >
        <p className={styles.taskNameValue}>{task.event_title}</p>
      </span>
      <span
        className={styles.employeeName}
        onClick={() => goToEmployee(task.employee_id)}
      >
        <p className={styles.employeeNameValue}>{task.employee_name}</p>
      </span>
      <span
        className={`${styles.statusCell} ${
          styles[task.event_status.toLowerCase()]
        }`}
      >
        {getStatusIcon(task.event_status)}
        {getStatusLabel(task.event_status)}
      </span>
    </div>
  );
};
