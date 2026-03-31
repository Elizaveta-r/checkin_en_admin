// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./SliderWithImageAndText.module.scss";
import { ImageModal } from "../ImageModal/ImageModal";

export function SliderWithImageAndText({ mode, steps, className = "" }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [selectedImage, setSelectedImage] = useState(null);

  const index = ((page % steps.length) + steps.length) % steps.length;

  useEffect(() => {
    setPage([0, 0]);
  }, [mode, steps]);

  const scrollToTokenInput = () => {
    const inputElement = document.querySelector("#input-token");
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
      inputElement.focus();
    }
  };

  const paginate = (newDirection) => {
    // Если нажали "вперёд"
    if (newDirection > 0) {
      // Последний слайд + повторный клик → скроллим
      if (mode === "commands" && index === steps.length - 1) {
        scrollToTokenInput();
        return;
      } else if (mode === "interface" && index === steps.length - 1) {
        // Последний слайд + повторный клик → скроллим
        scrollToTokenInput();
        return;
      }
    }

    // Обычное поведение
    setPage([page + newDirection, newDirection]);
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      position: "absolute",
    }),
  };

  return (
    <div className={`${styles.slider} ${className}`}>
      <div className={styles.sliderContent}>
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={styles.step}
          >
            <div
              className={styles.imageWrapper}
              onClick={() => setSelectedImage(steps[index].image)}
            >
              <img
                src={steps[index].image}
                alt={steps[index].title}
                className={styles.image}
              />
            </div>
            <div className={styles.textWrapper}>
              <h3 className={styles.stepTitle}>{steps[index].title}</h3>
              <p className={styles.stepText}>{steps[index].text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ImageModal
        onClose={() => setSelectedImage(null)}
        photoUrl={selectedImage}
      />

      {/* Кнопки */}
      <button
        onClick={() => paginate(-1)}
        className={`${styles.navButton} ${styles.leftButton}`}
        aria-label="Предыдущий шаг"
      >
        <ChevronLeft className={styles.icon} />
      </button>
      <button
        onClick={() => paginate(1)}
        className={`${styles.navButton} ${styles.rightButton}`}
        aria-label="Следующий шаг"
      >
        <ChevronRight className={styles.icon} />
      </button>

      {/* Пагинация */}
      <div className={styles.pagination}>
        {steps.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i === index ? styles.activeDot : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
