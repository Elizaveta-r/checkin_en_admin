import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import styles from "./EmployeeRowHeader.module.scss";

export default function EmployeeRowHeader() {
  return (
    <div className={`${styles.dataItem} ${styles.headerRow}`}>
      <div className={styles.nameCell}>
        <div className={`${styles.avatar} ${styles.empty}`}></div>
        <p className={styles.nameEmp}>FULL NAME</p>
      </div>

      <p className={styles.positionCol}>POSITION(S)</p>

      <p className={styles.roleCol}>ROLE</p>

      <p className={styles.department}>DEPARTMENT(S)</p>

      <div className={`${styles.statusIndicator}`}>
        <HintWithPortal hintContent="Whether the employee has checked in at work">
          <p className={styles.status}>CHECK-IN</p>
        </HintWithPortal>
      </div>

      <div className={styles.actions}>
        <div className={`${styles.trash} ${styles.empty}`}></div>
        <div className={`${styles.trash} ${styles.empty}`}></div>
        <div className={`${styles.edit} ${styles.empty}`}></div>
      </div>
    </div>
  );
}
