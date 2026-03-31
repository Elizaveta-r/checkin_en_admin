import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MobileLeftMenu.module.scss";
import {
  AlarmClockCheck,
  Briefcase,
  Building2,
  Cable,
  Calendar1,
  CreditCard,
  FileBarChart,
  Home,
  IdCardLanyard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Button } from "../../ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { revokeSession } from "../../utils/api/actions/sessions";
import { logout } from "../../store/slices/userSlice";

const mainMenuItems = [
  { name: "Задачи", path: "/tasks", icon: <AlarmClockCheck size={18} /> },
  { name: "Сотрудники", path: "/employees", icon: <IdCardLanyard size={20} /> },
  { name: "Обзор", path: "/", icon: <Home size={20} /> },
  { name: "Отчеты", path: "/reports", icon: <FileBarChart size={20} /> },
];

const burgerMenuItems = [
  // { name: "Биллинг", path: "/billing", icon: <CreditCard size={18} /> },
  { name: "Интеграции", path: "/integrations", icon: <Cable size={20} /> },
  { name: "Должности", path: "/positions", icon: <Briefcase size={18} /> },
  {
    name: "Подразделения",
    path: "/departments",
    icon: <Building2 size={18} />,
  },
  {
    name: "Штатное расписание",
    path: "/staffing-table",
    icon: <Calendar1 size={18} />,
  },
  {
    name: "Настройки",
    path: "/settings",
    icon: <Settings size={18} />,
  },
];

export const MobileLeftMenu = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userData = useSelector((state) => state?.user?.data);

  const sessionId = userData?.session?.id;

  // const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isParentActive = (item) =>
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/");

  const handleItemClick = (item) => {
    navigate(item.path);
    setIsOpen(false);
  };

  const handleKey = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await dispatch(revokeSession(sessionId, setLoading));
    } catch (error) {
      console.warn("Сессия уже завершена или не найдена:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      dispatch(logout());
      navigate("/auth", { replace: true });
    }
  };

  // Закрытие меню при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Мобильное меню */}
      <div className={styles.mobileMenuWrapper}>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Оверлей */}
              <motion.div
                className={styles.overlay}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              />

              {/* Бургер-меню */}
              <motion.nav
                className={styles.burgerMenu}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                aria-label="Дополнительное меню"
              >
                <button
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <X size={24} />
                </button>

                <div className={styles.burgerItems}>
                  {burgerMenuItems?.map((item, index) => (
                    <motion.div
                      key={`burger-menu-${item.name}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
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
                          {item.icon && (
                            <div className={styles.icon}>{item.icon}</div>
                          )}
                          <span className={styles.label}>{item.name}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  key={`burger-menu-button-logout`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 * 0.05 + 0.1 }}
                  className={styles.logoutContainer}
                >
                  <Button
                    title="Выйти"
                    className={styles.logout}
                    leftIcon={<LogOut size={16} />}
                    onClick={handleLogout}
                    loading={loading}
                  />
                </motion.div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Нижнее меню */}
        <nav className={styles.bottomMenu} aria-label="Главная навигация">
          {mainMenuItems?.map((item, index) => (
            <div
              key={`bottom-menu-${item.name}-${index}`}
              role="button"
              tabIndex={0}
              className={`${styles.bottomItem} ${
                isParentActive(item) ? styles.active : ""
              }`}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKey(e, item)}
            >
              <div className={styles.bottomIcon}>{item.icon}</div>
              <span className={styles.bottomLabel}>{item.name}</span>
            </div>
          ))}

          {/* Кнопка бургер-меню */}
          <div
            role="button"
            tabIndex={0}
            className={`${styles.bottomItem} ${isOpen ? styles.active : ""}`}
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
              }
            }}
            aria-label="Открыть меню"
            aria-expanded={isOpen}
          >
            <div className={styles.bottomIcon}>
              <Menu size={20} />
            </div>
            <span className={styles.bottomLabel}>Еще</span>
          </div>
        </nav>
      </div>
    </>
  );
};
