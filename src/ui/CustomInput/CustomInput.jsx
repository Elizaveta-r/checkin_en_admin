import React from "react";
import styles from "./CustomInput.module.scss";

/**
 * Переиспользуемый компонент инпута.
 * Поддерживает все стандартные пропсы HTML-инпута.
 */
export default function CustomInput({
  type = "text",
  placeholder,
  className,
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`${styles.input} ${className || ""}`}
      {...props}
    />
  );
}
