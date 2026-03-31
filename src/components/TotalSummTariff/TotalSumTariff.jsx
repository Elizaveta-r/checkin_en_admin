import React from "react";
import { pluralizeEmployees } from "../../utils/methods/pluralizeText";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";
import styles from "./TotalSumTariff.module.scss";

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
        Всего: {tariff.employees_limit + addedEmployeesCount}{" "}
        {pluralizeEmployees(tariff.employees_limit + addedEmployeesCount)}
      </p>

      <div className={styles.total}>
        <div className={styles.sumItem}>
          <p className={styles.sumTitle}>
            {addedEmployeesCount} x {employeeCost}
          </p>
          <p className={styles.sumValue}>{employeePrice} ₽</p>
        </div>
        <div className={styles.sumItem}>
          <p className={styles.sumTitle}>Тариф "{tariff.name}"</p>
          <p className={styles.sumValue}>
            {formatWithSpaces(tariff.base_price)} ₽
          </p>
        </div>

        <div className={styles.sumItem}>
          <p className={styles.sumTitle}>Итого к оплате</p>
          <p className={styles.totalSumValue}>
            {formatWithSpaces(totalPrice)} ₽ / мес.
          </p>
        </div>
      </div>
    </div>
  );
};
