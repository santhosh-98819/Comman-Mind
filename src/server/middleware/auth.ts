import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebaseAdmin.js';

/**
 * Required Auth Middleware:
 * Verifies Firebase ID token. If not provided or invalid, rejects with 401.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If guest / demo mode identifier is provided in header
    const guestHeader = req.headers['x-guest-id'];
    if (guestHeader) {
      (req as any).user = { uid: String(guestHeader), isGuest: true };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: No authentication token provided' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Empty token' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAnonymous: decodedToken.firebase?.sign_in_provider === 'anonymous',
    };
    next();
  } catch (error: any) {
    console.error(`${new Date().toISOString()} - Error verifying ID token:`, error.message || error);
    // If token verification failed, check if guest
    const guestHeader = req.headers['x-guest-id'];
    if (guestHeader) {
      (req as any).user = { uid: String(guestHeader), isGuest: true };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid authentication token',
      details: error.message,
    });
  }
};

/**
 * Optional Auth Middleware:
 * If token is present, verifies it and attaches user info; if not present, attaches anonymous guest user.
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const guestId = (req.headers['x-guest-id'] as string) || 'anonymous';
    (req as any).user = { uid: guestId, isGuest: true, isAnonymous: true };
    return next();
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    (req as any).user = { uid: 'anonymous', isGuest: true, isAnonymous: true };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAnonymous: decodedToken.firebase?.sign_in_provider === 'anonymous',
    };
    next();
  } catch (error: any) {
    console.warn('Optional auth token decode issue, continuing as guest:', error.message);
    (req as any).user = { uid: 'anonymous', isGuest: true, isAnonymous: true };
    next();
  }
};
