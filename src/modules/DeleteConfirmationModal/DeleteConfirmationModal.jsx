import React from "react";
import styles from "./DeleteConfirmationModal.module.scss";
import { AlertTriangle, UserMinus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal/Modal";
import { RingLoader } from "react-spinners";

/**
 * Компонент модального окна для подтверждения удаления.
 * * @param {boolean} isOpen - Флаг открытия/закрытия модалки.
 * @param {function} onClose - Функция закрытия модалки (при отмене).
 * @param {function} onConfirm - Функция, вызываемая при подтверждении удаления.
 * @param {string} employeeName - Имя сотрудника, которого нужно удалить.
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  buttonTitle = "Удалить сотрудника",
  buttonIcon = <UserMinus size={20} />,
  loading = false,
}) {
  // Обработчик подтверждения
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Подтверждение удаления">
          <div className={styles.content}>
            <div className={styles.iconContainer}>
              {/* Иконка-предупреждение */}
              <AlertTriangle size={48} className={styles.warningIcon} />
            </div>

            <div className={styles.message}>{message}</div>

            <div className={styles.actions}>
              {/* Кнопка "Отмена" (второстепенная, использует стиль из карточки) */}
              <button className={styles.buttonCancel} onClick={onClose}>
                Отмена
              </button>

              {/* Кнопка "Удалить" (основная, красная) */}
              <button className={styles.buttonConfirm} onClick={handleConfirm}>
                {loading ? <RingLoader color="white" size={12} /> : buttonIcon}
                {loading ? "Удаление..." : buttonTitle}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
