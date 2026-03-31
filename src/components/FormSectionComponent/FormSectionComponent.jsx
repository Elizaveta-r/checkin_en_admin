import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import styles from "./FormSectionComponent.module.scss";

export const FormSectionComponent = ({
  dataTour,
  children,
  label,
  hintContent,
  hintPosition,
  hasHintIcon,
  isMaxWidth,
}) => {
  return (
    <div className={styles.section} data-tour={dataTour}>
      {hintContent ? (
        <HintWithPortal
          hintContent={hintContent}
          position={hintPosition}
          hasIcon={hasHintIcon}
          isMaxWidth={isMaxWidth}
        >
          <p className={styles.label}>{label}</p>
        </HintWithPortal>
      ) : (
        <p className={styles.label}>{label}</p>
      )}

      {children}
    </div>
  );
};
