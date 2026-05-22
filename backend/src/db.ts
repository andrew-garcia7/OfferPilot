// src/db.ts
import { PrismaClient } from "./generated/prisma-client";

const prisma = new PrismaClient();

export { prisma };
