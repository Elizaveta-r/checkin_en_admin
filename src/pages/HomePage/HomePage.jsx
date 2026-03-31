import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle, // Выполнено
  Clock, // Просрочено
  AlertTriangle, // Проблемные задачи
  TrendingUp, // График
  ArrowRight, // Быстрые ссылки
  ThumbsUp,
  ChevronDown, // Провалено
} from "lucide-react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./HomePage.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMediaQuery } from "react-responsive";
import { getDashboard } from "../../utils/api/actions/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { buildWeekChartData } from "../../utils/methods/buildChartData";
import { KpiCard } from "./components/KPICard";
import { KpiCardMobile } from "./components/KPICardMobile";
import { IsProblemEvent } from "./components/IsProblemEvent";

const quickLinks = [
  { title: "Список сотрудников", path: "/employees" },
  { title: "Создать задачу", path: "/tasks/new" },
  { title: "Создать должность", path: "/positions?action=create" },
  { title: "Аналитические отчеты", path: "/reports" },
];

export default function HomePage() {
  const dispatch = useDispatch();

  const tableRef = useRef(null);

  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  const {
    ai_success_rate,
    checked_in_count,
    day_stats,
    done_tasks,
    employees_count,
    is_problem,
    not_done_tasks,
  } = useSelector((state) => state.dashboard);

  const [scrollPosition, setScrollPosition] = useState("top"); // 'top', 'middle', 'bottom'

  const isAtBottom = scrollPosition === "bottom";
  const scrollDirection = isAtBottom ? "up" : "down";

  const employeeProgress =
    employees_count > 0 ? (checked_in_count / employees_count) * 100 : 0;

  const chartData = useMemo(() => buildWeekChartData(day_stats), [day_stats]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;

    const atTop = scrollTop <= 1;
    const atBottom = scrollHeight - (scrollTop + clientHeight) <= 1;

    if (atTop) setScrollPosition("top");
    else if (atBottom) setScrollPosition("bottom");
    else setScrollPosition("middle");
  };

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop === 0) setScrollPosition("top");
    else if (Math.abs(scrollHeight - scrollTop - clientHeight) < 5)
      setScrollPosition("bottom");
    else setScrollPosition("middle");
  }, [is_problem?.length]);

  return (
    <div className={styles.dashboardPage}>
      <PageTitle
        title={"Дашборд"}
        hint={"Информация отображается за текущий день"}
      />

      {/* 1. СВОДКА KPI (ВЕРХНИЙ БЛОК) */}
      <div className={styles.kpiGrid}>
        {isMobile ? (
          <KpiCardMobile
            title="Задач выполнено"
            value={done_tasks}
            icon={CheckCircle}
            colorClass="green"
          />
        ) : (
          <KpiCard
            title="Задач выполнено"
            value={done_tasks}
            icon={CheckCircle}
            colorClass="green"
          />
        )}
        {isMobile ? (
          <KpiCardMobile
            title="Задач не выполнено"
            value={not_done_tasks}
            icon={Clock}
            colorClass="red"
          />
        ) : (
          <KpiCard
            title="Задач не выполнено"
            value={not_done_tasks}
            icon={Clock}
            colorClass="red"
          />
        )}
        {isMobile ? (
          <KpiCardMobile
            title="Успешность AI-проверок"
            value={`${Number(ai_success_rate?.toFixed(0))}%`}
            icon={ThumbsUp}
            colorClass="gradient"
          />
        ) : (
          <KpiCard
            title="Успешность AI-проверок"
            value={`${Number(ai_success_rate?.toFixed(0))}%`}
            icon={ThumbsUp}
            colorClass="gradient"
          />
        )}
        {/* Отдельная карточка для прогресса сотрудников */}
        <div className={`${styles.kpiCard} ${styles.blue}`}>
          <div className={styles.content}>
            <span className={styles.kpiValue}>
              {checked_in_count} из {employees_count}
            </span>
            <span className={styles.kpiTitle}>
              Сотрудников на рабочем месте
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${employeeProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. ОСНОВНОЙ КОНТЕНТ (2 КОЛОНКИ: Проблемы и Аналитика/Ссылки) */}
      <div className={styles.mainContentGrid}>
        {/* 2.1. ЛЕВЫЙ БЛОК: Проблемные задачи (Требуется внимание) */}
        <div className={styles.problemTasksSection}>
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={20} className={styles.alertIcon} />
            Требуется внимание ({is_problem?.length ? is_problem?.length : 0})
          </h2>

          <div className={styles.tableWrapper}>
            {/* Заголовки вынесены отдельно для sticky */}
            <div className={styles.tableHeader}>
              <span>Задача</span>
              <span>Сотрудник</span>
              <span>Статус</span>
            </div>

            <div
              className={styles.tasksTable}
              ref={tableRef}
              onScroll={handleScroll}
            >
              {is_problem ? (
                is_problem?.map((task) => (
                  <IsProblemEvent key={task.event_id} task={task} />
                ))
              ) : (
                <p>Нет проблемных событий</p>
              )}
            </div>

            {is_problem?.length > 2 && (
              <div
                className={`${styles.scrollIndicator} ${
                  scrollDirection === "up" ? styles.scrollUp : styles.scrollDown
                }`}
                onClick={() => {
                  const el = tableRef.current;
                  if (!el) return;

                  const target =
                    scrollDirection === "down" ? el.scrollHeight : 0;

                  el.scrollTo({
                    top: target,
                    behavior: "smooth",
                  });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  const el = tableRef.current;
                  if (!el) return;
                  const target =
                    scrollDirection === "down" ? el.scrollHeight : 0;
                  el.scrollTo({ top: target, behavior: "smooth" });
                }}
                aria-label={
                  scrollDirection === "down"
                    ? "Прокрутить вниз"
                    : "Прокрутить вверх"
                }
              >
                <ChevronDown size={28} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>

        {/* 2.2. ПРАВЫЙ БЛОК: Аналитика и Ссылки */}
        <div className={styles.analyticsSection}>
          {/* А. Блок быстрого обзора (График - тут будет заглушка) */}
          <div className={styles.analyticsCard}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={20} /> Динамика выполнения (7 дней)
            </h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -2, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis dataKey="name" stroke="#a0a0a0" tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Выполнено"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Проблемные"
                    fill="#dc2626"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Б. Блок быстрых ссылок */}
          <div className={styles.linksCard}>
            <h2 className={styles.sectionTitle}>Быстрые ссылки</h2>
            <div className={styles.linkList}>
              {quickLinks?.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className={styles.quickLink}
                >
                  {link.title}
                  <ArrowRight size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
