/* eslint-disable no-useless-escape */
import { useEffect, useState } from "react";
import styles from "./PasswordsBlock.module.scss";
import { EyeSlashIcon } from "../../../assets/icons/EyeSlashIcon";
import { EyeIcon } from "../../../assets/icons/EyeIcon";
import { InputAuth } from "../../../ui/InputAuth/InputAuth";
import { useDispatch } from "react-redux";
import { changePassword } from "../../../utils/api/actions/user";
import { RingLoader } from "react-spinners";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const PW_REGEX =
  /^(?=.*[A-Za-zА-Яа-я])(?=.*\d)[A-Za-zА-Яа-я\d!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|`~]{8,}$/;

const validateField = (name, value, allValues) => {
  switch (name) {
    case "currentPwd":
      if (!value) return "Введите текущий пароль";
      if (allValues.newPwd && value === allValues.newPwd) {
        return "Новый пароль не должен совпадать со старым";
      }
      return "";
    case "newPwd":
      if (!value) return "Введите новый пароль";
      if (!PW_REGEX.test(value)) return "Минимум 8 символов, буквы и цифры";
      if (allValues.currentPwd && value === allValues.currentPwd) {
        return "Новый пароль не должен совпадать со старым";
      }
      return "";
    case "confirmPwd":
      if (!value) return "Повторите новый пароль";
      if (value !== allValues.newPwd) return "Пароли не совпадают";
      return "";
    default:
      return "";
  }
};

export default function PasswordsBlock({ setVisible }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    currentPwd: "",
    newPwd: "",
    confirmPwd: "",
    errors: {
      currentPwd: "",
      newPwd: "",
      confirmPwd: "",
    },
    show: {
      currentPwd: false,
      newPwd: false,
      confirmPwd: false,
    },
  });
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (name) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      const err = validateField(name, value, updated);
      return {
        ...updated,
        errors: { ...prev.errors, [name]: err },
      };
    });
  };

  const toggleShow = (name) => {
    setForm((prev) => ({
      ...prev,
      show: { ...prev.show, [name]: !prev.show[name] },
    }));
  };

  const isSubmitAllowed =
    !pending &&
    form.currentPwd &&
    form.newPwd &&
    form.confirmPwd &&
    !form.errors.currentPwd &&
    !form.errors.newPwd &&
    !form.errors.confirmPwd;

  const onSubmitPassword = () => {
    if (!isSubmitAllowed) return;

    dispatch(
      changePassword(
        { old_password: form.currentPwd, new_password: form.newPwd },
        setPending,
        setSuccess
      )
    );
  };

  useEffect(() => {
    if (success) {
      setForm({
        currentPwd: "",
        newPwd: "",
        confirmPwd: "",
        errors: { currentPwd: "", newPwd: "", confirmPwd: "" },
        show: { currentPwd: false, newPwd: false, confirmPwd: false },
      });
      setSuccess(false);
      setVisible(false);
    }
  }, [success, setVisible]);

  // animations

  const collapse = {
    open: { height: "auto", opacity: 1, marginTop: 12 },
    collapsed: { height: 0, opacity: 0, marginTop: 0 },
  };

  const fadeStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: 0.05,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const fadeItem = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 480, damping: 32 },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  };

  return (
    <motion.div
      key="pwd-wrap"
      initial="collapsed"
      animate="open"
      exit="collapsed"
      variants={collapse}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden" }} // <-- важно
      className={styles.passwordInputsWrapper} // внешний обёртчик (без внутренних паддингов)
    >
      <motion.div
        className={styles.passwordInputs}
        variants={fadeStagger}
        initial="hidden"
        animate="show"
        exit="exit"
        key="pwd-block"
      >
        <motion.div variants={fadeItem} key="cur">
          <InputAuth
            label="Текущий пароль"
            type={form.show.currentPwd ? "text" : "password"}
            value={form.currentPwd}
            onChange={handleChange("currentPwd")}
            error={form.errors.currentPwd}
            rightIcon={
              <div
                className={styles.iconBlock}
                onClick={() => toggleShow("currentPwd")}
              >
                {form.show.currentPwd ? (
                  <EyeSlashIcon size={15} fill="#000" />
                ) : (
                  <EyeIcon size={15} fill="#000" />
                )}
              </div>
            }
            containerStyle={styles.inputContainer}
            wrapperStyle={styles.inputWrapper}
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
          />
        </motion.div>

        <motion.div variants={fadeItem} key="new">
          <InputAuth
            label="Новый пароль"
            type={form.show.newPwd ? "text" : "password"}
            value={form.newPwd}
            onChange={handleChange("newPwd")}
            error={form.errors.newPwd}
            rightIcon={
              <div
                className={styles.iconBlock}
                onClick={() => toggleShow("newPwd")}
              >
                {form.show.newPwd ? (
                  <EyeSlashIcon size={15} fill="#000" />
                ) : (
                  <EyeIcon size={15} fill="#000" />
                )}
              </div>
            }
            containerStyle={styles.inputContainer}
            wrapperStyle={styles.inputWrapper}
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
          />
        </motion.div>

        <motion.div variants={fadeItem} key="conf">
          <InputAuth
            label="Подтверждение пароля"
            type={form.show.confirmPwd ? "text" : "password"}
            value={form.confirmPwd}
            onChange={handleChange("confirmPwd")}
            error={form.errors.confirmPwd}
            rightIcon={
              <div
                className={styles.iconBlock}
                onClick={() => toggleShow("confirmPwd")}
              >
                {form.show.confirmPwd ? (
                  <EyeSlashIcon size={15} fill="#000" />
                ) : (
                  <EyeIcon size={15} fill="#000" />
                )}
              </div>
            }
            containerStyle={styles.inputContainer}
            wrapperStyle={styles.inputWrapper}
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
          />
        </motion.div>

        <motion.div variants={fadeItem} key="btn">
          <div className={styles.passwordActions}>
            <div
              className={styles.primaryBtn}
              role="button"
              aria-disabled={!isSubmitAllowed || pending}
              data-disabled={!isSubmitAllowed || pending}
              onClick={onSubmitPassword}
            >
              {pending ? (
                <RingLoader color="#fff" size={14} />
              ) : (
                "Сменить пароль"
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
