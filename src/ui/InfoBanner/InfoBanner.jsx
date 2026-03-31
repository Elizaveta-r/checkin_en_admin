import styles from "./InfoBanner.module.scss";

export const InfoBanner = ({ children }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.dot}></div>
      <div className={styles.text}>{children}</div>
    </div>
  );
};
