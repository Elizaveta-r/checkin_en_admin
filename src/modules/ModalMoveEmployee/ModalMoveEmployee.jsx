import { AnimatePresence } from "motion/react";
import Modal from "../../ui/Modal/Modal";
import styles from "./ModalMoveEmployee.module.scss";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";
import CancelButton from "../../ui/CancelButton/CancelButton";
import { Button } from "../../ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import {
  formatDataForSelect,
  mapSelectOptionsToIds,
} from "../../utils/methods/formatDataForSelect";
import { updateEmployee } from "../../utils/api/actions/employees";

export const ModalMoveEmployee = ({ isOpen, handleClose }) => {
  const dispatch = useDispatch();

  const { editedEmployee, loadingEmployee } = useSelector(
    (state) => state?.employees
  );

  const { departments } = useSelector((state) => state.departments);
  const { positions } = useSelector((state) => state.positions);

  const [position, setPosition] = useState([]);
  const [department, setDepartment] = useState(null);
  const [checked, setChecked] = useState(false);

  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );
  const positionsOptions = useMemo(
    () => formatDataForSelect(positions || []),
    [positions]
  );

  const initializeState = (emp) => {
    if (!emp) return;

    // Должности
    const initialPositions = Array.isArray(emp.positions)
      ? emp.positions
          .map((p) => positionsOptions.find((opt) => opt.value === p.id))
          .filter(Boolean) // убираем undefined, если не нашли
      : [];
    setPosition(initialPositions);

    // Подразделения
    if (Array.isArray(emp?.departments) && emp?.departments?.length > 0) {
      const initialDepartments = emp?.departments
        .map((d) => departmentsOptions.find((opt) => opt.value === d.id))
        .filter(Boolean);

      setDepartment(
        emp.role === "head" ? initialDepartments : initialDepartments[0]
      );
    } else {
      setDepartment(departmentsOptions[0] || null);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    initializeState(editedEmployee);
    // только на открытие и смену id редактируемого сотрудника
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editedEmployee?.id]);

  if (!isOpen) return;

  const handleSendData = () => {
    const positionIds = mapSelectOptionsToIds(position);
    const departmentsArray = Array.isArray(department)
      ? department
      : department
      ? [department]
      : [];
    const departmentIds = mapSelectOptionsToIds(departmentsArray);

    const base = {
      surname: editedEmployee?.surname,
      firstname: editedEmployee?.firstname,
      patronymic: editedEmployee?.patronymic,
      contacts: editedEmployee?.contacts,
      role: editedEmployee?.role,
      positions: positionIds,
      departments: departmentIds,
      timezone: editedEmployee?.timezone,
      check_in_time: editedEmployee?.check_in_time,
      check_out_time: editedEmployee?.check_out_time,
    };

    dispatch(updateEmployee({ employee_id: editedEmployee?.id, ...base })).then(
      (res) => {
        if (res.status === 200) {
          handleClose();
          setPosition([]);
          setDepartment(null);
        }
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`Перемещение сотрудника \n ${
            editedEmployee?.surname +
            " " +
            editedEmployee?.firstname +
            " " +
            editedEmployee?.patronymic
          }`}
        >
          <div className={styles.content}>
            <div className={styles.form}>
              <div className={styles.formItem}>
                <p className={styles.formLabel}>
                  Подразделение, в которое будет перемещен сотрудник
                </p>
                <CustomSelect
                  options={departmentsOptions}
                  value={department}
                  onChange={setDepartment}
                  placeholder="Выберите подразделение..."
                  isSearchable
                />
              </div>
              <div className={styles.formItem}>
                <p className={styles.formLabel}>
                  Должность, которая будет назначена сотруднику
                </p>
                <CustomSelect
                  isMulti
                  options={positionsOptions}
                  value={position}
                  onChange={setPosition}
                  placeholder="Выберите должность..."
                  isSearchable
                />
              </div>
              <CustomCheckbox
                className={styles.checkbox}
                labelClassName={styles.checkboxLabel}
                checked={checked}
                onChange={() => setChecked(!checked)}
                label={"Возврат в исходный отдел"}
                labelHint={`Если включено, сотрудник после завершения своей текущей смены автоматически вернётся в исходное подразделение, из которого был переведён. \n
                            Это удобно, если вы временно перемещаете сотрудника для усиления другого отдела и хотите, чтобы он автоматически вернулся на своё место после смены.`}
              />
            </div>
            <div className={styles.buttons}>
              <CancelButton onClick={handleClose} />
              <Button
                onClick={handleSendData}
                secondary
                title={"Переместить"}
                loading={loadingEmployee}
                className={styles.button}
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
