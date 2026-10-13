import 'server-only';
export function origin(){const value=process.env.APP_ORIGIN;if(!value)throw Error('APP_ORIGIN missing');const u=new URL(value);if(u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('Invalid APP_ORIGIN');if(process.env.VERCEL && (u.protocol!=='https:'||/localhost|127\.0\.0\.1/.test(u.hostname)))throw Error('Production HTTPS origin required');return u.origin;}
export function required(name:string){const value=process.env[name];if(!value)throw Error(`Configuration missing: ${name}`);return value;}
