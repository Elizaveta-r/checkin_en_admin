import { BadgeInfo } from "lucide-react";
import styles from "./ImportantInfo.module.scss";

const data = [
  "Вы можете сменить тариф в любое время",
  "Возврат средств возможен в течение 14 дней",
  "Оплата списывается ежемесячно автоматически",
  "Все тарифы включают бесплатные обновления",
  "Дополнительные сотрудники: 150 ₽/месяц за каждого",
];

export const ImportantInfo = () => {
  return (
    <div className={styles.importantInfo}>
      <div className={styles.header}>
        <BadgeInfo />
        <p className={styles.title}>Важная информация</p>
      </div>
      <div className={styles.info}>
        {data.map((item, index) => (
          <div key={`info-item-${index}`} className={styles.infoItem}>
            <div className={styles.dot} />
            <p className={styles.text}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
