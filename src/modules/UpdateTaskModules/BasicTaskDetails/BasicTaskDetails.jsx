import { useDispatch, useSelector } from "react-redux";
import CustomInput from "../../../ui/CustomInput/CustomInput";
import CustomSelect from "../../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../../ui/CustomTextArea/CustomTextArea";
import styles from "./BasicTaskDetails.module.scss";

import {
  resetPhotoToggles,
  setAcceptCondition,
  setDepartmentIds,
  setDoneType,
  setDraftName,
  setPositionIds,
} from "../../../store/slices/tasksSlice";
import { useEffect } from "react";
import { HintWithPortal } from "../../../ui/HintWithPortal/HintWithPortal";
import { createPosition } from "../../../utils/api/actions/positions";
import { toast } from "sonner";

const confirmationTypes = [
  { value: "photo", label: "Photo" },
  { value: "text", label: "Text" },
  { value: "check_box", label: "Checkbox" },
];

export const BasicTaskDetails = () => {
  const dispatch = useDispatch();

  const { department_ids, position_ids, title, done_type, ai_prompt } =
    useSelector((state) => state.tasks.draftTask);

  const { departments } = useSelector((state) => state?.departments);
  const { positions } = useSelector((state) => state?.positions);

  const departmentOptions = departments?.map((dep) => ({
    value: dep.id,
    label: dep.title,
  }));

  const positionOptions = positions?.map((pos) => ({
    value: pos.id,
    label: pos.title,
  }));

  const addPositionToValue = (createdOpt) => {
    const prev = Array.isArray(position_ids) ? position_ids.slice() : [];
    const exists = prev.some(
      (p) =>
        (p.value ?? p) === createdOpt.value || p.label === createdOpt.label,
    );
    if (!exists) dispatch(setPositionIds([...prev, createdOpt]));
  };

  const handleCreatePosition = async (optFromSelect) => {
    const payload = { title: optFromSelect.value, description: "" };
    const res = await dispatch(createPosition(payload));
    const created = res?.payload?.data ?? res?.payload ?? null;
    const createdOpt = created?.id
      ? { value: created.id, label: created.title }
      : { value: optFromSelect.value, label: optFromSelect.value };

    addPositionToValue(createdOpt);
    window.dispatchEvent(new Event("tour:task:position:create:success"));
    return res;
  };

  useEffect(() => {
    if (
      !Array.isArray(department_ids) ||
      !department_ids.length ||
      !departmentOptions?.length
    )
      return;

    const needHydrate = department_ids.some((p) => !p?.label);
    if (!needHydrate) return;

    const mapped = department_ids
      .map((p) => {
        const rawId = typeof p === "string" ? p : p.value;
        return departmentOptions.find((o) => o.value === rawId);
      })
      .filter(Boolean);

    if (mapped.length) {
      dispatch(setDepartmentIds(mapped));
    }
  }, [department_ids, departmentOptions, dispatch]);

  useEffect(() => {
    if (
      !Array.isArray(position_ids) ||
      !position_ids.length ||
      !positionOptions?.length
    )
      return;

    const needHydrate = position_ids.some((p) => !p?.label);
    if (!needHydrate) return;

    const mapped = position_ids
      .map((p) => {
        const rawId = typeof p === "string" ? p : p.value;
        return positionOptions.find((o) => o.value === rawId);
      })
      .filter(Boolean);

    if (mapped.length) {
      dispatch(setPositionIds(mapped));
    }
  }, [position_ids, positionOptions, dispatch]);

  if (!departmentOptions) {
    toast.error("Create at least one department");
    return;
  }

  return (
    <div className={styles.basicTaskDetails}>
      <div className={styles.row}>
        <div className={styles.section} data-tour="form.tasks.name">
          <p className={styles.label}>Task title</p>
          <CustomInput
            name="title"
            placeholder="Task title"
            value={title}
            onChange={(e) => dispatch(setDraftName(e.target.value))}
          />
        </div>
        <div
          className={styles.section}
          data-tour="form.tasks.confirmation-type"
        >
          <HintWithPortal
            hintContent={
              <>
                Specify how the assignee will confirm completion: with a{" "}
                <strong>photo</strong>, a <strong>short text report</strong>, or
                a simple <strong>completion mark</strong> (checkbox).
              </>
            }
          >
            <p className={styles.label}>Confirmation type</p>
          </HintWithPortal>
          <CustomSelect
            placeholder="Select confirmation type"
            options={confirmationTypes}
            value={done_type}
            onChange={(selectedOption) => {
              if (selectedOption.value !== "photo") {
                dispatch(resetPhotoToggles());
              }
              dispatch(setDoneType(selectedOption));
            }}
            dataTourHeader="form.tasks.confirmation-type.header"
            dataTourId="form.tasks.confirmation-type"
          />
        </div>
      </div>

      {done_type.value === "photo" && (
        <div className={styles.section} data-tour="form.tasks.accept-condition">
          <HintWithPortal
            hintContent={
              <>
                Specify <b>what exactly should be visible in the photo</b> so AI
                can determine that the task has been completed. <br />
                <br />
                The more <b>accurate and detailed</b> your criteria are{" "}
                <small>
                  (what should appear in the image, in what condition, and under
                  what circumstances)
                </small>
                , the better the system can <b>recognize the result</b>.
              </>
            }
          >
            <p className={styles.label}>Acceptance criteria</p>
          </HintWithPortal>
          <CustomTextArea
            placeholder={"Acceptance criteria"}
            value={ai_prompt}
            onChange={(e) => dispatch(setAcceptCondition(e.target.value))}
          />
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.section} data-tour="form.tasks.dep">
          <p className={styles.label}>Department</p>
          <CustomSelect
            placeholder="Select department"
            isSearchable
            isMulti
            options={departmentOptions}
            value={department_ids}
            onChange={(selectedOption) =>
              dispatch(setDepartmentIds(selectedOption))
            }
            dataTourHeader="form.tasks.dep.header"
            dataTourId="form.tasks.dep"
            showSelectAll
          />
        </div>
        <div className={styles.section} data-tour="form.tasks.position">
          <p className={styles.label}>Positions</p>
          <CustomSelect
            placeholder="Select positions"
            isSearchable
            isMulti
            options={positionOptions}
            value={position_ids}
            onChange={(selectedOption) =>
              dispatch(setPositionIds(selectedOption))
            }
            isCreatable
            onCreate={handleCreatePosition}
            dataTourHeader="form.tasks.position.header"
            dataTourId="form.tasks.position"
            showSelectAll
          />
        </div>
      </div>
    </div>
  );
};
