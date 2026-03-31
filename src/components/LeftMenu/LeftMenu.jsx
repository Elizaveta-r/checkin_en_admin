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
  { name: "Overview", path: "/", icon: <Home size={18} /> },
  { name: "Reports", path: "/reports", icon: <FileBarChart size={18} /> },
  // { name: "Billing", path: "/billing", icon: <CreditCard size={18} /> },
  {
    name: "Staff Schedule",
    path: "/staffing-table",
    icon: <Calendar1 size={18} />,
  },

  {
    name: "Tasks",
    path: "/tasks",
    icon: <AlarmClockCheck size={18} />,
    dataTour: "menu.tasks",
  },
  {
    name: "Positions",
    path: "/positions",
    icon: <Briefcase size={18} />,
    dataTour: "menu.positions",
  },
  {
    name: "Employees",
    path: "/employees",
    dataTour: "menu.employees",
    icon: <IdCardLanyard size={18} />,
  },
  {
    name: "Integrations",
    path: "/integrations",
    icon: <Cable size={18} />,
    dataTour: "menu.integrations",
  },
  {
    name: "Departments",
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
    <nav className={styles.leftMenu} aria-label="Main menu">
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
              {/* {item.name === "Billing" && <div className={styles.line} />} */}
              {item.name === "Staff Schedule" && (
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
        <span className={styles.label}>Take the tour</span>
      </div>
    </nav>
  );
};
