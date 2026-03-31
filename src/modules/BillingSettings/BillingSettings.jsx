import React, { useEffect } from "react";
import styles from "./BillingSettings.module.scss";
import ToggleSwitch from "../../ui/ToggleSwitch/ToggleSwitch";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { useDispatch, useSelector } from "react-redux";
import { getWalletSettings } from "../../utils/api/actions/billing";
import {
  setLimitBalanceNotify,
  setNegativeBalanceNotify,
  setNotifyLimitInput,
} from "../../store/slices/billingSlice";
import CustomInput from "../../ui/CustomInput/CustomInput";
import { HintComponent } from "../../components/HintComponent/HintComponent";

export const BillingSettings = () => {
  const dispatch = useDispatch();

  const { settings, form } = useSelector((s) => s.billing);

  const settingsId = settings?.id;

  const parsedInvalid = (() => {
    const t = (form.notifyLimitInput ?? "").trim();
    if (t === "") return false;
    const v = Number(t.replace(",", "."));
    return !(Number.isFinite(v) && v >= 0);
  })();

  useEffect(() => {
    dispatch(getWalletSettings());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.title}>Settings</p>
        <p className={styles.description}>
          Manage wallet notification settings and balance thresholds.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.toggleContainer}>
          <HintComponent
            hasIcon
            text={"Notify me about a low balance"}
            hint={`You will receive an email if your balance drops below the specified amount.`}
          />
          <ToggleSwitch
            checked={form.limitBalanceNotify}
            onChange={(v) => dispatch(setLimitBalanceNotify(v))}
            disabled={!settingsId}
            label={form.limitBalanceNotify ? "Enabled" : "Disabled"}
          />
        </div>

        {form.limitBalanceNotify && (
          <div className={styles.inputBlock}>
            <HintComponent
              hasIcon
              text={"Minimum balance for notifications"}
              hint={`An email will be sent when your balance reaches this amount.`}
            />
            <CustomInput
              type="text"
              inputMode="decimal"
              value={form.notifyLimitInput}
              onChange={(e) => dispatch(setNotifyLimitInput(e.target.value))}
              placeholder="00.00 ₽"
              aria-invalid={parsedInvalid}
              disabled={!settingsId}
            />
            <div
              className={`${styles.inputContainer} ${
                !settingsId ? styles.disabled : ""
              }`}
            ></div>
          </div>
        )}

        {/* <div className={`${styles.toggleContainer} ${styles.autoRenewal}`}>
          <HintComponent
            hasIcon
            text={"Auto-renewal"}
            hint={`Funds will be charged automatically from your balance`}
          />
          <ToggleSwitch
            checked={form.autoRenewal}
            onChange={(v) => dispatch(setAutoRenewal(v))}
            label={form.autoRenewal ? "Enabled" : "Disabled"}
          />
        </div> */}
        <div className={styles.toggleContainer}>
          <HintComponent
            hasIcon
            text={"Notify me about a negative balance"}
            hint={`You will receive an email if your balance becomes negative.`}
          />
          <ToggleSwitch
            checked={form.negativeBalanceNotify}
            onChange={(v) => dispatch(setNegativeBalanceNotify(v))}
            disabled={!settingsId}
            label={form.negativeBalanceNotify ? "Enabled" : "Disabled"}
          />
        </div>
      </div>
    </div>
  );
};
