import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import styles from "./HintWithPortal.module.scss";

const TOOLTIP_EVENT = "HINT_TOOLTIP_SHOW";

export const HintWithPortal = ({
  children,
  hintContent,
  position = "top",
  hasIcon = true,
  styleHintWrapper,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tappedOnce, setTappedOnce] = useState(false);

  const triggerRef = useRef(null);
  const tapTimeoutRef = useRef(null);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const handleGlobalHint = () => setIsVisible(false);
    window.addEventListener(TOOLTIP_EVENT, handleGlobalHint);
    return () => window.removeEventListener(TOOLTIP_EVENT, handleGlobalHint);
  }, []);

  useEffect(() => {
    return () => clearTimeout(tapTimeoutRef.current);
  }, []);

  const showTooltip = () => {
    window.dispatchEvent(new Event(TOOLTIP_EVENT));
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;

    switch (position) {
      case "top":
        top -= 10;
        left += rect.width / 2;
        break;
      case "bottom":
        top += rect.height + 10;
        left += rect.width / 2;
        break;
      case "left":
        top += rect.height / 2;
        left -= 10;
        break;
      case "right":
        top += rect.height / 2;
        left += rect.width + 10;
        break;
    }

    setTooltipPosition({ top, left });
    setIsVisible(true);
  };

  const hideTooltip = () => setIsVisible(false);

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

  const AnimatedIcon = (
    <div
      ref={triggerRef}
      className={styles.hintTriggerWrapper}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={showTooltip}
    >
      <motion.div
        className={styles.hintIcon}
        whileHover={{
          scale: 1.1,
          rotate: [0, -10, 10, -5, 5, 0],
          transition: {
            duration: 0.6,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          },
        }}
      >
        <CircleAlert size={16} color="#10b981" style={{ cursor: "pointer" }} />
      </motion.div>
    </div>
  );

  let content = null;

  if (hasIcon) {
    content = (
      <div className={styles.hintTarget} style={styleHintWrapper}>
        {children}
        <div ref={triggerRef} className={styles.hintTriggerWrapper}>
          {AnimatedIcon}
        </div>
      </div>
    );
  } else if (React.isValidElement(children)) {
    const originalOnClick = children.props?.onClick;

    content = React.cloneElement(children, {
      ref: triggerRef,
      onClick: (e) => {
        if (isMobile) {
          if (!tappedOnce) {
            e.preventDefault();
            setTappedOnce(true);
            showTooltip();
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = setTimeout(() => {
              setTappedOnce(false);
              hideTooltip();
            }, 3000);
          } else {
            hideTooltip();
            setTappedOnce(false);
            originalOnClick?.(e);
          }
        } else {
          showTooltip();
          originalOnClick?.(e);
        }
      },
      onMouseEnter: () => {
        if (!isMobile) showTooltip();
      },
      onMouseLeave: () => {
        if (!isMobile) hideTooltip();
      },
    });
  } else {
    content = (
      <div ref={triggerRef} className={styles.hintTarget}>
        {children}
      </div>
    );
  }

  return (
    <div className={styles.hintContainer} style={styleHintWrapper}>
      {content}

      {isVisible &&
        createPortal(
          isMobile ? (
            <div
              className={`${styles.hintTooltipPortal} ${styles[position]}`}
              style={{
                position: "absolute",
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                zIndex: 9999,
              }}
            >
              {hintContent}
            </div>
          ) : (
            <motion.div
              className={`${styles.hintTooltipPortal} ${styles[position]}`}
              style={{
                position: "absolute",
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                zIndex: 9999,
              }}
              variants={tooltipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {hintContent}
            </motion.div>
          ),
          document.body
        )}
    </div>
  );
};
