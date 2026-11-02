"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-text group-[.toaster]:border-line group-[.toaster]:shadow-xl font-mono text-xs rounded-xl",
          description: "group-[.toast]:text-muted",
          actionButton:
            "group-[.toast]:bg-brand-violet group-[.toast]:text-white font-mono text-xs",
          cancelButton:
            "group-[.toast]:bg-surface-2 group-[.toast]:text-muted font-mono text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
