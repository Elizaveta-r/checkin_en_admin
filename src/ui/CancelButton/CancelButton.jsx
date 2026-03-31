import styles from "./CancelButton.module.scss";

const CancelButton = ({ onClick, className }) => {
  return (
    <div className={`${styles.cancelButton} ${className}`} onClick={onClick}>
      Отменить
    </div>
  );
};

export default CancelButton;
