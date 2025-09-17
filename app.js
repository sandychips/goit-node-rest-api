import express from "express";
import dotenv from "dotenv";
dotenv.config();

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/authRouter.js";
import { initDb } from "./db/sequelize.js";

const app = express();

app.use(express.json());

// STATIC: роздача файлів з ./public
app.use(express.static("public"));

// routes
app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);

// 404
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;

async function start() {
  await initDb(); // підключення до БД + sync
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
