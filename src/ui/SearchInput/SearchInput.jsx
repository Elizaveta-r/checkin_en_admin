import { Search } from "lucide-react";
import styles from "./SearchInput.module.scss";

export const SearchInput = ({
  type = "text",
  placeholder,
  className,
  ...props
}) => {
  return (
    <div className={styles.inputWrapper}>
      <Search size={16} />
      <input
        type={type}
        placeholder={placeholder}
        className={`${styles.input} ${className || ""}`}
        {...props}
      />
    </div>
  );
};
