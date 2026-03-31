import { Pencil, Trash, Users } from "lucide-react";
import styles from "./JobTitleTable.module.scss";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

const JobTitleTable = ({ positions, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.jobTable}>
        {positions && (
          <thead>
            <tr>
              <th>Position Title</th>
              <th>Description</th>
              <th>Employees</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
        )}

        <tbody>
          {positions ? (
            positions?.map((job) => (
              <tr key={job.id}>
                <td className={styles.jobName}>{job.title}</td>
                <td className={styles.jobDescription}>
                  {job.description
                    ? job.description
                    : "No description provided"}
                </td>
                <td>
                  <div className={styles.employeeCell}>
                    <Users size={16} className={styles.userIcon} />
                    <span>{job.employees_count}</span>
                  </div>
                </td>

                <td>
                  <div className={styles.actionsCell}>
                    <HintWithPortal
                      hintContent="Edit"
                      hasIcon={false}
                      isMaxWidth
                    >
                      <div className={styles.edit} onClick={() => onEdit(job)}>
                        <Pencil size={16} />
                      </div>{" "}
                    </HintWithPortal>
                    <HintWithPortal
                      hintContent="Delete"
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
                No positions have been added yet. <br /> Click{" "}
                <strong>"Add"</strong> to create your first position.
              </td>
            </tr>
          )}

          {positions?.length === 0 && (
            <tr>
              <td colSpan="4" className={styles.noData}>
                No positions have been added yet. <br /> Click{" "}
                <strong>"Add"</strong> to create your first position.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobTitleTable;
