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
const CURRENCY_SYMBOL = "₽";
const CURRENCY_POSITION = "after"; // "before" | "after"
const PER_MONTH_LABEL = "per month";

const formatPrice = (value) => {
  const formatted = formatWithSpaces(value);

  return CURRENCY_POSITION === "before"
    ? `${CURRENCY_SYMBOL}${formatted}`
    : `${formatted} ${CURRENCY_SYMBOL}`;
};

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
          title={`Expand team`}
          description={"Add extra employee slots"}
        >
          <div className={styles.wrapper}>
            <div className={styles.content}>
              <div className={styles.tariffInfo}>
                <div className={styles.tariffInfoItem}>
                  <p className={styles.tariffInfoTitle}>Plan</p>
                  <p className={styles.tariffInfoValue}>
                    {selectedTariff.name}
                  </p>
                </div>
                <div className={styles.tariffInfoItem}>
                  <p className={styles.tariffInfoTitle}>Employees</p>
                  <p className={styles.tariffInfoValue}>
                    up to {selectedTariff.employees_limit}
                  </p>
                </div>
                <div className={styles.tariffInfoItem}>
                  <p className={styles.tariffInfoTitle}>{PER_MONTH_LABEL}</p>
                  <p className={styles.tariffInfoValue}>
                    {formatPrice(selectedTariff.base_price)}
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
                Total: {selectedTariff.employees_limit + addedEmployeesCount}{" "}
                {pluralizeEmployees(
                  selectedTariff.employees_limit + addedEmployeesCount,
                )}
              </p>

              <div className={styles.total}>
                <div className={styles.sumItem}>
                  <p className={styles.sumTitle}>
                    {addedEmployeesCount} x {ADDITIONAL_EMPLOYEE_COST}
                  </p>
                  <p className={styles.sumValue}>
                    {formatPrice(employeePrice)}
                  </p>
                </div>
                <div className={styles.sumItem}>
                  <p className={styles.sumTitle}>
                    Plan "{selectedTariff.name}"
                  </p>
                  <p className={styles.sumValue}>
                    {formatPrice(selectedTariff.price)}
                  </p>
                </div>

                <div className={styles.sumItem}>
                  <p className={styles.sumTitle}>Total due</p>
                  <p className={styles.totalSumValue}>
                    {formatPrice(totalPrice)} / {PER_MONTH_LABEL}
                  </p>
                </div>
              </div>
            </div>

            {addedEmployeesCount >= 15 &&
              selectedTariff.name !== "Standard" && (
                <small className={styles.warning}>
                  We recommend switching to the "Standard" plan
                </small>
              )}

            <div className={styles.info}>
              <Info color=" #3C82F5" />
              <p className={styles.infoText}>
                {`Additional slots will be added to your current plan.\nPayment will be charged automatically from your balance.`}
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
                title={`Pay ${formatPrice(totalPrice)}`}
                className={styles.submitBtn}
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
