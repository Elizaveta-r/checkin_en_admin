import { toast } from "sonner";
import {
  appendHistory,
  setHistory,
  setHistoryMeta,
  setLoadingHistory,
  setSettings,
  setTariffs,
  setWallet,
} from "../../../store/slices/billingSlice";
import { logPostError } from "../helpers/logErrorHelper";
import { $authHost } from "../http";

export const getUserWallet = () => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(`/billing/wallet`);
      dispatch(setWallet(res.data.wallet));
      return res;
    } catch (error) {
      console.error("getUserWallet", error);
      throw error;
    }
  };
};

export const getTariffList = (page = 1, pageSize = 100) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/billing/tariff/list?page=${page}&page_size=${pageSize}`
      );
      if (res.status === 200) {
        dispatch(setTariffs(res.data.tariffs));
        return res;
      }
    } catch (error) {
      logPostError("refillBalance", error);
      throw error;
    }
  };
};

export const getTariff = ({ paramType, param }) => {
  return async () => {
    try {
      if (!paramType || !param) throw new Error("paramType/param required");

      const qs = new URLSearchParams({
        param_type: paramType, // "id" | "code"
        param: String(param),
      }).toString();

      const res = await $authHost(`/billing/tariff?${qs}`); // или $authHost.get(...)
      return res;
    } catch (error) {
      console.error("getTariff", error);
      throw error;
    }
  };
};

export const topUpBalance = (data, setLoading) => {
  setLoading(true);
  return async () => {
    await $authHost
      .post("/billing/order", data)
      .then((res) => {
        if (res.status === 200) {
          window.location.href = res.data.order.payment_link;
          return res.data;
        }
      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message);
          console.error(err.response.data);
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      })
      .finally(() => setLoading(false));
  };
};

export const getWalletSettings = () => {
  return async (dispatch) => {
    await $authHost
      .get("/billing/wallet/settings")
      .then((res) => {
        if (res.status === 200) {
          dispatch(setSettings(res.data.wallet_settings));
          return res.data;
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

export async function saveSettingsAPI(data, { signal } = {}) {
  try {
    const res = await $authHost.put("/billing/wallet/settings", data, {
      signal,
    });
    return res.data;
  } catch (err) {
    // нормализуем ошибку и выбрасываем наверх — UI покажет тост
    const payload = err?.response?.data ?? err?.message ?? "Request failed";
    const e = new Error(
      typeof payload === "string" ? payload : "Request failed"
    );
    e.payload = payload;
    e.code = err?.response?.status;
    throw e;
  }
}

export const getHistory = ({
  page = 1,
  pageSize = 10,
  append = false,
} = {}) => {
  return async (dispatch, getState) => {
    const { billing } = getState();
    const meta = billing?.historyMeta || {};

    // анти-дубль запросов
    if (meta.loading) return;

    dispatch(setLoadingHistory(true));
    dispatch(setHistoryMeta({ loading: true }));

    await $authHost
      .get("/billing/wallet/history", { params: { page, page_size: pageSize } })
      .then((res) => {
        if (res.status === 200) {
          // сервер может вернуть разные ключи — нормализуем
          const payload = res.data || {};
          const items = Array.isArray(payload.wallet_history)
            ? payload.wallet_history
            : Array.isArray(payload.history)
            ? payload.history
            : Array.isArray(payload.data)
            ? payload.data
            : [];

          // если сервер (пока) возвращает только { wallet }, будет []
          const safeItems = Array.isArray(items) ? items : [];

          const prevItems = append ? billing?.history || [] : [];
          const totalLoaded = prevItems.length + safeItems.length;
          const hasMore = totalLoaded < res.data.total_count;

          if (append) {
            dispatch(appendHistory(safeItems));
          } else {
            dispatch(setHistory(safeItems));
          }

          dispatch(
            setHistoryMeta({
              page,
              pageSize,
              hasMore,
              loading: false,
            })
          );
        }
      })
      .catch((err) => {
        dispatch(setHistoryMeta({ loading: false }));
        if (err.response) console.error(err.response.data);
        else if (err.request) console.error(err.request);
        else console.error(err.message);
      })
      .finally(() => {
        dispatch(setLoadingHistory(false));
      });
  };
};

/**
 * Покупка тарифа
 * @param {{ tariff_id: string, employees_plus: number }} data
 */
export const buyTariff = (data) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.post(`/billing/tariff/buy`, data);
      dispatch(getHistory(1, 4));
      return res;
    } catch (error) {
      logPostError("buyTariff", error);
      throw error;
    }
  };
};

/**
 * Обновление подписки
 * @param {{ employees_count: number, employees_action: string, auto_renewal: boolean }} data
 */
export const updateSubscription = (data) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.put(`/billing/subscription`, data);
      dispatch(getUserWallet());
      dispatch(getHistory(1, 4));
      return res;
    } catch (error) {
      logPostError("", error);
      throw error;
    }
  };
};
