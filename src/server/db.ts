import 'server-only';
import { PrismaClient } from '@prisma/client';
const globalDb=globalThis as unknown as {db?:PrismaClient};
export const db=globalDb.db??new PrismaClient({log:[],transactionOptions:{maxWait:30000,timeout:60000}});
if(process.env.NODE_ENV!=='production')globalDb.db=db;
