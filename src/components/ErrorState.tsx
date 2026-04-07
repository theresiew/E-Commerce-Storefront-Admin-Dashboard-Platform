import type { ReactNode } from "react";
import { sectionClass } from "../lib/ui";

type ErrorStateProps = {
  title?: string;
  message?: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className={`${sectionClass} grid place-items-center gap-4 border-rose-200 py-16 text-center`}>
      <h3 className="text-2xl font-semibold text-ink-900">{title}</h3>
      <p className="max-w-xl text-sm leading-7 text-ink-500">{message}</p>
      {action}
    </div>
  );
}
