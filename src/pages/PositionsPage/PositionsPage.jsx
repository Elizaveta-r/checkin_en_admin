import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import JobTitleTable from "../../modules/JobTitleTable/JobTitleTable";
import styles from "./PositionsPage.module.scss";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import EditPositionModal from "../../modules/EditPositionModal/EditPositionModal";
import { PackageMinus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePosition,
  getPositionsList,
} from "../../utils/api/actions/positions";
import { useMediaQuery } from "react-responsive";
import { PositionsCard } from "../../components/PositionsCard/PositionsCard";

export default function PositionsPage() {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const isMobile = useMediaQuery({
    query: "(max-width: 723px)",
  });

  const { positions, loading } = useSelector((state) => state?.positions);

  const action = searchParams.get("action");

  const [visibleModal, setVisibleCreateModal] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState(null);
  const [isNew, setIsNew] = useState(false);

  const handleOpenCreateModal = () => {
    setIsNew(true);
    setVisibleCreateModal(true);
  };

  const handleOpenUpdateModal = (position) => {
    setIsNew(false);
    setVisibleCreateModal(true);
    setSelectedPosition(position);
  };
  const handleCloseCreateModal = () => {
    setVisibleCreateModal(false);
    setSearchParams({});
    setSelectedPosition(null);
  };

  const handleConfirmDelete = (id) => {
    if (id) {
      const selectedPosition = positions?.find(
        (position) => position.id === id
      );
      setSelectedPosition(selectedPosition);
    }
    setConfirmationOpen(true);
  };

  const handleDelete = () => {
    dispatch(deletePosition(selectedPosition?.id)).then((res) => {
      if (res.status === 200) {
        setConfirmationOpen(false);
        setSelectedPosition(null);
      }
    });
  };

  const handleConfirmDeleteClose = () => {
    setConfirmationOpen(false);
    setSelectedPosition(null);
  };

  useEffect(() => {
    if (action === "create") {
      handleOpenCreateModal();
    }
  }, [action]);

  useEffect(() => {
    dispatch(getPositionsList(1, 10));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <DeleteConfirmationModal
        message={<Message positionName={selectedPosition?.name} />}
        isOpen={isConfirmationOpen}
        onClose={handleConfirmDeleteClose}
        onConfirm={handleDelete}
        buttonTitle="Удалить"
        buttonIcon={<PackageMinus size={20} />}
        loading={loading}
      />
      <EditPositionModal
        isOpen={visibleModal}
        onClose={handleCloseCreateModal}
        position={selectedPosition}
        isNew={isNew}
      />
      <PageTitle
        title={"Должности"}
        hasButton
        onClick={handleOpenCreateModal}
        dataTour="positions.add"
        dataTourMobile={"menu.positions"}
      />
      {isMobile ? (
        positions ? (
          <div className={styles.cardsContainer}>
            {positions.map((position) => {
              return (
                <PositionsCard
                  key={position.id}
                  onEdit={handleOpenUpdateModal}
                  onDelete={handleConfirmDelete}
                  position={position}
                />
              );
            })}
          </div>
        ) : (
          <tr>
            <td colSpan="4" className={styles.noData}>
              Список должностей пуст. <br /> Нажмите <strong>"Добавить"</strong>
              , чтобы создать первую должность.
            </td>
          </tr>
        )
      ) : (
        <JobTitleTable
          onEdit={handleOpenUpdateModal}
          onDelete={handleConfirmDelete}
          positions={positions}
        />
      )}
    </div>
  );
}

const Message = ({ positionName }) => {
  return (
    <div>
      Вы действительно хотите удалить должность <strong>{positionName}</strong>?
    </div>
  );
};
