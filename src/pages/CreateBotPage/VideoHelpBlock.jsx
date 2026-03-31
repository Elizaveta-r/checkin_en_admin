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
    window.open("https://youtube.com/", "_blank", "noopener,noreferrer");
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
            <h3 className={styles.title}>📹 Video guide on YouTube</h3>
            <p className={styles.description}>
              Still not clear from the screenshots? Watch the full step-by-step
              video guide.
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
            <h3 className={styles.title}>📹 Video guide on YouTube</h3>
            <p className={styles.description}>
              Still not clear from the screenshots? Watch the full step-by-step
              video guide.
            </p>
          </div>

          <div
            className={` ${isHovered ? styles.arrowHover : ""} ${
              isMobile ? styles.mobileLink : ""
            }`}
          >
            Open on YouTube
            <ArrowRight />
          </div>
        </div>
      )}
    </div>
  );
};
