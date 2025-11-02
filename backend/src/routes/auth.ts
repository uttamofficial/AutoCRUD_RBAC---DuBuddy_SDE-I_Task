import { Router, Request, Response } from 'express';
import { generateToken } from '../utils/jwt';

const router = Router();

/**
 * POST /auth/login
 * Mock login endpoint for testing RBAC
 * In production, verify credentials against database
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Mock user ID based on email
  const userId = Math.floor(Math.random() * 1000) + 1;
  
  // Use provided role or default to Viewer
  const userRole = role || 'Viewer';
  
  // Generate JWT token
  const token = generateToken({
    userId,
    email,
    role: userRole
  });
  
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      userId,
      email,
      role: userRole
    }
  });
});

/**
 * POST /auth/mock-token
 * Generate a mock token for testing
 * Accepts: userId, email, role
 */
router.post('/mock-token', (req: Request, res: Response) => {
  const { userId = 1, email = 'test@example.com', role = 'Viewer' } = req.body;
  
  const token = generateToken({
    userId,
    email,
    role
  });
  
  res.json({
    success: true,
    token,
    user: { userId, email, role }
  });
});

export default router;
