import { useEffect, useRef } from "react";
import styles from "./PhoneInput.module.scss";
import { Phone } from "lucide-react";

const PHONE_MASK = "+7 (___) ___-__-__";
const RAW_LENGTH = 11;

const cleanInput = (input) => {
  let cleaned = ("" + input).replace(/\D/g, "");

  if (cleaned.startsWith("8")) {
    cleaned = "7" + cleaned.substring(1);
  } else if (!cleaned.startsWith("7") && cleaned.length > 0) {
    cleaned = "7" + cleaned;
  }

  // Ограничиваем длину
  return cleaned.substring(0, RAW_LENGTH);
};

const formatPhoneNumber = (cleaned) => {
  let formatted = "+7 (";

  if (cleaned.length > 1) {
    formatted += cleaned.substring(1, 4);
  }
  if (cleaned.length >= 5) {
    formatted += ") " + cleaned.substring(4, 7);
  }
  if (cleaned.length >= 8) {
    formatted += "-" + cleaned.substring(7, 9);
  }
  if (cleaned.length >= 10) {
    formatted += "-" + cleaned.substring(9, 11);
  }

  return formatted.substring(0, PHONE_MASK.length);
};

export const PhoneInput = ({
  value,
  onChange,
  label = "Номер телефона",
  placeholder = PHONE_MASK,
  name,
}) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const input = e.target;
    const rawInput = input.value;

    const currentCursorPos = input.selectionStart;

    const cleaned = cleanInput(rawInput);

    const formatted = formatPhoneNumber(cleaned);

    let newCursorPos = formatted.length;

    const formatDifference = formatted.length - rawInput.length;

    if (
      rawInput.length > formatted.length ||
      rawInput.length === formatted.length
    ) {
      newCursorPos = Math.min(currentCursorPos, formatted.length);
    } else {
      newCursorPos = currentCursorPos + formatDifference;
    }

    onChange({
      target: {
        name: name,
        value: formatted,
      },
    });

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  useEffect(() => {
    if (value && value.length !== PHONE_MASK.length) {
      const cleaned = cleanInput(value);
      const formatted = formatPhoneNumber(cleaned);

      if (formatted !== value) {
        setTimeout(() => {
          onChange({
            target: {
              name: name,
              value: formatted,
            },
          });
        }, 0);
      }
    }
  }, [value, name, onChange]);

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name || "phone-input"} className={styles.label}>
        {label}
      </label>

      <div className={styles.inputWrapper}>
        <Phone size={18} className={styles.icon} />

        <input
          ref={inputRef}
          id={name || "phone-input"}
          name={name}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${styles.input} `}
          autoComplete="off"
          maxLength={PHONE_MASK.length}
        />
      </div>
    </div>
  );
};
