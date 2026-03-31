import { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { History } from "../../modules/TabsBilling/components/History/History";
import { Overview } from "../../modules/TabsBilling/components/Overview/Overview";
import TopUpBalanceModal from "../../modules/TopUpBalanceModal/TopUpBalanceModal";
import styles from "./BillingPage.module.scss";
import { useDispatch } from "react-redux";
import { getTariffList } from "../../utils/api/actions/billing";
import { BillingSettings } from "../../modules/BillingSettings/BillingSettings";
import { getEmployeesList } from "../../utils/api/actions/employees";

export const BillingPage = () => {
  const dispatch = useDispatch();

  const [visibleBalanceModal, setVisibleBalanceModal] = useState(false);

  const handleOpenBalanceModal = () => {
    setVisibleBalanceModal(true);
  };

  useEffect(() => {
    dispatch(getTariffList());
    dispatch(getEmployeesList(1, 1000));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <PageTitle
        title={"Биллинг"}
        hasButton
        buttonTitle="Пополнить"
        onClick={handleOpenBalanceModal}
      />
      <Overview openBalanceModal={handleOpenBalanceModal} />
      <div className={styles.history}>
        <p>История операций:</p>
        <History />
      </div>

      <BillingSettings />

      <TopUpBalanceModal
        isOpen={visibleBalanceModal}
        onClose={() => setVisibleBalanceModal(false)}
        onSubmit={() => {}}
      />
    </div>
  );
};
