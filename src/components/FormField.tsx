import type { ReactNode } from "react";
import { cn, eyebrowClass } from "../lib/ui";

type FormFieldProps = {
  label: string;
  error?: ReactNode;
  hint?: ReactNode;
  htmlFor: string;
  children: ReactNode;
};

export function FormField({
  label,
  error,
  hint,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <label className="grid gap-2" htmlFor={htmlFor}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink-900">{label}</span>
        {hint ? <small className={cn(eyebrowClass, "tracking-[0.18em] text-ink-500")}>{hint}</small> : null}
      </div>
      <div className="[&>input]:w-full [&>input]:rounded-3xl [&>input]:border [&>input]:border-ink-900/10 [&>input]:bg-white [&>input]:px-4 [&>input]:py-3 [&>input]:text-sm [&>input]:text-ink-900 [&>input]:outline-none [&>input]:transition [&>input]:placeholder:text-ink-500/70 [&>input]:focus:border-mint-600/40 [&>input]:focus:ring-4 [&>input]:focus:ring-mint-600/10 [&>select]:w-full [&>select]:rounded-3xl [&>select]:border [&>select]:border-ink-900/10 [&>select]:bg-white [&>select]:px-4 [&>select]:py-3 [&>select]:text-sm [&>select]:text-ink-900 [&>select]:outline-none [&>select]:transition [&>select]:focus:border-mint-600/40 [&>select]:focus:ring-4 [&>select]:focus:ring-mint-600/10 [&>textarea]:w-full [&>textarea]:rounded-3xl [&>textarea]:border [&>textarea]:border-ink-900/10 [&>textarea]:bg-white [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-sm [&>textarea]:text-ink-900 [&>textarea]:outline-none [&>textarea]:transition [&>textarea]:placeholder:text-ink-500/70 [&>textarea]:focus:border-mint-600/40 [&>textarea]:focus:ring-4 [&>textarea]:focus:ring-mint-600/10">
        {children}
      </div>
      {error ? <span className="text-sm font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
