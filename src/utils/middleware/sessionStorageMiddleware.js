const SESSION_STORAGE_KEY = "draftTask";

export const sessionStorageMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState().tasks.draftTask;

  const result = next(action);

  const nextState = store.getState().tasks.draftTask;

  if (prevState !== nextState) {
    try {
      const serializedState = JSON.stringify(nextState);
      sessionStorage.setItem(SESSION_STORAGE_KEY, serializedState);
    } catch (e) {
      console.warn("Failed to save draftTask to Session Storage:", e);
    }
  }

  return result;
};
