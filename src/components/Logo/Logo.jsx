import styles from "./Logo.module.scss";

import Logotype from "../../assets/logo.svg";
import { useNavigate } from "react-router-dom";

export default function Logo() {
  const navigate = useNavigate();

  const handleGoHome = () => navigate("/");

  return (
    <div className={styles.logo} onClick={handleGoHome}>
      <div className={styles.imgContainer}>
        <img className={styles.img} src={Logotype} alt="logo" />
      </div>

      {/* <p className={styles.text}>
        24 Check<span className={styles.i}>I</span>n
      </p> */}
    </div>
  );
}
