import {
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import {
  saveSettingsAPI,
  updateSubscription,
} from "../../utils/api/actions/billing";
import { toast } from "sonner";

const safeGet = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

const initialState = {
  wallet: safeGet("wallet"),
  history: safeGet("history"),
  settings: safeGet("settings"), // { id, notify_limit, limit_balance_notify, negative_balance_notify } или null
  // Локальная форма в сторе:
  form: {
    notifyLimitInput: "", // строка для инпута
    limitBalanceNotify: false,
    negativeBalanceNotify: false,
    autoRenewal: false,
  },
  historyMeta: safeGet("history_meta") || {
    page: 0,
    pageSize: 10, // дефолт под твой первый запрос
    hasMore: true,
    loading: false,
  },
  saving: "idle",
  error: null,

  loadingHistory: false,

  tariffs: [],
};

export const saveSettings = createAsyncThunk(
  "billing/saveSettings",
  async (_, { getState, rejectWithValue }) => {
    const { settings, form } = getState().billing;
    if (!settings?.id) return;

    // Парс лимита — как у тебя
    const trimmed = (form.notifyLimitInput ?? "").trim();
    const num = trimmed === "" ? 0 : Number(trimmed.replace(",", "."));
    const notify_limit =
      Number.isFinite(num) && num >= 0 ? Number(num.toFixed(2)) : 0;

    const payload = {
      balance_threshold: String(notify_limit),
      balance_threshold_notify: !!form.limitBalanceNotify,
      balance_negative_notify: !!form.negativeBalanceNotify,
    };

    try {
      await saveSettingsAPI(payload);
      // Обновим settings в сторе и localStorage, чтобы всё было консистентно
      return payload;
    } catch (e) {
      return rejectWithValue(e?.payload?.message || "Ошибка сохранения");
    }
  }
);

export const saveSubscription = createAsyncThunk(
  "billing/saveSubscription",
  async (_, { getState, rejectWithValue }) => {
    const { wallet, form } = getState().billing;
    const sub = wallet?.subscription;

    if (!sub?.id) return;

    const payload = {
      auto_renewal: !!form.autoRenewal,
    };

    try {
      await updateSubscription(payload);

      return payload;
    } catch (e) {
      return rejectWithValue(e?.payload || "Ошибка сохранения");
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    setWallet: (state, action) => {
      state.wallet = action.payload;
      localStorage.setItem("wallet", JSON.stringify(action.payload));

      const sub = action.payload?.subscription;
      if (sub) {
        state.form.autoRenewal = !!sub.auto_renewal;
      }
    },
    setHistory: (state, action) => {
      state.history = Array.isArray(action.payload) ? action.payload : [];
      localStorage.setItem("history", JSON.stringify(state.history));
    },
    setLoadingHistory: (state, action) => {
      state.loadingHistory = action.payload;
    },
    appendHistory: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      const byId = new Set((state.history || []).map((i) => i?.id));
      const merged = (state.history || []).concat(
        incoming.filter((i) => (i?.id ? !byId.has(i.id) : true))
      );
      state.history = merged;
      localStorage.setItem("history", JSON.stringify(state.history));
    },

    // ⬇️ новое: метаданные пагинации
    setHistoryMeta: (state, action) => {
      state.historyMeta = { ...state.historyMeta, ...(action.payload || {}) };
      localStorage.setItem("history_meta", JSON.stringify(state.historyMeta));
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
      localStorage.setItem("settings", JSON.stringify(action.payload));
      // Инициализация формы из settings
      state.form.notifyLimitInput = String(
        action.payload?.balance_threshold ?? 0
      );
      state.form.limitBalanceNotify =
        !!action.payload?.balance_threshold_notify;
      state.form.negativeBalanceNotify =
        !!action.payload?.balance_negative_notify;
    },

    setAutoRenewal: (state, action) => {
      state.form.autoRenewal = action.payload;
    },

    // --- экшены формы
    setNotifyLimitInput: (state, action) => {
      state.form.notifyLimitInput = action.payload;
    },
    setLimitBalanceNotify: (state, action) => {
      state.form.limitBalanceNotify = action.payload;
    },
    setNegativeBalanceNotify: (state, action) => {
      state.form.negativeBalanceNotify = action.payload;
    },
    setTariffs: (state, action) => {
      state.tariffs = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSettings.pending, (state) => {
        state.saving = "pending";
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.saving = "succeeded";
        // Синхронизируем settings с тем, что сохранили
        const { settings } = state;
        if (settings?.id && action.payload) {
          state.settings = {
            id: settings.id,
            balance_threshold: action.payload.balance_threshold,
            balance_threshold_notify: action.payload.balance_threshold_notify,
            balance_negative_notify: action.payload.balance_negative_notify,
          };
          localStorage.setItem("settings", JSON.stringify(state.settings));
        }
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.saving = "failed";
        state.error = action.payload || "Ошибка сохранения";
      })
      .addCase(saveSubscription.fulfilled, (state, action) => {
        if (!state.wallet?.subscription || !action.payload) return;

        state.wallet.subscription.auto_renewal = action.payload.auto_renewal;
        localStorage.setItem("wallet", JSON.stringify(state.wallet));
      });
  },
});

export const {
  setWallet,
  setHistory,
  setLoadingHistory,
  setSettings,
  setAutoRenewal,
  setNotifyLimitInput,
  appendHistory,
  setHistoryMeta,
  setLimitBalanceNotify,
  setNegativeBalanceNotify,
  setTariffs,
} = billingSlice.actions;
export default billingSlice.reducer;
export const billingListener = createListenerMiddleware();

const DEBOUNCE_MS = 700;
let timer = null;
let toastId = null;

billingListener.startListening({
  matcher: isAnyOf(
    setNotifyLimitInput,
    setLimitBalanceNotify,
    setNegativeBalanceNotify
  ),
  effect: async (_action, api) => {
    // Один «Сохранение…» на серию изменений
    if (!toastId) toastId = toast.loading("Сохранение…");

    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await api.dispatch(saveSettings()).unwrap();
        toast.success("Сохранено", { id: toastId, duration: 1200 });
      } catch (e) {
        toast.error(String(e || "Ошибка сохранения"), { id: toastId });
      } finally {
        toastId = null;
        timer = null;
      }
    }, DEBOUNCE_MS);
  },
});

billingListener.startListening({
  matcher: isAnyOf(setAutoRenewal),
  effect: async (_action, api) => {
    if (!toastId) toastId = toast.loading("Сохранение…");

    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await api.dispatch(saveSubscription()).unwrap();
        toast.success("Автопродление обновлено", { id: toastId });
      } catch (e) {
        toast.error(String(e || "Ошибка"), { id: toastId });
      } finally {
        toastId = null;
        timer = null;
      }
    }, DEBOUNCE_MS);
  },
});
