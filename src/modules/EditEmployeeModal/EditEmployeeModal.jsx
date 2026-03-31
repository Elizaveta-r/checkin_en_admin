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
  { value: "employee", label: "Employee" },
  { value: "head", label: "Manager" },
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

  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments],
  );
  const positionsOptions = useMemo(
    () => formatDataForSelect(allPositions || []),
    [allPositions],
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
          : null,
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
        emp.role === "head" ? initialDepartments : initialDepartments[0],
      );
    } else {
      setDepartment(
        departments?.[0]
          ? { value: departments[0]?.id, label: departments[0]?.title }
          : null,
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
      (c) => c.type !== "telegram_id" && c.type !== "telegram_username",
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
      toast.error("Please enter the employee's full name.");
      return false;
    }
    const { surname } = parseFullName(input.name);
    if (!surname) {
      toast.error("Please enter at least a last name");
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

    const newOptions = formatDataForSelect(allPositions);

    const restoredPositions = lastSelectedPositionsRef.current
      .map(
        (old) =>
          newOptions.find(
            (opt) => opt.value === old.value || opt.label === old.label,
          ) || old,
      )
      .filter(Boolean);

    setPosition(restoredPositions);
  }, [allPositions]);

  useEffect(() => {
    let activeDepartmentId = null;

    if (Array.isArray(department) && department.length > 0) {
      activeDepartmentId = department[0].value;
    } else if (department?.value) {
      activeDepartmentId = department.value;
    }

    if (!activeDepartmentId) return;

    if (skipAutoFillRef.current) {
      skipAutoFillRef.current = false;
      return;
    }

    const depFull = departments.find((d) => d.id === activeDepartmentId);
    if (!depFull) return;

    const depTz = depFull.timezone
      ? timeZoneOptions.find((t) => t.value === depFull.timezone) || null
      : null;

    setTimeZone((prev) =>
      depTz && depTz.value !== prev?.value ? depTz : prev,
    );

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
          title={`${isNew ? "Create" : "Edit"} Employee`}
        >
          <div className={styles.content}>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.name"
                >
                  <p className={styles.formLabel}>Full name</p>
                  <CustomInput
                    placeholder="Enter full name..."
                    value={input.name}
                    name="name"
                    onChange={handleChangeInput}
                  />
                </div>
                <div
                  className={styles.formItem}
                  data-tour="modal.employee.role"
                >
                  <p className={styles.formLabel}>Role</p>
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
                            ? (prev?.[0] ?? null)
                            : prev,
                      );
                    }}
                    dataTourHeader="modal.employee.role.header"
                    dataTourId="modal.employee.role"
                    placeholder="Select a role..."
                  />
                </div>
              </div>

              <div className={styles.formItem} data-tour="modal.employee.dep">
                <p className={styles.formLabel}>
                  {department?.length > 1 ? "Departments" : "Department"}
                </p>
                <CustomSelect
                  options={departmentsOptions}
                  value={department}
                  onChange={setDepartment}
                  placeholder="Select a department..."
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
                  <p className={styles.formLabel}>Position</p>
                  <CustomSelect
                    isMulti
                    options={positionsOptions}
                    value={position}
                    onChange={setPosition}
                    placeholder="Select a position..."
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
                    hintContent={<HintTimeZone text={"your employee works"} />}
                    minWidth="500px"
                  >
                    <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                      Time zone
                    </p>
                  </HintWithPortal>

                  <CustomSelect
                    placeholder="Select a time zone"
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
                        Check-in (at)
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
                        Check-out (from)
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
                  <p className={styles.formLabel}>Telegram ID</p>
                  <CustomInput
                    placeholder="For example: 000012345"
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
                  <p className={styles.formLabel}>Username</p>
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
                title="Cancel"
                onClick={handleClose}
                className={styles.buttonCancel}
                secondary
              />
              <Button
                className={styles.button}
                title={isNew ? "Create" : "Save"}
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
