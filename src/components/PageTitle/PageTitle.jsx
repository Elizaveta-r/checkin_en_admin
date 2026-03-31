import { Plus } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import styles from "./PageTitle.module.scss";
import { useMediaQuery } from "react-responsive";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";

export default function PageTitle({
  dataTour,
  dataTourMobile,
  id,
  btnId,
  title,
  hasButton,
  leftIcon = <Plus size={16} />,
  onClick,
  buttonTitle = "Добавить",
  hint,
  hasCheckbox,
  checked,
  onChange,
  checkboxLabel,
}) {
  const isMobile = useMediaQuery({
    query: "(max-width: 430px)",
  });
  return (
    <div className={styles.container}>
      <div className={styles.title} id={id} data-tour={dataTourMobile}>
        {title}
        {hint && <p className={styles.info}>{hint}</p>}
      </div>
      {hasButton && (
        <Button
          dataTour={dataTour}
          id={btnId}
          secondary
          leftIcon={leftIcon}
          title={isMobile ? "" : buttonTitle}
          onClick={onClick}
          className={styles.button}
        />
      )}
      {hasCheckbox && (
        <CustomCheckbox
          checked={checked}
          onChange={onChange}
          label={checkboxLabel}
        />
      )}
    </div>
  );
}
