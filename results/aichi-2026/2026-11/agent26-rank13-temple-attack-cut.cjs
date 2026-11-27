'use strict';
function planTempleDenial(s) {
 const routes=["Megaton Blower","Silent Lab","Parallel City","Crispin","Raihan"],types=["G","F","D"];
 if(s.templeInPlay!==true)throw Error("requires established Temple");
 if(!Array.isArray(s.discard)||!Array.isArray(s.lost)||!Array.isArray(s.targets))throw Error("public zones and prospective attackers required");
 for(const x of routes)if([...s.discard,...s.lost].filter(y=>y===x).length>1)throw Error("rank13 singleton "+x);
 for(const k of ["legacyPossible","vsSeekerPossible","mistPossible","getLostPossible"])if(typeof s[k]!=="boolean")throw Error("explicit "+k);
 if(s.mistKO&&!Array.isArray(s.afterMistTargets))throw Error("post-KO prospective attackers required");
 const uniq=(a,allowed)=>{if(!Array.isArray(a)||a.some(x=>!allowed.includes(x)))throw Error("invalid energy access");return [...new Set(a)];};
 const manual=uniq(s.manualTypes??types,types),crispinDeck=uniq(s.crispinDeckTypes??["G","F"],["G","F"]),raihanSearch=uniq(s.raihanSearchTypes??types,types),extraRaihan=uniq(s.additionalRaihanDiscardTypes??["G","F"],["G","F"]);
 const validate=ts=>{for(const t of ts)for(const k of types)if(!Number.isSafeInteger(t[k])||t[k]<0)throw Error("invalid Energy");
  if(ts.reduce((n,t)=>n+t.G,0)>4||ts.reduce((n,t)=>n+t.F,0)>3||ts.reduce((n,t)=>n+t.D,0)>3)throw Error("source Energy envelope");};
 validate(s.targets);if(s.afterMistTargets)validate(s.afterMistTargets);
 function evaluate(action,picks){
  const picked=new Set(picks),discard=s.discard.filter((_,i)=>!picked.has(i)),lost=[...s.lost,...picks.map(i=>s.discard[i])];
  const mist=action==="Shadow Mist",ko=!!s.priorKO||(mist&&!!s.mistKO),targets=mist&&s.mistKO?s.afterMistTargets:s.targets;
  function access(name){if(lost.includes(name))return false;if(discard.includes(name))return s.legacyPossible||(["Crispin","Raihan"].includes(name)&&s.vsSeekerPossible);return true;}
  const removals=["none"];if(access("Megaton Blower"))removals.push("Megaton Blower");if(!mist)for(const x of ["Silent Lab","Parallel City"])if(access(x))removals.push(x);
  const supporters=[{name:"none",attach:null,generated:[]}];
  if(access("Crispin")){for(const h of crispinDeck)supporters.push({name:"Crispin",attach:null,generated:[h]});for(const a of crispinDeck)for(const h of crispinDeck)if(a!==h)supporters.push({name:"Crispin",attach:a,generated:[h]});}
  if(ko&&access("Raihan")){const ds=[...new Set([...extraRaihan,...(discard.includes("Grass Energy")?["G"]:[]),...(discard.includes("Fire Energy")?["F"]:[])])];for(const a of ds)supporters.push({name:"Raihan",attach:a,generated:raihanSearch});}
  const escapes=[];
  for(const removal of removals){search:for(const t of targets)for(const sp of supporters)for(const m of [null,...new Set([...manual,...sp.generated])].filter(x=>!mist||x!=="D")){
   const e={G:t.G,F:t.F,D:t.D};if(sp.attach)e[sp.attach]++;if(m)e[m]++;
   if(Math.max(0,2-e.G)+Math.max(0,1-e.F)<=(removal==="none"?0:2*e.D)){escapes.push({target:t.id??null,removal,supporter:sp.name,extraBasic:sp.attach,manual:m,energy:e});break search;}
  }}
  return {action,picks,cards:picks.map(i=>s.discard[i]),deniesApex:escapes.length===0,escapes};
 }
 const options=[];if(s.mistPossible)options.push(evaluate("Shadow Mist",[]));if(s.getLostPossible){const n=s.discard.length;if(n<2)options.push(evaluate("Get Lost",Array.from({length:n},(_,i)=>i)));else for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)options.push(evaluate("Get Lost",[i,j]));}
 return {options,denying:options.filter(x=>x.deniesApex)};
}
module.exports={planTempleDenial};
