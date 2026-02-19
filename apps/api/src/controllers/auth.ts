import { prisma } from "../core/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

export const studentRegister = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;
  const hashed = await bcrypt.hash(password, 10);
  const uniqueId = crypto.randomUUID();
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "STUDENT", uniqueId }
  });
  return user;
};

export const studentLogin = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return token;
};

export const adminLogin = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN") throw new Error("Admin not found");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return token;
};


export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true, email: true }, 
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

