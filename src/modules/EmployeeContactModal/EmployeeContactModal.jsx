import { useEffect, useState } from "react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import styles from "./EmployeeContactModal.module.scss";
import { PhoneInput } from "../../ui/PhoneInput/PhoneInput";
import { AnimatePresence } from "motion/react";
import Modal from "../../ui/Modal/Modal";
import { useDispatch } from "react-redux";
import { triggerContactAutosave } from "../../store/slices/employeesSlice";

const DEFAULT_CONTACT_KEYS = {
  email: "",
  phone: "",
  telegramUsername: "",
  telegramId: "",
};

const transformContacts = (contactsArray) => {
  if (!Array.isArray(contactsArray)) {
    return {};
  }

  return contactsArray.reduce((acc, contact) => {
    let key = contact.type;

    if (key.includes("_")) {
      key = key.replace(/_(\w)/g, (match, p1) => p1.toUpperCase());
    }

    acc[key] = contact.value || "";
    return acc;
  }, {});
};

const getInitialContactState = (contacts) => {
  const transformed = contacts ? transformContacts(contacts) : {};

  return {
    ...DEFAULT_CONTACT_KEYS,
    ...transformed,
  };
};

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};

const findContactId = (contactsArray, type) => {
  if (!Array.isArray(contactsArray)) return null;
  const contact = contactsArray.find((c) => c.type === type);
  return contact ? contact.id : null;
};

export default function EmployeeContactModal({ isOpen, onClose, employee }) {
  const dispatch = useDispatch();

  const fullName = `${employee?.surname} ${employee?.firstname} ${employee?.patronymic}`;

  const contacts = employee?.contacts;

  const [input, setInput] = useState(() => getInitialContactState(contacts));

  useEffect(() => {
    setInput(getInitialContactState(contacts));
  }, [contacts]);

  const handleContactChange = (e) => {
    const name = e.target.name; // 'phone', 'telegramName', 'email', 'telegramId'
    const value = e.target.value;

    // 1. Обновляем локальное состояние немедленно
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));

    const trimmedValue = value.trim();
    const apiType = toSnakeCase(name);
    const contactId = findContactId(contacts, apiType);

    const data = {
      type: apiType,
      value: trimmedValue,
    };

    if (contactId) {
      data.contact_id = contactId;
      data.employee_id = employee?.id;
    } else {
      data.employee_id = employee?.id;
    }

    if (contactId || (employee?.id && trimmedValue !== "")) {
      dispatch(triggerContactAutosave(data));
    }
  };

  const handleCancel = () => {
    setInput(getInitialContactState(contacts));
    onClose();
  };

  if (!employee) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleCancel}
          title={`Контактные данные сотрудника \n ${fullName}`}
        >
          <div className={styles.content}>
            <div className={styles.form}>
              <PhoneInput
                name={"phone"}
                value={input.phone}
                onChange={handleContactChange}
                label="Телефон для связи"
              />
              <div className={styles.formItem}>
                <p className={styles.formLabel}>Телеграм</p>
                <div className={styles.inputs}>
                  <CustomInput
                    placeholder={"Имя пользователя..."}
                    value={input.telegramUsername}
                    name="telegramUsername"
                    onChange={handleContactChange}
                  />
                  <CustomInput
                    placeholder={"Телеграм ID..."}
                    value={input.telegramId}
                    name="telegramId"
                    onChange={handleContactChange}
                  />
                </div>
              </div>
              <div className={styles.formItem}>
                <p className={styles.formLabel}>Адрес электронной почты</p>

                <CustomInput
                  placeholder={"Email..."}
                  value={input.email}
                  name="email"
                  onChange={handleContactChange}
                />
              </div>
            </div>

            <small className={styles.hint}>
              Введенные данные будут сохранены автоматически
            </small>

            {/* <div className={styles.actions}>
              <Button
                title="Отмена"
                onClick={handleCancel}
                className={styles.buttonCancel}
                secondary
              />
              <Button
                className={styles.button}
                title={"Сохранить"}
                onClick={handleSave}
                secondary
              />
            </div> */}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
