import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

import { authRoutes } from "./routes/auth.routes.js";

import { testRoutes } from "./routes/test.routes.js";
import { resultRoutes } from "./routes/result.routes.js";
import { proctoringRoutes } from "./routes/proctoring.routes.js";
import { profileRoutes } from "./routes/profile.routes.js";
import { collabRoutes } from "./routes/collaboration.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { teacherRoutes } from "./routes/teacher.routes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: function(origin, callback){
         return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "5mb" }));

  morgan.token('status-col', (req, res) => {
    const status = res.statusCode;
    const color = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
    return `\x1b[${color}m${status}\x1b[0m`;
  });
  
  morgan.token('method-col', (req) => {
    const color = req.method === 'GET' ? 32 : req.method === 'POST' ? 33 : req.method === 'DELETE' ? 31 : 34;
    return `\x1b[${color};1m${req.method.padEnd(6, ' ')}\x1b[0m`;
  });

  const professionalLog = (tokens, req, res) => {
    return [
      `\x1b[90m[${tokens.date(req, res, 'iso')}]\x1b[0m`,
      `\x1b[36m[Backend]\x1b[0m`,
      tokens['method-col'](req, res),
      tokens.url(req, res).padEnd(30, ' '),
      `\x1b[90m→\x1b[0m`,
      tokens['status-col'](req, res),
      `\x1b[90m|\x1b[0m`,
      `\x1b[33m${(tokens['response-time'](req, res) || '0').padStart(6, ' ')} ms\x1b[0m`,
      `\x1b[90m|\x1b[0m`,
      `${(tokens.res(req, res, 'content-length') || '-').padStart(5, ' ')} B`
    ].join(' ');
  };

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : professionalLog, {
    skip: (req, res) => req.url.includes("/api/collab/conversations/unread-count")
  }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);

  app.use("/api/test", testRoutes);
  app.use("/api/result", resultRoutes);
  app.use("/api/proctoring", proctoringRoutes);

  // Student Identity & Profile System
  app.use("/api", profileRoutes);
  
  // Collaboration System
  app.use("/api/collab", collabRoutes);

  // Admin Analytics System
  app.use("/api/admin", adminRoutes);

  // Teacher Analytics System
  app.use("/api/teacher", teacherRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

