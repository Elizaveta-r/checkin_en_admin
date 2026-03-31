import { useLocation, useNavigate } from "react-router-dom";
import styles from "./LeftMenu.module.scss";
import {
  AlarmClockCheck,
  Briefcase,
  Building2,
  Cable,
  Calendar1,
  CreditCard,
  FileBarChart,
  GraduationCap,
  Home,
  IdCardLanyard,
} from "lucide-react";

const renderItemsData = [
  { name: "Обзор", path: "/", icon: <Home size={18} /> },
  { name: "Отчеты", path: "/reports", icon: <FileBarChart size={18} /> },
  // { name: "Биллинг", path: "/billing", icon: <CreditCard size={18} /> },
  {
    name: "Штатное расписание",
    path: "/staffing-table",
    icon: <Calendar1 size={18} />,
  },

  {
    name: "Задачи",
    path: "/tasks",
    icon: <AlarmClockCheck size={18} />,
    dataTour: "menu.tasks",
  },
  {
    name: "Должности",
    path: "/positions",
    icon: <Briefcase size={18} />,
    dataTour: "menu.positions",
  },
  {
    name: "Сотрудники",
    path: "/employees",
    dataTour: "menu.employees",
    icon: <IdCardLanyard size={18} />,
  },
  {
    name: "Интеграции",
    path: "/integrations",
    icon: <Cable size={18} />,
    dataTour: "menu.integrations",
  },
  {
    name: "Подразделения",
    path: "/departments",
    dataTour: `menu.departments`,
    icon: <Building2 size={18} />,
  },
];

export const LeftMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isParentActive = (item) =>
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/");

  const handleItemClick = (item) => {
    navigate(item.path);
  };

  const handleKey = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  const handleStartTour = () => {
    localStorage.removeItem("tours_state_v1");
    sessionStorage.setItem("start_tour", "true");
    navigate("/departments");
  };

  return (
    <nav className={styles.leftMenu} aria-label="Главное меню">
      <div className={styles.navItems}>
        {renderItemsData?.map((item, index) => {
          return (
            <div
              key={`left-menu-${item.name}-${index}`}
              data-tour={item.dataTour}
            >
              <div
                role="button"
                tabIndex={0}
                className={`${styles.item} ${
                  isParentActive(item) ? styles.active : ""
                }`}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKey(e, item)}
              >
                <div className={styles.labelContainer}>
                  {item.icon && <div className={styles.icon}>{item.icon}</div>}
                  <span className={styles.label}>{item.name}</span>
                </div>
              </div>
              {/* {item.name === "Биллинг" && <div className={styles.line} />} */}
              {item.name === "Штатное расписание" && (
                <div className={styles.line} />
              )}
            </div>
          );
        })}
      </div>

      <div
        role="button"
        tabIndex={0}
        className={`${styles.trainingButton} `}
        onClick={handleStartTour}
      >
        <div className={styles.icon}>
          <GraduationCap size={18} />
        </div>{" "}
        <span className={styles.label}>Пройти обучение</span>
      </div>
    </nav>
  );
};
