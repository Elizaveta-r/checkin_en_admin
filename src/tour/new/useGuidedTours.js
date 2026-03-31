// useGuidedTours.js
import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";

function isOnRoute(def, pathname) {
  // Вариант A: route — строка-паттерн (например "/employees/*")
  if (typeof def.route === "string") {
    return !!matchPath({ path: def.route, end: false }, pathname);
  }
  // Вариант B: route — массив путей/паттернов
  if (Array.isArray(def.route)) {
    return def.route.some(
      (r) => !!matchPath({ path: r, end: false }, pathname)
    );
  }
  return false;
}

// ===== Сервисное состояние в localStorage
const LS_KEY = "tours_state_v1";
const DEFAULT_STATE = { version: 1, current: null, completed: {} };

function readState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const s = JSON.parse(raw);
    return s.version === DEFAULT_STATE.version ? s : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}
function writeState(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

// ===== Ожидание появления селекторов в DOM
function waitForSelectors(selectors = [], timeoutMs = 10000) {
  if (!selectors.length) return Promise.resolve();

  const allPresent = () =>
    selectors.every((sel) => document.querySelector(sel));
  if (allPresent()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error("Timeout waiting selectors: " + selectors.join(", ")));
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      if (allPresent()) {
        clearTimeout(timer);
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// ===== Главный хук
export function useGuidedTours(registry, order) {
  const navigate = useNavigate();
  const location = useLocation();

  const driversRef = useRef({}); // { [id]: Driver }
  const isUnmountingRef = useRef(false); // защита от StrictMode двойного mount/unmount
  const stateRef = useRef(readState()); // локальный кэш состояния

  const isPrimary = useRef(false);
  useEffect(() => {
    if (window.__TOURS_PRIMARY__) return; // уже есть «главный»
    window.__TOURS_PRIMARY__ = true;
    isPrimary.current = true;
    return () => {
      if (isPrimary.current) delete window.__TOURS_PRIMARY__;
    };
  }, []);

  const save = (patch) => {
    stateRef.current = { ...stateRef.current, ...patch };
    writeState(stateRef.current);
  };

  const completeTour = (id) => {
    if (isUnmountingRef.current) return;
    const completed = { ...stateRef.current.completed, [id]: true };
    const next = order.find((x) => !completed[x]) || null;
    save({ completed, current: next });
    if (next) {
      const nextDef = registry[next];
      if (nextDef?.route && !isOnRoute(nextDef, location.pathname)) {
        const entry = Array.isArray(nextDef.route)
          ? nextDef.route[0]
          : nextDef.entryRoute || nextDef.route;
        navigate(entry);
      }
    }
  };

  // вычисляем текущий тур: либо задан в state, либо первый незавершённый
  const currentId = useMemo(() => {
    const s = stateRef.current;
    if (s.current) return s.current;
    const next = order.find((id) => !s.completed[id]) || null;
    if (next !== s.current) save({ current: next });
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const allDone =
    order.length > 0 && order.every((id) => !!stateRef.current.completed[id]);
  if (allDone) {
    save({ current: null }); /* и просто выходим */
  }

  // запуск/перезапуск соответствующего тура при смене route или currentId
  useEffect(() => {
    if (!isPrimary.current) return;
    if (!currentId) return; // всё пройдено
    const def = registry[currentId];
    if (!def) return;

    // если не на нужной странице — переходим
    if (!isOnRoute(def, location.pathname)) {
      const entry = Array.isArray(def.route)
        ? def.route[0]
        : def.entryRoute || def.route;
      navigate(entry);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await waitForSelectors(def.readySelectors || []);
        if (cancelled) return;

        // создаём driver один раз и переиспользуем
        let drv = driversRef.current[currentId];
        if (!drv) {
          const raw = localStorage.getItem(LS_KEY);
          const snap = raw ? JSON.parse(raw) : null;

          // Позволяем форс-старт (флажок или query-параметр)
          const force =
            localStorage.getItem("start_tour") === "true" ||
            new URLSearchParams(location.search).get("tour") === "on";

          // ВАЖНО: учитываем пустой order
          const allDoneLS =
            Array.isArray(order) &&
            order.length > 0 &&
            order.every((id) => !!snap?.completed?.[id]);

          if (allDoneLS && !force) return;
          // если форс-стартовали — почистим флаг, чтобы не зациклиться
          if (force) localStorage.removeItem("start_tour");

          // создаём через фабрику и пробрасываем контекст
          drv = def.create({
            complete: () => completeTour(currentId),
          });
          driversRef.current[currentId] = drv;
        }

        // стартуем с нулевого шага (при желании можно хранить индекс шага)
        drv.drive(0);
      } catch {
        // селекторы не дождались — молча выходим (можно логировать)
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, location.pathname]);

  // общий cleanup — корректно разрушает инстансы, не помечая тур завершённым
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      Object.values(driversRef.current).forEach((drv) => {
        try {
          drv && drv.destroy && drv.destroy();
        } catch {
          console.error("driver destroy error");
        }
      });
    };
  }, []);
}

// ===== Хелперы для отладки
export function resetTours() {
  writeState({ ...DEFAULT_STATE });
}
export function completeAllTours(order) {
  const completed = Object.fromEntries(order.map((id) => [id, true]));
  writeState({ version: DEFAULT_STATE.version, current: null, completed });
}
