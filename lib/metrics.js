export const kinds=new Set(['visit','start','complete','stop','audio_unavailable','wake_unavailable','script_error','pause','resume']);
export const modes=new Set(['AMRAP','For Time','EMOM','TABATA','MIX']);
export function cleanEvent(e,now=Date.now()){
 if(!e||!kinds.has(e.kind))throw Error('Ugyldig hændelse');
 const at=Number(e.at);if(!Number.isFinite(at)||Math.abs(now-at)>86400000)throw Error('Ugyldigt tidspunkt');
 return {kind:e.kind,at,mode:modes.has(e.mode)?e.mode:'',run:/^[a-f0-9-]{36}$/i.test(e.run||'')?e.run:'',demo:e.demo===true};
}
export function summarize(sessions,feedback,since){
 const events=sessions.flatMap(s=>s.events||[]).filter(e=>e.at>=since);const runs=new Map(),types={},daily={},errors={};let visits=0,demos=0;
 for(const e of events){const date=new Date(e.at).toLocaleDateString('sv-SE',{timeZone:'Europe/Copenhagen'});daily[date]??={date,visits:0,starts:0,completed:0};
 if(e.kind==='visit'){visits++;daily[date].visits++;}
 if(['audio_unavailable','wake_unavailable','script_error'].includes(e.kind))errors[e.kind]=(errors[e.kind]||0)+1;
 if(e.kind==='start'){if(e.demo){demos++;continue;}if(!e.run)continue;types[e.mode]=(types[e.mode]||0)+1;daily[date].starts++;runs.set(e.run,{status:'open',mode:e.mode});}
 }
 for(const e of events){if(e.demo||!runs.has(e.run))continue;if(e.kind==='complete'||e.kind==='stop'){runs.get(e.run).status=e.kind;if(e.kind==='complete'){const date=new Date(e.at).toLocaleDateString('sv-SE',{timeZone:'Europe/Copenhagen'});daily[date].completed++;}}}
 const completed=[...runs.values()].filter(r=>r.status==='complete').length,stopped=[...runs.values()].filter(r=>r.status==='stop').length;
 return {visits,started:runs.size,completed,stopped,open:runs.size-completed-stopped,demos,types,errors,daily:Object.values(daily).sort((a,b)=>a.date.localeCompare(b.date)),feedback:feedback.filter(f=>f.at>=since).sort((a,b)=>b.at-a.at)};
}
