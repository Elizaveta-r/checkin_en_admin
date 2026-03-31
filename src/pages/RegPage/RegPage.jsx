import { useNavigate } from "react-router-dom";
import { RegForm } from "../../modules/RegForm/RegForm";
import styles from "./RegPage.module.scss";
import { useState } from "react";
import { TermsLinksAuth } from "../../components/TermsLinksAuth/TermsLinksAuth";

export const RegPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const handleGoToAuthPage = () => {
    navigate("/auth", {
      replace: true,
    });
  };

  return (
    <div className={styles.container}>
      {step === 2 ? (
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>Подтвердите почту</h3>
          <p className={styles.desc}>Введите код, полученный в письме</p>
        </div>
      ) : (
        <h1 className={styles.title}>Создание учетной записи</h1>
      )}

      <RegForm step={step} setStep={setStep} />

      {step < 2 && (
        <p className={styles.text}>
          Уже есть учетная запись?{" "}
          <span className={styles.link} onClick={handleGoToAuthPage}>
            Войти
          </span>
        </p>
      )}
      <TermsLinksAuth />
    </div>
  );
};
