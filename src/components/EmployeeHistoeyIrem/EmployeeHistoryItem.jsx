import {
  AlarmClock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Images,
  MessageCircleMore,
  ShieldQuestionMark,
  TriangleAlert,
  Zap,
} from "lucide-react";
import styles from "./EmployeeHistoryItem.module.scss";
import { getFormattedTimeZoneLabel } from "../../utils/methods/generateTimeZoneOptions";
import { useState } from "react";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { RingLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getTaskById } from "../../utils/api/actions/tasks";
import { getEventHistory } from "../../utils/api/actions/employees";
import { toast } from "sonner";

const STATUS_UI = {
  active: { Icon: Zap, className: styles.active },
  done: { Icon: CheckCircle, className: styles.done },
  not_done: { Icon: AlertTriangle, className: styles.failed },
  not_on_time: { Icon: Clock, className: styles.notOnTime },
  doubt: { Icon: ShieldQuestionMark, className: styles.doubt },
};

const formatDateTimeString = (datePart, timePart) => {
  // если передан один аргумент — как раньше
  if (timePart === undefined && typeof datePart === "string") {
    const date = new Date(datePart);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // если пришли отдельные дата и время
  if (datePart && timePart) {
    // безопасно собираем ISO-строку
    const combined = `${datePart}T${
      timePart.length === 5 ? timePart + ":00" : timePart
    }`;
    const date = new Date(combined);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return "-";
};

const formatTimeToWords = (timeStr) => {
  if (!timeStr) return "-";

  const [hours, minutes] = timeStr.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return "-";

  return `${hours} ч ${minutes} мин`;
};

const mergeById = (prevArr, nextArr) => {
  const prev = Array.isArray(prevArr) ? prevArr : [];
  const next = Array.isArray(nextArr) ? nextArr : [];

  const map = new Map();
  for (const x of prev) map.set(x.id, x);
  for (const x of next) {
    const old = map.get(x.id) || {};
    map.set(x.id, { ...old, ...x });
  }
  return Array.from(map.values());
};

export default function EmployeeHistoryItem({ timezone, item, onPhotoClick }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEventHistory, setLoadingEventHistory] = useState(false);

  const [eventsHistory, setEventsHistory] = useState([]);
  const [showAttempts, setShowAttempts] = useState(false);

  const onShowEventHistory = () => {
    setShowAttempts((prev) => {
      const next = !prev;

      // если открываем — грузим
      if (next) {
        setLoadingEventHistory(true);

        dispatch(getEventHistory(item.id, 1, 1000))
          .then((res) => {
            if (res.status === 200) {
              const incoming = Array.isArray(res.data?.event_history)
                ? res.data.event_history
                : [];

              setEventsHistory((prevHistory) =>
                mergeById(prevHistory, incoming)
              );
            } else {
              toast.error("Не удалось получить историю событий");
            }
          })
          .finally(() => setLoadingEventHistory(false));
      }

      return next;
    });
  };

  const eventStatus = item?.event_status;
  const isPhotoRequired = item?.done_type === "photo" ? true : false;

  const hasEventHistory = item?.done_type === "photo";

  const aiComment = item?.ai_feedback;

  const historyType = item?.event_type;

  const { Icon, className: statusClass } =
    STATUS_UI[eventStatus] || STATUS_UI.done;

  const onTaskClick = () => {
    setIsLoading(true);
    dispatch(getTaskById(item.task_id))
      .then((res) => {
        if (res.status === 200) {
          navigate(`/tasks/${item.task_id}`);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const date = formatDateTimeString(item.done_date, item.done_time);

  const renderHintContent = () => {
    switch (eventStatus) {
      case "active":
        return "В процессе";
      case "done":
        return "Выполнено";
      case "not_done":
        return "Не выполнено";
      case "not_on_time":
        return "С опозданием";
      case "doubt":
        return "Требует внимания";
      default:
        return "В процессе";
    }
  };

  const isTask = historyType !== "check_in" && historyType !== "check_out";

  return (
    <div
      className={`${styles.historyItem} ${
        isPhotoRequired ? styles.photo : ""
      } ${statusClass}`}
    >
      <HintWithPortal hintContent={renderHintContent()} hasIcon={false}>
        <div className={styles.statusIcon}>
          <Icon size={20} />
        </div>
      </HintWithPortal>

      {/* 2. Основное содержание */}
      <div className={styles.contentArea}>
        <div className={styles.titleRow}>
          <div className={styles.taskTitleContainer}>
            <p
              className={`${styles.taskTitle} ${isTask ? styles.task : ""}`}
              onClick={isTask ? onTaskClick : null}
            >
              {historyType === "check_in"
                ? "Чекин"
                : historyType === "check_out"
                ? "Чекаут"
                : item.title}
            </p>
            {isLoading && <RingLoader size={12} color="#16a34a" />}
          </div>

          <span className={styles.date}>
            {eventStatus === "active" ? "Выполняется" : date} (
            {getFormattedTimeZoneLabel(timezone)})
          </span>
        </div>

        <div className={styles.deadlineContainer}>
          <div className={styles.deadline}>
            <AlarmClock color="#6b7280" size={12} />{" "}
            {item?.event_type === "check_in"
              ? "Ожидаемое время чекина"
              : item?.action_type === "check_out"
              ? "Ожидаемое время чекаута"
              : "Дедлайн"}
            : {item.deadline_time}
          </div>
          {item?.delta && item?.delta !== "00:00" && (
            <div className={styles.late}>
              <TriangleAlert color="#f59e0b" size={12} />
              {item?.event_type === "check_in"
                ? "Выполнен с опозданием на"
                : item?.event_type === "check_out"
                ? "Выполнен раньше на"
                : "Выполнена с опозданием на"}
              : {formatTimeToWords(item.delta)}
            </div>
          )}
        </div>

        {/* 3. Детали и фидбек */}

        {(item.done_rules || item.comment || item.ai_feedback) && (
          <div className={styles.feedbackSection}>
            {item.done_rules && (
              <p className={styles.criteria}>
                <i>Критерий приемки:</i> <b>{item.done_rules}</b>
              </p>
            )}

            {item.comment && (
              <p className={styles.comment}>
                <MessageCircleMore size={14} className={styles.iconTiny} />
                Комментарий: {item.comment}
              </p>
            )}

            {item.ai_feedback?.includes("OK") ? (
              <p className={`${styles.aiFeedback} ${styles.aiSuccess}`}>
                <CheckCircle size={14} /> AI Анализ: Успешно
              </p>
            ) : (
              aiComment && (
                <p className={`${styles.aiFeedback} ${styles.aiFail}`}>
                  <AlertTriangle size={14} /> AI Анализ: Неудача (
                  {item.ai_feedback})
                </p>
              )
            )}
          </div>
        )}
      </div>

      {/* 4. Предпросмотр фотоотчета */}
      {isPhotoRequired &&
        (item.photo_link ? (
          <div
            className={`${styles.photoContainer} ${
              isPhotoRequired && !item?.photo_link ? styles.photoNeed : ""
            }`}
            onClick={() => onPhotoClick(item?.photo_link)}
          >
            <img
              src={item.photo_link}
              alt="Фотоотчет сотрудника"
              className={styles.photo}
            />
          </div>
        ) : (
          <div className={`${styles.photoContainer} ${styles.empty}`}>
            <p>Нет фото</p>
          </div>
        ))}
      {hasEventHistory && (
        <button className={styles.attemptsButton} onClick={onShowEventHistory}>
          <Images size={14} />
          Посмотреть историю попыток
          {isLoadingEventHistory ? (
            <RingLoader size={12} color="#16a34a" />
          ) : showAttempts ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>
      )}

      {/* 5. Раскрывающийся список попыток */}
      {showAttempts && (
        <div className={styles.attemptsList}>
          {eventsHistory.length === 0 ? (
            <p className={styles.noAttempts}>Нет попыток</p>
          ) : (
            eventsHistory.map((attempt, idx) => {
              return (
                <div key={idx} className={styles.attemptItem}>
                  <img
                    src={attempt.photo_link}
                    className={styles.attemptImage}
                    alt="Попытка"
                    onClick={() => onPhotoClick(attempt.photo_link)}
                  />

                  <div className={styles.attemptInfo}>
                    <div className={styles.attemptDateContainer}>
                      <div className={styles.taskTitleContainer}>
                        <p
                          className={`${styles.taskTitle} ${
                            isTask ? styles.task : ""
                          }`}
                          onClick={onTaskClick}
                        >
                          {attempt?.title}
                        </p>
                        {isLoading && <RingLoader size={12} color="#16a34a" />}
                      </div>

                      <p className={styles.attemptDate}>
                        {formatDateTimeString(
                          attempt.done_date,
                          attempt.done_time
                        )}
                      </p>
                    </div>
                    {attempt?.ai_feedback && (
                      <p className={`${styles.aiFeedback} ${styles.aiFail}`}>
                        <AlertTriangle size={14} /> AI Анализ: Неудача (
                        {attempt?.ai_feedback})
                      </p>
                    )}
                    {attempt.success && (
                      <p className={styles.attemptAiSuccess}>
                        <CheckCircle size={12} /> Принято
                      </p>
                    )}

                    {attempt.comment && !attempt.success && (
                      <div className={styles.feedbackSection}>
                        <p className={styles.comment}>
                          <MessageCircleMore
                            size={14}
                            className={styles.iconTiny}
                          />
                          Комментарий: {attempt.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
