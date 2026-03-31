import { useNavigate } from "react-router-dom";

import styles from "./Header.module.scss";
import { LogoutIcon } from "../../assets/icons/LogoutIcon";
import { Button } from "../../ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { Headset, Menu, Settings } from "lucide-react";
import { useState } from "react";
import Logo from "../Logo/Logo";
import { revokeSession } from "../../utils/api/actions/sessions";
import { logout } from "../../store/slices/userSlice";
import { MobileLeftMenu } from "../MobileLeftMenu/MobileLeftMenu";
import { SupportModal } from "../../modules/SupportModal/SupportModal";

export const Header = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = useSelector((state) => state?.user?.data);

  const sessionId = userData?.session?.id;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleSupportModal, setVisibleSupportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    try {
      await dispatch(revokeSession(sessionId, setLoading));
    } catch (error) {
      console.warn("Сессия уже завершена или не найдена:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      dispatch(logout());
      navigate("/auth", { replace: true });
    }
  };

  const handleSignIn = () => {
    navigate("/auth", { replace: true });
  };

  const handleGoHome = () => navigate("/");
  const handleGoToSettings = () => navigate("/settings");
  const handleOpenHelp = () => {
    setIsMenuOpen(false);
    setVisibleSupportModal(true);
  };

  const handleCloseSupportModal = () => {
    setVisibleSupportModal(false);
  };

  return (
    <div className={`${styles.header} ${isMobile ? styles.mobile : ""}`}>
      <div className={styles.logo} onClick={handleGoHome}>
        <Logo />
      </div>

      <SupportModal
        isOpen={visibleSupportModal}
        onClose={handleCloseSupportModal}
      />

      {isMobile ? (
        <MobileLeftMenu
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          handleOpenHelp={handleOpenHelp}
        />
      ) : (
        <div className={styles.block}>
          {!isMobile && (
            <Button
              leftIcon={<Headset size={16} strokeWidth={1.7} />}
              title={"Помогите настроить"}
              className={`${styles.supportButton}`}
              onClick={handleOpenHelp}
              secondary={true}
            />
          )}
          <div className={styles.buttons}>
            <div className={styles.settings} onClick={handleGoToSettings}>
              <Settings size={24} strokeWidth={1.5} />
            </div>
          </div>

          <Button
            leftIcon={userData && <LogoutIcon size={15} fill={"#fff"} />}
            title={userData ? "Выйти" : "Войти"}
            className={styles.logoutButton}
            loading={loading}
            onClick={userData ? handleLogOut : handleSignIn}
          />
        </div>
      )}

      {isMobile && (
        <Button
          leftIcon={<Headset size={16} strokeWidth={1.7} />}
          title={"Помощь"}
          className={`${styles.supportButton}`}
          onClick={handleOpenHelp}
          secondary={true}
        />
      )}
    </div>
  );
};
