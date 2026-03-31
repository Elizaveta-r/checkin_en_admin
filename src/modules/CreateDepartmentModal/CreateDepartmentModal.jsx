import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import styles from "./CreateDepartmentModal.module.scss";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RingLoader } from "react-spinners";
import { setDepartment } from "../../store/slices/departmentsSlice";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";

export default function CreateDepartmentModal({
  isOpen,
  isNew,
  onClose,
  onConfirm,
  onUpdate,
}) {
  const dispatch = useDispatch();

  const { loading, department } = useSelector((state) => state?.departments);

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    checkInTime: "09:00",
    checkOutTime: "18:00",
  });
  const [timeZone, setTimeZone] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(true);

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      checkInTime: "09:00",
      checkOutTime: "18:00",
    });
  };

  const handleConfirm = () => {
    if (!formData.name) {
      toast.error("Пожалуйста, заполните название подразделения.");
      return;
    }

    if (!timeZone) {
      toast.error("Пожалуйста, выберите часовой пояс.");
      return;
    }
    window.dispatchEvent(new CustomEvent("tour:submit:clicked"));

    onConfirm({ ...formData, timeZone, is_default: isDefault })
      .then((res) => {
        if (res && res.status === 200) {
          window.dispatchEvent(new CustomEvent("tour:submit:success"));
          setFormData({
            name: "",
            description: "",
            checkInTime: "09:00",
            checkOutTime: "18:00",
          });
          handleClose();
        } else {
          window.dispatchEvent(new CustomEvent("tour:submit:fail"));
        }
      })
      .catch(() => {
        window.dispatchEvent(new CustomEvent("tour:submit:fail"));
      });
  };

  const handleUpdate = () => {
    if (!formData.name) {
      toast.error("Пожалуйста, заполните название подразделения.");
      return;
    }

    if (!timeZone) {
      toast.error("Пожалуйста, выберите часовой пояс.");
      return;
    }

    onUpdate({
      ...formData,
      timeZone,
      id: department?.id,
      is_default: isDefault,
    }).then((res) => {
      if (res && res.status === 200) {
        setFormData({
          name: "",
          description: "",
          checkInTime: "09:00",
          checkOutTime: "18:00",
        });

        handleClose();
        dispatch(setDepartment(null));
      }
    });
  };

  useEffect(() => {
    if (!isNew && department) {
      setFormData({
        name: department.title || "",
        description: department.description || "",
        checkInTime: department.check_in_time || "09:00",
        checkOutTime: department.check_out_time || "18:00",
      });
      const tzOption =
        timeZoneOptions.find((t) => t.value === department.timezone) || null;

      setTimeZone(tzOption);
      setIsDefault(department.is_default);
    } else if (isNew) {
      setFormData({
        name: "",
        description: "",
        checkInTime: "09:00",
        checkOutTime: "18:00",
      });
      setTimeZone("");
      setIsDefault(true);
    }
  }, [isNew, isOpen, department]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${
            !isNew ? "Редактирование" : "Создание нового"
          } подразделения`}
        >
          <div className={styles.formContent}>
            {/* 1. Название и Описание */}
            <div className={styles.section} data-tour="modal.nameInput">
              <label className={styles.label} htmlFor="name">
                Название подразделения
              </label>
              <CustomInput
                id="name"
                name="name"
                placeholder="Например, Отдел контроля качества"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* 2. Таймзона  */}
            <div className={styles.section} data-tour="modal.timezone">
              <HintWithPortal hintContent={<HintTimeZone />}>
                <label className={styles.label}>Часовой пояс</label>
              </HintWithPortal>

              <CustomSelect
                placeholder="Выберите часовой пояс"
                options={timeZoneOptions}
                onChange={setTimeZone}
                value={timeZone}
                dataTourId="modal.timezone"
                isSearchable
              />
            </div>

            {/* 4. Время Check-in и Check-out */}
            <div className={styles.timeWrapper}>
              <div className={styles.timeGrid}>
                <div className={styles.section} data-tour="modal.check-in-time">
                  <HintWithPortal hintContent={<HintCheckIn />}>
                    <label className={styles.label} htmlFor="checkInTime">
                      Чекин (в)
                    </label>
                  </HintWithPortal>

                  <CustomInput
                    id="checkInTime"
                    name="checkInTime"
                    type="time"
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div
                  className={styles.section}
                  data-tour="modal.check-out-time"
                >
                  <HintWithPortal hintContent={<HintCheckOut />}>
                    <label className={styles.label} htmlFor="checkOutTime">
                      Чекаут (с)
                    </label>
                  </HintWithPortal>

                  <CustomInput
                    id="checkOutTime"
                    name="checkOutTime"
                    type="time"
                    value={formData.checkOutTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {!isNew && (
                <p className={styles.warning}>
                  ⚠️ При изменении временных настроек, они будут изменены у всех
                  сотрудников автоматически
                </p>
              )}
            </div>
          </div>

          {/* 3. Описание подразделения */}
          <div className={styles.section} data-tour="modal.description">
            <label className={styles.label} htmlFor="description">
              Описание подразделения
            </label>
            <CustomTextArea
              id="description"
              name="description"
              placeholder="Краткое описание функций (необязательно)"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div
            className={styles.section}
            style={{ margin: "20px 0" }}
            data-tour="modal.default"
          >
            <CustomCheckbox
              label="Сделать подразделением по умолчанию"
              checked={isDefault}
              onChange={setIsDefault}
            />{" "}
          </div>

          {/* Кнопки действий */}
          <div className={styles.actions}>
            <button className={styles.buttonCancel} onClick={onClose}>
              Отмена
            </button>
            <button
              data-tour="modal.submit"
              className={styles.buttonConfirm}
              onClick={!isNew ? handleUpdate : handleConfirm}
            >
              {loading && <RingLoader color="#fff" size={12} />}
              {loading
                ? "Создание..."
                : !isNew
                ? "Сохранить"
                : "Создать подразделение"}
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export const HintTimeZone = ({ text = "работает ваше подразделение" }) => {
  return (
    <div className={styles.hint}>
      Определяет в каком часовом поясе {text}. <br /> <br />
      <small className={styles.small}>
        Это влияет на корректную отправку уведомлений.
      </small>
    </div>
  );
};

export const HintCheckIn = () => {
  return (
    <div className={styles.hint}>
      В это время сотруднику приходит уведомление с возможностью отметиться{" "}
      <small className={styles.small}>(сделать чекин)</small> на рабочем месте.
    </div>
  );
};

export const HintCheckOut = () => {
  return (
    <div className={styles.hint}>
      Рекомендуемое время, начиная с которого сотрудник может завершить{" "}
      <small className={styles.small}>(сделать чекаут)</small> рабочий день.
    </div>
  );
};
