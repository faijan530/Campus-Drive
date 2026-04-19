/**
 * Badge – skill-level or status indicator
 * variant: "level" | "status" | "tech"
 */
const levelColors = {
  Beginner: "bg-amber-50 text-amber-700 border border-amber-200",
  Intermediate: "bg-blue-50 text-blue-700 border border-blue-200",
  Advanced: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const statusColors = {
  "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "On Hold": "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function Badge({ label, variant = "tech", className = "" }) {
  let colorClass = "bg-slate-100 text-slate-700 border border-slate-200";

  if (variant === "level" && levelColors[label]) colorClass = levelColors[label];
  else if (variant === "status" && statusColors[label]) colorClass = statusColors[label];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
