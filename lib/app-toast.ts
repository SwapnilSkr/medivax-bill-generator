import { toast } from "sonner";

const TOAST_DURATION_MS = 4000;

export function appToast(type: "success" | "error", message: string) {
  const options = { duration: TOAST_DURATION_MS };
  if (type === "success") {
    toast.success(message, options);
  } else {
    toast.error(message, options);
  }
}

export function appToastError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: description ? 6000 : TOAST_DURATION_MS,
  });
}
