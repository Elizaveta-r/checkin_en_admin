import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../modules/AuthForm/AuthForm";
import styles from "./AuthPage.module.scss";
import { TermsLinksAuth } from "../../components/TermsLinksAuth/TermsLinksAuth";

export const AuthPage = () => {
  const navigate = useNavigate();

  const handleGoToRegPage = () => {
    navigate("/reg", {
      replace: true,
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome back</h1>
      <AuthForm />
      <p className={styles.text}>
        Don’t have an account?{" "}
        <span className={styles.link} onClick={handleGoToRegPage}>
          Sign up
        </span>
      </p>
      <TermsLinksAuth />
    </div>
  );
};
