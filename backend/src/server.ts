import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import authRouter from './auth/auth';
import initPassport from "./auth/passport";
import { connectToDatabase, disconnectDatabase, getDb } from "./db/mongo";
import recipientRouter from "./routes/recipientRoute";
import logRouter from "./routes/logRoute";
import emailTemplateRouter from "./routes/emailRoute";

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json());

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret", // replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === "production", // trust reverse proxy
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// CORS: allow frontend origin and credentials (cookies)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// initialize passport
initPassport();
app.use(passport.initialize());
app.use(passport.session());

// Mount passport auth routes
app.use('/', authRouter);
app.use('/v1/recipients', recipientRouter);
app.use('/v1/logs', logRouter);
app.use('/v1/emails', emailTemplateRouter);

app.get("/api/me", (req, res) => {
  if (!req.isAuthenticated?.() && !req.user)
    return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: req.user });
});

// health check
app.get("/health", async (_req, res) => {
  try {
    // Check database connectivity
    const db = getDb();
    await db.admin().ping();
    
    res.json({ 
      status: "ok", 
      uptime: process.uptime(),
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      uptime: process.uptime(),
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

async function start() {
  try {
    // Connect to MongoDB before starting the server
    await connectToDatabase();
    const server = app.listen(port, () =>
      console.log(`Backend running on ${process.env.BASE_URL}`)
    );

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 5000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
