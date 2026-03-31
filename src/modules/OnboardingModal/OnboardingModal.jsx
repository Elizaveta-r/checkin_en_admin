import React from "react";
import { Button } from "../../ui/Button/Button";
import styles from "./OnboardingModal.module.scss";
import { AnimatePresence } from "motion/react";
import Modal from "../../ui/Modal/Modal";
import { useMediaQuery } from "react-responsive";

export const OnboardingModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 767px)",
  });
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Отлично! 🎉">
          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              <p className={styles.text}>
                Теперь бот готов принимать отчёты от ваших сотрудников —{" "}
                <strong>текст</strong>, <strong>фото</strong> и{" "}
                <strong>отметки о выполнении задач</strong>. Он сможет
                автоматически проверять их с помощью{" "}
                <strong>искусственного интеллекта</strong>.
              </p>
              <div className={styles.steps}>
                <p className={styles.title}>
                  Осталось сделать всего несколько простых шагов:
                </p>
                <ol className={styles.list}>
                  <li className={styles.item}>
                    Добавить <strong>задачи</strong> для сотрудников.
                  </li>
                  <li className={styles.item}>
                    При необходимости добавить <strong>подразделения</strong>{" "}
                    вашего бизнеса — отделы, филиалы или команды.
                  </li>
                  <li className={styles.item}>
                    Распределить задачи между ними.
                  </li>
                </ol>
              </div>

              <p className={styles.text}>
                Чтобы быстрее разобраться, как это работает, мы подготовили
                <strong>короткое обучение</strong>. Вы можете пройти его прямо
                сейчас — или пропустить и начать работу самостоятельно. 🚀
              </p>
              {isMobile && (
                <p className={`${styles.text} ${styles.warn}`}>
                  Обучение доступно только на компьютере или планшете. 📱❌
                  Пожалуйста, зайдите с другого устройства.
                </p>
              )}
            </div>
            {!isMobile && (
              <div className={styles.actions}>
                <Button
                  title={"Начать обучение"}
                  className={styles.confirm}
                  onClick={onConfirm}
                  secondary
                  loading={loading}
                />

                <Button
                  secondary
                  title={"Разберусь сам(-а)"}
                  className={styles.cancel}
                  onClick={onClose}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
