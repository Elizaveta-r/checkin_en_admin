import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmployeesList } from "../../utils/api/actions/employees";
import { getDepartmentsList } from "../../utils/api/actions/departments";
import { getPositionsList } from "../../utils/api/actions/positions";
import { selectIsLoggedIn } from "../../store/slices/userSlice";
import AppTours from "../../tour/new/AppTours";
import { getUserWallet } from "../../utils/api/actions/billing";
import Snowfall from "react-snowfall";
// import { HPModal } from "../../modules/HPModal/HPModal";

export const PageLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);
  // const userData = useSelector((state) => state?.user?.data);

  // const [visibleHPModal, setVisibleHPModal] = useState(false);

  const [startTour, setStartTour] = useState(false);

  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  // useEffect(() => {
  //   if (!userData?.user?.id) return;
  //   if (userData?.user?.id === "bf6b0fce-74bd-4df2-9720-28ccc78b0052") {
  //     setVisibleHPModal(true);
  //   }
  // }, [userData?.user.id]);

  useEffect(() => {
    const checkIntegrations = () => {
      const value = localStorage.getItem("hasIntegrations");
      if (value === "no") {
        navigate("/create-bot");
      }
    };

    // проверяем при монтировании
    checkIntegrations();

    // слушаем, если изменилось в другом месте (например, после логина)
    window.addEventListener("storage", checkIntegrations);

    return () => window.removeEventListener("storage", checkIntegrations);
  }, [navigate]);

  useEffect(() => {
    const checkStartTour = () => {
      const value = sessionStorage.getItem("start_tour");
      if (value === "true") {
        setStartTour(true);
      }
    };

    // проверяем при монтировании
    checkStartTour();

    // слушаем, если изменилось в другом месте (например, после логина)
    window.addEventListener("storage", checkStartTour);

    return () => window.removeEventListener("storage", checkStartTour);
  }, [navigate]);

  useEffect(() => {
    const onAllFinished = () => setStartTour(false);

    // на всякий случай синхронизируемся с текущим значением в storage
    onAllFinished();

    window.addEventListener("tour:all:finished", onAllFinished);

    return () => {
      window.removeEventListener("tour:all:finished", onAllFinished);
    };
  }, []);

  useEffect(() => {
    const off = () => setStartTour(false);
    window.addEventListener("tour:all:finished", off);
    return () => window.removeEventListener("tour:all:finished", off);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getEmployeesList(1, 1000));
      dispatch(getDepartmentsList(1, 1000));
      dispatch(getPositionsList(1, 1000));
      dispatch(getUserWallet());
    }
  }, [dispatch, isLoggedIn]);

  const raw = localStorage.getItem("tours_state_v1");
  let allCompleted = false;
  try {
    const st = JSON.parse(raw || "null");
    allCompleted =
      !!st?.completed &&
      ["departments", "positions", "tasks", "employees"].every(
        (k) => st.completed[k],
      );
  } catch {
    //
  }

  return (
    <BaseLayout>
      <Header />
      {/* <div
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      > */}
      {/* <Snowfall snowflakeCount={300} color="#06B5D46A" /> */}
      {/* </div> */}

      {/* <HPModal
        isOpen={visibleHPModal}
        onClose={() => setVisibleHPModal(false)}
      /> */}
      <div
        className={styles.layout}
        style={{ paddingBottom: isMobile && "75px" }}
      >
        {startTour && !allCompleted && <AppTours />}
        <div className={styles.leftMenu}>{!isMobile && <LeftMenu />}</div>
        <div className={`${styles.children} `}>
          {children ? children : <Outlet />}
        </div>
      </div>
    </BaseLayout>
  );
};
