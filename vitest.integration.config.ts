import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { config,parse } from 'dotenv';
import { existsSync,readFileSync } from 'node:fs';
const local=existsSync('.env.local')?parse(readFileSync('.env.local')):{};
if(existsSync('.env.integration'))config({path:'.env.integration',override:true,quiet:true});
else process.env.DISPOSABLE_TEST_PROJECT='false';
if(process.env.DATABASE_URL===local.DATABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL===local.NEXT_PUBLIC_SUPABASE_URL)process.env.DISPOSABLE_TEST_PROJECT='false';
export default defineConfig({resolve:{alias:{'@':path.resolve('src'),'server-only':path.resolve('tests/server-only.ts')}},test:{include:['tests/integration/**/*.test.ts'],environment:'node',fileParallelism:false,testTimeout:120000,hookTimeout:120000}});
