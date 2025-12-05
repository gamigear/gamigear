import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// SECURITY: Throw error if JWT_SECRET is not set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const SECURE_JWT_SECRET = JWT_SECRET || "dev-only-secret-do-not-use-in-production";
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: "customer" | "admin";
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECURE_JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token with proper signature verification
export function verifyToken(token: string): JWTPayload | null {
  try {
    // jwt.verify() validates both signature AND expiration
    const decoded = jwt.verify(token, SECURE_JWT_SECRET) as JWTPayload;
    
    // Additional validation
    if (!decoded.userId || !decoded.email || !decoded.type) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Log for security monitoring (don't expose details to client)
    if (process.env.NODE_ENV === "development") {
      console.error("Token verification failed:", error);
    }
    return null;
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

// Set auth cookie (server-side)
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Remove auth cookie (server-side)
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
