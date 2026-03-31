/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import styles from "./AuthLayout.module.scss";
import { motion } from "framer-motion";
import { useEffect } from "react";

export const AuthLayout = ({ children }) => {
  const navigate = useNavigate();
  const handleGoToAuth = () => {
    navigate("/auth");
  };

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;

    document.body.style.backgroundColor = "#ffffff";

    return () => {
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  return (
    <div className={styles.layout}>
      <div className={styles.logo} onClick={handleGoToAuth}>
        {/* <Logo /> */}
      </div>
      <motion.div
        className={styles.children}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};
