/**
 * ProfileStrengthBar – displays profile completeness percentage
 */
function getStrengthLabel(pct) {
  if (pct >= 80) return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-700" };
  if (pct >= 50) return { label: "Moderate", color: "bg-amber-400", text: "text-amber-700" };
  return { label: "Needs Work", color: "bg-slate-400", text: "text-slate-600" };
}

export default function ProfileStrengthBar({ strength = 0 }) {
  const pct = Math.min(100, Math.max(0, strength));
  const { label, color, text } = getStrengthLabel(pct);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Strength</span>
        <span className={`text-xs font-bold ${text}`}>
          {pct}% · {label}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
