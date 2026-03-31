import styles from "../HomePage.module.scss";

export const KpiCard = ({ title, value, icon, colorClass }) => {
  const Icon = icon;
  return (
    <div className={`${styles.kpiCard} ${styles[colorClass]}`}>
      <div className={styles.iconWrapper}>
        <Icon size={30} />
      </div>
      <div className={styles.content}>
        <span className={styles.kpiValue}>{value}</span>
        <span className={styles.kpiTitle}>{title}</span>
      </div>
    </div>
  );
};
