require('dotenv').config();

const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};

// Validate required config
const requiredKeys = ['databaseUrl', 'jwtSecret'];
for (const key of requiredKeys) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = { config };
