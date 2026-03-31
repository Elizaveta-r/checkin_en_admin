import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { triggerContactAutosave } from "../../store/slices/employeesSlice";
import {
  createEmployeeContact,
  updateEmployeeContact,
} from "../api/actions/employees";

const DEBOUNCE_MS = 700;
let timer = null;
let toastId = null;

export const employeeContactListener = createListenerMiddleware();

employeeContactListener.startListening({
  matcher: isAnyOf(triggerContactAutosave),

  effect: async (action, api) => {
    const contactData = action.payload; // Получаем данные для сохранения

    if (!toastId) toastId = toast.loading("Сохранение контакта...");

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      try {
        let thunkToDispatch;

        if (contactData.contact_id) {
          thunkToDispatch = updateEmployeeContact;
        } else if (contactData.employee_id) {
          thunkToDispatch = createEmployeeContact;
        } else {
          toast.error("Невозможно сохранить: отсутствует ID сотрудника.", {
            id: toastId,
          });
          return;
        }

        const resultPromise = api.dispatch(thunkToDispatch(contactData));
        await resultPromise;

        toast.success("Контакт сохранен", { id: toastId, duration: 1200 });
      } catch (e) {
        console.error("employeeContactListener", e);
        toast.error(e.response.data.message, { id: toastId });
      } finally {
        toastId = null;
        timer = null;
      }
    }, DEBOUNCE_MS);
  },
});
