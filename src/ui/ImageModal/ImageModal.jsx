import { useState, useEffect } from "react";
import {
  // eslint-disable-next-line no-unused-vars
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import { X } from "lucide-react";
import styles from "./ImageModal.module.scss";

export const ImageModal = ({ photoUrl, onClose }) => {
  const y = useMotionValue(0);
  const [isVisible, setIsVisible] = useState(!!photoUrl);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (photoUrl) {
      setIsVisible(true);
      y.set(0);
      setIsAnimatingOut(false);
    }
  }, [photoUrl, y]);

  const closeWithAnimation = (direction) => {
    setIsAnimatingOut(true);

    // уезжает вверх или вниз
    animate(y, direction === "down" ? 500 : -500, {
      type: "spring",
      stiffness: 250,
      damping: 25,
    });

    // выключаем после анимации
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 250);
  };

  const handleDragEnd = (_, info) => {
    const offsetY = info.offset.y;
    const threshold = 120;

    if (Math.abs(offsetY) > threshold) {
      closeWithAnimation(offsetY > 0 ? "down" : "up");
    } else {
      animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {photoUrl && (
        <motion.div
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimatingOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => closeWithAnimation("down")}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Группа картинки + кнопки */}
            <motion.div
              className={styles.imageWrapper}
              drag={window.innerWidth <= 1023 ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              style={{ y }}
              onDragEnd={handleDragEnd}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 30,
                duration: 0.25,
              }}
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: isAnimatingOut ? 0 : 1,
                scale: isAnimatingOut ? 0.95 : 1,
              }}
            >
              <button
                className={styles.modalCloseButton}
                onClick={(e) => {
                  e.stopPropagation();
                  closeWithAnimation("down");
                }}
              >
                <X size={24} />
              </button>

              <img
                src={photoUrl}
                alt="Фотоотчет сотрудника"
                className={styles.modalImage}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
