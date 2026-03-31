import React from "react";
import { Check } from "lucide-react";
import styles from "./CustomCheckbox.module.scss";
import { HintWithPortal } from "../HintWithPortal/HintWithPortal";

export const CustomCheckbox = ({
  checked,
  onChange,
  label,
  className,
  labelClassName,
  labelHint,
  disabled = false,
}) => {
  const handleToggle = (e) => {
    e.stopPropagation();

    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`${styles.checkboxWrapper} ${className || ""} ${
        disabled ? styles.disabled : ""
      }`}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle(e);
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="checkbox"
      aria-checked={checked}
    >
      <div
        className={`${styles.customCheckbox} ${checked ? styles.checked : ""}`}
      >
        {checked && <Check size={14} className={styles.icon} />}
      </div>

      {label && !labelHint && (
        <span className={`${styles.label} ${labelClassName || ""}`}>
          {label}
        </span>
      )}
      {label && labelHint && (
        <HintWithPortal hintContent={labelHint}>
          <span className={`${styles.label} ${labelClassName || ""}`}>
            {label}
          </span>
        </HintWithPortal>
      )}
    </div>
  );
};
