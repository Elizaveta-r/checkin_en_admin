import { Minus, Plus } from "lucide-react";
import styles from "./AddEmployeeToTariffControls.module.scss";

export const AddEmployeeToTariffControls = ({
  handleChange,
  addedEmployeesCount,
}) => {
  return (
    <div className={styles.employeeAdderControls}>
      <button
        onClick={() => handleChange(-1)}
        disabled={addedEmployeesCount === 0}
        className={styles.employeeButton}
      >
        <Minus size={16} />
      </button>
      <span className={styles.employeeCount}>{addedEmployeesCount}</span>
      <button onClick={() => handleChange(1)} className={styles.employeeButton}>
        <Plus size={16} />
      </button>
    </div>
  );
};
