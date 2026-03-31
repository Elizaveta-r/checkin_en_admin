import React, { useEffect } from "react";
import styles from "./EditPositionModal.module.scss";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal/Modal";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { useDispatch, useSelector } from "react-redux";
import {
  createPosition,
  updatePosition,
} from "../../utils/api/actions/positions";
import { RingLoader } from "react-spinners";
import { toast } from "sonner";

export default function EditPositionModal({
  isOpen,
  onClose,
  position,
  isNew,
}) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state?.positions);

  const [input, setInput] = React.useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isNew) {
      setInput({
        name: position?.title || "",
        description: position?.description || "",
      });
    }
  }, [isNew, position]);

  const handleChangeInput = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    onClose();
    setInput({
      name: "",
      description: "",
    });
  };

  const handleConfirmCreate = () => {
    if (!input.name) {
      toast.error("Please enter a position name.");
      return;
    }
    window.dispatchEvent(new CustomEvent("tour:position:submit:clicked"));
    dispatch(
      createPosition({
        title: input.name,
        description: input.description,
      }),
    )
      .then((res) => {
        if (res.status === 200) {
          window.dispatchEvent(new CustomEvent("tour:position:submit:success"));
          handleClose();
        } else {
          window.dispatchEvent(new CustomEvent("tour:position:submit:fail"));
        }
      })
      .catch(() => {
        window.dispatchEvent(new CustomEvent("tour:position:submit:fail"));
      });
  };

  const handleConfirmUpdate = () => {
    if (!input.name) {
      toast.error("Please enter a position name.");
      return;
    }
    dispatch(
      updatePosition({
        position_id: position.id,
        title: input.name,
        description: input.description,
      }),
    ).then((res) => {
      if (res.status === 200) {
        handleClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={!isNew ? "Edit Position" : "Create Position"}
        >
          <div className={styles.content}>
            <div className={styles.form}>
              <div className={styles.field} data-tour="modal.position.name">
                <label className={styles.label}>Name:</label>
                <CustomInput
                  id="name"
                  name="name"
                  value={input.name}
                  onChange={handleChangeInput}
                  placeholder={"Enter position name"}
                />
              </div>
              <div
                className={styles.field}
                data-tour="modal.position.description"
              >
                <label className={styles.label}>Description:</label>
                <CustomTextArea
                  name="description"
                  value={input.description}
                  onChange={handleChangeInput}
                  placeholder={"Enter a position description (optional)"}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonCancel} onClick={handleClose}>
                Cancel
              </button>
              <button
                className={styles.buttonConfirm}
                onClick={!isNew ? handleConfirmUpdate : handleConfirmCreate}
                data-tour="modal.position.submit"
              >
                {loading && <RingLoader color="white" size={12} />}
                {loading ? "Please wait..." : !isNew ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
