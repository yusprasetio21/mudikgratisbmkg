import { NextRequest } from 'next/server';

/**
 * Validate if the request has valid authentication
 * Returns true if authenticated, false otherwise
 */
export function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;
  
  // Check for Bearer token or session token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true; // TODO: Validate JWT token properly
  }
  
  if (sessionToken) {
    return true; // TODO: Validate session token properly
  }

  return false;
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(request: NextRequest) {
  if (!isAuthenticated(request)) {
    throw new Error('Unauthorized - Authentication required');
  }
}
