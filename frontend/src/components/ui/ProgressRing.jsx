export default function ProgressRing({ value = 0, size = 96, stroke = 10, label, sublabel }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="text-slate-200"
            stroke="currentColor"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="text-emerald-600"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-extrabold text-slate-900">{v}%</div>
          {label ? <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{label}</div> : null}
        </div>
      </div>
      <div className="min-w-0">
        {sublabel ? <div className="text-xs text-slate-600">{sublabel}</div> : null}
      </div>
    </div>
  );
}

