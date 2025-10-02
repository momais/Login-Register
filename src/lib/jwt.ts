import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(userId: number, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
  };

  // Token expires in 7 days
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'authflow-app'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}
