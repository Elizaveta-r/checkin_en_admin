/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { CircleAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Импортируем Framer Motion
import styles from "./Hint.module.scss";

/**
 * Компонент-обертка, добавляющий иконку подсказки справа от элемента.
 * При наведении на иконку появляется всплывающее окно.
 * * @param {React.ReactNode} children - Оборачиваемый компонент.
 * @param {React.ReactNode} hintContent - Содержимое подсказки (текст, картинки, шаги).
 * @param {string} position - Позиция всплывающего окна ('top', 'right', 'left', 'bottom'). По умолчанию 'top'.
 */
const Hint = ({
  children,
  hintContent,
  position = "top",
  hasIcon = true,
  isCentered = false,
  isMaxWidth,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // 1. Анимационные варианты для всплывающего окна
  const tooltipVariants = {
    initial: { opacity: 0, y: 5, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    exit: { opacity: 0, y: 5, scale: 0.95 },
  };

  // 2. Иконка с анимацией при наведении
  const AnimatedIcon = (
    <motion.div
      whileHover={{
        scale: 1.1,
        rotate: [0, -10, 10, -5, 5, 0],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      }}
      className={styles.hintIcon}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <CircleAlert size={16} color="#10b981" style={{ cursor: "pointer" }} />
    </motion.div>
  );

  return (
    <div
      className={styles.hintContainer}
      style={{ justifyContent: isCentered ? "center" : "flex-start" }}
    >
      {hasIcon ? (
        <div className={styles.hintTarget}>
          {children}
          <div className={styles.hintTriggerWrapper}>
            {AnimatedIcon}

            {/* 3. Оборачиваем тултип в AnimatePresence */}
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  className={`${styles.hintTooltip} ${styles[position]}`}
                  variants={tooltipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {hintContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div
          className={styles.hintTarget}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}

          {/* 3. Оборачиваем тултип в AnimatePresence */}
          <AnimatePresence>
            {isVisible && (
              <motion.div
                className={`${styles.hintTooltip} ${styles[position]} ${
                  isMaxWidth ? styles.maxWidth : ""
                }`}
                variants={tooltipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {hintContent}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Hint;
