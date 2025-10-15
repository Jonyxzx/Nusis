import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import authRouter from './auth';
import initPassport from "./passport";

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
    cookie: { secure: process.env.NODE_ENV === "production" }, // use secure cookies in production
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

app.get("/api/me", (req, res) => {
  if (!req.isAuthenticated?.() && !req.user)
    return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: req.user });
});

// health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(port, () =>
  console.log(`Backend running on ${process.env.BASE_URL}`)
);
