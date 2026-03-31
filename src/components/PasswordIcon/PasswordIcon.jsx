import { Eye, EyeOff } from "lucide-react";
import styles from "./PasswordIcon.module.scss";

export default function PasswordIcon({ viewPassword, setViewPassword }) {
  return (
    <div
      className={styles.iconBlock}
      onClick={() => setViewPassword((v) => !v)}
    >
      {viewPassword ? (
        <EyeOff size={15} color="var(--color-text-main)" />
      ) : (
        <Eye size={15} color="var(--color-text-main)" />
      )}
    </div>
  );
}
