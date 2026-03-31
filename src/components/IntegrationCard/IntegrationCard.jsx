import { Check, Copy, Eye, EyeOff, PencilLine, Trash } from "lucide-react";
import { TelegramIcon } from "../../assets/icons/TelegramIcon";
import styles from "./IntegrationCard.module.scss";
import { useDispatch } from "react-redux";
import ToggleSwitch from "../../ui/ToggleSwitch/ToggleSwitch";
import { useState } from "react";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { copyToClipboard } from "../../utils/methods/copyToClipboard";
import { toggleIntegration } from "../../store/slices/integrationsSlice";
import { useMediaQuery } from "react-responsive";

const maskToken = (token) => {
  if (!token || token.length <= 6) return token; // короткие не трогаем
  const start = token.slice(0, 4);
  const end = token.slice(-2);
  const middle = "*".repeat(token.length - 6);
  return `${start}${middle}${end}`;
};

export const IntegrationCard = ({ integration, onUpdate, onDelete }) => {
  const dispatch = useDispatch();

  const isMobile = useMediaQuery({
    query: "(max-width: 1100px)",
  });

  const [isIntegrationActive] = useState(integration.is_active);
  const [visibleToken, setVisibleToken] = useState(false);
  const [localActive, setLocalActive] = useState(integration.is_active);
  const [isCopying, setIsCopying] = useState(false);

  const handleUpdate = () => {
    onUpdate(integration);
  };

  const handleToggleToken = () => {
    setVisibleToken(!visibleToken);
  };

  const handleToggleChange = () => {
    const newStatus = !localActive;
    setLocalActive(newStatus); // оптимистично
    dispatch(toggleIntegration({ id: integration.id, newStatus }))
      .unwrap()
      .catch(() => setLocalActive(!newStatus)); // откат при ошибке
  };

  const handleCopy = () => {
    setIsCopying(true);
    copyToClipboard(integration.perpetual_token);
    setTimeout(() => {
      setIsCopying(false);
    }, 1500);
  };

  return (
    <div className={styles.card}>
      {isMobile && <div className={styles.headerAccent} />}
      {isMobile ? (
        <div className={styles.cardMobile}>
          <div className={styles.cardIcon}>
            <TelegramIcon size={25} fill={"#27a7e7"} />
          </div>

          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <i>
                <p className={styles.cardName}>{integration.title}</p>
              </i>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.cardIcon}>
            <TelegramIcon size={25} fill={"#27a7e7"} />
          </div>

          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <i>
                <p className={styles.cardName}>{integration.title}</p>
              </i>
            </div>

            {/* <StatusPill
          isActive={integration.is_active}
          className={styles.status}
        /> */}
          </div>
        </>
      )}

      {/* <p className={styles.description}>
        {integration.description || "Описание отсутствует"}
      </p> */}

      {/* <div className={styles.cardInfo}> */}
      <div className={styles.info}>
        {isMobile ? (
          <p className={styles.token}>
            {visibleToken
              ? integration.perpetual_token
              : maskToken(integration.perpetual_token)}
          </p>
        ) : (
          <HintWithPortal
            styleHintWrapper={{ width: "max-content" }}
            hintContent="Ваш токен бота"
            isCentered
            hasIcon={false}
          >
            <p className={styles.token}>
              {visibleToken
                ? integration.perpetual_token
                : maskToken(integration.perpetual_token)}
            </p>
          </HintWithPortal>
        )}
        <div className={styles.actions}>
          <HintWithPortal
            hasIcon={false}
            hintContent={`${visibleToken ? "Скрыть" : "Показать"} токен`}
          >
            <div className={styles.toggleToken} onClick={handleToggleToken}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  className={styles.icon}
                  key={visibleToken ? "off" : "on"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {visibleToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </HintWithPortal>
          <HintWithPortal
            hasIcon={false}
            hintContent={`Кликните, чтобы скопировать`}
          >
            <div
              className={styles.toggleToken}
              onClick={() => handleCopy(integration.perpetual_token)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  className={styles.icon}
                  key={isCopying ? "off" : "on"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {isCopying ? <Check size={14} /> : <Copy size={14} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </HintWithPortal>
        </div>
      </div>
      {/* <div className={styles.info}>
          <p className={styles.type}>
            {getIntegrationTypeLabel(integration.integration_type)}
          </p>
          <p className={styles.use}>{getUseTypeLabel(integration.use_type)}</p>
        </div> */}
      {/* </div> */}

      <div className={styles.cardActions}>
        <HintWithPortal
          hasIcon={isMobile ? true : false}
          hintContent={
            isMobile
              ? `Когда бот выключен — он не получает и не отвечает на сообщения. \n\n Включите его, чтобы снова принимать обращения пользователей.`
              : `${isIntegrationActive ? "Выключить" : "Включить"} интеграцию`
          }
        >
          <ToggleSwitch
            label={isMobile && (isIntegrationActive ? "Включен" : "Выключен")}
            togglePosition="left"
            checked={localActive}
            onChange={handleToggleChange}
          />
        </HintWithPortal>
        <div className={styles.edit} onClick={handleUpdate}>
          <PencilLine size={16} />
        </div>
        <div className={styles.trash} onClick={onDelete}>
          <Trash size={16} />
        </div>
      </div>
    </div>
  );
};
