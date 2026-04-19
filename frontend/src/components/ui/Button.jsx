export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-bold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95 relative overflow-hidden group";

  const sizes = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-2.5",
  };

  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-transparent hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl focus:ring-purple-500/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
    secondary: "bg-white/90 backdrop-blur-sm text-slate-900 border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-md focus:ring-slate-900/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-100/50 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
    ghost: "bg-transparent text-slate-700 border-transparent hover:bg-slate-100/80 hover:text-slate-900 focus:ring-slate-900/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-200/30 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}

