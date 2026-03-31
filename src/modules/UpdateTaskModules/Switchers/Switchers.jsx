import styles from "./Switchers.module.scss";
import ToggleSwitch from "../../../ui/ToggleSwitch/ToggleSwitch";
import { useDispatch, useSelector } from "react-redux";
import {
  setExpiredNotify,
  setToFinalReport,
} from "../../../store/slices/tasksSlice";
import { HintWithPortal } from "../../../ui/HintWithPortal/HintWithPortal";

export const Switchers = () => {
  const dispatch = useDispatch();

  const { late_push, to_report } = useSelector(
    (state) => state.tasks.draftTask
  );

  return (
    <div className={styles.switchers} data-tour="form.tasks.switchers">
      <HintWithPortal
        hasIcon={false}
        hintContent={
          <>
            Включите, чтобы <b>руководитель тоже</b> получал уведомления о{" "}
            <b>просрочках</b>. <br />
            <br /> <small>Сотрудник получает уведомления всегда.</small>
          </>
        }
      >
        <ToggleSwitch
          labelStyle={styles.switcherLabel}
          label="Уведомить о просрочке"
          checked={late_push}
          onChange={() => dispatch(setExpiredNotify(!late_push))}
        />
      </HintWithPortal>

      <HintWithPortal
        hasIcon={false}
        hintContent={
          <>
            Включите, чтобы добавить задачу <b>в итоговый отчёт в Телеграм</b>.{" "}
            <br />
            <br />
            <small>В веб-отчёте она отображается всегда.</small>
          </>
        }
      >
        <ToggleSwitch
          labelStyle={styles.switcherLabel}
          label="В итоговый отчет"
          checked={to_report}
          onChange={() => dispatch(setToFinalReport(!to_report))}
        />
      </HintWithPortal>
    </div>
  );
};
