import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

const prisma = new PrismaClient();

const SALT_ROUNDS = config.bcryptSaltRounds;
const JWT_SECRET = config.jwtSecret as string;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

class AuthService {
  static async register(name: string, email: string, password: string) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const error: any = new Error('Email already in use');
      error.code = 'UNIQUE_CONSTRAINT_ERROR';
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.CASHIER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return user;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error: any = new Error('Invalid credentials');
      error.code = 'UNAUTHORIZED';
      throw error;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const error: any = new Error('Invalid credentials');
      error.code = 'UNAUTHORIZED';
      throw error;
    }
    const payload = {
      sub: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
    return token;
  }

  static async verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { sub: string; role: Role };
    } catch (err) {
      const error: any = new Error('Invalid token');
      error.code = 'UNAUTHORIZED';
      throw error;
    }
  }
}

export default AuthService;
