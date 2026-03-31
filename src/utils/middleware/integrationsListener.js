import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { toggleIntegration } from "../../store/slices/integrationsSlice";
import { toast } from "sonner";

export const integrationsListener = createListenerMiddleware();

let toastId = null;

integrationsListener.startListening({
  matcher: isAnyOf(
    toggleIntegration.pending,
    toggleIntegration.fulfilled,
    toggleIntegration.rejected,
  ),
  effect: async (action) => {
    if (action.type.endsWith("pending")) {
      toastId = toast.loading("Saving…");
    }

    if (action.type.endsWith("fulfilled")) {
      toast.success("Saved", { id: toastId, duration: 1200 });
      toastId = null;
    }

    if (action.type.endsWith("rejected")) {
      toast.error("Save failed", { id: toastId });
      toastId = null;
    }
  },
});
