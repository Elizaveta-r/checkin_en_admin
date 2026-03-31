import React from "react";
import styles from "./CustomTextArea.module.scss";

/**
 * Переиспользуемый компонент текстового поля (TextArea).
 * Поддерживает все стандартные пропсы HTML-textarea.
 */
export default function CustomTextArea({
  placeholder,
  className,
  rows = 4,
  ...props
}) {
  return (
    <textarea
      placeholder={placeholder}
      rows={rows} // По умолчанию 4 строки
      className={`${styles.textarea} ${className || ""}`}
      {...props}
    />
  );
}
