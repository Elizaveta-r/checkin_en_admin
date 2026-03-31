import React from "react";
import { Users, Zap, TrendingUp } from "lucide-react";
import styles from "./EmployeeLimitModal.module.scss";

export const EmployeeLimitModal = ({
  isOpen,
  onClose,
  currentCount = 5,
  maxCount = 5,
  planName = "Бесплатный",
  onUpgradePlan,
  onAddSlots,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>

          <div className={styles.modalHeader}>
            <div className={styles.iconWrapper}>
              <Users size={40} strokeWidth={2.5} />
            </div>
            <h2 className={styles.title}>Достигнут лимит сотрудников</h2>
            <p className={styles.subtitle}>
              Вы не можете добавить нового сотрудника
            </p>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.limitInfo}>
              <div className={styles.currentCount}>
                {currentCount} / {maxCount}
              </div>
              <p className={styles.limitText}>
                Тариф <span className={styles.planName}>{planName}</span>
              </p>
            </div>

            {planName !== "Бесплатный" ? (
              <p className={styles.message}>
                Чтобы продолжить добавление сотрудников, вы можете сменить тариф
                или докупить дополнительные места.
              </p>
            ) : (
              <p className={styles.message}>
                Чтобы продолжить добавление сотрудников, вам необходимо сменить
                тариф.
              </p>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={onUpgradePlan}
              >
                <TrendingUp size={18} />
                Сменить тариф
              </button>
              {planName !== "Бесплатный" && (
                <button
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={onAddSlots}
                >
                  <Zap size={18} />
                  Расширить команду
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
