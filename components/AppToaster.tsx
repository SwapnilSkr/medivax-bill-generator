"use client";

import { Toaster } from "sonner";

/** Fixed viewport toasts — sits below sticky app headers (~4.5rem). */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      duration={4000}
      offset="4.75rem"
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border !border-border/60 !bg-background/95 !text-foreground !shadow-lg backdrop-blur-sm",
          title: "!text-sm !font-medium",
          description: "!text-sm !text-muted-foreground",
          closeButton:
            "!border-border/60 !bg-background !text-foreground hover:!bg-muted",
        },
      }}
    />
  );
}
