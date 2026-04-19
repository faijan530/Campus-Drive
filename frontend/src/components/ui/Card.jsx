export default function Card({ className = "", children }) {
  return (
    <div 
      className={`bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

