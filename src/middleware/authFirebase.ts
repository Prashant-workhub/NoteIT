// src/middleware/authFirebase.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!getApps().length) {
  if (privateKey && clientEmail) {
    initializeApp({
      credential: cert({
        projectId: projectId || 'noteit-3bb0f',
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    initializeApp(projectId ? { projectId } : { projectId: 'noteit-3bb0f' });
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

  // Test-only bypass — ONLY active when ALLOW_TEST_AUTH_BYPASS=true is
  // explicitly set in the environment. Never enable it in production, and it
  // must not be implicitly enabled just because NODE_ENV is not 'production'.
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
