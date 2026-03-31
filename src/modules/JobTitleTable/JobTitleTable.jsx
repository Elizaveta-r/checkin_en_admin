import { Pencil, Trash, Users } from "lucide-react";
import styles from "./JobTitleTable.module.scss";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

const JobTitleTable = ({ positions, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.jobTable}>
        {/* Заголовок таблицы */}
        {positions && (
          <thead>
            <tr>
              <th>Название должности</th>
              <th>Описание</th>
              <th>Сотрудников</th>
              <th className={styles.actionsHeader}>Действия</th>
            </tr>
          </thead>
        )}

        {/* Тело таблицы */}
        <tbody>
          {positions ? (
            positions?.map((job) => (
              <tr key={job.id}>
                <td className={styles.jobName}>{job.title}</td>
                <td className={styles.jobDescription}>
                  {job.description ? job.description : "Описание отсутствует"}
                </td>
                <td>
                  <div className={styles.employeeCell}>
                    <Users size={16} className={styles.userIcon} />
                    <span>{job.employees_count}</span>
                  </div>
                </td>

                {/* Кнопки действий */}
                <td>
                  <div className={styles.actionsCell}>
                    <HintWithPortal
                      hintContent="Редактировать"
                      hasIcon={false}
                      isMaxWidth
                    >
                      <div className={styles.edit} onClick={() => onEdit(job)}>
                        <Pencil size={16} />
                      </div>{" "}
                    </HintWithPortal>
                    <HintWithPortal
                      hintContent="Удалить"
                      hasIcon={false}
                      isMaxWidth
                    >
                      <div
                        className={styles.trash}
                        onClick={() => onDelete(job.id)}
                      >
                        <Trash size={16} />
                      </div>{" "}
                    </HintWithPortal>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className={styles.noData}>
                Список должностей пуст. <br /> Нажмите{" "}
                <strong>"Добавить"</strong>, чтобы создать первую должность.
              </td>
            </tr>
          )}

          {positions?.length === 0 && (
            <tr>
              <td colSpan="4" className={styles.noData}>
                Список должностей пуст. <br /> Нажмите{" "}
                <strong>"Добавить"</strong>, чтобы создать первую должность.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobTitleTable;
