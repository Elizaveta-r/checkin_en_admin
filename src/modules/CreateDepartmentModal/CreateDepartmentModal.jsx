import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import styles from "./CreateDepartmentModal.module.scss";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RingLoader } from "react-spinners";
import { setDepartment } from "../../store/slices/departmentsSlice";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";

export default function CreateDepartmentModal({
  isOpen,
  isNew,
  onClose,
  onConfirm,
  onUpdate,
}) {
  const dispatch = useDispatch();

  const { loading, department } = useSelector((state) => state?.departments);

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    checkInTime: "09:00",
    checkOutTime: "18:00",
  });
  const [timeZone, setTimeZone] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(true);

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      checkInTime: "09:00",
      checkOutTime: "18:00",
    });
  };

  const handleConfirm = () => {
    if (!formData.name) {
      toast.error("Please enter a department name.");
      return;
    }

    if (!timeZone) {
      toast.error("Please select a time zone.");
      return;
    }
    window.dispatchEvent(new CustomEvent("tour:submit:clicked"));

    onConfirm({ ...formData, timeZone, is_default: isDefault })
      .then((res) => {
        if (res && res.status === 200) {
          window.dispatchEvent(new CustomEvent("tour:submit:success"));
          setFormData({
            name: "",
            description: "",
            checkInTime: "09:00",
            checkOutTime: "18:00",
          });
          handleClose();
        } else {
          window.dispatchEvent(new CustomEvent("tour:submit:fail"));
        }
      })
      .catch(() => {
        window.dispatchEvent(new CustomEvent("tour:submit:fail"));
      });
  };

  const handleUpdate = () => {
    if (!formData.name) {
      toast.error("Please enter a department name.");
      return;
    }

    if (!timeZone) {
      toast.error("Please select a time zone.");
      return;
    }

    onUpdate({
      ...formData,
      timeZone,
      id: department?.id,
      is_default: isDefault,
    }).then((res) => {
      if (res && res.status === 200) {
        setFormData({
          name: "",
          description: "",
          checkInTime: "09:00",
          checkOutTime: "18:00",
        });

        handleClose();
        dispatch(setDepartment(null));
      }
    });
  };

  useEffect(() => {
    if (!isNew && department) {
      setFormData({
        name: department.title || "",
        description: department.description || "",
        checkInTime: department.check_in_time || "09:00",
        checkOutTime: department.check_out_time || "18:00",
      });
      const tzOption =
        timeZoneOptions.find((t) => t.value === department.timezone) || null;

      setTimeZone(tzOption);
      setIsDefault(department.is_default);
    } else if (isNew) {
      setFormData({
        name: "",
        description: "",
        checkInTime: "09:00",
        checkOutTime: "18:00",
      });
      setTimeZone("");
      setIsDefault(true);
    }
  }, [isNew, isOpen, department]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${!isNew ? "Edit" : "Create New"} Department`}
        >
          <div className={styles.formContent}>
            <div className={styles.section} data-tour="modal.nameInput">
              <label className={styles.label} htmlFor="name">
                Department name
              </label>
              <CustomInput
                id="name"
                name="name"
                placeholder="For example, Quality Control Department"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.section} data-tour="modal.timezone">
              <HintWithPortal hintContent={<HintTimeZone />}>
                <label className={styles.label}>Time zone</label>
              </HintWithPortal>

              <CustomSelect
                placeholder="Select a time zone"
                options={timeZoneOptions}
                onChange={setTimeZone}
                value={timeZone}
                dataTourId="modal.timezone"
                isSearchable
              />
            </div>

            <div className={styles.timeWrapper}>
              <div className={styles.timeGrid}>
                <div className={styles.section} data-tour="modal.check-in-time">
                  <HintWithPortal hintContent={<HintCheckIn />}>
                    <label className={styles.label} htmlFor="checkInTime">
                      Check-in (at)
                    </label>
                  </HintWithPortal>

                  <CustomInput
                    id="checkInTime"
                    name="checkInTime"
                    type="time"
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div
                  className={styles.section}
                  data-tour="modal.check-out-time"
                >
                  <HintWithPortal hintContent={<HintCheckOut />}>
                    <label className={styles.label} htmlFor="checkOutTime">
                      Check-out (from)
                    </label>
                  </HintWithPortal>

                  <CustomInput
                    id="checkOutTime"
                    name="checkOutTime"
                    type="time"
                    value={formData.checkOutTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {!isNew && (
                <p className={styles.warning}>
                  ⚠️ If you change the time settings, they will be updated
                  automatically for all employees
                </p>
              )}
            </div>
          </div>

          <div className={styles.section} data-tour="modal.description">
            <label className={styles.label} htmlFor="description">
              Department description
            </label>
            <CustomTextArea
              id="description"
              name="description"
              placeholder="A short description of responsibilities (optional)"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div
            className={styles.section}
            style={{ margin: "20px 0" }}
            data-tour="modal.default"
          >
            <CustomCheckbox
              label="Set as default department"
              checked={isDefault}
              onChange={setIsDefault}
            />{" "}
          </div>

          <div className={styles.actions}>
            <button className={styles.buttonCancel} onClick={onClose}>
              Cancel
            </button>
            <button
              data-tour="modal.submit"
              className={styles.buttonConfirm}
              onClick={!isNew ? handleUpdate : handleConfirm}
            >
              {loading && <RingLoader color="#fff" size={12} />}
              {loading ? "Creating..." : !isNew ? "Save" : "Create Department"}
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export const HintTimeZone = ({ text = "your department operates" }) => {
  return (
    <div className={styles.hint}>
      Defines the time zone in which {text}. <br /> <br />
      <small className={styles.small}>
        This affects the correct delivery of notifications.
      </small>
    </div>
  );
};

export const HintCheckIn = () => {
  return (
    <div className={styles.hint}>
      At this time, the employee receives a notification allowing them to check
      in <small className={styles.small}>(mark their arrival)</small> at the
      workplace.
    </div>
  );
};

export const HintCheckOut = () => {
  return (
    <div className={styles.hint}>
      The recommended time from which the employee can complete{" "}
      <small className={styles.small}>(check out of)</small> their workday.
    </div>
  );
};
