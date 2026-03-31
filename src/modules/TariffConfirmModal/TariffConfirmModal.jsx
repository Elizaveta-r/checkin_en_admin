import { useState } from "react";
import { X, Check, Crown, Users, Zap } from "lucide-react";

import styles from "./TariffConfirmModal.module.scss";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";
import { AddEmployeeToTariffControls } from "../../components/AddEmployeeToTariffControls/AddEmployeeToTariffControls";
import { TotalSumTariff } from "../../components/TotalSummTariff/TotalSumTariff";
import Modal from "../../ui/Modal/Modal";
import { HintComponent } from "../../components/HintComponent/HintComponent";
import { useDispatch } from "react-redux";
import { buyTariff, getUserWallet } from "../../utils/api/actions/billing";
import { toast } from "sonner";

const durationLabel = (days) => {
  if (days === 1) return "день";
  if (days === 7) return "неделя";
  if (days === 30 || days === 31) return "месяц";
  return ""; // или "дней" / "—" если нужно
};
const ADDITIONAL_EMPLOYEE_COST = 150;

export const TariffConfirmModal = ({ tariff, isOpen, onClose, onConfirm }) => {
  const dispatch = useDispatch();

  const [isProcessing, setIsProcessing] = useState(false);

  const [addedEmployeesCount, setAddedEmployeesCount] = useState(0);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const data = {
      tariff_id: tariff.id,
      employees_plus: addedEmployeesCount,
    };
    setIsProcessing(true);
    dispatch(buyTariff(data))
      .then((res) => {
        if (res.status === 200) {
          onConfirm(tariff);
          dispatch(getUserWallet());
          toast.success(`Тариф ${tariff.name} успешно приобретен!`);
        }
      })
      .finally(() => setIsProcessing(false));
  };

  // employeeAdd

  const handleChange = (delta) => {
    setAddedEmployeesCount((prev) => {
      const current = prev || 0;
      const newValue = Math.max(0, current + delta);
      return newValue;
    });
  };

  const calculateTotalPrice = () => {
    const basePrice = Number(tariff.base_price);
    const additionalCost = addedEmployeesCount * ADDITIONAL_EMPLOYEE_COST;

    return basePrice + additionalCost;
  };

  const totalPrice = calculateTotalPrice();
  const employeePrice = addedEmployeesCount * ADDITIONAL_EMPLOYEE_COST;

  const handleClose = () => {
    onClose();
    setAddedEmployeesCount(0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={"Подтверждение покупки"}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            {tariff.isPopular ? <Crown size={32} /> : <Zap size={32} />}
          </div>

          <p className={styles.title}>Вы выбрали тариф:</p>
        </div>

        <div className={styles.tariffCard}>
          <div className={styles.tariffHeader}>
            <div className={styles.tariffInfo}>
              <div className={styles.tariffTitleWrapper}>
                <h3 className={styles.tariffTitle}>
                  {tariff.name}
                  {tariff.isPopular && (
                    <span className={styles.popularBadge}>Популярный</span>
                  )}
                </h3>
                <p className={styles.tariffDescription}>{tariff.description}</p>
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.price}>
                  {tariff.base_price.toLocaleString("ru-RU")} ₽
                </div>
                <div className={styles.period}>
                  / {durationLabel(tariff.duration_days)}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.features}>
            {tariff.features.slice(0, 3).map((feature, index) => (
              <div key={index} className={styles.feature}>
                <div
                  className={`${styles.featureIcon} ${
                    feature.included ? styles.included : styles.excluded
                  }`}
                >
                  {feature.included ? <Check size={14} /> : <X size={14} />}
                </div>
                <span
                  className={`${styles.featureText} ${
                    feature.included ? styles.included : styles.excluded
                  }`}
                >
                  {feature.text}
                </span>
              </div>
            ))}
            {tariff.maxEmployees && (
              <div className={`${styles.feature} ${styles.employeesFeature}`}>
                <div className={styles.featureIcon}>
                  <Users size={14} />
                </div>
                <span className={styles.featureText}>
                  До {tariff.maxEmployees} активных сотрудников
                </span>
              </div>
            )}
          </div>

          {tariff.code !== "free" && (
            <div className={styles.addEmployeesContainer}>
              <HintComponent
                hasIcon
                text="Увеличить лимит сотрудников"
                hint={`Каждый дополнительный сотрудник стоит ${ADDITIONAL_EMPLOYEE_COST} ₽ за ${durationLabel(
                  tariff.duration_days
                )}. Вы можете добавить неограниченное количество сотрудников к базовому тарифу.`}
                titleStyle={styles.titleHint}
                styleHintWrapper={{
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              />
              <AddEmployeeToTariffControls
                handleChange={handleChange}
                addedEmployeesCount={addedEmployeesCount}
              />

              <TotalSumTariff
                tariff={tariff}
                addedEmployeesCount={addedEmployeesCount}
                employeePrice={employeePrice}
                totalPrice={totalPrice}
                employeeCost={ADDITIONAL_EMPLOYEE_COST}
              />
            </div>
          )}

          {addedEmployeesCount >= 15 && tariff.name !== "Стандарт" && (
            <small className={styles.warning}>
              Рекомендуем выбрать тариф "Стандарт"
            </small>
          )}

          {tariff.code !== "free" && (
            <div className={styles.paymentInfo}>
              <p className={styles.paymentText}>
                <strong>💳 Безопасная оплата</strong>
                После нажатия кнопки вы будете перенаправлены на защищенную
                страницу оплаты Робокасса
              </p>
            </div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button
          onClick={onClose}
          disabled={isProcessing}
          className={`${styles.button} ${styles.cancelButton}`}
        >
          Отменить
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className={`${styles.button} ${styles.confirmButton}`}
        >
          {isProcessing ? (
            <>
              <div className={styles.spinner} />
              Обработка...
            </>
          ) : tariff?.code === "free" ? (
            "Перейти на бесплатный"
          ) : (
            <>
              Оплатить {formatWithSpaces(totalPrice.toLocaleString("ru-RU"))} ₽
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
