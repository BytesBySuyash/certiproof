import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
config({path:'.env.local',quiet:true});
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '.cache/ms-playwright';
const baseURL=process.env.TEST_BASE_URL||'http://localhost:3000';
export default defineConfig({testDir:'./tests/e2e',fullyParallel:false,timeout:60000,retries:0,use:{baseURL,trace:'retain-on-failure'},reporter:[['list'],['html',{open:'never'}]],webServer:process.env.TEST_BASE_URL?undefined:{command:'node node_modules/next/dist/bin/next start',url:baseURL,reuseExistingServer:true},projects:[{name:'chromium',use:{browserName:'chromium'}}]});
