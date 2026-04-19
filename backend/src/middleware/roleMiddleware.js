import { forbidden } from "../utils/httpError.js";

export function requireRole(...allowed) {
  const set = new Set(allowed);
  return (req, _res, next) => {
    if (!req.auth?.role || !set.has(req.auth.role)) return next(forbidden("Insufficient role"));
    return next();
  };
}

