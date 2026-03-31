import { useDispatch, useSelector } from "react-redux";
import CustomInput from "../../../ui/CustomInput/CustomInput";
import CustomSelect from "../../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../../ui/CustomTextArea/CustomTextArea";
import styles from "./BasicTaskDetails.module.scss";

import {
  resetPhotoToggles,
  setAcceptCondition,
  // setDepartmentId,
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
  { value: "photo", label: "Фото" },
  { value: "text", label: "Текст" },
  { value: "check_box", label: "Чекбокс" },
];

export const BasicTaskDetails = () => {
  const dispatch = useDispatch();

  // const { isEdit } = useSelector((state) => state.tasks);
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
      (p) => (p.value ?? p) === createdOpt.value || p.label === createdOpt.label
    );
    if (!exists) dispatch(setPositionIds([...prev, createdOpt]));
  };

  const handleCreatePosition = async (optFromSelect) => {
    const payload = { title: optFromSelect.value, description: "" };
    const res = await dispatch(createPosition(payload));
    // Пытаемся достать созданную сущность (зависит от твоего thunk)
    const created = res?.payload?.data ?? res?.payload ?? null;
    const createdOpt = created?.id
      ? { value: created.id, label: created.title }
      : { value: optFromSelect.value, label: optFromSelect.value };

    addPositionToValue(createdOpt); // ✅ не сбрасываем старые, просто добавляем
    window.dispatchEvent(new Event("tour:task:position:create:success")); // ✅ дёргаем тур
    return res;
  };

  // useEffect(() => {
  //   if (!isEdit) {
  //     dispatch(setDepartmentId(departmentOptions[0]));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dispatch, isEdit]);

  // useEffect(() => {
  //   if (!department_ids || !departmentOptions?.length) return;

  //   // поддержим оба варианта: {value} или просто строка id
  //   const rawId =
  //     typeof department_ids === "string" ? department_ids : department_ids.value;
  //   const match = departmentOptions.find((o) => o.value === rawId);

  //   // если уже есть label — ничего не делаем
  //   if (typeof department_ids === "object" && department_ids.label) return;

  //   if (match) {
  //     dispatch(setDepartmentId(match));
  //   }
  // }, [department_ids, departmentOptions, dispatch]);

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
      .filter(Boolean); // убираем не найденные

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
      .filter(Boolean); // убираем не найденные

    if (mapped.length) {
      dispatch(setPositionIds(mapped));
    }
  }, [position_ids, positionOptions, dispatch]);

  if (!departmentOptions) {
    toast.error("Создайте хотя бы 1 подразделение");
    return;
  }

  return (
    <div className={styles.basicTaskDetails}>
      <div className={styles.row}>
        <div className={styles.section} data-tour="form.tasks.name">
          <p className={styles.label}>Название задачи</p>
          <CustomInput
            name="title"
            placeholder="Название задачи"
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
                Укажите, как исполнитель будет подтверждать выполнение:{" "}
                <strong>фотографией</strong>,{" "}
                <strong>кратким текстовым отчётом</strong> или простой{" "}
                <strong>отметкой о завершении</strong> (чекбоксом)
              </>
            }
          >
            <p className={styles.label}>Тип подтверждения</p>
          </HintWithPortal>
          <CustomSelect
            placeholder="Выберите тип подтверждения"
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
                Укажите, <b>что именно должно быть видно на фото</b>, чтобы ИИ
                смог понять, что задача выполнена. <br />
                <br /> Чем <b>точнее и подробнее</b> вы опишете критерии{" "}
                <small>
                  (что должно быть на снимке, в каком виде, при каких условиях)
                </small>
                , тем <b>лучше система распознает результат</b>.
              </>
            }
          >
            <p className={styles.label}>Критерий приемки</p>
          </HintWithPortal>
          <CustomTextArea
            placeholder={"Критерий приемки"}
            value={ai_prompt}
            onChange={(e) => dispatch(setAcceptCondition(e.target.value))}
          />
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.section} data-tour="form.tasks.dep">
          <p className={styles.label}>Подразделение</p>
          <CustomSelect
            placeholder="Выберите подразделение"
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
          <p className={styles.label}>Должности</p>
          <CustomSelect
            placeholder="Выберите должности"
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
