import { useDispatch, useSelector } from "react-redux";
import styles from "./SecuritySection.module.scss";
import { deviceIcons } from "../../utils/renderData/deviceRenderData";
import { Globe, ShieldCheck } from "lucide-react";
import {
  getBrowserInfo,
  getDeviceTypeFromUA,
  parseUA,
} from "../../utils/methods/getBrowser";
import { revokeSession } from "../../utils/api/actions/sessions";
import { useState } from "react";
import PasswordsBlock from "./PasswordsBlock/PasswordsBlock";
import { AnimatePresence } from "framer-motion";
import { RingLoader } from "react-spinners";
import { Button } from "../../ui/Button/Button";
import { ModalDeleteAccount } from "../ModalDeleteAccount/ModalDeleteAccount";

export const SecuritySection = () => {
  const sessions = useSelector((state) => state?.sessions?.data) || [];
  const user_data = useSelector((state) => state?.user?.data);
  const currentSessionId = user_data?.session?.id;

  const [visibleChangePassword, setVisibleChangePassword] = useState(false);
  const [visibleConfirmationDeleteModal, setVisibleConfirmationDeleteModal] =
    useState(false);

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.id === currentSessionId) return -1;
    if (b.id === currentSessionId) return 1;
    return 0;
  });

  const handleVisibleChangePassword = () => {
    setVisibleChangePassword((v) => !v);
  };

  const handleConfirmationDelete = () => {
    setVisibleConfirmationDeleteModal(true);
  };

  const handleCloseConfirmationDelete = () => {
    setVisibleConfirmationDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    return Promise.resolve();
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Безопасность аккаунта</h2>
        <p className={styles.sectionDescription}>
          Контролируйте сессии и пароль — держите безопасность под своим
          управлением.
        </p>
      </div>

      {/* Блок пароля */}
      <div className={styles.passwordBlock}>
        <div className={styles.passwordHeader}>
          <p className={styles.passwordTitle}>Пароль</p>
          <div
            className={styles.passwordAction}
            onClick={handleVisibleChangePassword}
          >
            {visibleChangePassword ? "Скрыть" : "Изменить пароль"}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {visibleChangePassword && (
            <PasswordsBlock setVisible={setVisibleChangePassword} />
          )}
        </AnimatePresence>
      </div>

      {/* Сессии */}
      <div className={styles.sessionsBlock}>
        <p className={styles.sessionsTitle}>Активные сессии</p>
        <div className={styles.sessionsList}>
          {sortedSessions?.length === 0 ? (
            <div className={styles.emptySessions}>
              Активных сессий не найдено
            </div>
          ) : (
            sortedSessions?.map((session) => {
              const isSessionCurrent = session.id === currentSessionId;
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  isSessionCurrent={isSessionCurrent}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Удаление аккаунта */}
      <div className={styles.sessionsBlock}>
        <p className={styles.deleteTitle}>Удаление аккаунта</p>

        <div className={styles.deleteContainer}>
          <p>
            После удаления учётной записи восстановить её уже не получится.
            Пожалуйста, убедитесь, что вы уверены в своём решении.
          </p>
          <Button
            secondary
            className={styles.deleteAccount}
            title="Удалить аккаунт"
            onClick={handleConfirmationDelete}
          />
        </div>
      </div>

      <ModalDeleteAccount
        isOpen={visibleConfirmationDeleteModal}
        handleClose={handleCloseConfirmationDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

const SessionCard = ({ session, isSessionCurrent }) => {
  const dispatch = useDispatch();

  const [isSessionLoading, setIsSessionLoading] = useState(false);

  const type = getDeviceTypeFromUA(session.user_agent);
  const Icon = deviceIcons[type] || deviceIcons.unknown;

  const handleRevokeSession = (sessionId) => {
    dispatch(revokeSession(sessionId, setIsSessionLoading));
  };

  return (
    <div
      className={`${styles.sessionCard} ${
        isSessionCurrent ? styles.active : ""
      }`}
    >
      <div
        className={`${styles.sessionIcon} ${
          isSessionCurrent ? styles.active : ""
        }`}
      >
        <Icon size={20} />
      </div>
      <div className={styles.sessionInfo}>
        <div className={styles.deviceInfo}>
          <p className={styles.deviceName}>{parseUA(session.user_agent)}</p>
          <div
            className={`${
              isSessionCurrent ? styles.currentSession : styles.endSession
            }`}
            onClick={() =>
              !isSessionCurrent ? handleRevokeSession(session.id) : undefined
            }
            role={!isSessionCurrent ? "button" : undefined}
            tabIndex={!isSessionCurrent ? 0 : -1}
          >
            {isSessionCurrent ? (
              <>Текущая</>
            ) : isSessionLoading ? (
              <RingLoader color="#fff" size={10} />
            ) : (
              <>Завершить</>
            )}
          </div>
        </div>
        <div className={styles.sessionDetails}>
          <div className={styles.itemDetails}>
            <div className={styles.itemIcon}>
              <Globe size={14} />
            </div>
            <p className={styles.itemValue}>
              {getBrowserInfo(session.user_agent)}
            </p>
          </div>
          <div className={styles.itemDetails}>
            <div className={styles.itemIcon}>
              <ShieldCheck size={14} />
            </div>
            <p className={styles.itemValue}>{session.ip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
