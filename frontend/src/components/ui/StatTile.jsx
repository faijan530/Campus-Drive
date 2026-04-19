export default function StatTile({ title, value, meta, tone = "neutral" }) {
  const toneClass =
    tone === "green"
      ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900"
      : tone === "amber"
        ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-900"
        : "bg-white border-slate-200 text-slate-900";

  const valueClass =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : "text-slate-900";

  return (
    <div className={`rounded-xl border ${toneClass} p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <div className={`text-2xl font-extrabold ${valueClass}`}>{value}</div>
        {meta ? <div className="text-xs font-semibold text-slate-600">{meta}</div> : null}
      </div>
    </div>
  );
}

