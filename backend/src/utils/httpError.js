export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message = "Bad Request", details) => new HttpError(400, message, details);
export const unauthorized = (message = "Unauthorized", details) => new HttpError(401, message, details);
export const forbidden = (message = "Forbidden", details) => new HttpError(403, message, details);
export const notFound = (message = "Not Found", details) => new HttpError(404, message, details);

