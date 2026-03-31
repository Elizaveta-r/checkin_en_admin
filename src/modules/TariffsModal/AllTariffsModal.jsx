import styles from "./TariffsModal.module.scss";
import { TariffCard } from "../../components/TariffCard/TariffCard";
import { ImportantInfo } from "./ImportantInfo/ImportantInfo";
import { AnimatePresence } from "motion/react";
import Modal from "../../ui/Modal/Modal";
import { useState } from "react";
import { ModalTeamExpand } from "../ModalTeamExpand/ModalTeamExpand";
import { TariffConfirmModal } from "../TariffConfirmModal/TariffConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { getTariff } from "../../utils/api/actions/billing";

const mapTariffToUi = (t, currentCode) => ({
  ...t,

  isPopular: t?.code === "start",

  isCurrent: currentCode ? t?.code === currentCode : false,

  features: [
    { text: "AI photo report analysis", included: Boolean(t?.enabled_ai) },
    { text: `Employee limit: up to ${t?.employees_limit}`, included: true },
    { text: `Duration: ${t?.duration_days} days`, included: true },
  ],
});

const ORDER = ["free", "start", "standart"];

export default function AllTariffsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const { tariffs, wallet } = useSelector((state) => state?.billing);

  const [isTeamClicked, setIsTeamClicked] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false);
  const [loadingGetTariff, setLoadingGetTariff] = useState(false);

  if (!isOpen) return null;

  const subscription = wallet?.subscription;

  const currentTariff = tariffs?.find(
    (tariff) => tariff?.id === subscription?.tariff_id,
  );

  const currentCode = currentTariff?.code;

  const uiTariffs = tariffs
    .slice()
    .sort((a, b) => ORDER.indexOf(a.code) - ORDER.indexOf(b.code))
    .map((t) => mapTariffToUi(t, currentCode));

  const handleCloseTeamModal = () => {
    setIsTeamClicked(false);
    setSelectedTariff(null);
  };

  const handleOpenConfirmModal = (id) => {
    setLoadingGetTariff(true);
    dispatch(getTariff({ paramType: "tariff_id", param: id }))
      .then((res) => {
        if (res.data.status === 200) {
          setVisibleConfirmModal(true);
          setSelectedTariff(res.data.tariff);
        }
      })
      .finally(() => setLoadingGetTariff(false));
  };

  const handleCloseConfirmModal = () => {
    setVisibleConfirmModal(false);
    setSelectedTariff(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={`Pricing Plans`}
          description={"Choose the right plan for your business"}
          className={styles.modalTariff}
        >
          <div className={styles.content}>
            <div className={styles.tariffGrid}>
              {uiTariffs.map((tariff) => (
                <TariffCard
                  key={tariff.id}
                  tariff={tariff}
                  onBuyClick={() =>
                    handleOpenConfirmModal(tariff?.id, tariff?.code)
                  }
                  loadingBuy={loadingGetTariff}
                />
              ))}
            </div>

            <ImportantInfo />
          </div>
        </Modal>
      )}
      <TariffConfirmModal
        isOpen={visibleConfirmModal}
        onClose={handleCloseConfirmModal}
        tariff={mapTariffToUi(selectedTariff)}
        onConfirm={handleCloseConfirmModal}
      />
      <ModalTeamExpand
        isOpen={isTeamClicked}
        onClose={handleCloseTeamModal}
        selectedTariff={mapTariffToUi(selectedTariff)}
      />
    </AnimatePresence>
  );
}
