import { BadgeInfo } from "lucide-react";
import styles from "./ImportantInfo.module.scss";

const CURRENCY_SYMBOL = "₽";
const CURRENCY_POSITION = "after"; // "before" | "after"
const BILLING_PERIOD = "month";
const ADDITIONAL_EMPLOYEE_PRICE = 150;

const formatPrice = (value) => {
  return CURRENCY_POSITION === "before"
    ? `${CURRENCY_SYMBOL}${value}`
    : `${value} ${CURRENCY_SYMBOL}`;
};

const data = [
  "You can change your plan at any time",
  "Refunds are available within 14 days",
  "Payments are charged automatically every month",
  "All plans include free updates",
  `Additional employees: ${formatPrice(
    ADDITIONAL_EMPLOYEE_PRICE,
  )}/${BILLING_PERIOD} per employee`,
];

export const ImportantInfo = () => {
  return (
    <div className={styles.importantInfo}>
      <div className={styles.header}>
        <BadgeInfo />
        <p className={styles.title}>Important Information</p>
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
