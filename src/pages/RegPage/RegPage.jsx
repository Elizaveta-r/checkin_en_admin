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
          <h3 className={styles.title}>Verify your email</h3>
          <p className={styles.desc}>Enter the code from the email</p>
        </div>
      ) : (
        <h1 className={styles.title}>Create an account</h1>
      )}

      <RegForm step={step} setStep={setStep} />

      {step < 2 && (
        <p className={styles.text}>
          Already have an account?{" "}
          <span className={styles.link} onClick={handleGoToAuthPage}>
            Sign in
          </span>
        </p>
      )}
      <TermsLinksAuth />
    </div>
  );
};
