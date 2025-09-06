import jwt from "jsonwebtoken";
import User from "../models/user.js";

const { JWT_SECRET = "dev_secret" } = process.env;

export default async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByPk(payload.id);
    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = { id: user.id, email: user.email, subscription: user.subscription };
    next();
  } catch (e) {
    res.status(401).json({ message: "Not authorized" });
  }
}
