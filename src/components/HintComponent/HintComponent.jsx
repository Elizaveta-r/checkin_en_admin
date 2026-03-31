import styles from "./HintComponent.module.scss";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

export const HintComponent = ({
  hint,
  text,
  position,
  hasIcon = false,
  titleStyle,
  styleHintWrapper,
}) => {
  return (
    <HintWithPortal
      hintContent={hint}
      position={position}
      hasIcon={hasIcon}
      styleHintWrapper={styleHintWrapper}
    >
      <p className={`${titleStyle} ${styles.sectionTitle} `}>{text}</p>
    </HintWithPortal>
  );
};
