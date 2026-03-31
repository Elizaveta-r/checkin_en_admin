import { Contact, Pencil, Shuffle, Trash } from "lucide-react";
import styles from "./EmployeeRow.module.scss";
import { getInitials } from "../../utils/methods/getInitials";
import { useSelector } from "react-redux";
import { RingLoader } from "react-spinners";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

export default function EmployeeRow({
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
  onMove,
}) {
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
  const initials = getInitials(surname, firstname);

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
      </div>

      <div>
        {positionsForEmployee?.length > 0 ? (
          positionsForEmployee?.map((position, index) => {
            const isLast = index === positionsForEmployee?.length - 1;
            return (
              <p key={`position-${index}`} className={styles.positionCol}>
                {position?.title ? position?.title : "Должность не назначена"}
                {!isLast && ", "}
              </p>
            );
          })
        ) : (
          <p className={styles.positionCol}>Должность не назначена</p>
        )}
      </div>

      <p className={styles.roleCol}>{getRoleName()}</p>

      <div>
        {departmentsForEmployee?.map((department, index) => {
          // Определяем, является ли текущий элемент последним в массиве
          const isLast = index === departmentsForEmployee?.length - 1;

          return (
            <p
              key={`department-${index}`}
              className={styles.department}
              // Добавляем запятую и пробел, если это не последний элемент
            >
              {department?.title}
              {!isLast && ", "}
            </p>
          );
        })}
      </div>

      <div className={styles.statusIndicator}>
        <div
          className={`${styles.dot} ${checkedIn ? styles.on : styles.off}`}
        ></div>
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
}
