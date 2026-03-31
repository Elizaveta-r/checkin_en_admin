import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectIsLoggedIn } from "../../store/slices/userSlice";
import styles from "./BaseLayout.module.scss";
// import AppTours from "../../tour/new/AppTours";

export const BaseLayout = ({ children }) => {
  // const isSuccessReg = sessionStorage.getItem("success_registration");
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    // sessionStorage.removeItem("success_registration");
    return <Navigate to="/auth" replace />;
  }

  // if (isSuccessReg && isLoggedIn) {
  //   sessionStorage.removeItem("success_registration");
  //   return <Navigate to="/create-bot" replace />;
  // }

  return <div className={styles.layout}>{children}</div>;
};
