import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import axios from "axios";

export const hashPassword = async (password: string) => {
  return await bcryptjs.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  return await bcryptjs.compare(password, hashedPassword);
};

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
  } catch {
    return null;
  }
};

export const getAuthUser = async (request: NextRequest) => {
  const token = request.cookies.get("authToken");

  if (!token) return null;

  const decoded = verifyToken(token.value);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
};

export const authUtils = {
  setAuthCookies: (token: string, role: string) => {
    const maxAge = 7 * 24 * 60 * 60;

    document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = `userRole=${role}; path=/; max-age=${maxAge}; samesite=lax`;
  },

  getCookie: (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      return cookieValue || null;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    const token = authUtils.getCookie("authToken");
    const role = authUtils.getCookie("userRole");
    return !!(token && role);
  },

  isAdmin: (): boolean => {
    const role = authUtils.getCookie("userRole");
    return role === "ADMIN";
  },

  getToken: (): string | null => {
    return authUtils.getCookie("authToken");
  },

  getRole: (): string | null => {
    return authUtils.getCookie("userRole");
  },

  clearAuth: () => {
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  },
};

export const serverAuthUtils = {
  setAuthCookies: (token: string, role: string) => {
    const maxAge = 7 * 24 * 60 * 60;

    return [
      `authToken=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
      `userRole=${role}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
    ];
  },

  clearAuthCookies: () => {
    return [
      "authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;",
      "userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;",
    ];
  },
};
