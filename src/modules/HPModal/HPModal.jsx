import React, { useEffect, useState } from "react";
import styles from "./HPModal.module.scss";

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#f9ca24",
      "#6c5ce7",
      "#a29bfe",
      "#fd79a8",
      "#fdcb6e",
    ];
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 6,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className={styles.confettiContainer}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div
            className={styles.particleInner}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const HPModal = ({ isOpen, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {showConfetti && <Confetti />}

      <div className={styles.overlay}>
        <div className={styles.modal}>
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Закрыть"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Контент */}
          <div className={styles.content}>
            {/* Заголовок */}
            <div className={styles.header}>
              <h2 className={styles.title}>🎉 С Днём Рождения! 🎂</h2>
              <p className={styles.subtitle}>Желаем счастья и успехов!</p>
            </div>

            {/* Место для вертикальной картинки */}
            <div className={styles.imageWrapper}>
              <img
                src="https://i.pinimg.com/736x/d3/9d/72/d39d72d83274f1d9aa0f1b4f30e3afe5.jpg"
                alt="С Днём Рождения"
                className={styles.image}
              />
            </div>

            {/* Поздравительный текст */}
            <div className={styles.textBlock}>
              <p className={styles.mainText}>
                Пусть этот день будет наполнен радостью, смехом и приятными
                сюрпризами!
              </p>
              <p className={styles.secondaryText}>
                Желаем вдохновения, новых достижений и исполнения всех желаний!
                🌟
              </p>
            </div>

            {/* Кнопка */}
            <button onClick={onClose} className={styles.actionButton}>
              Спасибо! 💝
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
