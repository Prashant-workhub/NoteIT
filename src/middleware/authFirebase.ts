// src/middleware/authFirebase.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';

// Initialise Firebase Admin SDK if not already initialised
if (!getApps().length) {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  } else {
    initializeApp(process.env.FIREBASE_PROJECT_ID
      ? { projectId: process.env.FIREBASE_PROJECT_ID }
      : undefined);
  }
}


/**
 * Middleware that verifies a Firebase ID token sent in the Authorization header.
 * On success, the decoded token is attached to req.user and req.body.user for downstream handlers.
 */
export const authenticateFirebaseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  // Test-only bypass. Never enable this variable in a deployed service.
  if (idToken === 'test-token' && process.env.ALLOW_TEST_AUTH_BYPASS === 'true') {
    const testUser = { uid: 'test-user-uid', email: 'test@example.com' };
    (req as any).user = testUser;
    req.body = req.body || {};
    req.body.user = testUser;
    return next();
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    (req as any).user = decoded;
    req.body = req.body || {};
    req.body.user = decoded;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired Firebase token' });
  }
};
