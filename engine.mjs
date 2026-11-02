export function compile(blocks) {
 const out=[];
 for (const b of blocks) {
  const work=Number(b.work), rest=Number(b.rest), transition=Number(b.transition), rounds=Number(b.rounds), sets=Number(b.sets), setRest=Number(b.setRest);
  if (![work,rest,transition,rounds,sets,setRest].every(Number.isFinite)||work<1||work>86400||rest<0||transition<0||setRest<0||rounds<1||rounds>200||sets<1||sets>50||!Number.isInteger(rounds)||!Number.isInteger(sets)) throw Error('Kontrollér tider, runder og sæt.');
  for(let s=1;s<=sets;s++) for(let r=1;r<=rounds;r++) {
   const base={name:b.name||b.type,type:b.type,round:r,rounds,set:s,sets,direction:b.direction};
   out.push({...base,phase:'Arbejde',duration:work});
   if(r<rounds) {const t=b.type==='EMOM'?transition:rest;if(t)out.push({...base,phase:b.type==='EMOM'?'Skift':'Pause',duration:t});}
   else if(s<sets&&setRest)out.push({...base,phase:'Sætpause',duration:setRest});
  }
  const blockRest=Number(b.blockRest||0);
  if(!Number.isFinite(blockRest)||blockRest<0||blockRest>86400)throw Error('Kontrollér blokpausen.');
  if(b!==blocks.at(-1)&&blockRest)out.push({name:b.name||b.type,type:b.type,phase:'Blokpause',duration:blockRest,round:rounds,rounds,set:sets,sets});
  if(out.length>20000)throw Error('Træningen har for mange intervaller.');
 }
 return out;
}
export function position(plan, elapsed) {
 let start=0;
 for(let i=0;i<plan.length;i++){if(elapsed<start+plan[i].duration)return {index:i,segment:plan[i],elapsed:elapsed-start,remaining:plan[i].duration-(elapsed-start)};start+=plan[i].duration;}
 return null;
}
