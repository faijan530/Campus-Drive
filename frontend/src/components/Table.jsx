/**
 * Reusable table component with consistent styling.
 * Props:
 *   columns: [{ key, label, render? }]
 *   rows: array of objects
 *   emptyText: string shown when no rows
 *   actions?: (row) => ReactNode
 */
export default function Table({ columns = [], rows = [], emptyText = "No data available.", actions }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-slate-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row._id || i} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 align-top">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right align-top">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
