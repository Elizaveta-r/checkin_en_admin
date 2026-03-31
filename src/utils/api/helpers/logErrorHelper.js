import { toast } from "sonner";

export const logPostError = (method = "-", err) => {
  if (err?.response) {
    console.error(method, err.response.data);
    if (err.response.data?.message) toast.error(err.response.data.message);
  } else if (err?.request) {
    console.error(method, err.request);
  } else {
    console.error(method, err?.message);
  }
};
