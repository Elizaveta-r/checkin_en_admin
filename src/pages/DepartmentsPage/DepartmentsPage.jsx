import styles from "./DepartmentsPage.module.scss";
import DepartmentCard from "../../components/DepartmentCard/DepartmentCard";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import CreateDepartmentModal from "../../modules/CreateDepartmentModal/CreateDepartmentModal";
import { useDispatch, useSelector } from "react-redux";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartmentsList,
  updateDepartment,
} from "../../utils/api/actions/departments";
import {
  selectHasDefaultDepartment,
  setDepartment,
  setLoadingGetDetails,
} from "../../store/slices/departmentsSlice";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import { Trash } from "lucide-react";
import { toast } from "sonner";

const CHECK_DELAY_MS = 500;

export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { departments, department, loading } = useSelector(
    (state) => state?.departments,
  );

  const hasDefault = useSelector(selectHasDefaultDepartment);

  const [visibleCreateModal, setVisibleCreateModal] = useState(false);
  const [visibleUpdateModal, setVisibleUpdateModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

  const [hasCheckedDefault, setHasCheckedDefault] = useState(false);
  const timerRef = useRef(null);

  const action = searchParams.get("create");

  const handleDetails = (id) => {
    dispatch(setLoadingGetDetails(id));
    dispatch(getDepartmentById(id)).then(() => {
      navigate(`${id}`);
    });
  };

  const handleOpenUpdateModal = (id) => {
    setIsNew(false);
    dispatch(getDepartmentById(id));
    setVisibleUpdateModal(true);
  };

  const handleOpenCreateModal = () => {
    setIsNew(true);
    setVisibleCreateModal(true);
  };

  const handleOpenConfirmationModal = (id) => {
    dispatch(getDepartmentById(id));
    setOpenConfirmationModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setOpenConfirmationModal(false);
  };

  const handleCreateDepartment = (data) => {
    const dataForServer = {
      title: data?.name,
      description: data?.description,
      timezone: data?.timeZone.value,
      check_in_time: data?.checkInTime,
      check_out_time: data?.checkOutTime,
      is_default: data?.is_default,
    };

    return dispatch(createDepartment(dataForServer));
  };

  const handleUpdateDepartment = (data) => {
    const dataForServer = {
      department_id: data?.id,
      title: data?.name,
      description: data?.description,
      timezone: data?.timeZone.value,
      check_in_time: data?.checkInTime,
      check_out_time: data?.checkOutTime,
      is_default: data?.is_default,
    };

    return dispatch(updateDepartment(dataForServer));
  };

  const handleDeleteDepartment = () => {
    dispatch(deleteDepartment(department?.id)).then((res) => {
      if (res.status === 200) {
        handleCloseConfirmationModal();
      }
    });
  };

  const handleCreateClose = () => {
    setVisibleCreateModal(false);
    setSearchParams({});
  };

  const handleUpdateClose = () => {
    dispatch(setDepartment(null));
    setVisibleUpdateModal(false);
  };

  useEffect(() => {
    dispatch(getDepartmentsList(1, 10));
  }, [dispatch]);

  useEffect(() => {
    if (action === "true") {
      handleOpenCreateModal();
    }
  }, [action]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (
      departments &&
      departments.length > 0 &&
      !loading &&
      !hasDefault &&
      !hasCheckedDefault
    ) {
      timerRef.current = setTimeout(() => {
        toast.warning("⚠️ No default department selected!", {
          id: "default-department-warning",
          duration: Infinity,
          description: "We recommend setting one main department",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss("default-department-warning"),
          },
        });

        setHasCheckedDefault(true);
        timerRef.current = null;
      }, CHECK_DELAY_MS);
    }

    if (hasDefault) {
      toast.dismiss("default-department-warning");

      if (hasCheckedDefault) {
        setHasCheckedDefault(false);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [departments, loading, hasDefault, hasCheckedDefault]);

  return (
    <div className={styles.pageContent}>
      <PageTitle
        title="Your Departments"
        hasButton
        onClick={handleOpenCreateModal}
        dataTour={"departments.add"}
        dataTourMobile={"menu.departments"}
      />
      <DeleteConfirmationModal
        isOpen={openConfirmationModal}
        onClose={handleCloseConfirmationModal}
        message={`Are you sure you want to delete this department?\nThis action cannot be undone.`}
        onConfirm={handleDeleteDepartment}
        buttonTitle="Delete"
        buttonIcon={<Trash size={20} />}
      />
      {department && (
        <CreateDepartmentModal
          isOpen={visibleCreateModal || visibleUpdateModal}
          onClose={() =>
            visibleCreateModal ? handleCreateClose() : handleUpdateClose()
          }
          isNew={isNew}
          onConfirm={handleCreateDepartment}
          onUpdate={handleUpdateDepartment}
        />
      )}

      {!departments && (
        <div className={styles.empty}>
          No departments yet. <br /> Click <strong>"Add"</strong> to create your
          first department.
        </div>
      )}

      {departments && (
        <div className={styles.content}>
          {departments?.map((department, index) => (
            <DepartmentCard
              key={index}
              department={department}
              onDetailsClick={() => handleDetails(department.id)}
              onUpdateClick={handleOpenUpdateModal}
              onDeleteClick={handleOpenConfirmationModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
