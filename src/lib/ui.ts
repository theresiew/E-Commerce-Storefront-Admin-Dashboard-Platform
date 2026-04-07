export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const shellClass =
  "rounded-[30px] border border-white/60 bg-white/70 shadow-[0_24px_80px_rgba(23,31,52,0.12)] backdrop-blur-xl";

export const sectionClass = `${shellClass} p-5 sm:p-6 lg:p-7`;

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-600 to-mint-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(19,93,102,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(19,93,102,0.28)] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ink-900/10 bg-white/80 px-5 py-3 text-sm font-semibold text-ink-900 transition hover:border-mint-600/30 hover:text-mint-600 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-700 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(190,24,93,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

export const inputClass =
  "w-full rounded-3xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500/70 focus:border-mint-600/40 focus:ring-4 focus:ring-mint-600/10";

export const eyebrowClass =
  "text-[0.72rem] font-black uppercase tracking-[0.28em] text-mint-600";

export const mutedTextClass = "text-sm leading-7 text-ink-500";
