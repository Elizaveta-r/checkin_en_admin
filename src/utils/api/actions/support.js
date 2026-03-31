import { toast } from "sonner";
import { $authHost } from "../http";
import { logPostError } from "../helpers/logErrorHelper";

/**
 * Отправка сообщения в поддержку
 *
 * @param {string} message - Сообщение пользователя
 * @param {string} topic - Тема сообщения
 * @returns {Function} thunk - Redux thunk-функция.
 */
export const sendMessageSupport = (data, setVisible, setLoading) => {
  setLoading(true);
  return async () => {
    try {
      const res = await $authHost.post("/user/support", data);
      if (res.status === 200) {
        toast.success(
          `Сообщение успешно отправлено! \n Мы свяжемся с вами в ближайшее время!`
        );
        setVisible(false);
      }
      return res;
    } catch (error) {
      logPostError("sendMessageSupport", error);
    } finally {
      setLoading(false);
    }
  };
};
