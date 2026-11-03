import {headers,sameOrigin,body,put,localLimit,id} from '../lib/server.js';
import {cleanEvent} from '../lib/metrics.js';
export default async function handler(req,res){headers(res);if(req.method!=='POST')return res.status(405).end();if(!sameOrigin(req))return res.status(403).end();if(!localLimit(req))return res.status(429).json({error:'Prøv igen om lidt'});
 try{const input=body(req,64000),now=Date.now(),day=new Date(now).toISOString().slice(0,10);
 if(input.type==='feedback'){
  const message=String(input.message||'').trim();if(!message||message.length>2000)return res.status(400).json({error:'Skriv en besked på højst 2000 tegn.'});
  const clean={message,at:now,audio:['yes','no','untested'].includes(input.audio)?input.audio:'untested',screen:['yes','no','untested'].includes(input.screen)?input.screen:'untested'};const path=`feedback/${day}/${id()}.json`;clean.path=path;
  await put(path,JSON.stringify(clean),{access:'private',addRandomSuffix:false,contentType:'application/json'});return res.json({ok:true});
 }
 if(input.consent!==true||!/^\d{4}-\d{2}-\d{2}\/[a-f0-9-]{36}$/i.test(input.session||'')||!Array.isArray(input.events)||input.events.length>200)return res.status(400).end();
 const sessionDay=input.session.split('/')[0];if(Math.abs(Date.parse(sessionDay)-now)>2*86400000)return res.status(400).end();
 const events=input.events.map(e=>cleanEvent(e,now));await put(`sessions/${input.session}.json`,JSON.stringify({events,updatedAt:now}),{access:'private',allowOverwrite:true,addRandomSuffix:false,contentType:'application/json'});return res.json({ok:true});
 }catch{return res.status(400).json({error:'Kunne ikke gemme. Prøv igen.'});}}
