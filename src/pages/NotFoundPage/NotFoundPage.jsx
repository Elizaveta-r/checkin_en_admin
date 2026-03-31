import styles from "./NotFoundPage.module.scss";

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.numberContainer}>
          <h1 className={styles.mainNumber}>404</h1>
          <div className={styles.numberShadow}>404</div>
        </div>

        <div className={styles.textSection}>
          <h2 className={styles.title}>Page not found</h2>
          <p className={styles.description}>
            It looks like you followed a broken or outdated link. This page may
            have been moved or removed.
          </p>
        </div>

        <div className={styles.divider}>
          <div className={styles.line}></div>
        </div>

        <div className={styles.buttonSection}>
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            <svg
              className={styles.backIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Go back</span>
          </button>
        </div>

        <div className={styles.backgroundAnimation}>
          <div className={styles.floatingElement1}></div>
          <div className={styles.floatingElement2}></div>
        </div>
      </div>
    </div>
  );
}
