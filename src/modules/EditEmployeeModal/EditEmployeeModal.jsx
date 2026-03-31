import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../../ui/Modal/Modal";
import { AnimatePresence } from "motion/react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import styles from "./EditEmployeeModal.module.scss";
import { Button } from "../../ui/Button/Button";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import {
  formatDataForSelect,
  mapSelectOptionsToIds,
} from "../../utils/methods/formatDataForSelect";
import { parseFullName } from "../../utils/methods/parseFullName";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import {
  HintCheckIn,
  HintCheckOut,
  HintTimeZone,
} from "../CreateDepartmentModal/CreateDepartmentModal";
import { createPosition } from "../../utils/api/actions/positions";

const roles = [
  { value: "employee", label: "Сотрудник" },
  { value: "head", label: "Руководитель" },
];

export default function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onConfirm,
  onUpdate,
  isNew,
}) {
  const dispatch = useDispatch();

  const { departments } = useSelector((state) => state.departments);
  const { positions: allPositions } = useSelector((state) => state.positions);
  const { loadingEmployee } = useSelector((state) => state?.employees);

  // ✅ мемоизируем, чтобы не менять ссылки на каждом рендере
  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );
  const positionsOptions = useMemo(
    () => formatDataForSelect(allPositions || []),
    [allPositions]
  );

  const getRoleValue = (role) =>
    roles.find((r) => r.value === role) || roles[0];

  const getPosition = (positionName) =>
    positionsOptions.find((p) => p.label === positionName) || {
      value: positionName,
      label: positionName,
    };

  const [input, setInput] = useState({
    name: "",
    telegramId: "",
    telegramName: "",
    checkInTime: "09:00",
    checkOutTime: "18:00",
  });
  const [role, setRole] = useState(roles[0]);
  const [position, setPosition] = useState([]);
  const [department, setDepartment] = useState(null);
  const [timeZone, setTimeZone] = useState(null);

  const lastSelectedPositionsRef = useRef([]);
  const skipAutoFillRef = useRef(false);

  const defaultDepartment = departments?.filter((d) => d.is_default)[0];

  const initializeState = (emp) => {
    if (!emp) {
      setInput({
        name: "",
        telegramId: "",
        telegramName: "",
        checkInTime: "09:00",
        checkOutTime: "18:00",
      });
      setRole(roles[0]);
      setPosition([]);
      setDepartment(
        defaultDepartment
          ? { value: defaultDepartment.id, label: defaultDepartment.title }
          : null
      );
      setTimeZone(null);
      return;
    }

    setInput({
      name: `${emp.surname} ${emp.firstname}${
        emp.patronymic ? " " + emp.patronymic : ""
      }`,
      checkInTime: emp.check_in_time || "09:00",
      checkOutTime: emp.check_out_time || "18:00",
      telegramId:
        emp.contacts.find((c) => c.type === "telegram_id")?.value || "",
      telegramName:
        emp.contacts.find((c) => c.type === "telegram_username")?.value || "",
    });

    setRole(getRoleValue(emp.role));

    const initialPositions = Array.isArray(emp.positions)
      ? emp?.positions.map((p) => getPosition(p?.title))
      : [];
    setPosition(initialPositions);

    if (Array.isArray(emp?.departments) && emp?.departments?.length > 0) {
      const initialDepartments = emp?.departments?.map((d) => ({
        value: d.id,
        label: d.title,
      }));
      setDepartment(
        emp.role === "head" ? initialDepartments : initialDepartments[0]
      );
    } else {
      setDepartment(
        departments?.[0]
          ? { value: departments[0]?.id, label: departments[0]?.title }
          : null
      );
    }

    if (emp.timezone) {
      const tz = timeZoneOptions?.find((t) => t.value === emp.timezone) || null;
      setTimeZone(tz);
    } else {
      setTimeZone(null);
    }

    skipAutoFillRef.current = true;
  };

  useEffect(() => {
    if (isOpen) {
      initializeState(isNew ? null : employee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, employee, isNew, departmentsOptions, positionsOptions]);

  const handleChangeInput = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    onClose();
  };

  const buildContacts = () => {
    const prevContacts = employee?.contacts || [];

    const findPrevByType = (type) =>
      prevContacts.find((c) => c.type === type) || null;

    const telegramIdValue = input.telegramId?.trim();
    const telegramNameValue = input.telegramName?.trim();

    const contacts = [];

    if (telegramIdValue) {
      const prev = findPrevByType("telegram_id");
      contacts.push({
        ...(prev?.id ? { id: prev.id } : {}),
        type: "telegram_id",
        value: telegramIdValue,
      });
    }

    if (telegramNameValue) {
      const prev = findPrevByType("telegram_username");
      contacts.push({
        ...(prev?.id ? { id: prev.id } : {}),
        type: "telegram_username",
        value: telegramNameValue,
      });
    }

    const preserved = prevContacts.filter(
      (c) => c.type !== "telegram_id" && c.type !== "telegram_username"
    );

    return [...contacts, ...preserved];
  };

  const buildPayload = (withId = false) => {
    const { surname, firstname, patronymic } = parseFullName(input.name);
    const positionIds = mapSelectOptionsToIds(position);
    const departmentsArray = Array.isArray(department)
      ? department
      : department
      ? [department]
      : [];
    const departmentIds = mapSelectOptionsToIds(departmentsArray);

    const contacts = buildContacts();

    const base = {
      surname,
      firstname,
      patronymic,
      contacts,
      role: role.value,
      positions: positionIds,
      departments: departmentIds,
      timezone: timeZone?.value ?? null,
      check_in_time: input.checkInTime,
      check_out_time: input.checkOutTime,
    };

    return withId ? { employee_id: employee.id, ...base } : base;
  };

  const validateName = () => {
    if (!input.name) {
      toast.error("Пожалуйста, заполните ФИО сотрудника.");
      return false;
    }
    const { surname } = parseFullName(input.name);
    if (!surname) {
      toast.error("Пожалуйста, введите как минимум фамилию");
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateName()) return;
    onConfirm(buildPayload(false)).then((res) => {
      if (res?.status === 200) {
        initializeState(null);
        handleClose();
      }
    });
  };

  const handleUpdate = () => {
    if (!validateName()) return;
    onUpdate(buildPayload(true)).then((res) => {
      if (res?.status === 200) handleClose();
    });
  };

  const handleCreatePosition = (data) => {
    const dataToCreate = {
      title: data.value,
      description: "",
    };
    return dispatch(createPosition(dataToCreate));
  };

  useEffect(() => {
    lastSelectedPositionsRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!allPositions?.length) return;

    // 1️⃣ превращаем redux-список в формат {value, label}
    const newOptions = formatDataForSelect(allPositions);

    // 2️⃣ фильтруем и восстанавливаем прежние выбранные по label или id
    const restoredPositions = lastSelectedPositionsRef.current
      .map(
        (old) =>
          newOptions.find(
            (opt) => opt.value === old.value || opt.label === old.label
          ) || old // если новой опции пока нет — оставляем старую
      )
      // на случай дублей / undefined
      .filter(Boolean);

    // 3️⃣ если реально что-то поменялось — обновляем
    setPosition(restoredPositions);
  }, [allPositions]);

  useEffect(() => {
    // определяем ID активного подразделения
    let activeDepartmentId = null;

    if (Array.isArray(department) && department.length > 0) {
      // если мультиселект — берём первое подразделение
      activeDepartmentId = department[0].value;
    } else if (department?.value) {
      activeDepartmentId = department.value;
    }

    if (!activeDepartmentId) return;

    // пропускаем автофилл при инициализации
    if (skipAutoFillRef.current) {
      skipAutoFillRef.current = false;
      return;
    }

    const depFull = departments.find((d) => d.id === activeDepartmentId);
    if (!depFull) return;

    // таймзона
    const depTz = depFull.timezone
      ? timeZoneOptions.find((t) => t.value === depFull.timezone) || null
      : null;

    setTimeZone((prev) =>
      depTz && depTz.value !== prev?.value ? depTz : prev
    );

    // чекин/чекаут
    const newIn = depFull.check_in_time || "09:00";
    const newOut = depFull.check_out_time || "18:00";

    setInput((prev) => {
      if (prev.checkInTime !== newIn || prev.checkOutTime !== newOut) {
        return { ...prev, checkInTime: newIn, checkOutTime: newOut };
      }
      return prev;
    });
  }, [department, departments]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${isNew ? "Создание" : "Редактирование"} сотрудника`}
        >
          <div className={styles.content}>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.name"
                >
                  <p className={styles.formLabel}>ФИО</p>
                  <CustomInput
                    placeholder="Введите ФИО..."
                    value={input.name}
                    name="name"
                    onChange={handleChangeInput}
                  />
                </div>
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.role"
                >
                  <p className={styles.formLabel}>Роль</p>
                  <CustomSelect
                    options={roles}
                    value={role}
                    onChange={(val) => {
                      setRole(val);
                      setDepartment((prev) =>
                        val?.value === "head"
                          ? Array.isArray(prev)
                            ? prev
                            : prev
                          : Array.isArray(prev)
                          ? prev?.[0] ?? null
                          : prev
                      );
                    }}
                    dataTourHeader="modal.employee.role.header"
                    dataTourId="modal.employee.role"
                    placeholder="Выберите роль..."
                  />
                </div>
              </div>

              <div className={styles.formItem} data-tour="modal.employee.dep">
                <p className={styles.formLabel}>
                  {department?.length > 1 ? "Подразделения" : "Подразделение"}
                </p>
                <CustomSelect
                  options={departmentsOptions}
                  value={department}
                  onChange={setDepartment}
                  placeholder="Выберите подразделение..."
                  isSearchable
                  dataTourHeader="modal.employee.dep.header"
                  dataTourId="modal.employee.dep"
                  isMulti={role?.value === "head"}
                />
              </div>

              {role?.value !== "head" && (
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.position"
                >
                  <p className={styles.formLabel}>Должность</p>
                  <CustomSelect
                    isMulti
                    options={positionsOptions}
                    value={position}
                    onChange={setPosition}
                    placeholder="Выберите должность..."
                    isSearchable
                    isCreatable
                    onCreate={handleCreatePosition}
                    dataTourId="modal.employee.position.menu"
                  />
                </div>
              )}

              {role?.value !== "head" && (
                <div
                  className={styles.formItem}
                  style={{ gap: 6 }}
                  data-tour="modal.employee.timezone"
                >
                  <HintWithPortal
                    hintContent={
                      <HintTimeZone text={"работает ваш сотрудник"} />
                    }
                    minWidth="500px"
                  >
                    <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                      Часовой пояс
                    </p>
                  </HintWithPortal>

                  <CustomSelect
                    placeholder="Выберите часовой пояс"
                    options={timeZoneOptions}
                    onChange={setTimeZone}
                    value={timeZone}
                    isSearchable
                    dataTourId="modal.employee.timezone"
                    dataTourHeader="modal.employee.timezone.header"
                  />
                </div>
              )}

              {role?.value !== "head" && (
                <div className={styles.formRow}>
                  <div
                    className={styles.formItem}
                    style={{ gap: 6 }}
                    data-tour="modal.employee.check-in-time"
                  >
                    <HintWithPortal hintContent={<HintCheckIn />}>
                      <p
                        className={styles.formLabel}
                        style={{ marginBottom: 0 }}
                      >
                        Чекин (в)
                      </p>
                    </HintWithPortal>
                    <CustomInput
                      id="checkInTime"
                      name="checkInTime"
                      type="time"
                      value={input.checkInTime}
                      onChange={handleChangeInput}
                    />
                  </div>
                  <div
                    className={styles.formItem}
                    style={{ gap: 6 }}
                    data-tour="modal.employee.check-out-time"
                  >
                    <HintWithPortal hintContent={<HintCheckOut />}>
                      <p
                        className={styles.formLabel}
                        style={{ marginBottom: 0 }}
                      >
                        Чекаут (с)
                      </p>
                    </HintWithPortal>
                    <CustomInput
                      id="checkOutTime"
                      name="checkOutTime"
                      type="time"
                      value={input.checkOutTime}
                      onChange={handleChangeInput}
                    />
                  </div>
                </div>
              )}

              <div className={styles.formRow}>
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.telegram-id"
                >
                  <p className={styles.formLabel}>Телеграм ID</p>
                  <CustomInput
                    placeholder="Например: 000012345"
                    value={input.telegramId}
                    name="telegramId"
                    type="number"
                    onChange={handleChangeInput}
                  />
                </div>
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.telegram-name"
                >
                  <p className={styles.formLabel}>Имя пользователя</p>
                  <CustomInput
                    placeholder="@user_name"
                    value={input.telegramName}
                    name="telegramName"
                    onChange={handleChangeInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                title="Отмена"
                onClick={handleClose}
                className={styles.buttonCancel}
                secondary
              />
              <Button
                className={styles.button}
                title={isNew ? "Создать" : "Сохранить"}
                onClick={isNew ? handleConfirm : handleUpdate}
                loading={loadingEmployee}
                dataTour="modal.employee.submit"
                secondary
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
