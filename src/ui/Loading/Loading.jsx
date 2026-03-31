import styles from "./Loading.module.scss";
import { RingLoader } from "react-spinners";

export const Loading = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderSpinner}>
        <RingLoader size={48} color="#16a34a" />
      </div>
      <div className={styles.loaderText}>
        Подождите, пожалуйста, идет загрузка
        <span className={styles.loaderDots}>
          <span className={styles.loaderDot} />
          <span className={styles.loaderDot} />
          <span className={styles.loaderDot} />
        </span>
      </div>
    </div>
  );
};
