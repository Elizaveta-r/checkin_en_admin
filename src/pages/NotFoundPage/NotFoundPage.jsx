import styles from "./NotFoundPage.module.scss";

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Анимированный 404 */}
        <div className={styles.numberContainer}>
          <h1 className={styles.mainNumber}>404</h1>
          <div className={styles.numberShadow}>404</div>
        </div>

        {/* Заголовок */}
        <div className={styles.textSection}>
          <h2 className={styles.title}>Страница не найдена</h2>
          <p className={styles.description}>
            Похоже, вы перешли на несуществующий адрес. Эта страница могла быть
            перемещена или удалена.
          </p>
        </div>

        {/* Минималистичный разделитель */}
        <div className={styles.divider}>
          <div className={styles.line}></div>
        </div>

        {/* Кнопка возврата */}
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
            <span>Вернуться назад</span>
          </button>
        </div>

        {/* Минималистичная анимация */}
        <div className={styles.backgroundAnimation}>
          <div className={styles.floatingElement1}></div>
          <div className={styles.floatingElement2}></div>
        </div>
      </div>
    </div>
  );
}
