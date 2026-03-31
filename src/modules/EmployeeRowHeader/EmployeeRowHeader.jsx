import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import styles from "./EmployeeRowHeader.module.scss";

export default function EmployeeRowHeader() {
  return (
    <div className={`${styles.dataItem} ${styles.headerRow}`}>
      <div className={styles.nameCell}>
        <div className={`${styles.avatar} ${styles.empty}`}></div>
        <p className={styles.nameEmp}>ФИО</p>
      </div>

      <p className={styles.positionCol}>ДОЛЖНОСТЬ(-И)</p>

      <p className={styles.roleCol}>РОЛЬ</p>

      <p className={styles.department}>ПОДРАЗДЕЛЕНИЕ(-Я)</p>

      <div className={`${styles.statusIndicator}`}>
        <HintWithPortal hintContent="Отметился ли сотрудник о приходе на работу">
          <p className={styles.status}>ЧЕКИН</p>
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
