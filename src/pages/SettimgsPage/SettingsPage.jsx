import { useEffect, useRef, useState } from "react";
import styles from "./SettingsPage.module.scss";
import { useDispatch } from "react-redux";
import { getSessions } from "../../utils/api/actions/sessions";
import { SettingsNav } from "../../modules/SettingsNav/SettingsNav";
import { ProfileSection } from "../../modules/ProfileSection/ProfileSection";
import { SecuritySection } from "../../modules/SecuritySection/SecuritySection";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import PageTitle from "../../components/PageTitle/PageTitle";

export const SettingsPage = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("profile");

  const hasFetchedSessions = useRef(false);

  useEffect(() => {
    if (!hasFetchedSessions.current) {
      dispatch(getSessions());
      hasFetchedSessions.current = true;
    }
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <PageTitle
        title="Settings"
        description={"Manage your account and preferences"}
      />

      <div className={styles.content}>
        <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className={styles.mainContent}>
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSection />
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <SecuritySection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
