import React from "react";
import styles from "./DeleteConfirmationModal.module.scss";
import { AlertTriangle, UserMinus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal/Modal";
import { RingLoader } from "react-spinners";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  buttonTitle = "Delete employee",
  buttonIcon = <UserMinus size={20} />,
  loading = false,
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm deletion">
          <div className={styles.content}>
            <div className={styles.iconContainer}>
              <AlertTriangle size={48} className={styles.warningIcon} />
            </div>

            <div className={styles.message}>{message}</div>

            <div className={styles.actions}>
              <button className={styles.buttonCancel} onClick={onClose}>
                Cancel
              </button>

              <button className={styles.buttonConfirm} onClick={handleConfirm}>
                {loading ? <RingLoader color="white" size={12} /> : buttonIcon}
                {loading ? "Deleting..." : buttonTitle}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
