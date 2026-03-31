import styles from "./TermsLinksAuth.module.scss";
// import { Link } from "react-router-dom";

export const TermsLinksAuth = () => {
  return (
    <div className={styles.links}>
      <a href="https://24checkin.ru/terms-of-use" target="_blank">
        Условия использования
      </a>
      {/* <Link to={"/terms-of-use"}></Link> */}
      <div className={styles.line}></div>
      <a href="https://24checkin.ru/privacy" target="_blank">
        Политика конфиденциальности
      </a>
      {/* <Link to={"/privacy-policy"}>Политика конфиденциальности</Link> */}
    </div>
  );
};
