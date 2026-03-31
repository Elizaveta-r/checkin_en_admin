import { Pencil, Trash, Users } from "lucide-react";
import styles from "./PositionsCard.module.scss";

export const PositionsCard = ({ position, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.headerAccent} />
      <div className={styles.content}>
        <div className={styles.positionCell}>
          <div className={styles.positionNameCell}>
            <p className={styles.positionName}>{position.title}</p>
            <div className={styles.actionsCell}>
              <div className={styles.edit} onClick={() => onEdit(position)}>
                <Pencil size={16} />
              </div>

              <div
                className={styles.trash}
                onClick={() => onDelete(position.id)}
              >
                <Trash size={16} />
              </div>
            </div>
          </div>

          <p className={styles.positionDescription}>
            {position.description
              ? position.description
              : "Описание отсутствует"}
          </p>
        </div>

        <div className={styles.employeeCell}>
          <div className={styles.userCell}>
            <Users size={16} className={styles.userIcon} />
            <p>Пользователей:</p>
          </div>
          <span className={styles.userCount}>{position.employees_count}</span>
        </div>
      </div>
    </div>
  );
};
