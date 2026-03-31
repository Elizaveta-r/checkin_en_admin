import styles from "../HomePage.module.scss";

export const KpiCardMobile = ({ title, value, icon, colorClass }) => {
  const Icon = icon;
  return (
    <div className={`${styles.kpiCard} ${styles[colorClass]}`}>
      <div className={styles.contentMobile}>
        <div className={styles.iconWrapper}>
          <Icon size={20} />
        </div>

        <span className={styles.kpiValue}>{value}</span>
      </div>

      <span className={styles.kpiTitle}>{title}</span>
    </div>
  );
};
