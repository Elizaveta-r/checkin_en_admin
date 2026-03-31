import { AnimatePresence } from "motion/react";
import styles from "./ModalTeamExpand.module.scss";
import Modal from "../../ui/Modal/Modal";
import { Button } from "../../ui/Button/Button";
import CancelButton from "../../ui/CancelButton/CancelButton";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";
import { useState } from "react";
import { Info, Minus, Plus } from "lucide-react";
import { pluralizeEmployees } from "../../utils/methods/pluralizeText";

const ADDITIONAL_EMPLOYEE_COST = 150;

export const ModalTeamExpand = ({
  isOpen,
  onSubmit,
  onClose,
  selectedTariff,
}) => {
  const [addedEmployeesCount, setAddedEmployeesCount] = useState(0);

  if (!isOpen && !selectedTariff) return;

  const handleChange = (delta) => {
    setAddedEmployeesCount((prev) => {
      const current = prev || 0;
      const newValue = Math.max(0, current + delta);
      return newValue;
    });
  };

  const calculateTotalPrice = () => {
    const basePrice = Number(selectedTariff.base_price);
    const additionalCost = addedEmployeesCount * ADDITIONAL_EMPLOYEE_COST;

    return basePrice + additionalCost;
  };

  const totalPrice = calculateTotalPrice();
  const employeePrice = addedEmployeesCount * ADDITIONAL_EMPLOYEE_COST;

  const handleClose = () => {
    onClose();
    setAddedEmployeesCount(0);
  };

  const handleSubmit = () => {
    onSubmit();
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`Расширить команду`}
          description={"Добавьте дополнительные места для сотрудников"}
        >
          <div className={styles.wrapper}>
            <div className={styles.content}>
              <div className={styles.tariffInfo}>
                <div className={styles.tariffInfoItem}>
                  <p className={styles.tariffInfoTitle}>Тариф</p>
                  <p className={styles.tariffInfoValue}>
                    {selectedTariff.name}
                  </p>
                </div>
                <div className={styles.tariffInfoItem}>
                  <p className={styles.tariffInfoTitle}>Сотрудников</p>
                  <p className={styles.tariffInfoValue}>
                    до {selectedTariff.employees_limit}
                  </p>
                </div>
                <div className={styles.tariffInfoItem}>
                  <p className={styles.tariffInfoTitle}>Стоимость / мес.</p>
                  <p className={styles.tariffInfoValue}>
                    {formatWithSpaces(selectedTariff.base_price)} ₽
                  </p>
                </div>
              </div>

              <div className={styles.employeeAdderControls}>
                <button
                  onClick={() => handleChange(-1)}
                  disabled={addedEmployeesCount === 0}
                  className={styles.employeeButton}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.employeeCount}>
                  {addedEmployeesCount}
                </span>
                <button
                  onClick={() => handleChange(1)}
                  className={styles.employeeButton}
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className={styles.totalEmployees}>
                Всего: {selectedTariff.employees_limit + addedEmployeesCount}{" "}
                {pluralizeEmployees(
                  selectedTariff.employees_limit + addedEmployeesCount
                )}
              </p>

              <div className={styles.total}>
                <div className={styles.sumItem}>
                  <p className={styles.sumTitle}>
                    {addedEmployeesCount} x {ADDITIONAL_EMPLOYEE_COST}
                  </p>
                  <p className={styles.sumValue}>{employeePrice} ₽</p>
                </div>
                <div className={styles.sumItem}>
                  <p className={styles.sumTitle}>
                    Тариф "{selectedTariff.name}"
                  </p>
                  <p className={styles.sumValue}>
                    {formatWithSpaces(selectedTariff.price)} ₽
                  </p>
                </div>

                <div className={styles.sumItem}>
                  <p className={styles.sumTitle}>Итого к оплате</p>
                  <p className={styles.totalSumValue}>
                    {formatWithSpaces(totalPrice)} ₽ / мес.
                  </p>
                </div>
              </div>
            </div>

            {addedEmployeesCount >= 15 &&
              selectedTariff.name !== "Стандарт" && (
                <small className={styles.warning}>
                  Рекомендуем выбрать тариф "Стандарт"
                </small>
              )}

            <div className={styles.info}>
              <Info color=" #3C82F5" />
              <p className={styles.infoText}>
                {`Дополнительные места будут добавлены к вашему тарифу. \n Оплата
                спишется автоматически с баланса.`}
              </p>
            </div>

            <div className={styles.btnGrid}>
              <CancelButton
                onClick={handleClose}
                className={styles.cancelBtn}
              />
              <Button
                secondary
                onClick={handleSubmit}
                title={`Оплатить ${formatWithSpaces(totalPrice)} ₽`}
                className={styles.submitBtn}
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
