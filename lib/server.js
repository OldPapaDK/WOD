import {createHash,randomBytes,scrypt as rawScrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {getIronSession} from 'iron-session';
import {list,get,put,del} from '@vercel/blob';
export {list,put,del};
export const scrypt=promisify(rawScrypt);
export function headers(res){res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow');}
export function sameOrigin(req){return req.headers.origin===`https://${req.headers.host}`;}
export function body(req,max=64000){let b=req.body;if(typeof b==='string')b=JSON.parse(b);if(!b||Buffer.byteLength(JSON.stringify(b))>max)throw Error('Ugyldig forespørgsel');return b;}
export async function session(req,res){if(!process.env.WOD_SESSION_SECRET)throw Error('Login er ikke konfigureret');return getIronSession(req,res,{password:process.env.WOD_SESSION_SECRET,cookieName:'__Host-wod-admin',ttl:28800,cookieOptions:{secure:true,httpOnly:true,sameSite:'strict',path:'/'}});}
export async function authorized(req,res){const s=await session(req,res);return s.admin===true;}
export async function verifyPassword(password){if(typeof password!=='string'||password.length>200)return false;const [salt,hash]=(process.env.WOD_ADMIN_HASH||'').split(':');if(!salt||!hash)return false;const derived=await scrypt(password,salt,64);const expected=Buffer.from(hash,'hex');return expected.length===derived.length&&timingSafeEqual(expected,derived);}
export async function readBlob(path){const result=await get(path,{access:'private',useCache:false});if(!result||result.statusCode!==200)return null;return JSON.parse(await new Response(result.stream).text());}
export async function readPrefix(prefix,max=1000){const paths=[];let cursor;do{const page=await list({prefix,limit:Math.min(1000,max-paths.length),cursor});paths.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;}while(cursor&&paths.length<max);return {paths,truncated:!!cursor};}
export async function readMany(paths){const result=[];for(let i=0;i<paths.length;i+=12){const batch=await Promise.all(paths.slice(i,i+12).map(b=>readBlob(b.pathname)));result.push(...batch.filter(Boolean));}return result;}
export function id(){return randomBytes(16).toString('hex');}
export function ipHash(req){return createHash('sha256').update((process.env.WOD_SESSION_SECRET||'')+String(req.headers['x-forwarded-for']||'unknown').split(',')[0]).digest('hex').slice(0,24);}
const limits=new Map();
export function localLimit(req,max=30){const now=Date.now(),key=ipHash(req);if(limits.size>2000)for(const [k,v] of limits)if(v.until<now)limits.delete(k);const entry=limits.get(key)||{count:0,until:now+60000};if(entry.until<now){entry.count=0;entry.until=now+60000;}entry.count++;limits.set(key,entry);return entry.count<=max;}
