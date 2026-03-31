import React from "react";
import styles from "./DepartmentCard.module.scss";
import { getFormattedTimeZoneLabel } from "../../utils/methods/generateTimeZoneOptions";
import { useDispatch, useSelector } from "react-redux";
import { CardActions } from "../CardActions/CardActions";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import {
  HintCheckIn,
  HintCheckOut,
  HintTimeZone,
} from "../../modules/CreateDepartmentModal/CreateDepartmentModal";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";
import { toggleDepartmentIsDefault } from "../../store/slices/departmentsSlice";

const DepartmentCard = ({
  department,
  onDetailsClick,
  onUpdateClick,
  onDeleteClick,
}) => {
  const dispatch = useDispatch();

  const { loadingGetDetails } = useSelector((state) => state?.departments);

  const handleIsDefaultChange = (newCheckedValue) => {
    if (!department || !department.id) return;

    dispatch(
      toggleDepartmentIsDefault({
        department: department,
        newValue: newCheckedValue,
      }),
    );
  };

  const handleUpdateClick = () => {
    onUpdateClick(department?.id);
  };

  const handleDeleteClick = () => {
    onDeleteClick(department?.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerAccent} />

      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{department?.title}</h2>
        </div>

        <p className={styles.description}>
          {department?.description
            ? department?.description
            : "No description provided"}
        </p>

        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <div className={styles.checkInTime}>
              <span className={styles.dataLabel}>Check-in at:</span>
            </div>

            <HintWithPortal hintContent={<HintCheckIn />}>
              <span className={`${styles.dataValue} ${styles.checkIn}`}>
                {department?.check_in_time}
              </span>
            </HintWithPortal>
          </div>

          <div className={styles.dataItem}>
            <div className={styles.checkOutTime}>
              <span className={styles.dataLabel}>Check-out from:</span>
            </div>

            <HintWithPortal hintContent={<HintCheckOut />}>
              <span className={styles.dataValue}>
                {department?.check_out_time}
              </span>
            </HintWithPortal>
          </div>

          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Time zone:</span>

            <HintWithPortal hintContent={<HintTimeZone />}>
              <span className={styles.dataValue}>
                {getFormattedTimeZoneLabel(department?.timezone)}
              </span>
            </HintWithPortal>
          </div>

          <div className={styles.dataItem}>
            <div className={styles.employeeCount}>
              <span className={styles.dataLabel}>Employees:</span>
            </div>

            <span className={styles.dataValue}>
              {department?.employees_count}
            </span>
          </div>
        </div>

        <div className={styles.isDefault}>
          <HintWithPortal hintContent={"Use as default"} hasIcon={false}>
            <CustomCheckbox
              checked={department.is_default}
              onChange={handleIsDefaultChange}
              label={"Use as default"}
            />
          </HintWithPortal>
        </div>

        <CardActions
          loading={loadingGetDetails === department?.id}
          onDetails={onDetailsClick}
          onUpdate={handleUpdateClick}
          onDelete={handleDeleteClick}
        />
      </div>
    </div>
  );
};

export default DepartmentCard;
