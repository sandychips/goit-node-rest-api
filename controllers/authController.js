import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

import User from "../models/user.js";
import {
  registerSchema,
  loginSchema,
  subscriptionSchema,
  verifyEmailSchema,
} from "../schemas/authSchemas.js";
import { sendEmail } from "../helpers/sendEmail.js";

const { JWT_SECRET = "dev_secret", JWT_EXPIRES_IN = "24h", BASE_URL = "http://localhost:3000" } = process.env;
const avatarsDir = path.resolve("public", "avatars");

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email in use" });

    const hash = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: "250", d: "retro", protocol: "https" });
    const verificationToken = nanoid(); // токен для лінка верифікації

    const user = await User.create({
      email,
      password: hash,
      avatarURL,
      verify: false,
      verificationToken,
    });

    const verifyLink = `${BASE_URL}/api/auth/verify/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `<p>Please confirm your email:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
    });

    return res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
      message: "Registration successful. Please verify your email.",
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/auth/verify/:verificationToken
export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ where: { verificationToken } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ verify: true, verificationToken: null });
    return res.status(200).json({ message: "Verification successful" });
  } catch (e) {
    next(e);
  }
};

// POST /api/auth/verify  (ресенд)
export const resendVerify = async (req, res, next) => {
  try {
    // спеціальна вимога ТЗ про текст помилки
    if (!req.body || typeof req.body.email !== "string") {
      return res.status(400).json({ message: "missing required field email" });
    }

    const { error } = verifyEmailSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verify) return res.status(400).json({ message: "Verification has already been passed" });

    const verificationToken = user.verificationToken || nanoid();
    if (!user.verificationToken) {
      await user.update({ verificationToken });
    }

    const verifyLink = `${BASE_URL}/api/auth/verify/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify your email (resend)",
      html: `<p>Please confirm your email:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
    });

    return res.status(200).json({ message: "Verification email sent" });
  } catch (e) {
    next(e);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email or password is wrong" });

    // блок логіну, якщо email не верифіковано
    if (!user.verify) return res.status(401).json({ message: "Email not verified" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Email or password is wrong" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    await user.update({ token });

    return res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL },
    });
  } catch (e) {
    next(e);
  }
};

// інші контролери без змін по суті:
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
      avatarURL: req.user.avatarURL,
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
      avatarURL: user.avatarURL,
    });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/auth/avatars  (залишаємо як було)
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { path: tmpPath, originalname } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const fileName = `${req.user.id}_${Date.now()}${ext}`;
    const finalPath = path.join(avatarsDir, fileName);

    await fs.rename(tmpPath, finalPath);

    const avatarURL = `/avatars/${fileName}`;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: "Not authorized" });

    await user.update({ avatarURL });
    return res.status(200).json({ avatarURL });
  } catch (e) {
    try { if (req.file?.path) await fs.unlink(req.file.path); } catch {}
    next(e);
  }
};
