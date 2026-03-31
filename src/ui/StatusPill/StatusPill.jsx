/* src/ui/StatusPill/StatusPill.jsx */

import React from "react";
import styles from "./StatusPill.module.scss";

/**
 * Компонент-пилюля для отображения статуса Активна/Не активна.
 * * @param {object} props - Свойства компонента.
 * @param {boolean} props.isActive - Определяет, активен ли статус (true = Активна, false = Не активна).
 * @param {string} [props.className] - Дополнительный класс CSS.
 */
export const StatusPill = ({ isActive, className = "" }) => {
  const statusText = isActive ? "Активна" : "Не активна";

  const pillClass = isActive ? styles.active : styles.inactive;

  return (
    <span className={`${styles.pill} ${pillClass} ${className}`}>
      {statusText}
    </span>
  );
};
