import {
  Clock,
  Camera,
  Zap,
  CheckSquare,
  XCircle,
  Bell,
  Pencil,
  Trash,
  Building2,
  BugPlay,
  ArrowRight,
} from "lucide-react";
import styles from "./TaskCard.module.scss";
import { useState } from "react";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDraftFromEditedTask,
  setIsEdit,
} from "../../store/slices/tasksSlice";
import { deleteTask, getTaskById } from "../../utils/api/actions/tasks";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

const getLabelDoneType = (type) => {
  switch (type) {
    case "photo":
      return "Фото";
    case "text":
      return "Текст";
    case "check_box":
      return "Чекбокс";
    default:
      return "Фото";
  }
};

export const TaskCard = ({ task, isFull, isViewShort }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loadingTask } = useSelector((state) => state?.tasks);

  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);

  // Определяем бейджи для фото
  const photoBadge = task?.photo_required
    ? styles.badgeMandatory
    : task?.photo_need
    ? styles.badgeRequired
    : styles.badgeInfo;
  const photoText = task?.done_type === "photo" ? "Требуется фото" : "Без фото";

  const PhotoIcon = task?.photo_required ? Zap : Camera;

  // Определяем бейдж для уведомлений
  const notifyBadge = task?.late_push ? styles.badgeAlert : styles.badgeMuted;

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

  const handleGoToDetails = () => {
    dispatch(getTaskById(task?.id)).then(() => {
      navigate(`${task?.id}`);
    });
  };

  const handleDeleteTask = () => {
    dispatch(deleteTask(task?.id)).then((res) => {
      if (res.status === 200) {
        if (isFull) {
          navigate(-1);
        }
        setVisibleDeleteModal(false);
      }
    });
  };

  return (
    <div className={styles.taskCard}>
      <DeleteConfirmationModal
        isOpen={visibleDeleteModal}
        onClose={() => setVisibleDeleteModal(false)}
        message={<Message taskName={task?.title} />}
        buttonTitle="Удалить задачу"
        onConfirm={handleDeleteTask}
        buttonIcon={<XCircle size={20} />}
        loading={loadingTask}
      />

      <div className={`${styles.header} ${isViewShort ? styles.short : ""}`}>
        <div className={styles.headerContent}>
          <div className={styles.row}>
            <div
              className={`${styles.taskTitle} ${isFull ? styles.full : ""}`}
              onClick={isFull ? () => {} : handleGoToDetails}
            >
              {task?.title}
            </div>

            <div className={styles.headerActionsContainer}>
              <div className={styles.headerActions}>
                <HintWithPortal hintContent="Редактировать" hasIcon={false}>
                  <div className={styles.edit} onClick={handleUpdate}>
                    <Pencil size={16} />
                  </div>
                </HintWithPortal>
                <HintWithPortal hintContent="Удалить" hasIcon={false}>
                  <div className={styles.trash} onClick={handleDelete}>
                    <Trash size={16} />
                  </div>
                </HintWithPortal>
              </div>
            </div>
          </div>

          <div className={`${styles.positions} ${isFull ? styles.full : ""}`}>
            {task?.positions?.map((position, index) => (
              <div
                key={`${position?.id}-${index}`}
                className={styles.positionBadge}
              >
                {position?.title}
              </div>
            ))}
            {/* <div className={styles.shadow} /> */}
          </div>
        </div>
      </div>

      {!isViewShort && (
        <div className={styles.badgesContainer}>
          <div className={`${styles.badge} ${photoBadge}`}>
            <PhotoIcon size={14} /> <span>{photoText}</span>
          </div>

          <div className={`${styles.badge} ${notifyBadge}`}>
            <Bell size={14} />{" "}
            <span>
              {task?.late_push
                ? "Уведомление при просрочке"
                : "Без уведомлений"}
            </span>
          </div>
          <div
            className={`${styles.badge} ${
              task?.to_report ? styles.badgePrimary : styles.badgeMuted
            }`}
          >
            <CheckSquare size={14} />{" "}
            <span>{task?.to_report ? "В итоговом отчете" : "Вне отчета"}</span>
          </div>
          <div className={`${styles.badge} ${styles.badgeTimeType}`}>
            <Clock size={14} />
            <span>
              {task.time_type === "daily" && "Ежедневно"}
              {task.time_type === "weekly" && "Еженедельно"}
              {task.time_type === "monthly" && "Ежемесячно"}
              {task.time_type === "onetime" && "Единоразово"}
            </span>
          </div>
        </div>
      )}

      {/* 3. ОСНОВНЫЕ ДЕТАЛИ (GRID) */}
      {!isViewShort && (
        <div className={`${styles.detailsGrid}`}>
          {/* Время и Дедлайн (1-й ряд) */}
          <div className={styles.detailItem}>
            <span className={styles.label}>
              <Clock size={16} />{" "}
              <span className={styles.labelText}>Время начала:</span>
            </span>
            <span className={styles.value}>{task?.start_time}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>
              <Clock size={16} />{" "}
              <span className={styles.labelText}>Дедлайн:</span>
            </span>
            <span className={styles.valueAccent}>{task?.deadline_time}</span>
          </div>

          {/* Тип подтверждения (2-й ряд) */}
          <div className={styles.detailItem}>
            <span className={styles.label}>
              <CheckSquare size={16} />{" "}
              <span className={styles.labelText}>Тип подтверждения:</span>
            </span>
            <span className={styles.value}>
              {getLabelDoneType(task?.done_type)}
            </span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.label}>
              <Building2 size={16} />
              <span className={styles.labelText}>
                {task?.departments.length > 1
                  ? "Подразделения: "
                  : "Подразделение: "}
              </span>
            </span>
            {!isFull && task?.departments.length > 1 && (
              <span
                className={styles.viewAllDepartments}
                onClick={handleGoToDetails}
              >
                Смотреть все <ArrowRight size={16} />
              </span>
            )}
            {isFull &&
              task?.departments.map((department, index) => (
                <span key={`${department?.id}-${index}`}>
                  {department?.title}
                </span>
              ))}
            {task?.departments.length == 1 &&
              task?.departments.map((department, index) => (
                <span key={`${department?.id}-${index}`}>
                  {department?.title}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 4. КРИТЕРИЙ ПРИЕМКИ (FOOTER) */}
      {!isViewShort && (
        <div className={styles.criteriaSection}>
          <p className={styles.criteriaTitle}>Критерий приемки:</p>
          <p className={`${styles.criteriaText} ${isFull ? styles.full : ""}`}>
            {task?.ai_prompt ? task?.ai_prompt : "Отсутствует"}
          </p>
        </div>
      )}
    </div>
  );
};

const Message = ({ taskName }) => {
  return (
    <div>
      <p>Вы действительно хотите удалить задачу?</p> "
      <strong>{taskName}</strong>"
    </div>
  );
};
