// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import Modal from "../../ui/Modal/Modal";
import { useSelector } from "react-redux";
import CustomInput from "../../ui/CustomInput/CustomInput";
import { Button } from "../../ui/Button/Button";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import styles from "./ModalDeleteAccount.module.scss";
import CancelButton from "../../ui/CancelButton/CancelButton";

export const ModalDeleteAccount = ({ isOpen, handleClose, onConfirm }) => {
  const userData = useSelector((state) => state.user.data.user);
  const [emailInput, setEmailInput] = useState("");
  const [phraseInput, setPhraseInput] = useState("");

  const requiredPhrase = "удалить аккаунт";
  const isEmailValid =
    emailInput.trim().toLowerCase() === userData?.email?.toLowerCase();
  const isPhraseValid = phraseInput.trim().toLowerCase() === requiredPhrase;
  const isButtonEnabled = isEmailValid && isPhraseValid;

  const close = () => {
    setEmailInput("");
    setPhraseInput("");
    handleClose();
  };

  const handleConfirm = () => {
    onConfirm().then(() => {
      close();
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={close}
          title={
            <div className={styles.modalTitle}>
              <ShieldAlert size={28} />
              <span>Удаление аккаунта</span>
            </div>
          }
          hideFooter={true}
        >
          <div className={styles.modalContent}>
            {/* WARNING TEXT */}
            <motion.div
              className={styles.warningText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AlertTriangle size={20} />
              <p>
                Удаление аккаунта приведёт к безвозвратной потере всех данных,
                интеграций и настроек. Это действие нельзя отменить.
              </p>
            </motion.div>

            {/* EMAIL INPUT */}
            <motion.div
              className={styles.inputGroup}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className={styles.label}>
                Введите вашу почту для подтверждения
              </label>
              <CustomInput
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Введите вашу почту"
                className={
                  emailInput.length > 0 && !isEmailValid
                    ? styles.inputError
                    : ""
                }
              />
              <AnimatePresence>
                {!isEmailValid && emailInput.length > 0 && (
                  <motion.span
                    className={styles.errorText}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Почта не совпадает с {userData?.email}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* PHRASE INPUT */}
            <motion.div
              className={styles.inputGroup}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className={styles.label}>
                Чтобы продолжить, введите фразу
                <span className={styles.phraseBadge}>{requiredPhrase}</span>
              </label>
              <CustomInput
                type="text"
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
                placeholder="Введите фразу для подтверждения"
                className={
                  phraseInput.length > 0 && !isPhraseValid
                    ? styles.inputError
                    : ""
                }
              />
              <AnimatePresence>
                {!isPhraseValid && phraseInput.length > 0 && (
                  <motion.span
                    className={styles.errorText}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Фраза введена неверно
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* FINAL WARNING */}
            <motion.div
              className={styles.finalWarning}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Trash2 size={18} />
              <span>
                После удаления восстановить аккаунт будет{" "}
                <strong>невозможно</strong>
              </span>
            </motion.div>

            {/* BUTTONS */}
            <motion.div
              className={styles.buttonGroup}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CancelButton onClick={close} />

              <Button
                title="Удалить аккаунт навсегда"
                onClick={handleConfirm}
                disabled={!isButtonEnabled}
                leftIcon={<Trash2 size={18} />}
                className={styles.deleteButton}
                secondary
              />
            </motion.div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
