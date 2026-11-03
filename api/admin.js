import {headers,sameOrigin,body,session,authorized,verifyPassword,put,list,id,ipHash,readPrefix,readMany,del} from '../lib/server.js';
import {summarize} from '../lib/metrics.js';
export default async function handler(req,res){headers(res);try{
 const action=req.query.action||'stats';
 if(req.method==='POST'){
  if(!sameOrigin(req))return res.status(403).json({error:'Forespørgslen blev afvist'});
  if(action==='login'){
   const input=body(req,1000),bucket=Math.floor(Date.now()/900000),prefix=`auth/${bucket}/${ipHash(req)}/`;
   const attempts=await list({prefix,limit:12});if(attempts.blobs.length>=10)return res.status(429).json({error:'For mange forsøg. Prøv igen om 15 minutter.'});
   await put(`${prefix}${id()}.json`,'{}',{access:'private',addRandomSuffix:false,contentType:'application/json'});
   if(!await verifyPassword(input.password))return res.status(401).json({error:'Forkert kode'});
   const s=await session(req,res);s.admin=true;await s.save();return res.json({ok:true});
  }
  if(action==='logout'){const s=await session(req,res);s.destroy();return res.json({ok:true});}
  if(!await authorized(req,res))return res.status(401).json({error:'Log ind først'});
  if(action==='delete-feedback'){const {path}=body(req,1000);if(!/^feedback\/\d{4}-\d{2}-\d{2}\/[a-f0-9]{32}\.json$/.test(path))return res.status(400).json({error:'Ugyldig feedback'});await del(path);return res.json({ok:true});}
  if(action==='cleanup'){
   const cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10);let count=0;for(const prefix of ['sessions/','feedback/','auth/']){const {paths}=await readPrefix(prefix,5000);const old=paths.filter(b=>prefix==='auth/'?Number(b.pathname.split('/')[1])<Math.floor(Date.now()/900000)-2:b.pathname.split('/')[1]<cutoff);if(old.length){await del(old.map(b=>b.url));count+=old.length;}}return res.json({ok:true,deleted:count});
  }
  return res.status(400).json({error:'Ukendt handling'});
 }
 if(req.method!=='GET')return res.status(405).end();
 if(!await authorized(req,res))return res.status(401).json({error:'Log ind først'});
 if(action==='session')return res.json({ok:true});
 const days=[7,30,90].includes(Number(req.query.days))?Number(req.query.days):30,since=Date.now()-days*86400000;
 const [s,f]=await Promise.all([readPrefix('sessions/',2000),readPrefix('feedback/',500)]);
 const cutoff=new Date(since).toISOString().slice(0,10),recent=s.paths.filter(b=>b.pathname.split('/')[1]>=cutoff);
 const [sessions,feedback]=await Promise.all([readMany(recent),readMany(f.paths.filter(b=>b.pathname.split('/')[1]>=cutoff))]);
 return res.json({...summarize(sessions,feedback,since),days,truncated:s.truncated||f.truncated,updatedAt:Date.now()});
 }catch{console.error('WOD admin operation failed');return res.status(503).json({error:'Data kunne ikke hentes lige nu. Prøv igen.'});}}
