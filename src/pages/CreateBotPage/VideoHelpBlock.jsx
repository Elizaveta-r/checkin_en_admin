import { ArrowRight, PlayCircle } from "lucide-react";
import { useState } from "react";
import styles from "./VideoHelpBlock.module.scss";
import { useMediaQuery } from "react-responsive";

export const VideoHelpBlock = () => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery({
    query: "(max-width: 450px)",
  });

  const handleClick = () => {
    window.open(
      "https://rutube.ru/plst/1303409",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      className={`${styles.videoHelpBlock} ${
        isHovered ? styles.videoHelpBlockHover : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={styles.gradientBg}></div>
      {!isMobile ? (
        <>
          <div className={styles.iconWrapper}>
            <PlayCircle />
          </div>

          <div className={styles.content}>
            <h3 className={styles.title}>📹 Видеоинструкция на RuTube</h3>
            <p className={styles.description}>
              Не понятно по скриншотам? Посмотрите подробное видео с пошаговыми
              инструкциями
            </p>
          </div>

          <div
            className={`${styles.arrow} ${isHovered ? styles.arrowHover : ""}`}
          >
            <ArrowRight />
          </div>
        </>
      ) : (
        <div className={styles.mobileWrapper}>
          <div className={styles.iconWrapper}>
            <PlayCircle />
          </div>

          <div className={styles.content}>
            <h3 className={styles.title}>📹 Видеоинструкция на RuTube</h3>
            <p className={styles.description}>
              Не понятно по скриншотам? Посмотрите подробное видео с пошаговыми
              инструкциями
            </p>
          </div>

          <div
            className={` ${isHovered ? styles.arrowHover : ""} ${
              isMobile ? styles.mobileLink : ""
            }`}
          >
            Перейти в RuTube
            <ArrowRight />
          </div>
        </div>
      )}
    </div>
  );
};
