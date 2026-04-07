import { sectionClass } from "../lib/ui";

type LoadingStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({
  title = "Loading data",
  message = "Please wait while we prepare your view.",
}: LoadingStateProps) {
  return (
    <div className={`${sectionClass} grid place-items-center gap-4 py-16 text-center`}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-mint-600/15 border-t-mint-600" />
      <h3 className="text-2xl font-semibold text-ink-900">{title}</h3>
      <p className="max-w-xl text-sm leading-7 text-ink-500">{message}</p>
    </div>
  );
}
