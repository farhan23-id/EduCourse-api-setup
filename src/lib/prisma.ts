import {env} from "../config/env";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({  connectionString: env.databaseUrl });

export const prisma = new PrismaClient({adapter});