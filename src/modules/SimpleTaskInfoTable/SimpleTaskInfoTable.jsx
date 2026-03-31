import { useState } from "react";
import styles from "./SimpleTaskInfoTable.module.scss";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDraftFromEditedTask,
  setIsEdit,
} from "../../store/slices/tasksSlice";
import { deleteTask, getTaskById } from "../../utils/api/actions/tasks";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { Pencil, Trash, XCircle } from "lucide-react";

export const SimpleTaskInfoTable = ({ tasks }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>Title</div>
        <div className={styles.headerTitle}>Position(s)</div>
        <div className={styles.headerTitle}>Department(s)</div>
        <div className={styles.headerTitle}>Type</div>
        <div className={styles.headerTitle}>Deadline</div>
        <div className={styles.buttons}>
          <div className={`${styles.edit} ${styles.empty}`}></div>
          <div className={`${styles.trash} ${styles.empty}`}></div>
        </div>
      </div>
      <div className={styles.body}>
        {tasks.map((task) => (
          <TableItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

const TableItem = ({ task }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loadingTask } = useSelector((state) => state?.tasks);

  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);

  const handleDelete = () => {
    setVisibleDeleteModal(true);
  };
  const handleUpdate = () => {
    dispatch(setIsEdit(true));
    dispatch(getTaskById(task?.id)).then(async (res) => {
      await dispatch(setDraftFromEditedTask(res.data.task));
      navigate(`/tasks/update/${task?.id}`);
    });
  };
  const handleDeleteTask = () => {
    dispatch(deleteTask(task?.id)).then((res) => {
      if (res.status === 200) {
        setVisibleDeleteModal(false);
      }
    });
  };

  const getTaskTypeLabel = () => {
    switch (task?.done_type) {
      case "text":
        return "Text";
      case "check_box":
        return "Checkbox";
      case "photo":
        return "Photo";
      default:
        return "";
    }
  };

  return (
    <>
      <div className={styles.item}>
        <div className={styles.itemTitleContainer}>
          <p className={styles.itemTitle}>{task?.title}</p>
        </div>
        <div className={styles.itemPositions}>
          {task?.positions.map((p) => p.title).join(", ")}
        </div>
        <div className={styles.itemDepartments}>
          {task?.departments.map((d) => d.title).join(", ")}
        </div>
        <div className={styles.itemType}>{getTaskTypeLabel()}</div>
        <div className={styles.itemTime}>
          {task?.start_time} / {task?.deadline_time}
        </div>
        <div className={styles.buttons}>
          <HintWithPortal hintContent="Edit" hasIcon={false}>
            <div className={styles.edit} onClick={handleUpdate}>
              <Pencil size={16} />
            </div>
          </HintWithPortal>
          <HintWithPortal hintContent="Delete" hasIcon={false}>
            <div className={styles.trash} onClick={handleDelete}>
              <Trash size={16} />
            </div>
          </HintWithPortal>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={visibleDeleteModal}
        onClose={() => setVisibleDeleteModal(false)}
        message={<Message taskName={task?.title} />}
        buttonTitle="Delete task"
        onConfirm={handleDeleteTask}
        buttonIcon={<XCircle size={20} />}
        loading={loadingTask}
      />
    </>
  );
};

const Message = ({ taskName }) => {
  return (
    <div>
      <p>Are you sure you want to delete this task?</p>{" "}
      <strong>{taskName}</strong>
    </div>
  );
};
