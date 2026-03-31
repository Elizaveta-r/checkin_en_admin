// src/store/middleware/sessionStorageMiddleware.js

const SESSION_STORAGE_KEY = "draftTask";

// Middleware для сохранения draftTask в Session Storage после каждого изменения
export const sessionStorageMiddleware = (store) => (next) => (action) => {
  // Получаем предыдущее состояние
  const prevState = store.getState().tasks.draftTask;

  // Передаем действие дальше по цепочке (обновляем Redux)
  const result = next(action);

  // Получаем новое состояние
  const nextState = store.getState().tasks.draftTask;

  // Проверяем, изменился ли draftTask (простое сравнение ссылок)
  if (prevState !== nextState) {
    try {
      const serializedState = JSON.stringify(nextState);
      sessionStorage.setItem(SESSION_STORAGE_KEY, serializedState);
    } catch (e) {
      console.warn("Ошибка при сохранении draftTask в Session Storage:", e);
      // Можно добавить логику для очистки, если хранилище переполнено
    }
  }

  return result;
};
