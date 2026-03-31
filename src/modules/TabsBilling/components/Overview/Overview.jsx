import styles from "./Overview.module.scss";
import { useState } from "react";
import formatWithSpaces from "../../../../utils/methods/formatNumberWithSpaces";
import {
  Zap,
  CreditCard,
  Wallet,
  Bell,
  IdCardLanyard,
  HandCoins,
} from "lucide-react";
import { AddEmployeesModal } from "../../../AddEmployeesModal/AddEmployeesModal";
import AllTariffsModal from "../../../TariffsModal/AllTariffsModal";
import { useDispatch, useSelector } from "react-redux";
// import { formatDate } from "../../../../utils/methods/dateFormatter";
// import { HintWithPortal } from "../../../../ui/HintWithPortal/HintWithPortal";
import { pluralizeEmployees } from "../../../../utils/methods/pluralizeText";
import { updateSubscription } from "../../../../utils/api/actions/billing";
import { toast } from "sonner";

export const Overview = ({ openBalanceModal }) => {
  const dispatch = useDispatch();

  const { wallet, tariffs } = useSelector((state) => state?.billing);
  const { employees } = useSelector((state) => state.employees);

  const [loading] = useState(false);
  const [isTariffsModalOpen, setIsTariffsModalOpen] = useState(false);
  const [isAddEmployeeModal, setIsAddEmployeeModal] = useState(false);

  const balance = wallet?.balance;
  const subscription = wallet?.subscription;

  const currentTariff = tariffs?.find(
    (tariff) => tariff?.id === subscription?.tariff_id
  );

  const employeesCount = employees?.length || 0;
  const employeesInTariff = Number(subscription?.employees_limit ?? 0);
  const addedEmployees = subscription?.employees_plus ?? 0;

  const limitEmployees = employeesInTariff + addedEmployees;

  const tariffName = currentTariff?.name;

  // TODO: при клике на название тарифа показывать модалку с деталями тарифа

  // const expiresAt = formatDate(subscription?.expires_at);

  const employeesPlus = Number(subscription?.employees_plus ?? 0);

  const tariffPrice = Number(currentTariff?.base_price ?? 0);

  const nextChargeAmount = subscription?.daily_charge;

  const nextChargeFormatted = `${formatWithSpaces(nextChargeAmount)} ₽ ${
    employeesPlus !== 0
      ? `(${employeesPlus} ${pluralizeEmployees(
          employeesPlus
        )} + ${formatWithSpaces(tariffPrice)} ₽)`
      : ""
  }`;

  const balanceFormatter = () => {
    if (balance) {
      return `${formatWithSpaces(balance)} ₽`;
    } else {
      return loading ? "" : "0,00 ₽";
    }
  };

  const handleChangeTariff = () => {
    setIsTariffsModalOpen(true);
  };

  const handleCloseTariffsModal = () => {
    setIsTariffsModalOpen(false);
  };

  const handleOpenAddEmployeeModal = () => {
    setIsAddEmployeeModal(true);
  };

  const handleCloseAddEmployeeModal = () => {
    setIsAddEmployeeModal(false);
  };

  const handleAddEmployee = (employees_count, employees_action) => {
    let data = {
      employees_count,
      employees_action,
      auto_renewal: subscription?.auto_renewal,
    };
    dispatch(updateSubscription(data)).then((res) => {
      if (res.status === 200) {
        toast.success("Лимит сотрудников успешно расширен!");
        setIsAddEmployeeModal(false);
      }
    });
  };

  const handleTopUpBalance = () => {
    openBalanceModal();
  };

  return (
    <div className={styles.content}>
      {/* Верхняя секция с балансом */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          {/* Баланс слева */}
          <div className={styles.balanceSection}>
            <div className={styles.title}>Состояние счёта</div>
            <div className={styles.balanceRow}>
              <div className={styles.balance}>
                {!balance && loading ? <p>Загрузка...</p> : balanceFormatter()}
              </div>
            </div>
          </div>

          {/* Компактная информация справа */}
          <div className={styles.quickInfo}>
            <div className={styles.quickInfoItem}>
              <div className={styles.quickInfoLabel}>
                <Zap className={styles.quickInfoIcon} />
                Тариф
              </div>
              <div className={styles.quickInfoValue}>
                {subscription
                  ? tariffName
                    ? tariffName
                    : "Тариф не найден"
                  : "Не приобретен"}
              </div>
            </div>

            {/* {subscription && (
              <div className={styles.quickInfoItem}>
                <div className={styles.quickInfoLabel}>
                  <Clock className={styles.quickInfoIcon} />
                  Действует до
                </div>
                <div className={styles.quickInfoValue}>{expiresAt}</div>
              </div>
            )} */}
            {subscription &&
              currentTariff &&
              currentTariff?.code !== "free" && (
                <div className={styles.quickInfoItem}>
                  <div className={styles.quickInfoLabel}>
                    {/* {employeesPlus > 0 ? (
                      <HintWithPortal
                        position="top"
                        hasIcon={false}
                        hintContent={`Следующее списание считается так:\n${employeesPlus} ${pluralizeEmployees(
                          employeesPlus
                        )} + ${formatWithSpaces(
                          tariffPrice
                        )} ₽ = ${formatWithSpaces(nextChargeAmount)} ₽`}
                        styleHintWrapper={{ width: "max-content" }}
                      >
                        <Eye className={styles.quickInfoIcon} />
                      </HintWithPortal>
                    ) : ( */}
                    <HandCoins className={styles.quickInfoIcon} />
                    {/* )} */}
                    Расход в сутки
                  </div>

                  <div className={styles.quickInfoValue}>
                    {nextChargeFormatted}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Подсказка */}
        <div className={styles.statusTip}>
          <Bell className={styles.statusIcon} />

          <span>
            Средства списываются автоматически в соответствии с вашим тарифом.
            <br /> При необходимости вы можете изменить автопродление в
            настройках ниже.
          </span>
        </div>
      </div>

      {/* Секция действий */}
      <div className={styles.actionsContainer}>
        {/* Главная кнопка - Пополнить баланс */}
        <button className={styles.topUpButton} onClick={handleTopUpBalance}>
          <Wallet className={styles.buttonIcon} />
          <div className={styles.buttonContent}>
            <span className={styles.buttonText}>Пополнить баланс</span>
            <span className={styles.buttonHint}>Быстрое пополнение</span>
          </div>
        </button>

        {/* Вторичные действия */}
        <div className={styles.secondaryActions}>
          <button className={styles.actionButton} onClick={handleChangeTariff}>
            <CreditCard className={styles.buttonIcon} />
            <span>
              {currentTariff?.code === "free"
                ? "Приобрести тариф"
                : subscription
                ? "Сменить тариф"
                : "Выбрать тариф"}
            </span>
          </button>

          {currentTariff?.code !== "free" && (
            <button
              className={styles.actionButton}
              onClick={handleOpenAddEmployeeModal}
            >
              <IdCardLanyard className={styles.buttonIcon} />
              <span>
                Изменить лимит сотрудников{" "}
                <i>{`${employeesCount}/${limitEmployees}`}</i>
              </span>
            </button>
          )}
        </div>
      </div>

      <AddEmployeesModal
        isOpen={isAddEmployeeModal}
        onClose={handleCloseAddEmployeeModal}
        onConfirm={handleAddEmployee}
      />

      <AllTariffsModal
        isOpen={isTariffsModalOpen}
        onClose={handleCloseTariffsModal}
      />
    </div>
  );
};
