import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./UpdateTaskPage.module.scss";
import { resetDraftTask } from "../../store/slices/tasksSlice";
import { useNavigate } from "react-router-dom";
import CancelButton from "../../ui/CancelButton/CancelButton";
import { Button } from "../../ui/Button/Button";
import {
  BasicTaskDetails,
  FrequencySelector,
  Switchers,
} from "../../modules/UpdateTaskModules";
import { createTask, updateTask } from "../../utils/api/actions/tasks";

export default function UpdateTaskPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isEdit, draftTask, loadingTask } = useSelector(
    (state) => state?.tasks,
  );

  let disposableDateString = null;

  const handleCancel = () => {
    navigate(-1);
    dispatch(resetDraftTask());
  };

  const handleConfirm = () => {
    if (draftTask?.onetime_date) {
      const isoString = draftTask?.onetime_date;
      disposableDateString = isoString.split("T")[0];
    }

    window.dispatchEvent(new CustomEvent("tour:tasks:submit:clicked"));

    const taskDataToSend = {
      ...draftTask,
      time_type: draftTask?.task_type.value,
      week_days: draftTask?.week_days?.map((d) => d.value),
      department_id: draftTask?.department_id?.value,
      done_type: draftTask?.done_type.value,
      onetime_date: disposableDateString,
      department_ids: draftTask?.department_ids?.map((p) => p.value),
      position_ids: draftTask?.position_ids?.map((p) => p.value),
    };

    const taskDataToEdit = {
      ...draftTask,
      task_id: draftTask?.id,
      time_type: draftTask?.task_type.value,
      week_days: draftTask?.week_days?.map((d) => d.value),
      department_id: draftTask?.department_id?.value,
      done_type: draftTask?.done_type.value,
      onetime_date: disposableDateString,
      department_ids: draftTask?.department_ids?.map((p) => p.value),
      position_ids: draftTask?.position_ids?.map((p) => p.value),
    };

    if (draftTask.done_type.value !== "photo") {
      delete taskDataToEdit.photo_need;
      delete taskDataToEdit.photo_required;
    }

    if (isEdit) {
      dispatch(updateTask(taskDataToEdit)).then((res) => {
        if (res.status === 200) {
          handleCancel();
        }
      });
    } else {
      dispatch(createTask(taskDataToSend))
        .then((res) => {
          if (res.status === 200) {
            window.dispatchEvent(new CustomEvent("tour:tasks:submit:success"));
            handleCancel();
          } else {
            window.dispatchEvent(new CustomEvent("tour:tasks:submit:fail"));
          }
        })
        .catch(() => {
          window.dispatchEvent(new CustomEvent("tour:tasks:submit:fail"));
        });
    }
  };

  return (
    <div className={styles.page}>
      <PageTitle title={isEdit ? "Edit Task" : "New Task"} />
      <BasicTaskDetails />
      <FrequencySelector />

      <Switchers />

      <div className={styles.actions}>
        <CancelButton className={styles.cancelButton} onClick={handleCancel} />
        <Button
          secondary
          onClick={handleConfirm}
          title={isEdit ? "Save" : "Add"}
          dataTour="form.tasks.submit"
          loading={loadingTask}
        />
      </div>
    </div>
  );
}
