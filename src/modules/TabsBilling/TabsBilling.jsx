/* eslint-disable no-unused-vars */
import { useMemo } from "react";
import styles from "./TabsBilling.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Overview } from "./components/Overview/Overview";
import { History } from "./components/History/History";

const TABS = [
  {
    label: "Обзор",
    slug: "overview",
    Component: Overview,
    preload: () => import("./components/Overview/Overview"),
  },
  {
    label: "История операций",
    slug: "history",
    Component: History,
    preload: () => import("./components/History/History"),
  },
];

export const TabsBilling = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabSlug = searchParams.get("tab") || "overview";

  const activeTabIndex = useMemo(() => {
    const i = TABS.findIndex((t) => t.slug === currentTabSlug);
    return i === -1 ? 0 : i;
  }, [currentTabSlug]);

  const handleTabClick = (index) => {
    setSearchParams({ tab: TABS[index].slug }, { replace: true });
  };

  const Active = TABS[activeTabIndex].Component;

  return (
    <div className={styles.tabsBilling}>
      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <div
            key={tab.slug}
            className={`${styles.tab} ${
              i === activeTabIndex ? styles.active : ""
            }`}
            onClick={() => handleTabClick(i)}
            onMouseEnter={() => tab.preload?.()} // префетч чанка по ховеру
            onFocus={() => tab.preload?.()}
          >
            {tab.label}
            {i === activeTabIndex && <div className={styles.underline} />}
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={TABS[activeTabIndex].slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={styles.tabContent}
          >
            <Active />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
