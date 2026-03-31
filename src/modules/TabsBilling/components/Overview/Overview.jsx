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

const CURRENCY_SYMBOL = "₽";
const CURRENCY_POSITION = "after"; // "before" | "after"
const PER_DAY_LABEL = "per day";

const formatPrice = (value) => {
  const formatted = formatWithSpaces(value);

  return CURRENCY_POSITION === "before"
    ? `${CURRENCY_SYMBOL}${formatted}`
    : `${formatted} ${CURRENCY_SYMBOL}`;
};

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
    (tariff) => tariff?.id === subscription?.tariff_id,
  );

  const employeesCount = employees?.length || 0;
  const employeesInTariff = Number(subscription?.employees_limit ?? 0);
  const addedEmployees = subscription?.employees_plus ?? 0;

  const limitEmployees = employeesInTariff + addedEmployees;

  const tariffName = currentTariff?.name;

  const employeesPlus = Number(subscription?.employees_plus ?? 0);

  const tariffPrice = Number(currentTariff?.base_price ?? 0);

  const nextChargeAmount = subscription?.daily_charge;

  const nextChargeFormatted = `${formatPrice(nextChargeAmount)} ${
    employeesPlus !== 0
      ? `(${employeesPlus} ${pluralizeEmployees(
          employeesPlus,
        )} + ${formatPrice(tariffPrice)})`
      : ""
  }`;

  const balanceFormatter = () => {
    if (balance) {
      return formatPrice(balance);
    } else {
      return loading ? "" : formatPrice("0,00");
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
        toast.success("Employee limit updated successfully!");
        setIsAddEmployeeModal(false);
      }
    });
  };

  const handleTopUpBalance = () => {
    openBalanceModal();
  };

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.balanceSection}>
            <div className={styles.title}>Account Balance</div>
            <div className={styles.balanceRow}>
              <div className={styles.balance}>
                {!balance && loading ? <p>Loading...</p> : balanceFormatter()}
              </div>
            </div>
          </div>

          <div className={styles.quickInfo}>
            <div className={styles.quickInfoItem}>
              <div className={styles.quickInfoLabel}>
                <Zap className={styles.quickInfoIcon} />
                Plan
              </div>
              <div className={styles.quickInfoValue}>
                {subscription
                  ? tariffName
                    ? tariffName
                    : "Plan not found"
                  : "No plan selected"}
              </div>
            </div>

            {subscription &&
              currentTariff &&
              currentTariff?.code !== "free" && (
                <div className={styles.quickInfoItem}>
                  <div className={styles.quickInfoLabel}>
                    <HandCoins className={styles.quickInfoIcon} />
                    Daily charge
                  </div>

                  <div className={styles.quickInfoValue}>
                    {nextChargeFormatted}
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className={styles.statusTip}>
          <Bell className={styles.statusIcon} />

          <span>
            Funds are charged automatically according to your selected plan.
            <br /> You can manage auto-renewal in the settings below if needed.
          </span>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        <button className={styles.topUpButton} onClick={handleTopUpBalance}>
          <Wallet className={styles.buttonIcon} />
          <div className={styles.buttonContent}>
            <span className={styles.buttonText}>Top up balance</span>
            <span className={styles.buttonHint}>Quick top-up</span>
          </div>
        </button>

        <div className={styles.secondaryActions}>
          <button className={styles.actionButton} onClick={handleChangeTariff}>
            <CreditCard className={styles.buttonIcon} />
            <span>
              {currentTariff?.code === "free"
                ? "Upgrade plan"
                : subscription
                  ? "Change plan"
                  : "Choose plan"}
            </span>
          </button>

          {currentTariff?.code !== "free" && (
            <button
              className={styles.actionButton}
              onClick={handleOpenAddEmployeeModal}
            >
              <IdCardLanyard className={styles.buttonIcon} />
              <span>
                Change employee limit{" "}
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
