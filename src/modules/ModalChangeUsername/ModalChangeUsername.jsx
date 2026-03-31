import styles from "./ModalChangeUsername.module.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/Button/Button";
import CancelButton from "../../ui/CancelButton/CancelButton";
import { updateUserName } from "../../utils/api/actions/user";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import { AnimatePresence } from "motion/react";

export const ModalChangeUsername = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const { user_data } = useSelector((state) => state?.user);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user_data.username || "");
  const [success, setSuccess] = useState(false);

  const handleSendData = () => {
    dispatch(updateUserName({ username: name }, setLoading, setSuccess));
  };

  const handleClose = () => {
    onClose();
    setName("");
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [onClose, success]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose} title={"Изменение имени"}>
          <div className={styles.form}>
            <div className={styles.formItem}>
              <p className={styles.formLabel}>Имя</p>
              <CustomInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={"Введите новое имя"}
              />
            </div>

            <div className={styles.actions}>
              <CancelButton
                onClick={handleClose}
                className={styles.cancelButton}
              />
              <Button
                secondary={true}
                title={"Сохранить"}
                loading={loading}
                onClick={handleSendData}
                className={styles.saveButton}
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
