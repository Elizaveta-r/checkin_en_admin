import React from "react";
import { pluralizeEmployees } from "../../utils/methods/pluralizeText";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";
import styles from "./TotalSumTariff.module.scss";

const CURRENCY_SYMBOL = "$";
const CURRENCY_POSITION = "before"; // "before" | "after"
const PER_MONTH_LABEL = "month";

const formatPrice = (value) => {
  const formatted = formatWithSpaces(value);

  return CURRENCY_POSITION === "before"
    ? `${CURRENCY_SYMBOL}${formatted}`
    : `${formatted} ${CURRENCY_SYMBOL}`;
};

export const TotalSumTariff = ({
  tariff,
  addedEmployeesCount,
  employeePrice,
  totalPrice,
  employeeCost,
}) => {
  return (
    <div className={styles.content}>
      <p className={styles.totalEmployees}>
        Total: {tariff.employees_limit + addedEmployeesCount}{" "}
        {pluralizeEmployees(tariff.employees_limit + addedEmployeesCount)}
      </p>

      <div className={styles.total}>
        <div className={styles.sumItem}>
          <p className={styles.sumTitle}>
            {addedEmployeesCount} x {employeeCost}
          </p>
          <p className={styles.sumValue}>{formatPrice(employeePrice)}</p>
        </div>
        <div className={styles.sumItem}>
          <p className={styles.sumTitle}>Plan "{tariff.name}"</p>
          <p className={styles.sumValue}>{formatPrice(tariff.base_price)}</p>
        </div>

        <div className={styles.sumItem}>
          <p className={styles.sumTitle}>Total due</p>
          <p className={styles.totalSumValue}>
            {formatPrice(totalPrice)} / {PER_MONTH_LABEL}
          </p>
        </div>
      </div>
    </div>
  );
};
