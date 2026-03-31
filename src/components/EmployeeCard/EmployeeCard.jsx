import { useSelector } from "react-redux";
import { getInitials } from "../../utils/methods/getInitials";
import styles from "./EmployeeCard.module.scss";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { Contact, Pencil, Shuffle, Trash } from "lucide-react";
import { RingLoader } from "react-spinners";

export const EmployeeCard = ({
  id,
  departments,
  firstname,
  patronymic,
  surname,
  positions,
  role,

  checkedIn,
  onShowDetails,
  onShowContacts,
  onDelete,
  onEdit,
}) => {
  const allDepartments = useSelector(
    (state) => state?.departments?.departments
  );
  const allPositions = useSelector((state) => state?.positions?.positions);
  const { loadingGetEmployee } = useSelector((state) => state?.employees);

  const employeeDepartmentIdsSet = new Set(departments?.map((dep) => dep.id));
  const employeePositionIdsSet = new Set(positions?.map((pos) => pos.id));

  const getRoleName = () => {
    switch (role) {
      case "employee":
        return "Сотрудник";
      case "head":
        return "Руководитель";
      default:
        return "";
    }
  };

  const departmentsForEmployee = allDepartments?.filter((department) =>
    employeeDepartmentIdsSet.has(department.id)
  );

  const positionsForEmployee = allPositions?.filter((position) =>
    employeePositionIdsSet.has(position.id)
  );

  const fullName = `${surname} ${firstname} ${patronymic}`;
  const initials = getInitials(surname, firstname, patronymic);

  return (
    <div className={styles.dataItem}>
      <div
        className={styles.nameCell}
        onClick={onShowDetails}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.avatar}>
          {loadingGetEmployee === id ? (
            <RingLoader color="#fff" size={14} />
          ) : (
            initials
          )}
        </div>
        <p className={styles.nameEmp}>{fullName}</p>
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.dot} ${checkedIn ? styles.on : styles.off}`}
          ></div>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.positions}>
          <p className={styles.positionsTitle}>
            {`Должност${positionsForEmployee?.length > 1 ? "и" : "ь"}`}:
          </p>
          <div className={styles.positionCol}>
            {positionsForEmployee?.length > 0
              ? positionsForEmployee.map((pos, i) => (
                  <span key={i}>
                    {pos?.title || "Должность не назначена"}
                    {i !== positionsForEmployee.length - 1 && ", "}
                  </span>
                ))
              : "Должность не назначена"}
          </div>
        </div>

        <div className={styles.role}>
          <p className={styles.roleTitle}>Роль:</p>
          <p className={styles.roleCol}>{getRoleName()}</p>
        </div>

        <div className={styles.departments}>
          <p className={styles.departmentsTitle}>{`Подразделени${
            departmentsForEmployee?.length > 1 ? "я" : "е"
          }:`}</p>
          <p className={styles.department}>
            {departmentsForEmployee?.length > 0
              ? departmentsForEmployee.map((dep) => dep?.title).join(", ")
              : "Отдел не назначен"}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <HintWithPortal
          hintContent="Посмотреть контактные данные"
          hasIcon={false}
          isMaxWidth
        >
          <div className={styles.contact} onClick={onShowContacts}>
            <Contact size={16} />
          </div>
        </HintWithPortal>
        {/* <HintWithPortal hintContent="Переместить сотрудника" hasIcon={false}>
          <div className={styles.move} onClick={onMove}>
            <Shuffle size={16} />
          </div>
        </HintWithPortal> */}
        <HintWithPortal hintContent="Редактировать" hasIcon={false} isMaxWidth>
          <div className={styles.edit} onClick={onEdit}>
            <Pencil size={16} />
          </div>{" "}
        </HintWithPortal>
        <HintWithPortal hintContent="Удалить" hasIcon={false} isMaxWidth>
          <div className={styles.trash} onClick={onDelete}>
            <Trash size={16} />
          </div>{" "}
        </HintWithPortal>
      </div>
    </div>
  );
};
