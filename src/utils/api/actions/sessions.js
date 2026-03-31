import { setSessions } from "../../../store/slices/sessionsSlice";
import { $authHost } from "../http";

export const getSessions = () => {
  return async (dispatch) => {
    await $authHost
      .get("/user/session/list")
      .then((res) => {
        if (res.status === 200) {
          dispatch(setSessions(res.data.sessions));
          localStorage.setItem(
            "sessions_data",
            JSON.stringify(res.data.sessions)
          );
        }
      })
      .catch((err) => {
        if (err.response) {
          console.error(err.response.data);
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      });
  };
};

export const revokeSession = (session_id, setLoading) => {
  setLoading(true);
  return async (dispatch) => {
    await $authHost
      .post("/user/session/revoke", { session_id })
      .then((res) => {
        if (res.status === 200) {
          dispatch(getSessions());
          return res.data;
        } else {
          return Promise.reject(new Error("Ошибка при завершении сессии"));
        }
      })
      .catch((err) => {
        if (err.response) {
          console.error(err.response.data);
          return Promise.reject(err.response.data);
        } else {
          if (err.request) {
            console.error(err.request);
            return Promise.reject("Сервер не ответил");
          } else {
            console.error(err.message);
            return Promise.reject(err.message);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
};
