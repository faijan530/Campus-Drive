import { HttpError } from "../utils/httpError.js";

export function errorHandler(err, _req, res, _next) {
  const status = err instanceof HttpError ? err.status : 500;
  const body = {
    error: {
      message: status === 500 ? "Internal Server Error" : err.message,
    },
  };
  if (err instanceof HttpError && err.details) body.error.details = err.details;
  if (process.env.NODE_ENV !== "production") {
    body.error.debug = { name: err?.name, stack: err?.stack };
  }
  res.status(status).json(body);
}

