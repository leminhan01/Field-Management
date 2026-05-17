import { registerAs } from '@nestjs/config';

export const prismaConfig = registerAs('prisma', () => ({
  url: process.env.DATABASE_URL,
}));
