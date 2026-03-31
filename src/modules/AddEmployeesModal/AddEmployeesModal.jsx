import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Minus,
  CreditCard,
  TrendingUp,
  Check,
  X,
} from "lucide-react";
import styles from "./AddEmployeesModal.module.scss";
import { useSelector } from "react-redux";
import { pluralizeEmployees } from "../../utils/methods/pluralizeText";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";

const ADDITIONAL_EMPLOYEE_COST = 150;
const CURRENCY_SYMBOL = "₽";
const CURRENCY_POSITION = "after"; // "before" | "after"
const PER_MONTH_LABEL = "per month";

const formatPrice = (value) => {
  const formatted = formatWithSpaces(value);

  return CURRENCY_POSITION === "before"
    ? `${CURRENCY_SYMBOL}${formatted}`
    : `${formatted} ${CURRENCY_SYMBOL}`;
};

export const AddEmployeesModal = ({ isOpen, onClose, onConfirm }) => {
  const { wallet, tariffs } = useSelector((state) => state?.billing);
  const { subscription } = wallet;

  const currentPlus = Number(subscription?.employees_plus) || 0;

  const currentTariff = tariffs?.find(
    (tariff) => tariff?.id === subscription?.tariff_id,
  );

  const [additionalCount, setAdditionalCount] = useState(currentPlus);

  useEffect(() => {
    if (isOpen) setAdditionalCount(currentPlus);
  }, [isOpen, currentPlus]);

  if (!isOpen) return null;

  const limit = Number(subscription?.employees_limit) || 0;

  const allEmployeesCount = limit + currentPlus;
  const newTotalEmployees = limit + additionalCount;

  const totalPrice =
    Number(currentTariff?.base_price) +
    Number(additionalCount) * ADDITIONAL_EMPLOYEE_COST;

  const additionalCost = additionalCount * ADDITIONAL_EMPLOYEE_COST;

  const handleEmployeeChange = (delta) => {
    setAdditionalCount((prev) => {
      const current = prev || 0;
      const newValue = Math.max(0, current + delta);
      return newValue;
    });
  };

  const handleConfirm = () => {
    const delta = additionalCount - currentPlus;
    if (delta === 0) return;

    const employees_action = delta > 0 ? "add" : "sub";
    const employees_count = Math.abs(delta);

    onConfirm?.(employees_count, employees_action);
  };

  const benefits = [
    "Slots are activated instantly",
    "Automatic charge from your balance",
    "Cancel anytime",
  ];

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div className={styles.headerText}>
              <h2 className={styles.title}>Expand your team</h2>
              <p className={styles.subtitle}>Add more employees</p>
            </div>
          </div>
        </div>

        <div className={styles.currentPlanCard}>
          <div className={styles.planInfo}>
            <div>
              <div className={styles.planLabel}>Current plan</div>
              <div className={styles.planName}>{currentTariff?.name}</div>
            </div>
            <div className={styles.employeesCount}>
              <div className={styles.employeesNumber}>{allEmployeesCount}</div>
              <div className={styles.employeesLabel}>
                {pluralizeEmployees(allEmployeesCount)}
              </div>
            </div>
          </div>

          <div className={styles.progressIndicator}>
            <TrendingUp size={18} />
            <span>
              After adding: <strong>{newTotalEmployees}</strong>{" "}
              {pluralizeEmployees(newTotalEmployees)}
            </span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.employeeCounter}>
            <div className={styles.counterLabel}>
              Number of additional slots
            </div>

            <div className={styles.counterControls}>
              <button
                onClick={() => handleEmployeeChange(-1)}
                disabled={additionalCount === 0}
                className={`${styles.counterButton} ${styles.counterButtonMinus}`}
              >
                <Minus size={24} strokeWidth={2.5} />
              </button>

              <div className={styles.counterDisplay}>
                <div className={styles.counterNumber}>{additionalCount}</div>
                <div className={styles.counterText}>new slots</div>
              </div>

              <button
                onClick={() => handleEmployeeChange(1)}
                className={`${styles.counterButton} ${styles.counterButtonPlus}`}
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </div>

            {additionalCount > 0 && (
              <div className={styles.calculation}>
                {additionalCount} × {formatPrice(ADDITIONAL_EMPLOYEE_COST)} ={" "}
                <strong>{formatPrice(additionalCost)}</strong>
              </div>
            )}
          </div>

          <div className={styles.priceSummary}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Base plan</span>
              <span className={styles.priceValue}>
                {formatPrice(currentTariff?.base_price)}
              </span>
            </div>

            {additionalCount > 0 && (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Additional slots</span>
                <span className={styles.priceValue}>
                  +{formatPrice(additionalCost)}
                </span>
              </div>
            )}

            <div className={styles.priceTotal}>
              <span className={styles.totalLabel}>Total due</span>
              <div className={styles.totalAmount}>
                <div className={styles.totalPrice}>
                  {formatPrice(totalPrice)}
                </div>
                <div className={styles.totalPeriod}>{PER_MONTH_LABEL}</div>
              </div>
            </div>
          </div>

          <div className={styles.benefits}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className={styles.benefitText}>{benefit}</span>
              </div>
            ))}
          </div>

          {additionalCount >= 15 && currentTariff?.name !== "Standard" && (
            <div className={styles.warning}>
              We recommend switching to the "Standard" plan
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleConfirm}
              disabled={additionalCount === currentPlus}
            >
              <CreditCard size={18} strokeWidth={2.5} />
              <span>
                {additionalCount > currentPlus ? "Add slots" : "Reduce slots"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
