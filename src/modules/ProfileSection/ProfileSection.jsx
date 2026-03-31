import styles from "./ProfileSection.module.scss";
import { useSelector } from "react-redux";
import { CircleCheck, PencilLine } from "lucide-react";
import { useState } from "react";
import { ModalChangeUsername } from "../ModalChangeUsername/ModalChangeUsername";

export const ProfileSection = () => {
  const { user_data } = useSelector((state) => state?.user);

  const [visibleModalChangeName, setVisibleModalChangeName] = useState(false);

  const handleOpenModalChangeName = () => {
    setVisibleModalChangeName(true);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Profile Information</h2>
        <p className={styles.sectionDescription}>
          Basic information about your account
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <div className={styles.valueGroup}>
            <div className={styles.value}>{user_data.username}</div>
            <button
              className={styles.editButton}
              onClick={handleOpenModalChangeName}
            >
              <PencilLine className={styles.editIcon} />
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email Address</label>
          <div className={styles.valueGroup}>
            <div className={styles.value}>{user_data.email}</div>
            <div className={styles.verificationStatus}>
              {user_data.verified && (
                <>
                  <CircleCheck className={styles.verifiedIcon} />
                  <span className={styles.verifiedText}>Verified</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalChangeUsername
        isOpen={visibleModalChangeName}
        onClose={() => setVisibleModalChangeName(false)}
      />
    </div>
  );
};
