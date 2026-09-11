import crypto from "node:crypto";
import bcrypt from "bcrypt";

import { prisma } from "../config/database.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type RefreshTokenPayload,
} from "../utils/jwt.js";

type UserRole = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResult> => {
  const email = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role,
    },
  });

  const refreshTokenId = crypto.randomUUID();

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    tokenId: refreshTokenId,
  });

  await prisma.refreshToken.create({
    data: {
      id: refreshTokenId,
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (
  input: LoginInput,
): Promise<AuthResult> => {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const refreshTokenId = crypto.randomUUID();

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    tokenId: refreshTokenId,
  });

  await prisma.refreshToken.create({
    data: {
      id: refreshTokenId,
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};


export const refreshAccessToken = async (
  refreshToken: string,
): Promise<string> => {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error("Invalid or expired refresh token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    const error = new Error("Refresh token not found");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  if (storedToken.revokedAt) {
    const error = new Error("Refresh token has been revoked");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  if (storedToken.expiresAt < new Date()) {
    const error = new Error("Refresh token has expired");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  if (storedToken.userId !== payload.userId) {
    const error = new Error("Invalid refresh token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  return generateAccessToken({
    userId: user.id,
    role: user.role,
  });
};

export const logoutUser = async (
  refreshToken: string,
): Promise<void> => {
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};