import { CircleCheck, CircleX } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import styles from "./TariffCard.module.scss";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";

export const TariffCard = ({ tariff, onBuyClick, loadingBuy }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <p className={styles.title}>{tariff.name}</p>
          {tariff.isPopular && <div className={styles.pill}>Popular</div>}
        </div>

        <div className={styles.priceContainer}>
          <div className={styles.price}>
            {formatWithSpaces(tariff.base_price)} ₽ <span>per month</span>
          </div>
          <p className={styles.description}>{tariff.description}</p>
        </div>
      </div>
      <div className={styles.btnGrid}>
        <Button
          className={`${styles.buttonBuy} ${
            tariff.isCurrent ? styles.disabled : ""
          }`}
          secondary
          title={
            tariff.isCurrent
              ? "Current plan"
              : tariff.code === "free"
                ? "Switch to Free"
                : "Choose plan"
          }
          loading={loadingBuy}
          disabled={tariff.isCurrent}
          onClick={onBuyClick}
        />
        {/* <HintWithPortal
          hintContent={`You can expand the employee limit by purchasing additional slots.\n
            This feature is not available on the Free plan.`}
          position="left"
        >
          <Button
            className={`${styles.buttonTeam} ${
              tariff.name === "Free" ? styles.disabled : ""
            }`}
            secondary
            title={"Expand team"}
            disabled={tariff.name === "Free"}
            onClick={onTeamClick}
          />
        </HintWithPortal> */}
      </div>

      <div className={styles.featuresContainer}>
        <p className={styles.featuresTitle}>Benefits</p>
        <div className={styles.featuresList}>
          {tariff.features.map((feature) => (
            <div key={feature.text} className={`${styles.feature} `}>
              {feature.included ? (
                <CircleCheck size={12} className={styles.includedIcon} />
              ) : (
                <CircleX size={12} className={styles.notIncluded} />
              )}
              <p
                className={`${styles.featureText} ${
                  feature.included ? styles.included : ""
                }`}
              >
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
