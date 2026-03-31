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
    if (!department || !department.id) return; // Защита от отсутствия данных

    // Вызываем Thunk, который сам управляет оптимистичным обновлением и откатом
    dispatch(
      toggleDepartmentIsDefault({
        department: department,
        newValue: newCheckedValue,
      })
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
            : "Описание отсутствует"}
        </p>

        {/* Блок с ключевыми данными */}
        <div className={styles.dataGrid}>
          {/* Время Check-in */}
          <div className={styles.dataItem}>
            <div className={styles.checkInTime}>
              <span className={styles.dataLabel}>Чекин в:</span>
            </div>

            <HintWithPortal hintContent={<HintCheckIn />}>
              <span className={`${styles.dataValue} ${styles.checkIn}`}>
                {department?.check_in_time}
              </span>
            </HintWithPortal>
          </div>

          {/* Время Check-out */}
          <div className={styles.dataItem}>
            <div className={styles.checkOutTime}>
              <span className={styles.dataLabel}>Чекаут с:</span>
            </div>

            <HintWithPortal hintContent={<HintCheckOut />}>
              <span className={styles.dataValue}>
                {department?.check_out_time}
              </span>
            </HintWithPortal>
          </div>

          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Часовой пояс:</span>

            <HintWithPortal hintContent={<HintTimeZone />}>
              <span className={styles.dataValue}>
                {getFormattedTimeZoneLabel(department?.timezone)}
              </span>
            </HintWithPortal>
          </div>

          {/* Количество сотрудников */}
          <div className={styles.dataItem}>
            <div className={styles.employeeCount}>
              <span className={styles.dataLabel}>Сотрудников:</span>
            </div>

            <span className={styles.dataValue}>
              {department?.employees_count}
            </span>
          </div>
        </div>

        {/* --- */}
        <div className={styles.isDefault}>
          <HintWithPortal
            hintContent={"Использовать по умолчанию"}
            hasIcon={false}
          >
            <CustomCheckbox
              checked={department.is_default}
              onChange={handleIsDefaultChange}
              label={"Использовать по умолчанию"}
            />
          </HintWithPortal>
        </div>

        {/* Кнопки с акцентами */}
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
