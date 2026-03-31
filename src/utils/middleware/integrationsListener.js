import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { toggleIntegration } from "../../store/slices/integrationsSlice";
import { toast } from "sonner";

export const integrationsListener = createListenerMiddleware();

let toastId = null;

integrationsListener.startListening({
  matcher: isAnyOf(
    toggleIntegration.pending,
    toggleIntegration.fulfilled,
    toggleIntegration.rejected
  ),
  effect: async (action) => {
    if (action.type.endsWith("pending")) {
      toastId = toast.loading("Сохранение…");
    }

    if (action.type.endsWith("fulfilled")) {
      toast.success("Сохранено", { id: toastId, duration: 1200 });
      toastId = null;
    }

    if (action.type.endsWith("rejected")) {
      toast.error("Ошибка сохранения", { id: toastId });
      toastId = null;
    }
  },
});
