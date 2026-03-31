import { Clock, Contact, Globe, Pencil, Trash, Users } from "lucide-react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./DepartmentDetailPage.module.scss";
import { useEffect, useState } from "react";
import Hint from "../../ui/Hint/Hint";
import { getInitials } from "../../utils/methods/getInitials";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeContactModal from "../../modules/EmployeeContactModal/EmployeeContactModal";
import { getFormattedTimeZoneLabel } from "../../utils/methods/generateTimeZoneOptions";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentById } from "../../utils/api/actions/departments";
import {
  setDepartment,
  setLoadingGetDetails,
  toggleDepartmentIsDefault,
} from "../../store/slices/departmentsSlice";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";
import { setEditedEmployee } from "../../store/slices/employeesSlice";
import EditEmployeeModal from "../../modules/EditEmployeeModal/EditEmployeeModal";
import {
  getEmployeeWithHistory,
  updateEmployee,
} from "../../utils/api/actions/employees";
import { RingLoader } from "react-spinners";
import { useMediaQuery } from "react-responsive";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

export default function DepartmentDetailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery({
    query: "(max-width: 553px)",
  });

  const { id } = useParams();

  const { department } = useSelector((state) => state?.departments);

  const description = department?.description;
  const check_in_time = department?.check_in_time;
  const check_out_time = department?.check_out_time;
  const timezone = department?.timezone;

  const employees = department?.employees;
  const managers = department?.manager;

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [visibleContactModal, setVisibleContactModal] = useState(false);
  const [visibleUpdateModal, setVisibleUpdateModal] = useState(false);

  const { editedEmployee, loadingGetEmployee } = useSelector(
    (state) => state?.employees
  );

  const handleIsDefaultChange = (newCheckedValue) => {
    if (!department || !department?.id) return; // Защита от отсутствия данных

    // Вызываем Thunk, который сам управляет оптимистичным обновлением и откатом
    dispatch(
      toggleDepartmentIsDefault({
        department: department,
        newValue: newCheckedValue,
      })
    );
  };

  const handleUpdateEmployee = (data) => {
    return dispatch(updateEmployee(data));
  };

  const handleOpenUpdateModal = (employee) => {
    setVisibleUpdateModal(true);
    dispatch(setEditedEmployee(employee));
  };

  const handleCloseUpdateModal = () => {
    setVisibleUpdateModal(false);
    dispatch(setEditedEmployee(null));
  };

  const handleOpenContactModal = (employee) => {
    setSelectedEmployee(employee);
    setVisibleContactModal(true);
  };

  const handleCloseContactModal = () => {
    setVisibleContactModal(false);
  };

  const handleGetDetails = (id) => {
    dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate(`/employees/${id}`);
      }
    });
  };

  useEffect(() => {
    dispatch(getDepartmentById(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(setLoadingGetDetails(""));

    if (!department) {
      dispatch(getDepartmentById(id));
    }

    return () => {
      dispatch(setDepartment(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  return (
    <div className={styles.pageContent}>
      <PageTitle
        title={department?.title}
        hasCheckbox
        checked={department.is_default}
        onChange={handleIsDefaultChange}
        checkboxLabel={"Использовать по умолчанию"}
      />

      {/* <div className={styles.isDefault}>
        <CustomCheckbox
          checked={department.is_default}
          onChange={handleIsDefaultChange}
          label={"Использовать по умолчанию"}
        />
      </div> */}

      <EditEmployeeModal
        isOpen={visibleUpdateModal}
        onClose={handleCloseUpdateModal}
        employee={editedEmployee}
        onUpdate={handleUpdateEmployee}
      />

      {selectedEmployee && (
        <EmployeeContactModal
          isOpen={visibleContactModal}
          onClose={handleCloseContactModal}
          employee={selectedEmployee}
        />
      )}
      <div className={styles.content}>
        <p className={styles.desc}>{description}</p>
        <div className={styles.details}>
          <p className={styles.title}>Детали:</p>
          <div className={styles.detailsGrid}>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Clock size={"0.85rem"} color="#6b7280" />
                <p className={styles.label}>Чекин до:</p>
              </div>
              <p className={styles.time}>{check_in_time}</p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Clock size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Чекаут с:</p>
              </div>
              <p className={styles.time}>{check_out_time}</p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Globe size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Часовой пояс:</p>
              </div>
              <p className={styles.time}>
                {getFormattedTimeZoneLabel(timezone)}
              </p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Users size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Всего сотрудников:</p>
              </div>
              <p className={styles.time}>
                {department?.employees_count || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.employees}>
          <p className={styles.title}>Руководители:</p>
          <div className={styles.employeeGrid}>
            {managers ? (
              managers?.map((emp) =>
                isMobile ? (
                  <EmployeeRowMobile
                    key={emp.id}
                    name={`${emp.surname} ${emp.firstname} ${emp.patronymic}`}
                    post={emp.positions}
                    id={emp.id}
                    loadingGetEmployee={loadingGetEmployee}
                    onShowContacts={() => handleOpenContactModal(emp)}
                    onGetDetails={() => handleGetDetails(emp.id)}
                    onEdit={() => handleOpenUpdateModal(emp)}
                  />
                ) : (
                  <EmployeeRow
                    key={emp.id}
                    name={`${emp.surname} ${emp.firstname} ${emp.patronymic}`}
                    post={emp.positions}
                    id={emp.id}
                    loadingGetEmployee={loadingGetEmployee}
                    onShowContacts={() => handleOpenContactModal(emp)}
                    onGetDetails={() => handleGetDetails(emp.id)}
                    onEdit={() => handleOpenUpdateModal(emp)}
                  />
                )
              )
            ) : (
              <p className={styles.empty}>Нет руководителей</p>
            )}
          </div>
        </div>

        <div className={styles.employees}>
          <p className={styles.title}>Сотрудники:</p>
          <div className={styles.employeeGrid}>
            {employees ? (
              employees?.map((emp) =>
                isMobile ? (
                  <EmployeeRowMobile
                    key={emp.id}
                    name={`${emp.surname} ${emp.firstname} ${emp.patronymic}`}
                    surname={emp.surname}
                    firstname={emp.firstname}
                    post={emp.positions}
                    id={emp.id}
                    loadingGetEmployee={loadingGetEmployee}
                    onShowContacts={() => handleOpenContactModal(emp)}
                    onGetDetails={() => handleGetDetails(emp.id)}
                    onEdit={() => handleOpenUpdateModal(emp)}
                  />
                ) : (
                  <EmployeeRow
                    key={emp.id}
                    name={`${emp.surname} ${emp.firstname} ${emp.patronymic}`}
                    surname={emp.surname}
                    firstname={emp.firstname}
                    post={emp.positions}
                    id={emp.id}
                    loadingGetEmployee={loadingGetEmployee}
                    onShowContacts={() => handleOpenContactModal(emp)}
                    onGetDetails={() => handleGetDetails(emp.id)}
                    onEdit={() => handleOpenUpdateModal(emp)}
                  />
                )
              )
            ) : (
              <p className={styles.empty}>Нет сотрудников</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const EmployeeRow = ({
  name,
  surname,
  firstname,
  post,
  onEdit,
  onShowContacts,
  onGetDetails,
  id,
  loadingGetEmployee,
}) => {
  const initials = getInitials(surname, firstname);
  const positionNames = post?.map((pos) => pos.title);
  const positionsString = positionNames?.join(", ");
  return (
    <div className={styles.dataItem}>
      <div className={styles.avatar}>
        {loadingGetEmployee === id ? (
          <RingLoader color="#fff" size={14} />
        ) : (
          initials
        )}
      </div>
      <p className={styles.nameEmp} onClick={onGetDetails}>
        {name}
      </p>

      <p className={styles.postEmp}>{positionsString}</p>

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
        <HintWithPortal hintContent="Редактировать" hasIcon={false} isMaxWidth>
          <div className={styles.edit} onClick={onEdit}>
            <Pencil size={16} />
          </div>{" "}
        </HintWithPortal>
      </div>
    </div>
  );
};

const EmployeeRowMobile = ({
  name,
  surname,
  firstname,
  post,
  onEdit,
  onShowContacts,
  onGetDetails,
  id,
  loadingGetEmployee,
}) => {
  const initials = getInitials(surname, firstname);
  const positionNames = post?.map((pos) => pos.title);
  const positionsString = positionNames?.join(", ");
  return (
    <div className={styles.dataItem}>
      <div className={styles.nameCell}>
        <div className={styles.avatar}>
          {loadingGetEmployee === id ? (
            <RingLoader color="#fff" size={14} />
          ) : (
            initials
          )}
        </div>
        <p className={styles.nameEmp} onClick={onGetDetails}>
          {name}
        </p>
      </div>

      <p className={styles.postEmp}>{positionsString}</p>

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
        <HintWithPortal hintContent="Редактировать" hasIcon={false} isMaxWidth>
          <div className={styles.edit} onClick={onEdit}>
            <Pencil size={16} />
          </div>{" "}
        </HintWithPortal>
      </div>
    </div>
  );
};
