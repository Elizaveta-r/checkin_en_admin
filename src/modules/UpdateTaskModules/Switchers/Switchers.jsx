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
    (state) => state.tasks.draftTask,
  );

  return (
    <div className={styles.switchers} data-tour="form.tasks.switchers">
      <HintWithPortal
        hasIcon={false}
        hintContent={
          <>
            Enable this so the <b>manager also</b> receives notifications about{" "}
            <b>overdue tasks</b>. <br />
            <br /> <small>The employee always receives notifications.</small>
          </>
        }
      >
        <ToggleSwitch
          labelStyle={styles.switcherLabel}
          label="Notify about overdue tasks"
          checked={late_push}
          onChange={() => dispatch(setExpiredNotify(!late_push))}
        />
      </HintWithPortal>

      <HintWithPortal
        hasIcon={false}
        hintContent={
          <>
            Enable this to include the task <b>in the final Telegram report</b>.{" "}
            <br />
            <br />
            <small>It is always shown in the web report.</small>
          </>
        }
      >
        <ToggleSwitch
          labelStyle={styles.switcherLabel}
          label="Include in final report"
          checked={to_report}
          onChange={() => dispatch(setToFinalReport(!to_report))}
        />
      </HintWithPortal>
    </div>
  );
};
