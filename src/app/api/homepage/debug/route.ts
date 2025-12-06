import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-auth';

// GET /api/homepage/debug - Debug authentication status
export async function GET(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  
  const authResult = await verifyAdminAuth(request);
  
  return NextResponse.json({
    hasToken: !!authToken,
    tokenLength: authToken?.length || 0,
    authSuccess: authResult.success,
    authError: authResult.error,
    userRole: authResult.user?.role,
    userType: authResult.user?.type,
    timestamp: new Date().toISOString(),
  });
}
