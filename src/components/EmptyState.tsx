import type { ReactNode } from "react";
import { sectionClass } from "../lib/ui";

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className={`${sectionClass} grid place-items-center gap-4 py-16 text-center`}>
      <h3 className="text-2xl font-semibold text-ink-900">{title}</h3>
      <p className="max-w-xl text-sm leading-7 text-ink-500">{message}</p>
      {action}
    </div>
  );
}
