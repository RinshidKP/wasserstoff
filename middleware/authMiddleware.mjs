import jwt from 'jsonwebtoken';
import { refreshToken } from '../controllers/authController.mjs';

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token not provided' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        try {
          // If token is expired, refresh it
          const newAccessToken = await refreshToken(req, res);
          req.accessToken = newAccessToken;
          next();
        } catch (error) {
          res.status(401).json({ error: 'Invalid or expired refresh token' });
        }
      } else {
        res.status(403).json({ error: 'Invalid access token' });
      }
    } else {
      // Token is valid, pass to next middleware or route handler
      req.accessToken = token;
      next();
    }
  });
}
