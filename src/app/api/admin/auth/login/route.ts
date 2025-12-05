import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIP, rateLimitResponse, hashSensitiveData } from "@/lib/security";

// Login attempt tracking (in-memory, use Redis in production)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number; lockedUntil?: number } {
  const record = loginAttempts.get(identifier);
  const now = Date.now();

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  // Check if lockout has expired
  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: record.lockedUntil };
  }

  // Reset if lockout expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - record.count };
}

function recordFailedAttempt(identifier: string): void {
  const record = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 };
  record.count++;

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }

  loginAttempts.set(identifier, record);
}

function clearLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting - 10 requests per minute per IP
    const rateLimit = checkRateLimit(`admin-login:${clientIP}`, { 
      windowMs: 60000, 
      maxRequests: 10 
    });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetTime);
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check login attempts for this email
    const loginCheck = checkLoginAttempts(email.toLowerCase());
    if (!loginCheck.allowed) {
      const remainingMinutes = Math.ceil((loginCheck.lockedUntil! - Date.now()) / 60000);
      
      // Log suspicious activity
      await prisma.activityLog.create({
        data: {
          action: "login_blocked",
          objectType: "security",
          details: JSON.stringify({ 
            email: hashSensitiveData(email),
            ip: hashSensitiveData(clientIP),
            reason: "too_many_attempts",
            lockedMinutes: remainingMinutes
          }),
          ipAddress: clientIP,
        },
      });

      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${remainingMinutes} minutes.` },
        { status: 429 }
      );
    }

    // Find admin user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Use constant-time comparison to prevent timing attacks
    // Always verify password even if user doesn't exist
    const dummyHash = "$2a$12$dummy.hash.for.timing.attack.prevention";
    const passwordToVerify = user?.passwordHash || dummyHash;
    const isValid = await verifyPassword(password, passwordToVerify);

    if (!user || !isValid) {
      recordFailedAttempt(email.toLowerCase());
      
      // Log failed attempt
      await prisma.activityLog.create({
        data: {
          action: "login_failed",
          objectType: "security",
          details: JSON.stringify({ 
            email: hashSensitiveData(email),
            ip: hashSensitiveData(clientIP),
            reason: !user ? "user_not_found" : "invalid_password"
          }),
          ipAddress: clientIP,
        },
      });

      const remaining = checkLoginAttempts(email.toLowerCase()).remainingAttempts;
      return NextResponse.json(
        { error: `Invalid credentials. ${remaining} attempts remaining.` },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "login_failed",
          objectType: "security",
          details: JSON.stringify({ reason: "account_disabled" }),
          ipAddress: clientIP,
        },
      });

      return NextResponse.json(
        { error: "Account is disabled. Contact administrator." },
        { status: 403 }
      );
    }

    // Check if user has admin role
    const adminRoles = ["administrator", "admin", "shop_manager", "editor"];
    if (!adminRoles.includes(user.role)) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "login_failed",
          objectType: "security",
          details: JSON.stringify({ reason: "insufficient_privileges", role: user.role }),
          ipAddress: clientIP,
        },
      });

      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Clear failed login attempts on successful login
    clearLoginAttempts(email.toLowerCase());

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: "admin",
    });

    // Set cookie
    await setAuthCookie(token);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log successful login
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "login_success",
        objectType: "user",
        objectId: user.id,
        details: JSON.stringify({ method: "password" }),
        ipAddress: clientIP,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
