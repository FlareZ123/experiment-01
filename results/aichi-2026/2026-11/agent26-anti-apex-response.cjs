'use strict';
// Conditional paper decision slice; no native integration.
const {TYPES}=require('./agent26-rank13-extra-turn-prize-planner.cjs');
const {analyze}=require('./agent26-regidrago-get-lost-denial.cjs');
const assert=(x,m)=>{if(!x)throw Error(m)};
const subset=(a,n)=>n===0?[[]]:n>a.length?[]:a.flatMap((v,i)=>subset(a.slice(i+1),n-1).map(b=>[v,...b]));
const GIR='Girafarig LOT 94',MAR='Marshadow UNB 81',CLE="Lillie's Clefairy ex JTG 56",VM='Shadow Rider Calyrex VMAX CRE 75';
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
function directDamage(s){
 assert(['hood','lockbridge'].includes(s.profile),'profile');
 assert([VM,CLE].includes(s.attacker),'attack identity');
 assert(int(s.ownBench,0,8)&&int(s.opponentBench,0,8),'bench counts');
 assert(int(s.totalPsychic,0,11)&&int(s.attackerPsychic,0,s.totalPsychic),'energy counts');
 assert(int(s.targetHP,10,280)&&s.targetHP%10===0,'remaining Regidrago VSTAR HP');
 assert(['valley','fairyZone','rollingIron','covertFlight','ranger'].every(k=>typeof s[k]==='boolean'),'modifiers');
 assert(!s.ranger||s.profile==='hood','Ranger not in Lockbridge');
 assert(s.readyPosition===true,'candidate attack position must be established');
 assert(!s.ranger||s.rangerCanPlay===true,'Ranger requires actual supporter availability');
 const cost=(s.attacker===VM?3:2)-Number(s.valley);
 const base=s.attacker===VM?10+30*s.totalPsychic:20*(1+s.ownBench+s.opponentBench);
 const reduced=Math.max(0,base*(s.fairyZone?2:1)-(s.rollingIron&&!s.ranger?80:0));
 const damage=s.attacker===CLE&&s.covertFlight&&!s.ranger?0:reduced;
 const payable=s.attackerPsychic>=cost;
 return {attack:s.attacker===VM?'Max Geist':'Full Moon Rondo',cost,payable,damage,knockout:payable&&damage>=s.targetHP,candidatePrizes:payable&&damage>=s.targetHP?2:0};
}
function rescue(input){
 const {rank,state,stadium,girafarigEnergy,resetAvailable,blowerAvailable,acerolaAvailable,replacementStadium,bandCanReturn,lost,locked}=input;
 assert(['none','Sky Field','Dimension Valley','Silent Lab','Temple of Sinnoh','other'].includes(stadium),'stadium');
 assert(int(girafarigEnergy,0,11),'Girafarig Psychic');
 assert([resetAvailable,blowerAvailable,acerolaAvailable,bandCanReturn].every(x=>typeof x==='boolean'),'confirmed action facts required');
 assert(replacementStadium===null||['Sky Field','Dimension Valley','Temple of Sinnoh'].includes(replacementStadium),'playable replacement only');
 assert(replacementStadium!=='Temple of Sinnoh'||state.profile==='lockbridge','Temple not in Hood');
 assert(state.targets.some(t=>t.id===state.active&&t.printing===GIR),'Girafarig already Active');
 const benches=state.targets.filter(t=>t.id!==state.active);
 assert(benches.length<=(stadium==='Sky Field'?8:5),'current bench exceeds capacity');
 const plans=[{actions:[],stadium,targets:state.targets,band:state.bandLive}];
 const add=(p,action,changes)=>plans.push({...p,...changes,actions:[...p.actions,action]});
 const base=plans[0];
 // Exclude Resetting Hole / Sky Field overflow timing ambiguity.
 if(resetAvailable&&stadium!=='none'&&stadium!=='Silent Lab'&&benches.length<=5){
   const m=benches.find(t=>t.printing===MAR);
   if(m)add(base,'Resetting Hole: '+m.id,{stadium:'none',targets:base.targets.filter(t=>t.id!==m.id)});
 }
 if(blowerAvailable&&state.bandLive){
   add(base,'Field Blower: Muscle Band',{band:bandCanReturn});
   for(const p of plans.slice(1).filter(x=>x.actions[0].startsWith('Resetting Hole')))
     add(p,'Field Blower: Muscle Band',{band:bandCanReturn});
 }
 const drop=(p,action,newStadium,band=p.band)=>{
   if(p.stadium==='Sky Field'&&newStadium!=='Sky Field'){
     const b=p.targets.filter(t=>t.id!==state.active);
     for(const discarded of subset(b,Math.max(0,b.length-5))){
       const ids=discarded.map(t=>t.id);
       add(p,action+(ids.length?' / collapse '+ids.join(','):''),{stadium:newStadium,band,targets:p.targets.filter(t=>!ids.includes(t.id))});
     }
   }else add(p,action,{stadium:newStadium,band});
 };
 if(blowerAvailable&&stadium!=='none'){
   drop(base,'Field Blower: Stadium','none');
   if(state.bandLive)drop(base,'Field Blower: Stadium + Muscle Band','none',bandCanReturn);
 }
 if(replacementStadium&&replacementStadium!==stadium){
   drop(base,'Play '+replacementStadium,replacementStadium);
   if(blowerAvailable&&state.bandLive)drop(base,'Field Blower: Muscle Band; play '+replacementStadium,replacementStadium,bandCanReturn);
 }
 if(acerolaAvailable)
   for(const p of plans.slice())for(const t of p.targets.filter(t=>t.id!==state.active&&t.remainingHP<TYPES[t.printing][0]))
     add(p,'Acerola: '+t.id,{targets:p.targets.filter(x=>x.id!==t.id)});
 const rows=[];
 for(const p of plans){
   const cost=p.stadium==='Dimension Valley'?0:1;
   if(girafarigEnergy<cost){rows.push({...p,payable:false,safe:false,reason:'Get Lost loses payment',pair:null});continue;}
   const result=analyze({rank,state:{...state,targets:p.targets,bandLive:p.band},...(lost?{lost}:{}),...(locked?{locked}:{})});
   // Do not accept the preceding solver's current-first sort as a robust
   // selection rule: explicitly choose an envelope-safe pair if any.
   const pair=result.safeEnvelope[0]??result.rows[0]??null;
   rows.push({...p,payable:true,safe:!!pair&&!pair.envelope.win,reason:!pair?'no available pair':pair.envelope.win?'source envelope retains finish':'no modeled finish after pair',pair:pair?.cards??null,reply:pair?.envelope??null});
 }
 rows.sort((a,b)=>Number(b.safe)-Number(a.safe)||Number(b.payable)-Number(a.payable)||a.actions.length-b.actions.length||(a.reply?.potentialPrizes??100)-(b.reply?.potentialPrizes??100));
 return {best:rows[0],rows,qualification:'fixed surviving source-payload envelope and both Apex windows granted; no new discard targets credited from opponent Sky Field collapse; retained material and later turns unscored'};
}
module.exports={directDamage,rescue};
