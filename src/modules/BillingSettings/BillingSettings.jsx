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
        <p className={styles.title}>Настройки</p>
        <p className={styles.description}>
          Управление параметрами уведомлений и лимитов кошелька.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.toggleContainer}>
          <HintComponent
            hasIcon
            text={"Уведомлять о низком балансе"}
            hint={`Вам на почту придёт письмо, если баланс опустится ниже указанной суммы.`}
          />
          <ToggleSwitch
            checked={form.limitBalanceNotify}
            onChange={(v) => dispatch(setLimitBalanceNotify(v))}
            disabled={!settingsId}
            label={form.limitBalanceNotify ? "Включено" : "Отключено"}
          />
        </div>

        {form.limitBalanceNotify && (
          <div className={styles.inputBlock}>
            <HintComponent
              hasIcon
              text={"Минимальный баланс для уведомления"}
              hint={`Сумма, при достижении которой будет отправляться письмо.`}
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
            text={"Автопродление"}
            hint={`С вашего баланса автоматически будут списываться средства`}
          />
          <ToggleSwitch
            checked={form.autoRenewal}
            onChange={(v) => dispatch(setAutoRenewal(v))}
            label={form.autoRenewal ? "Включено" : "Отключено"}
          />
        </div> */}
        <div className={styles.toggleContainer}>
          <HintComponent
            hasIcon
            text={"Уведомлять об отрицательном балансе"}
            hint={`На почту придёт письмо, если баланс станет отрицательным.`}
          />
          <ToggleSwitch
            checked={form.negativeBalanceNotify}
            onChange={(v) => dispatch(setNegativeBalanceNotify(v))}
            disabled={!settingsId}
            label={form.negativeBalanceNotify ? "Включено" : "Отключено"}
          />
        </div>
      </div>
    </div>
  );
};
