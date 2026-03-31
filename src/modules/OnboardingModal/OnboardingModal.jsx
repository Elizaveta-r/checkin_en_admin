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
        <Modal isOpen={isOpen} onClose={onClose} title="Great! 🎉">
          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              <p className={styles.text}>
                Your bot is now ready to receive reports from your employees —
                <strong> text</strong>, <strong>photos</strong>, and{" "}
                <strong>task completion confirmations</strong>. It can also
                review them automatically using{" "}
                <strong>artificial intelligence</strong>.
              </p>
              <div className={styles.steps}>
                <p className={styles.title}>Just a few simple steps left:</p>
                <ol className={styles.list}>
                  <li className={styles.item}>
                    Add <strong>tasks</strong> for your employees.
                  </li>
                  <li className={styles.item}>
                    If needed, add <strong>departments</strong> to represent
                    your business structure — teams, branches, or locations.
                  </li>
                  <li className={styles.item}>Assign tasks to them.</li>
                </ol>
              </div>

              <p className={styles.text}>
                To help you get started faster, we’ve prepared a
                <strong> short onboarding guide</strong>. You can go through it
                now — or skip it and start using the platform on your own. 🚀
              </p>
              {isMobile && (
                <p className={`${styles.text} ${styles.warn}`}>
                  The onboarding guide is only available on desktop or tablet.
                  📱❌ Please open it on another device.
                </p>
              )}
            </div>
            {!isMobile && (
              <div className={styles.actions}>
                <Button
                  title={"Start onboarding"}
                  className={styles.confirm}
                  onClick={onConfirm}
                  secondary
                  loading={loading}
                />

                <Button
                  secondary
                  title={"I’ll figure it out myself"}
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
