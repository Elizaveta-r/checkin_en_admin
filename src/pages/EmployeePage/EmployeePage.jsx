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

import { SearchInput } from "../../ui/SearchInput/SearchInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { formatDataForSelect } from "../../utils/methods/formatDataForSelect";

const roleOptions = [
  { value: "head", label: "Manager" },
  { value: "employee", label: "Employee" },
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

  const { positions } = useSelector((state) => state?.positions);
  const { departments } = useSelector((state) => state?.departments);

  const [searchText, setSearchText] = useState("");

  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [selectedRole, setSelectedRole] = useState(null);

  const positionsOptions = useMemo(
    () => formatDataForSelect(positions || []),
    [positions],
  );
  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments],
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
    (tariff) => tariff?.id === subscription?.tariff_id,
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

  useEffect(() => {
    dispatch(getEmployeesList(1, 1000));
  }, [dispatch]);

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
      }),
    );
  };

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
      }),
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
      }),
    );
  };

  return (
    <div className={styles.pageContent}>
      <PageTitle
        title="Your Employees"
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
        Employees are added automatically when they press{" "}
        <strong>“/start”</strong> in the Telegram bot.
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

      <div className={styles.filters}>
        <SearchInput
          placeholder="Search by full name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <CustomSelect
          placeholder="Positions"
          options={positionsOptions}
          isMulti
          value={selectedPositions}
          onChange={handlePositionsChange}
          isSearchable
        />

        <CustomSelect
          placeholder="Departments"
          options={departmentsOptions}
          isMulti
          value={selectedDepartments}
          onChange={handleDepartmentsChange}
          isSearchable
        />
        <CustomSelect
          placeholder="Role"
          options={roleOptions}
          value={selectedRole}
          onChange={handleRoleChange}
          isSearchable
        />
      </div>

      <div className={styles.content}>
        {filteredEmployeesStored && !isMobile && <EmployeeRowHeader />}

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
                No employees found for the selected filters.
              </div>
            )
          ) : (
            <div className={styles.empty}>
              No employees yet. <br /> Click <strong>"Add"</strong> to add your
              first employee.
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
                No employees found for the selected filters.
              </div>
            )
          ) : (
            <div className={styles.empty}>
              No employees yet. <br /> Click <strong>"Add"</strong> to add your
              first employee.
            </div>
          ))}
      </div>
    </div>
  );
}

const MessageDelete = ({ employeeName }) => {
  return (
    <div>
      Are you sure you want to <strong>delete</strong> this employee? <br />
      <span className={styles.employeeName}>{employeeName}</span>? <br /> This
      action is <strong>irreversible</strong>.
    </div>
  );
};
