import styles from "./TermsLinksAuth.module.scss";

export const TermsLinksAuth = () => {
  return (
    <div className={styles.links}>
      <a href="https://checkin-en.vercel.app/terms-of-use" target="_blank">
        Terms of Use
      </a>
      <div className={styles.line}></div>
      <a href="https://checkin-en.vercel.app/privacy" target="_blank">
        Privacy Policy
      </a>
    </div>
  );
};
