import {readFile,readdir} from 'node:fs/promises';
import {config} from 'dotenv';
import {spawnSync} from 'node:child_process';
config({path:'.env.local',quiet:true});
const values=['CERTIFICATE_SIGNING_PRIVATE_KEY_B64','SUPABASE_SECRET_KEY','ABUSE_HASH_SECRET','DATABASE_URL','DIRECT_URL','RUNTIME_DATABASE_PASSWORD'].map(name=>process.env[name]).filter(value=>value&&value.length>20);
async function walk(dir){const result=[];try{for(const entry of await readdir(dir,{withFileTypes:true})){const file=`${dir}/${entry.name}`;if(entry.isDirectory())result.push(...await walk(file));else result.push(file);}}catch{}return result;}
const git=process.env.GIT_EXECUTABLE||'git';const files=spawnSync(git,['ls-files','-z'],{encoding:'utf8'});if(files.status!==0)throw Error('Git unavailable; set GIT_EXECUTABLE to installed git.exe.');const tracked=files.stdout.split('\0').filter(Boolean);if(tracked.some(f=>/^\.env(\.|$)/.test(f)&&!f.endsWith('.example')))throw Error('Secret environment file tracked.');
for(const file of [...tracked,...await walk('.next/static')]){const content=await readFile(file);if(values.some(value=>content.includes(Buffer.from(value))))throw Error(`Secret detected in ${file}; remove before any push.`);}
console.log(`Secret-value scan passed: ${tracked.length} tracked files and client build assets. Values hidden; this does not prove absence of unknown credentials.`);
