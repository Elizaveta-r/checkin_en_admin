/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Modal.module.scss";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  isFullWidth,
  footer,
}) => {
  // Анимационные варианты для оверлея (плавное появление и исчезновение)
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  // Анимационные варианты для модального окна (появление с масштабом и сдвигом)
  const modalVariants = {
    hidden: {
      y: "-100vh", // Начинаем за экраном
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      y: "0", // Перемещаем в центр
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring", // Используем пружинный эффект для плавности
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      y: "100vh", // При закрытии уводим вниз
      opacity: 0,
    },
  };

  // Эффект для обработки клавиши Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.backdrop}
      onClick={onClose} // Закрытие по клику на оверлей
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className={`${className} ${styles.modal} `}
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике внутри окна
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3
              className={`${styles.title} ${
                description ? styles.titleTop : ""
              }`}
            >
              {title}
            </h3>
            {description && <p className={styles.description}>{description}</p>}
          </div>

          <button
            style={{ position: isFullWidth ? "absolute" : "" }}
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </motion.div>
    </motion.div>
  );
};

export default Modal;
