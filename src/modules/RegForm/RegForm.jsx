/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import styles from "./RegForm.module.scss";
import {
  validateEmail,
  validatePassword,
} from "../../utils/methods/validation";
import { InputAuth } from "../../ui/InputAuth/InputAuth";
import { Button } from "../../ui/Button/Button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PasswordIcon from "../../components/PasswordIcon/PasswordIcon";
import { signUp } from "../../utils/api/actions/user";
import { getEmailName } from "../../utils/methods/getEmailName copy";

export const RegForm = ({ step, setStep }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [viewPassword, setViewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(
    () => [
      { key: "len", text: "Минимум 8 символов", ok: password.length >= 8 },
      { key: "digit", text: "Хотя бы 1 цифра", ok: /\d/.test(password) },
      {
        key: "spec",
        text: "Хотя бы 1 спецсимвол",
        ok: /[^A-Za-z0-9А-Яа-я]/.test(password),
      },
    ],
    [password]
  );

  const allOk = passwordRules.every((r) => r.ok);
  const showError = !!passwordError;

  // автофокус на пароль при step = 1
  useEffect(() => {
    if (step === 1) {
      passwordRef.current?.focus();
    }
  }, [step]);

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  }, []);

  const handleSubmit = useCallback(() => {
    if (step === 0) {
      if (!emailError && email.length > 0) {
        localStorage.setItem("email", email);
        emailRef.current.blur();
        setStep(1);
      } else {
        toast.error("Введите адрес электронной почты");
      }
      return;
    }

    if (!passwordError && password) {
      dispatch(
        signUp(setLoading, navigate, {
          email,
          password,
          userName: getEmailName(email),
        })
      );
    } else {
      toast.error("Введите пароль");
    }
  }, [
    step,
    email,
    password,
    emailError,
    passwordError,
    dispatch,
    navigate,
    setStep,
  ]);

  const handlePrevStep = useCallback(() => setStep(0), [setStep]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={styles.form}>
      <div className={styles.inputs}>
        <InputAuth
          ref={emailRef}
          label="Адрес электронной почты"
          value={email}
          type="email"
          onChange={handleEmailChange}
          onKeyDown={step === 0 ? handleKeyDown : undefined}
          error={emailError}
          readOnly={step === 1}
          rightIcon={
            step === 1 && (
              <div className={styles.rightIcon} onClick={handlePrevStep}>
                Изменить
              </div>
            )
          }
        />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              className={styles.password}
              key="password-input"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <InputAuth
                ref={passwordRef}
                label="Пароль"
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                error={passwordError}
                type={viewPassword ? "text" : "password"}
                rightIcon={
                  <PasswordIcon
                    viewPassword={viewPassword}
                    setViewPassword={setViewPassword}
                  />
                }
              />
              <div className={styles.passwordMeta}>
                <div className={styles.passwordReqTitle}>
                  Требования к паролю:
                </div>

                <ul className={styles.passwordReqList}>
                  {passwordRules.map((r) => (
                    <li
                      key={r.key}
                      className={r.ok ? styles.reqItemOk : styles.reqItemNo}
                    >
                      <span className={styles.reqIcon}>{r.ok ? "✓" : "•"}</span>
                      <span className={styles.reqText}>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        title="Продолжить"
        className={styles.button}
        onClick={handleSubmit}
        loading={loading}
        disabled={
          loading ||
          (step === 0
            ? email.length === 0 || !!emailError
            : password.length === 0 || !!passwordError)
        }
      />
    </div>
  );
};
