import React from "react";
import { Users, Zap, TrendingUp } from "lucide-react";
import styles from "./EmployeeLimitModal.module.scss";

export const EmployeeLimitModal = ({
  isOpen,
  onClose,
  currentCount = 5,
  maxCount = 5,
  planName = "Free",
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
            <h2 className={styles.title}>Employee limit reached</h2>
            <p className={styles.subtitle}>You cannot add a new employee</p>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.limitInfo}>
              <div className={styles.currentCount}>
                {currentCount} / {maxCount}
              </div>
              <p className={styles.limitText}>
                Plan <span className={styles.planName}>{planName}</span>
              </p>
            </div>

            {planName !== "Free" ? (
              <p className={styles.message}>
                To continue adding employees, you can upgrade your plan or
                purchase additional slots.
              </p>
            ) : (
              <p className={styles.message}>
                To continue adding employees, you need to upgrade your plan.
              </p>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={onUpgradePlan}
              >
                <TrendingUp size={18} />
                Upgrade plan
              </button>
              {planName !== "Free" && (
                <button
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={onAddSlots}
                >
                  <Zap size={18} />
                  Expand team
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
