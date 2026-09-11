const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../../config/env');

const prisma = new PrismaClient();

const SALT_ROUNDS = config.bcryptSaltRounds;
const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

class AuthService {
  static async register(name, email, password) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const error = new Error('Email already in use');
      error.code = 'UNIQUE_CONSTRAINT_ERROR';
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'CASHIER',
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

  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.code = 'UNAUTHORIZED';
      throw error;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const error = new Error('Invalid credentials');
      error.code = 'UNAUTHORIZED';
      throw error;
    }
    const payload = {
      sub: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      const error = new Error('Invalid token');
      error.code = 'UNAUTHORIZED';
      throw error;
    }
  }
}

module.exports = AuthService;
