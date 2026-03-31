import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import CodeInput from "../../ui/CodeInput/CodeInput";
import styles from "./CodeVerifyPage.module.scss";
import { Button } from "../../ui/Button/Button";
import { codeVerify } from "../../utils/api/actions/user";

const RESEND_COOLDOWN = 60;
const LS_KEY = "resend_code_available_at";

export const CodeVerifyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loadingCode } = useSelector((state) => state?.auth);

  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  const email = localStorage.getItem("email");

  useEffect(() => {
    const ts = Number(localStorage.getItem(LS_KEY) || 0);
    const now = Date.now();
    const left = Math.max(0, Math.ceil((ts - now) / 1000));
    setCooldown(left);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const armCooldown = () => {
    const availableAt = Date.now() + RESEND_COOLDOWN * 1000;
    localStorage.setItem(LS_KEY, String(availableAt));
    setCooldown(RESEND_COOLDOWN);
  };

  const handleCodeComplete = (completeCode) => {
    dispatch(codeVerify(navigate, { email, code: completeCode }, setSuccess));
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleClick = () => {
    if (success) {
      navigate("/auth");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    if (!email) return;

    try {
      // await dispatch(getNewCode({ email })).unwrap();
      armCooldown();
    } catch {
      armCooldown();
    }
  };

  return (
    <div className={styles.container}>
      {!success && (
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>Verify your email</h3>
          <p className={styles.desc}>Enter the code from the email</p>
        </div>
      )}

      {!success && (
        <CodeInput
          length={6}
          value={code}
          onComplete={handleCodeComplete}
          onChange={handleCodeChange}
          loading={loadingCode}
        />
      )}

      {!success && (
        <div className={styles.resendRow}>
          <span className={styles.resendHint}>Didn’t get the code?</span>
          <div
            onClick={handleResend}
            className={`${styles.resendButton} ${
              cooldown > 0 || loadingCode ? styles.disabled : ""
            }`}
          >
            {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend code"}
          </div>
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <p className={styles.successTitle}>Code verified!</p>
          <p className={styles.successText}>
            You can now click the button below and sign in again using your
            password.
          </p>
        </div>
      )}

      {success && (
        <Button
          title={"Sign in"}
          onClick={handleClick}
          className={styles.button}
        />
      )}
    </div>
  );
};
