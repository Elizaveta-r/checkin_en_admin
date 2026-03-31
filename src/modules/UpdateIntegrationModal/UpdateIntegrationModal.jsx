import { AnimatePresence } from "motion/react";
import styles from "./UpdateIntegrationModal.module.scss";
import Modal from "../../ui/Modal/Modal";
import CancelButton from "../../ui/CancelButton/CancelButton";
import { Button } from "../../ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { FormSectionComponent } from "../../components/FormSectionComponent/FormSectionComponent";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { useEffect, useState } from "react";
import {
  createIntegration,
  updateIntegration,
} from "../../utils/api/actions/integrations";
import { setEditedIntegration } from "../../store/slices/integrationsSlice";

const useTypeOptions = [
  { value: "employee_interface", label: "Интерфейс для сотрудников" },
];

const integrationTypeOptions = [
  { value: "telegram_bot", label: "Телеграм бот" },
];

const findOptionByValue = (optionsArray, value) => {
  return optionsArray.find((option) => option.value === value);
};

export const UpdateIntegrationModal = ({ isOpen, handleClose, isNew }) => {
  const dispatch = useDispatch();

  const { isIntegrationLoading, editedIntegration } = useSelector(
    (state) => state?.integrations
  );

  const [dataForm, setDataForm] = useState({
    name: "",
    description: "",
    token: "",
  });
  const [useType, setUseType] = useState({
    value: "employee_interface",
    label: "Интерфейс для сотрудников",
  });
  const [integrationType, setIntegrationType] = useState({
    value: "telegram_bot",
    label: "Телеграм бот",
  });

  const handleChangeInput = (e) => {
    setDataForm({
      ...dataForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setDataForm({
      name: "",
      description: "",
      token: "",
    });
    dispatch(setEditedIntegration(null));
    handleClose();
  };

  const handleCreate = () => {
    window.dispatchEvent(new CustomEvent("tour:integration:submit:clicked"));
    let data = {
      title: dataForm.name,
      description: dataForm.description,
      use_type: useType.value,
      integration_type: integrationType.value,
      perpetual_token: dataForm.token,
    };
    dispatch(createIntegration(data))
      .then((res) => {
        if (res.status === 200) {
          window.dispatchEvent(
            new CustomEvent("tour:integration:submit:success")
          );
          handleCancel();
        } else {
          window.dispatchEvent(new CustomEvent("tour:integration:submit:fail"));
        }
      })
      .catch(() => {
        window.dispatchEvent(new CustomEvent("tour:integration:submit:fail"));
      });
  };

  const handleUpdate = () => {
    let data = {
      integration_id: editedIntegration.id,
      title: dataForm.name,
      description: dataForm.description,
      use_type: useType.value,
      integration_type: integrationType.value,
      perpetual_token: dataForm.token,
    };
    dispatch(updateIntegration(data)).then(() => {
      handleCancel();
    });
  };

  useEffect(() => {
    if (!isNew && editedIntegration) {
      setDataForm({
        name: editedIntegration.name,
        description: editedIntegration.description,
        token: editedIntegration.perpetual_token,
      });

      const initialUseType = findOptionByValue(
        useTypeOptions,
        editedIntegration.use_type
      );
      if (initialUseType) {
        setUseType(initialUseType);
      }

      const initialIntegrationType = findOptionByValue(
        integrationTypeOptions,
        editedIntegration.integration_type
      );
      if (initialIntegrationType) {
        setIntegrationType(initialIntegrationType);
      }
    } else {
      setDataForm({ name: "", description: "", token: "" });
      setUseType(useTypeOptions[0] || { value: "", label: "" });
      setIntegrationType(integrationTypeOptions[0] || { value: "", label: "" });
    }
  }, [isNew, editedIntegration]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleCancel}
          title={`${isNew ? "Создание" : "Редактирование"} интеграции`}
        >
          <div className={styles.wrapper}>
            <div className={styles.form}>
              {/* <FormSectionComponent
                label={"Название"}
                dataTour="modal.integration.name"
              >
                <CustomInput
                  name="name"
                  onChange={handleChangeInput}
                  value={dataForm.name}
                  placeholder={"Введите название интеграции"}
                />
              </FormSectionComponent> */}
              {/* <FormSectionComponent
                label={"Описание"}
                dataTour="modal.integration.description"
              >
                <CustomTextArea
                  name="description"
                  onChange={handleChangeInput}
                  value={dataForm.description}
                  placeholder={"Введите описание интеграции"}
                />
              </FormSectionComponent> */}
              {/* <FormSectionComponent
                hintContent={"Выберите, как будет использоваться интеграция"}
                label={"Тип использования"}
              >
                <CustomSelect
                  placeholder="Выберите тип"
                  options={useTypeOptions}
                  onChange={setUseType}
                  value={useType}
                />
              </FormSectionComponent> */}
              {/* <FormSectionComponent label={"Тип интеграции"}>
                <CustomSelect
                  placeholder="Выберите интеграцию"
                  options={integrationTypeOptions}
                  onChange={setIntegrationType}
                  value={integrationType}
                />
              </FormSectionComponent> */}
              <FormSectionComponent
                label={"Токен бота"}
                dataTour="modal.integration.token"
              >
                <CustomInput
                  placeholder="Введите токен"
                  name="token"
                  onChange={handleChangeInput}
                  value={dataForm.token}
                />
              </FormSectionComponent>
            </div>
            <div className={styles.actions}>
              <CancelButton
                className={styles.cancelButton}
                onClick={handleCancel}
              />
              <Button
                dataTour="modal.integration.submit"
                loading={isIntegrationLoading}
                secondary
                title={
                  isIntegrationLoading
                    ? "Сохранение..."
                    : isNew
                    ? "Создать"
                    : "Сохранить"
                }
                onClick={isNew ? handleCreate : handleUpdate}
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
