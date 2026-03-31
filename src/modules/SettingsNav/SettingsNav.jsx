import { Lock, UserIcon } from "lucide-react";
import styles from "./SettingsNav.module.scss";

export const SettingsNav = ({ activeTab, setActiveTab }) => {
  return (
    <nav className={styles.navigation}>
      <button
        className={`${styles.navItem} ${
          activeTab === "profile" ? styles.active : ""
        }`}
        onClick={() => setActiveTab("profile")}
      >
        <UserIcon className={styles.navIcon} />
        Profile
      </button>
      <button
        className={`${styles.navItem} ${
          activeTab === "security" ? styles.active : ""
        }`}
        onClick={() => setActiveTab("security")}
      >
        <Lock className={styles.navIcon} />
        Security
      </button>
    </nav>
  );
};
