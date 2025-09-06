import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { registerSchema, loginSchema, subscriptionSchema } from "../schemas/authSchemas.js";

const { JWT_SECRET = "dev_secret", JWT_EXPIRES_IN = "24h" } = process.env;

export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    return res.status(201).json({
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email or password is wrong" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Email or password is wrong" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    await user.update({ token });

    return res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: "Not authorized" });
    await user.update({ token: null });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const current = async (req, res, next) => {
  try {
    return res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
    });
  } catch (e) {
    next(e);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { error } = subscriptionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: "Not authorized" });

    await user.update({ subscription: req.body.subscription });
    return res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (e) {
    next(e);
  }
};
