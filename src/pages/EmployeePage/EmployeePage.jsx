// import PageTitle from "../../components/PageTitle/PageTitle";
// import styles from "./EmployeePage.module.scss";
// import { useEffect, useState } from "react";
// import EmployeeRow from "../../components/EmployeeRow/EmployeeRow";
// import EmployeeRowHeader from "../../modules/EmployeeRowHeader/EmployeeRowHeader";
// import { useNavigate } from "react-router-dom";
// import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
// import EmployeeContactModal from "../../modules/EmployeeContactModal/EmployeeContactModal";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   deleteEmployee,
//   getEmployeesList,
//   getEmployeeWithHistory,
// } from "../../utils/api/actions/employees";
// import { setEditedEmployee } from "../../store/slices/employeesSlice";
// import { useMediaQuery } from "react-responsive";
// import { EmployeeCard } from "../../components/EmployeeCard/EmployeeCard";
// import { InfoBanner } from "../../ui/InfoBanner/InfoBanner";
// import { ModalMoveEmployee } from "../../modules/ModalMoveEmployee/ModalMoveEmployee";
// import { EmployeeLimitModal } from "../../modules/EmployeeLimitModal/EmployeeLimitModal";

// export default function EmployeePage() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const isMobile = useMediaQuery({
//     query: "(max-width: 1334px)",
//   });

//   const { editedEmployee, employees } = useSelector(
//     (state) => state?.employees
//   );

//   const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
//     useState(false);
//   const [visibleContactModal, setVisibleContactModal] = useState(false);
//   const [visibleMoveEmployeeModal, setVisibleMoveEmployeeModal] =
//     useState(false);

//   const fullName = `${editedEmployee?.surname} ${editedEmployee?.firstname} ${editedEmployee?.patronymic}`;

//   const handleOpenNewEmployeeModal = () => {
//     dispatch(setEditedEmployee(null));
//     navigate("new");
//   };

//   const handleOpenEmployeeModal = (employee) => {
//     navigate(`${employee?.id}/update`);
//     dispatch(setEditedEmployee(employee));
//   };

//   const handleOpenConfirmDeleteModal = (employee) => {
//     setVisibleConfirmDeleteModal(true);
//     dispatch(setEditedEmployee(employee));
//   };

//   const handleCloseConfirmDeleteModal = () => {
//     setVisibleConfirmDeleteModal(false);
//   };

//   const handleOpenContactModal = (employee) => {
//     setVisibleContactModal(true);
//     dispatch(setEditedEmployee(employee));
//   };

//   const handleCloseContactModal = () => {
//     setVisibleContactModal(false);
//   };

//   const handleDetails = (id) => {
//     dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
//       if (res.status === 200) {
//         navigate(`${id}`);
//       }
//     });
//   };

//   const handleDeleteEmployee = () => {
//     dispatch(deleteEmployee(editedEmployee?.id)).then((res) => {
//       if (res.status === 200) {
//         setVisibleConfirmDeleteModal(false);
//       }
//     });
//   };

//   const handleOpenMoveEmployeeModal = (employee) => {
//     setVisibleMoveEmployeeModal(true);
//     dispatch(setEditedEmployee(employee));
//   };

//   const handleCloseMoveEmployeeModal = () => {
//     setVisibleMoveEmployeeModal(false);
//     dispatch(setEditedEmployee(null));
//   };

//   useEffect(() => {
//     dispatch(getEmployeesList(1, 1000));
//   }, [dispatch]);

//   return (
//     <div className={styles.pageContent}>
//       <PageTitle
//         title="Ваши сотрудники"
//         hasButton
//         dataTour="employees.add"
//         dataTourMobile={"menu.employees"}
//         onClick={handleOpenNewEmployeeModal}
//       />

//       {/* <EmployeeLimitModal isOpen={true} /> */}

//       <InfoBanner>
//         Сотрудники добавляются автоматически, когда они нажимают{" "}
//         <strong>«/start»</strong> в Телеграм-боте.
//       </InfoBanner>

//       <DeleteConfirmationModal
//         isOpen={visibleConfirmDeleteModal}
//         onClose={handleCloseConfirmDeleteModal}
//         onConfirm={handleDeleteEmployee}
//         message={<MessageDelete employeeName={fullName} />}
//       />

//       <ModalMoveEmployee
//         isOpen={visibleMoveEmployeeModal}
//         handleClose={handleCloseMoveEmployeeModal}
//       />

//       <EmployeeContactModal
//         isOpen={visibleContactModal}
//         onClose={handleCloseContactModal}
//         employee={editedEmployee}
//       />

//       <div className={styles.content}>
//         {employees && !isMobile && <EmployeeRowHeader />}

//         {/* СТРОКИ ДАННЫХ */}
//         {!isMobile &&
//           (employees ? (
//             employees?.map((employee) => (
//               <EmployeeRow
//                 key={employee.id}
//                 checkedIn={employee.checked_in}
//                 {...employee}
//                 onShowDetails={() => handleDetails(employee.id)}
//                 onShowContacts={() => handleOpenContactModal(employee)}
//                 onEdit={() => handleOpenEmployeeModal(employee)}
//                 onDelete={() => handleOpenConfirmDeleteModal(employee)}
//                 onMove={() => handleOpenMoveEmployeeModal(employee)}
//               />
//             ))
//           ) : (
//             <div className={styles.empty}>
//               Список сотрудников пуст. <br /> Нажмите{" "}
//               <strong>"Добавить"</strong>, чтобы добавить первого сотрудника.
//             </div>
//           ))}

//         {isMobile &&
//           (employees ? (
//             <div className={styles.mobileCards}>
//               {employees?.map((employee) => (
//                 <EmployeeCard
//                   key={employee.id}
//                   checkedIn={employee.checked_in}
//                   {...employee}
//                   onShowDetails={() => handleDetails(employee.id)}
//                   onShowContacts={() => handleOpenContactModal(employee)}
//                   onEdit={() => handleOpenEmployeeModal(employee)}
//                   onDelete={() => handleOpenConfirmDeleteModal(employee)}
//                   onMove={() => handleOpenMoveEmployeeModal(employee)}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className={styles.empty}>
//               Список сотрудников пуст. <br /> Нажмите{" "}
//               <strong>"Добавить"</strong>, чтобы добавить первого сотрудника.
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// }

// const MessageDelete = ({ employeeName }) => {
//   return (
//     <div>
//       Вы уверены, что хотите <strong>удалить</strong> сотрудника <br />
//       <span className={styles.employeeName}>{employeeName}</span>? <br /> Это
//       действие <strong>необратимо</strong>.
//     </div>
//   );
// };

import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./EmployeePage.module.scss";
import { useEffect, useMemo, useState } from "react";
import EmployeeRow from "../../components/EmployeeRow/EmployeeRow";
import EmployeeRowHeader from "../../modules/EmployeeRowHeader/EmployeeRowHeader";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import EmployeeContactModal from "../../modules/EmployeeContactModal/EmployeeContactModal";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteEmployee,
  getEmployeesList,
  getEmployeeWithHistory,
  getFilteredEmployeesList,
} from "../../utils/api/actions/employees";
import {
  setEditedEmployee,
  setFilteredEmployees,
} from "../../store/slices/employeesSlice";
import { useMediaQuery } from "react-responsive";
import { EmployeeCard } from "../../components/EmployeeCard/EmployeeCard";
import { InfoBanner } from "../../ui/InfoBanner/InfoBanner";
import { ModalMoveEmployee } from "../../modules/ModalMoveEmployee/ModalMoveEmployee";
import { EmployeeLimitModal } from "../../modules/EmployeeLimitModal/EmployeeLimitModal";

// 👇 новые импорты
import { SearchInput } from "../../ui/SearchInput/SearchInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { formatDataForSelect } from "../../utils/methods/formatDataForSelect";

const roleOptions = [
  { value: "head", label: "Руководитель" },
  { value: "employee", label: "Сотрудник" },
];

export default function EmployeePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery({
    query: "(max-width: 1334px)",
  });

  const {
    editedEmployee,
    employees,
    filteredEmployees: filteredEmployeesStored,
  } = useSelector((state) => state?.employees);

  const { tariffs, wallet } = useSelector((state) => state?.billing);

  // списки для селектов
  const { positions } = useSelector((state) => state?.positions);
  const { departments } = useSelector((state) => state?.departments);

  // 🔍 локальный поиск по ФИО
  const [searchText, setSearchText] = useState("");

  // 🎯 мультивыбор для фильтрации на сервере
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // 👇 новое поле
  const [selectedRole, setSelectedRole] = useState(null);

  const positionsOptions = useMemo(
    () => formatDataForSelect(positions || []),
    [positions]
  );
  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );

  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [visibleContactModal, setVisibleContactModal] = useState(false);
  const [visibleMoveEmployeeModal, setVisibleMoveEmployeeModal] =
    useState(false);
  const [visibleEmployeeLimitModal, setVisibleEmployeeLimitModal] =
    useState(false);

  const fullName = `${editedEmployee?.surname} ${editedEmployee?.firstname} ${editedEmployee?.patronymic}`;

  const subscription = wallet?.subscription;

  const currentTariff = tariffs?.find(
    (tariff) => tariff?.id === subscription?.tariff_id
  );

  const limit = Number(subscription?.employees_limit) || 0;
  const plus = Number(subscription?.employees_plus) || 0;
  const employeeCount = limit + plus;

  const totalEmployeesCount = employees?.length || 0;
  const canAddEmployee = totalEmployeesCount < employeeCount;

  const handleOpenNewEmployeeModal = () => {
    if (currentTariff && !canAddEmployee) {
      setVisibleEmployeeLimitModal(true);
      return;
    }
    dispatch(setEditedEmployee(null));
    navigate("new");
  };

  const handleCloseEmployeeLimitModal = () => {
    setVisibleEmployeeLimitModal(false);
  };

  const handleOpenEmployeeModal = (employee) => {
    navigate(`${employee?.id}/update`);
    dispatch(setEditedEmployee(employee));
  };

  const handleOpenConfirmDeleteModal = (employee) => {
    setVisibleConfirmDeleteModal(true);
    dispatch(setEditedEmployee(employee));
  };

  const handleCloseConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(false);
  };

  const handleOpenContactModal = (employee) => {
    setVisibleContactModal(true);
    dispatch(setEditedEmployee(employee));
  };

  const handleCloseContactModal = () => {
    setVisibleContactModal(false);
  };

  const handleDetails = (id) => {
    dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate(`${id}`);
      }
    });
  };

  const handleDeleteEmployee = () => {
    dispatch(deleteEmployee(editedEmployee?.id)).then((res) => {
      if (res.status === 200) {
        setVisibleConfirmDeleteModal(false);
      }
    });
  };

  const handleOpenMoveEmployeeModal = (employee) => {
    setVisibleMoveEmployeeModal(true);
    dispatch(setEditedEmployee(employee));
  };

  const handleCloseMoveEmployeeModal = () => {
    setVisibleMoveEmployeeModal(false);
    dispatch(setEditedEmployee(null));
  };

  const handleGoToBilling = () => {
    navigate(`/billing`);
  };

  // первый запрос — без фильтров
  useEffect(() => {
    dispatch(getEmployeesList(1, 1000));
  }, [dispatch]);

  // 🔍 локальный фильтр по ФИО
  const filteredEmployees = useMemo(() => {
    if (!employees) return null;
    if (!searchText.trim()) return employees;

    const q = searchText.trim().toLowerCase();

    return employees.filter((emp) => {
      const fullName = `${emp.surname || ""} ${emp.firstname || ""} ${
        emp.patronymic || ""
      }`.toLowerCase();
      return fullName.includes(q);
    });
  }, [employees, searchText]);

  useEffect(() => {
    dispatch(setFilteredEmployees(filteredEmployees));
  }, [filteredEmployees, dispatch]);

  // ⚙️ изменение фильтра по должностям (селект)
  const handlePositionsChange = (options) => {
    const normalized = Array.isArray(options)
      ? options
      : options
      ? [options]
      : [];
    setSelectedPositions(normalized);

    const position_ids = normalized.map((o) => o.value);
    const department_ids = selectedDepartments.map((o) => o.value);
    const role = selectedRole?.value || null;

    dispatch(
      getFilteredEmployeesList(1, 1000, {
        position_ids,
        department_ids,
        role,
      })
    );
  };

  // ⚙️ изменение фильтра по подразделениям (селект)
  const handleDepartmentsChange = (options) => {
    const normalized = Array.isArray(options)
      ? options
      : options
      ? [options]
      : [];
    setSelectedDepartments(normalized);

    const position_ids = selectedPositions.map((o) => o.value);
    const department_ids = normalized.map((o) => o.value);
    const role = selectedRole?.value || null;

    dispatch(
      getFilteredEmployeesList(1, 1000, {
        position_ids,
        department_ids,
        role,
      })
    );
  };

  const handleRoleChange = (option) => {
    setSelectedRole(option);

    const position_ids = selectedPositions.map((o) => o.value);
    const department_ids = selectedDepartments.map((o) => o.value);
    const role = option?.value || null;

    dispatch(
      getFilteredEmployeesList(1, 1000, {
        position_ids,
        department_ids,
        role,
      })
    );
  };

  return (
    <div className={styles.pageContent}>
      <PageTitle
        title="Ваши сотрудники"
        hasButton
        dataTour="employees.add"
        dataTourMobile={"menu.employees"}
        onClick={handleOpenNewEmployeeModal}
      />

      <EmployeeLimitModal
        isOpen={visibleEmployeeLimitModal}
        onClose={handleCloseEmployeeLimitModal}
        currentCount={employees?.length}
        maxCount={employeeCount}
        planName={currentTariff?.name}
        onUpgradePlan={handleGoToBilling}
        onAddSlots={handleGoToBilling}
      />

      <InfoBanner>
        Сотрудники добавляются автоматически, когда они нажимают{" "}
        <strong>«/start»</strong> в Телеграм-боте.
      </InfoBanner>

      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        onConfirm={handleDeleteEmployee}
        message={<MessageDelete employeeName={fullName} />}
      />

      <ModalMoveEmployee
        isOpen={visibleMoveEmployeeModal}
        handleClose={handleCloseMoveEmployeeModal}
      />

      <EmployeeContactModal
        isOpen={visibleContactModal}
        onClose={handleCloseContactModal}
        employee={editedEmployee}
      />

      {/* 🔽 БЛОК ФИЛЬТРОВ */}
      <div className={styles.filters}>
        <SearchInput
          placeholder="Поиск по ФИО..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <CustomSelect
          placeholder="Должности"
          options={positionsOptions}
          isMulti
          value={selectedPositions}
          onChange={handlePositionsChange}
          isSearchable
        />

        <CustomSelect
          placeholder="Подразделения"
          options={departmentsOptions}
          isMulti
          value={selectedDepartments}
          onChange={handleDepartmentsChange}
          isSearchable
        />
        <CustomSelect
          placeholder="Роль"
          options={roleOptions}
          value={selectedRole}
          onChange={handleRoleChange}
          isSearchable
        />
      </div>

      <div className={styles.content}>
        {filteredEmployeesStored && !isMobile && <EmployeeRowHeader />}

        {/* СТРОКИ ДАННЫХ */}
        {!isMobile &&
          (employees ? (
            filteredEmployeesStored ? (
              filteredEmployeesStored.map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  checkedIn={employee.checked_in}
                  {...employee}
                  onShowDetails={() => handleDetails(employee.id)}
                  onShowContacts={() => handleOpenContactModal(employee)}
                  onEdit={() => handleOpenEmployeeModal(employee)}
                  onDelete={() => handleOpenConfirmDeleteModal(employee)}
                  onMove={() => handleOpenMoveEmployeeModal(employee)}
                />
              ))
            ) : (
              <div className={styles.empty}>
                По выбранным фильтрам сотрудники не найдены.
              </div>
            )
          ) : (
            <div className={styles.empty}>
              Список сотрудников пуст. <br /> Нажмите{" "}
              <strong>"Добавить"</strong>, чтобы добавить первого сотрудника.
            </div>
          ))}

        {isMobile &&
          (employees ? (
            filteredEmployeesStored ? (
              <div className={styles.mobileCards}>
                {filteredEmployeesStored.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    checkedIn={employee.checked_in}
                    {...employee}
                    onShowDetails={() => handleDetails(employee.id)}
                    onShowContacts={() => handleOpenContactModal(employee)}
                    onEdit={() => handleOpenEmployeeModal(employee)}
                    onDelete={() => handleOpenConfirmDeleteModal(employee)}
                    onMove={() => handleOpenMoveEmployeeModal(employee)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                По выбранным фильтрам сотрудники не найдены.
              </div>
            )
          ) : (
            <div className={styles.empty}>
              Список сотрудников пуст. <br /> Нажмите{" "}
              <strong>"Добавить"</strong>, чтобы добавить первого сотрудника.
            </div>
          ))}
      </div>
    </div>
  );
}

const MessageDelete = ({ employeeName }) => {
  return (
    <div>
      Вы уверены, что хотите <strong>удалить</strong> сотрудника <br />
      <span className={styles.employeeName}>{employeeName}</span>? <br /> Это
      действие <strong>необратимо</strong>.
    </div>
  );
};
