import Button from "./Button.jsx";

export default function Modal({ open, title, description, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 truncate">{title}</div>
                {description ? <div className="mt-1 text-xs text-slate-600">{description}</div> : null}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                Close
              </Button>
            </div>
          </div>

          <div className="px-5 py-4">{children}</div>

          {footer ? <div className="px-5 py-4 border-t border-slate-200">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

