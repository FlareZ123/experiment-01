'use strict';
// Bounded paper-combat calculation, NOT a worker, game, or native generator.
// Caller establishes Apex payment, live modifiers, and actual Guzma mobility.
const TYPES=Object.freeze({
 'Shadow Rider Calyrex V CRE 74':[210,2,4,4],
 'Shadow Rider Calyrex VMAX CRE 75':[320,3,4,4],
 "Lillie's Clefairy ex JTG 56":[190,2,2,1],
 'Tapu Lele-GX GRI 60':[170,2,1,1],
 'Trevenant & Dusknoir-GX SMP 217':[270,3,1,1],
 'Latias ex SSP 76':[210,2,1,1],
 'Dialga-GX UPR 100':[180,2,1,1],
 'Mimikyu GRI 58':[70,1,1,1],
 'Girafarig LOT 94':[90,1,1,1],
 'Marshadow UNB 81':[80,1,1,1],
 'Radiant Eternatus CRZ 105':[170,1,1,1],
 'Wobbuffet PHF 36':[110,1,0,1]
});
const PAYLOADS=Object.freeze({
 'Dialga-GX UPR 100':['Timeless-GX','Shred'],
 'Dragapult ex TWM 130':['Phantom Dive','Jet Headbutt'],
 'Kyurem SFA 47':['Trifrost'],
 'Salamence ex JTG 114':['Wide Blast','Dragon Impact'],
 'Noivern ex PAL 153':['Dominating Echo','Covert Flight'],
 'Regidrago V SIT 135':['Dragon Laser'],
 'Koraidon ex TEF 120':['Kaiser Tackle','Retribution Strike'],
 'Hisuian Goodra VSTAR LOR 136':['Rolling Iron'],
 'Mega Dragonite ex ASC 152':['Ryuno Glide']
});
const DIRECT=Object.freeze({'Shred':80,'Dragon Impact':300,'Dominating Echo':140,'Covert Flight':70,'Jet Headbutt':70,'Kaiser Tackle':280,'Rolling Iron':200,'Ryuno Glide':330});
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const sum=rows=>rows.reduce((a,b)=>a+b,0);
const combinations=(rows,n)=>{
 if(n===0)return [[]];
 if(n>rows.length)return [];
 return rows.flatMap((row,i)=>combinations(rows.slice(i+1),n-1).map(rest=>[row,...rest]));
};
const subsets=rows=>Array.from({length:rows.length+1},(_,n)=>combinations(rows,n)).flat();
const cmp=(a,b)=>Number(a.win)-Number(b.win)||a.prizes-b.prizes;
const best=rows=>rows.reduce((a,b)=>!a||cmp(b,a)>0?b:a,null);
const worst=rows=>rows.reduce((a,b)=>!a||cmp(b,a)<0?b:a,null);
function validate(s){
 assert(s&&['hood','lockbridge'].includes(s.profile),'unknown candidate profile');
 assert(s.apexPayable===true&&s.noOtherCombatModifiers===true,'requires established Apex payment and modeled combat modifiers');
 assert(typeof s.bandLive==='boolean'&&typeof s.gxUnused==='boolean'&&typeof s.nextApexPayable==='boolean','unknown attack/Tool state');
 assert(Number.isInteger(s.prizesToWin)&&s.prizesToWin>=1&&s.prizesToWin<=6,'invalid Prize count');
 assert(Number.isInteger(s.gustBudget)&&s.gustBudget>=0&&s.gustBudget<=2,'invalid committed Guzma budget');
 assert(typeof s.firstGustReady==='boolean'&&typeof s.secondGustReady==='boolean','gust mobility must be established per turn');
 assert(Array.isArray(s.discard)&&s.discard.every(x=>typeof x==='string'),'invalid visible discard');
 // For Koraidon, require known damage on 280-HP Regidrago and exclude self-KO
 // geometries: Kaiser Tackle's self-damage can change simultaneous win/loss.
 if(s.discard.includes('Koraidon ex TEF 120'))assert(Number.isInteger(s.attackerDamage)&&s.attackerDamage>=0&&s.attackerDamage<=210&&s.attackerDamage%10===0,'Koraidon requires known surviving attacker (at least 70 HP)');
 assert(Array.isArray(s.targets)&&s.targets.length>=1&&s.targets.length<=9,'invalid board size');
 const seen=new Set(),counts={};
 const rows=s.targets.map(t=>{
  const info=Object.hasOwn(TYPES,t.printing)?TYPES[t.printing]:null;
  assert(info&&info[s.profile==='hood'?2:3]>0,'out-of-profile target');
  assert(typeof t.id==='string'&&t.id&&!seen.has(t.id),'invalid or duplicate target identity');
  seen.add(t.id);
  counts[t.printing]=(counts[t.printing]||0)+1;
  assert(counts[t.printing]<=info[s.profile==='hood'?2:3],'exceeds source inventory');
  assert(Number.isInteger(t.remainingHP)&&t.remainingHP>0&&t.remainingHP<=info[0]&&t.remainingHP%10===0,'invalid remaining HP');
  return {id:t.id,printing:t.printing,hp:t.remainingHP,prize:info[1]};
 });
 assert(seen.has(s.active),'active must be present');
 return rows;
}
function available(discard){
 return [...new Set(discard.flatMap(p=>Object.hasOwn(PAYLOADS,p)?PAYLOADS[p]:[]))];
}
function effect(rows,amounts,prizesToWin){
 const damage=id=>Object.hasOwn(amounts,id)?amounts[id]:0;
 const ko=rows.filter(t=>damage(t.id)>=t.hp);
 const remaining=rows.filter(t=>!ko.some(k=>k.id===t.id)).map(t=>({...t,hp:t.hp-damage(t.id)}));
 const prizes=sum(ko.map(t=>t.prize));
 return {prizes,win:prizes>=prizesToWin||remaining.length===0,knockedOut:ko.map(t=>t.id),remaining};
}
function attackVariants(name,rows,active,band,needed,attackerDamage=0){
 const bonus=band?20:0,bench=rows.filter(t=>t.id!==active);
 if(name==='Retribution Strike'){
  return [{attack:name,active,targets:[active],...effect(rows,{[active]:20+attackerDamage+bonus},needed)}];
 }
 if(Object.hasOwn(DIRECT,name)){
  return [{attack:name,active,targets:[active],...effect(rows,{[active]:DIRECT[name]+bonus},needed)}];
 }
 if(name==='Trifrost'){
  return combinations(rows,Math.min(3,rows.length)).map(targets=>{
   const amounts=Object.fromEntries(targets.map(t=>[t.id,110+(t.id===active?bonus:0)]));
   return {attack:name,active,targets:targets.map(t=>t.id),...effect(rows,amounts,needed)};
  });
 }
 if(name==='Phantom Dive'){
  // Prize-only second-attack/terminal calculation. Remaining counters are
  // not allocated here; this is not a complete native prompt result/state.
  return subsets(bench).filter(ts=>sum(ts.map(t=>t.hp))<=60).map(ts=>{
   const amounts=Object.fromEntries(ts.map(t=>[t.id,t.hp]));
   Object.defineProperty(amounts,active,{value:200+bonus,enumerable:true});
   return {attack:name,active,targets:[active,...ts.map(t=>t.id)],requiredBenchCounters:Object.fromEntries(ts.map(t=>[t.id,t.hp/10])),...effect(rows,amounts,needed)};
  });
 }
 if(name==='Wide Blast'){
  return [{attack:name,active,targets:bench.map(t=>t.id),...effect(rows,Object.fromEntries(bench.map(t=>[t.id,50])),needed)}];
 }
 if(name==='Dragon Laser'){
  return (bench.length?bench:[null]).map(t=>{
   const amounts=Object.fromEntries([[active,130+bonus],...(t?[[t.id,30]]:[])]);
   return {attack:name,active,targets:t?[active,t.id]:[active],...effect(rows,amounts,needed)};
  });
 }
 return [];
}
function actions(rows,active,canGust){
 return [active,...(canGust?rows.filter(t=>t.id!==active).map(t=>t.id):[])].map(target=>({active:target,gust:target!==active}));
}
function bestSingle(rows,active,attacks,band,needed,canGust,attackerDamage=0){
 return best(actions(rows,active,canGust).flatMap(a=>attacks.filter(n=>n!=='Timeless-GX').flatMap(n=>
   attackVariants(n,rows,a.active,band,needed,attackerDamage).map(r=>({...r,gust:a.gust})))));
}
function plan(s){
 const board=validate(s), attacks=available(s.discard);
 const direct=bestSingle(board,s.active,attacks,s.bandLive,s.prizesToWin,s.gustBudget>0&&s.firstGustReady,s.attackerDamage??0);
 const extra=[];
 if(s.gxUnused&&attacks.includes('Timeless-GX')){
  for(const a of actions(board,s.active,s.gustBudget>0&&s.firstGustReady)){
   const first=effect(board,{[a.active]:150+(s.bandLive?20:0)},s.prizesToWin);
   if(first.win){
    extra.push({attack:'Timeless-GX',firstTarget:a.active,firstGust:a.gust,prizes:first.prizes,win:true,firstKnockouts:first.knockedOut,responses:[]});continue;
   }
   if(!s.nextApexPayable)continue;
   // Opponent chooses new Active after a KO; don't award cooperative promotion.
   const promoted=first.knockedOut.includes(a.active)?first.remaining.map(t=>t.id):[a.active];
   const responses=promoted.map(active=>{
    const response=bestSingle(first.remaining,active,attacks,s.bandLive,s.prizesToWin-first.prizes,
      s.secondGustReady&&s.gustBudget-Number(a.gust)>0,s.attackerDamage??0);
    return {promoted:active,second:response,prizes:first.prizes+(response?.prizes||0),win:response?.win===true};
   });
   const floor=worst(responses);
   extra.push({attack:'Timeless-GX',firstTarget:a.active,firstGust:a.gust,prizes:floor.prizes,win:floor.win,firstKnockouts:first.knockedOut,responses});
  }
 }
 const extraTurn=best(extra);
 const selected=direct?.win?'single-attack':extraTurn&&(!direct||cmp(extraTurn,direct)>0)?'extra-turn':direct?'single-attack':extraTurn?'extra-turn':'no-modeled-attack';
 return {selected,direct,extraTurn,assumptions:'fixed visible payloads and mobility; no opponent turn, no new resources credited; adverse promotion; Prize-only objective'};
}
module.exports={TYPES,PAYLOADS,plan,available,attackVariants};
