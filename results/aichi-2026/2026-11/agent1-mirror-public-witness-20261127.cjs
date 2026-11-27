'use strict';
/*
 * Restricted, actor-owned research adapter for Hood Shield/Lockbridge
 * against the original rank-1 mirror. No native Store, no hidden deck,
 * no production policy override. All selected root tokens are supplied
 * by the current native frontier. Replan before every subsequent root.
 */
const planner=require('./agent1-joint-terminal-planner-20261127.cjs');
const oracle=require('./agent1-terminal-attack-oracle-20261127.cjs');
const PK=[
 ['Shadow Rider Calyrex V','CRE','74','v',210,2,2,true,1],
 ['Shadow Rider Calyrex VMAX','CRE','75','vmax',320,3,2,true,1],
 ["Lillie's Clefairy ex",'JTG','56','clefairy',190,2,1,true,1],
 ['Tapu Lele-GX','GRI','60','lele',170,2,1,true,1],
 ['Trevenant & Dusknoir-GX','SMP','217','trev',270,3,3,true,1],
 ['Latias ex','SSP','76','latias',210,2,2,true,1],
 ['Dialga-GX','UPR','100','dialga',180,2,3,false,1],
 ['Mimikyu','GRI','58','mimikyu',70,1,1,true,1],
 ['Girafarig','LOT','94','girafarig',90,1,1,true,2],
 ['Marshadow','UNB','81','marshadow',80,1,1,true,1],
 ['Radiant Eternatus','CRZ','105','eternatus',170,1,2,false,1],
 ['Wobbuffet','PHF','36','wobbuffet',110,1,2,true,2]
];
const TR=[
 ["Lillie's Determination",'MEG','119','lillie',2],['Iono','PAL','185','iono',1],
 ['Teammates','PRC','141','teammates',1],['Raihan','EVS','152','raihan',1],
 ['Acerola','BUS','112','other',1],['Guzma','BUS','115','guzma',1],
 ['Mysterious Treasure','FLI','113','other',4],['Fog Crystal','CRE','140','fog',4],
 ['VS Seeker','PHF','109','seeker',2],['Quick Ball','FST','237','other',1],
 ['Hisuian Heavy Ball','ASR','146','other',1],['Battle Compressor','PHF','92','compressor',1],
 ['Field Blower','GRI','125','other',1],['Night Stretcher','ASC','196','stretcher',1],
 ['Unfair Stamp','TWM','165','stamp',1],['Float Stone','BKT','137','float',1],
 ['Forest Seal Stone','SIT','156','stone',1],['Sky Field','ROS','89','other',1],
 ['Dimension Valley','PHF','93','valley',1],['Stealthy Hood','UNB','186','other',2],
 ['Arven','SVI','166','arven',1],['Pokémon Ranger','STS','104','other',1],
 ['Temple of Sinnoh','ASR','155','other',0]
];
const byName=new Map(PK.map(p=>[p[0],p]));
const P={};
for(const p of PK)for(const key of [p[0]+' '+p[1],p[0]+' '+p[1]+' '+p[2]])P[key]={name:p[0],category:'other',pokemon:p};
for(const t of TR)for(const key of [t[0]+' '+t[1],t[0]+' '+t[1]+' '+t[2]])P[key]={name:t[0],category:t[3]};
for(const key of ['Psychic Energy MEE','Psychic Energy MEE 13','Psychic Energy SVE','Psychic Energy SVE 13'])P[key]={name:'Psychic Energy',category:'energy'};
for(const key of ['Night Stretcher SFA','Night Stretcher SFA 61'])P[key]={name:'Night Stretcher',category:'stretcher'};
function card(x){const p=Object.hasOwn(P,x)?P[x]:null;if(!p)throw Error('unsupported printing '+String(x));return p;}
function counts(profile){
 if(!['hood','lockbridge'].includes(profile))throw Error('unknown fixed profile');
 const c={};for(const p of PK)c[p[0]]=p[3]==='v'||p[3]==='vmax'?4:p[3]==='clefairy'?2:p[3]==='wobbuffet'?0:1;
 for(const t of TR)c[t[0]]=t[4];c['Psychic Energy']=11;
 if(profile==='lockbridge'){c["Lillie's Clefairy ex"]--;c.Wobbuffet++;c['Pokémon Ranger']--;c['Temple of Sinnoh']++;}
 if(Object.values(c).reduce((s,n)=>s+n,0)!==60)throw Error('bad profile total');
 return c;
}
const countCategories=xs=>{const v={};for(const x of xs){const k=card(x).category;v[k]=(v[k]??0)+1;}return v;};
const categoryByName=n=>n==='Psychic Energy'?'energy':TR.find(t=>t[0]===n)?.[3]??'other';
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const empty=x=>Array.isArray(x)&&x.length===0;
const inactive=x=>x===false||x===null||x===0||empty(x);
const requireTrue=(p,msg)=>{if(!p)throw Error(msg);};
const playerZero=['attackLockTurnsRemaining','attackMaxEnergyTurnsRemaining','ignoreAttackCostTurnsRemaining','stadiumAndToolHaveNoEffectTurnsRemaining'];
const slotZero=['cannotAttackNextTurn','cannotUseAttacksNextTurn','blockedAttackNameNextTurn','blockedAttackNameUntilLeavesActive','onlyAllowedAttackNameNextTurn','attackCostIncreaseNextTurn','attackCostIncreaseWhileActive','cannotRetreat','cannotRetreatNextTurn','cannotRetreatWhileActive','cannotEvolveNextTurn'];
function board(player){
 requireTrue(player?.active&&Array.isArray(player.bench),'unknown board');
 const out=[{zone:'active',index:0,slot:player.active}];
 player.bench.forEach((slot,index)=>{if(slot!==null)out.push({zone:'bench',index,slot});});
 for(const row of out){
  const s=row.slot,p=card(s?.printing).pokemon;
  requireTrue(p&&s.name===p[0]&&s.hp===p[4]&&integer(s.damage)&&s.damage<s.hp,'unrecognized Pokémon or health');
  requireTrue(empty(s.specialConditions)&&s.publicRestrictions&&slotZero.every(k=>inactive(s.publicRestrictions[k])),'dynamic Pokémon condition');
  requireTrue(Array.isArray(s.energies)&&s.energies.every(e=>card(e).category==='energy'),'nonbasic Psychic attachment');
  requireTrue(Array.isArray(s.tools)&&s.tools.length<=1&&s.tools.every(t=>['Stealthy Hood','Float Stone','Forest Seal Stone'].includes(card(t).name)),'unmodeled attached Tool');
  requireTrue(Array.isArray(s.evolutionPrintings)&&s.evolutionPrintings.length===(p[3]==='vmax'?2:1),'missing evolution stack');
  const stack=s.evolutionPrintings.map(x=>card(x).name);
  requireTrue(stack.filter(n=>n===p[0]).length===1&&(p[3]!=='vmax'||stack.includes('Shadow Rider Calyrex V')),'wrong evolution stack');
  requireTrue(Array.isArray(s.attacks)&&Array.isArray(s.abilities),'missing attack/ability projection');
  // Exact known mirror cards have no relevant Psychic ability suppressor.
  // Explicit contradictory native evidence is never overridden.
  const relevant=['Underworld Door','Fairy Zone','Skyliner'];
  requireTrue(!relevant.some(n=>s.abilitySuppressions?.some(r=>r.abilityName===n&&r.suppressed===true)),'explicit ability suppression');
  const needed=p[3]==='vmax'?'Underworld Door':p[3]==='clefairy'?'Fairy Zone':p[3]==='latias'?'Skyliner':null;
  requireTrue(!needed||s.abilities.includes(needed),'missing expected continuous ability');
  row.p=p;row.tool=s.tools.length?card(s.tools[0]).name:null;
 }
 return out;
}
function noGlobalDynamic(p){
 const r=p?.publicTurnRestrictions;
 requireTrue(r&&playerZero.every(k=>r[k]===0)&&r.attackMaxEnergy===null&&empty(r.ignoreAttackCostCardTypes),'unmodeled player-wide effect');
 for(const k of ['itemPlayLocked','supporterPlayLocked','stadiumPlayLocked','toolPlayLocked','energyPlayLocked','vstarUsed'])requireTrue(typeof r[k]==='boolean','missing public resource restriction '+k);
 requireTrue(empty(p.resolvingSupporter),'resolving Supporter');
}
function knownDoor(req,row){
 const v=req.observation,r=req.publicEventReceipt;
 if(!r||r.version!=='agent8-public-event-receipt-v3-turn-stamped'||r.actorSeat!==req.seat||r.turn!==v.globalTurn)return false;
 const e=row.zone==='active'?r.ownerActive:r.ownerBench?.[row.index];
 return e?.printing===row.slot.printing&&e.knownAbilityUse?.filter(x=>x.name==='Underworld Door').length===1&&e.knownAbilityUse.find(x=>x.name==='Underworld Door').usedThisTurn===false;
}
function project(req,profile,opts={}){
 try{
  const v=req?.observation,t=v?.ownTurnResources;
  requireTrue(req?.prompt===null&&v?.decisionKind==='owner-root'&&v.phase===2&&integer(v.globalTurn)&&v.globalTurn>=2&&v.actorSeat===req.seat&&v.turnSeat===req.seat,'not normal actor turn root');
  requireTrue(t&&integer(t.supporterPlayedTurn)&&[0,1,false,true].includes(t.retreatedTurn)&&typeof t.energyPlayedTurn==='boolean'&&typeof t.stadiumPlayedTurn==='boolean'&&typeof t.vstarUsed==='boolean','unknown turn-resource flags');
  requireTrue(opts.mirrorHistoryCertified===true,'mirror-only public-history model not certified');
  const own=v.ownPublic,opp=v.opponentPublic;
  noGlobalDynamic(own);noGlobalDynamic(opp);
  const a=board(own),b=board(opp);
  requireTrue(b.every(r=>r.p[3]!=='wobbuffet'&&r.tool!=='Stealthy Hood'),'not original rank-1 mirror board');
  const st=[...own.stadium,...opp.stadium].map(x=>card(x).name);
  requireTrue(st.length<=1&&st.every(x=>['Sky Field','Dimension Valley','Temple of Sinnoh'].includes(x)),'unmodeled Stadium');
  requireTrue(a.length<=(st[0]==='Sky Field'?9:6)&&b.length<=(st[0]==='Sky Field'?9:6),'inconsistent bench capacity');
  requireTrue(integer(own.deckCount)&&integer(own.prizeCount)&&own.prizeCount>=1&&own.prizeCount<=6&&Array.isArray(v.ownHand)&&v.ownHand.length===own.handCount,'inconsistent public zone counts');
  const initial=counts(profile),seen=[...v.ownHand,...own.discard,...own.lostZone,...own.stadium,...own.resolvingSupporter,...a.flatMap(r=>[...r.slot.evolutionPrintings,...r.slot.energies,...r.slot.tools])];
  for(const x of seen){const n=card(x).name;requireTrue(integer(initial[n])&&initial[n]>0,'fixed-list overcount '+n);initial[n]--;}
  // Known face-up Prize identities are deliberately not consumed: the
  // residual is a support superset, with all Prize identities latent.
  requireTrue(Object.values(initial).reduce((n,x)=>n+x,0)===own.deckCount+own.prizeCount,'fixed-list zone conservation mismatch');
  const d={};for(const [n,k] of Object.entries(initial)){const cat=categoryByName(n);d[cat]=(d[cat]??0)+k;}
  const skyliner=a.some(r=>r.p[3]==='latias'),fairy=a.some(r=>r.p[3]==='clefairy');
  const r=own.publicTurnRestrictions;
  const lock=k=>r[k]===true||t[k]===true;
  const slots=a.map(row=>{
   const p=row.p,s=row.slot,kind=p[3],psychic=p[7],basic=kind!=='vmax';
   const retreat=row.tool==='Float Stone'||basic&&skyliner?0:p[6];
   const attacks=oracle.CATALOG[kind].map(x=>x[0]).filter(n=>s.attacks.some(x=>x.name===n)&&n!=='Astral Barrage');
   return {kind,attacks,retreat,tool:row.tool===null?'open':row.tool==='Float Stone'?'float':row.tool==='Forest Seal Stone'?'stone':'other',
    manualOK:!lock('energyPlayLocked'),effectOK:true,psychic,door:kind==='vmax'&&knownDoor(req,row),stoneUsable:kind==='v'||kind==='vmax'};
  });
  const target=b.map(row=>({hp:row.p[4]-row.slot.damage,damage:row.slot.damage,award:row.p[5],energy:row.slot.energies.length,weak:(!row.p[7]&&fairy&&row.tool!=='Stealthy Hood')?2:row.p[8],resist:0,ultra:false,blockDamage:[],blockCounters:[],reduceDamage:Array(a.length).fill(0)}));
  // No native Astral Barrage certificate until the approved prompt
  // target-count fix is actually present in the relevant runner.
  const model={stable:true,own:slots,opp:target,remaining:own.prizeCount};
  const input={model,position:{a:0,b:0,es:a.map(x=>x.slot.energies.length),discount:st[0]==='Dimension Valley'?1:0},
   flags:{manual:!t.energyPlayedTurn&&!lock('energyPlayLocked'),retreat:t.retreatedTurn===0||t.retreatedTurn===false,supporter:t.supporterPlayedTurn===0&&!lock('supporterPlayLocked'),items:!lock('itemPlayLocked'),tools:!lock('toolPlayLocked'),stadium:!t.stadiumPlayedTurn&&!lock('stadiumPlayLocked'),vstar:!t.vstarUsed&&!r.vstarUsed,priorKO:false,safeValley:a.length<=6&&b.length<=6,safeFloat:true,safeStone:false,safeRedraw:false,oppHandNonempty:opp.handCount>0},
   hand:countCategories(v.ownHand),discard:countCategories(own.discard),
   belief:{mode:'K0',supportComplete:true,exchangeable:false,unknownPrizes:own.prizeCount,counts:d}};
  return {status:'ok',input,own:a,opp:b,actorSeat:req.seat,turn:v.globalTurn};
 }catch(e){return {status:'unsupported',reason:e.message};}
}
function matchesAddress(m,row,prefix){
 return m?.[prefix+'Seat']==='actor'&&m[prefix+'Zone']===row.zone&&
  (row.zone==='active'?(m[prefix+'Index']===undefined||m[prefix+'Index']===0):m[prefix+'Index']===row.index);
}
function matchRoot(req,proj,move){
 const actions=req.actionFrontier?.items;
 if(!Array.isArray(actions))return null;
 const name={manual:'Psychic Energy',guzma:'Guzma',stretcher:'Night Stretcher',seeker:'VS Seeker',float:'Float Stone',valley:'Dimension Valley'}[move.kind];
 const found=actions.filter(a=>{
  if(typeof a.token!=='string'||!a.token)return false;
  const m=a.publicMetadata??{};
  if(m.hasUnmodeledModifier===true)return false;
  if(move.kind==='attack')return a.kind==='attack'&&a.attackName===move.name&&a.actorPrinting===proj.own[0].slot.printing&&m.attackCostPayable===true&&m.attackSource?.sourceKind==='active-pokemon'&&m.attackSource.sourceSlot==='ACTIVE'&&m.attackSource.sourceIndex===0&&m.attackSource.sourceCardFullName===a.actorPrinting&&m.attackSource.attackName===move.name;
  if(move.kind==='retreat')return a.kind==='retreat'&&a.actorPrinting===proj.own[0].slot.printing&&matchesAddress(m,proj.own[move.to],'target')&&m.isOwnerVisible===true&&a.targetPrinting===proj.own[move.to].slot.printing;
  if(move.kind==='door')return a.kind==='use-ability'&&m.abilityName==='Underworld Door'&&a.actorPrinting===proj.own[move.source].slot.printing&&matchesAddress(m,proj.own[move.source],'source');
  if(!name||a.kind!=='play-card'||!integer(m.handIndex)||req.observation.ownHand[m.handIndex]!==a.actorPrinting)return false;
  try{if(card(a.actorPrinting).name!==name)return false;}catch{return false;}
  if(move.kind==='manual'||move.kind==='float')return matchesAddress(m,proj.own[move.target],'target')&&m.isOwnerVisible===true&&a.targetPrinting===proj.own[move.target].slot.printing;
  return true;
 });
 // Identical cards may have distinct hand-index tokens; stable order is
 // harmless. All candidates must already be native root tokens.
 return found[0]?.token??null;
}
function rootIntent(proj,move,rootToken){
 const ref=(rows,i)=>({zone:rows[i].zone,index:rows[i].index,printing:rows[i].slot.printing});
 const out={actorSeat:proj.actorSeat,turn:proj.turn,kind:move.kind,rootToken};
 if(move.kind==='guzma'){out.opponent=ref(proj.opp,move.opp);out.promote=ref(proj.own,move.promote);}
 if(move.kind==='door'){out.source=ref(proj.own,move.source);out.target=ref(proj.own,move.target);}
 if(move.kind==='retreat')out.pay=move.pay;
 if(move.kind==='seeker'||move.kind==='stretcher')out.card=move.card;
 return out;
}
function recommend(req,profile,opts={}){
 const p=project(req,profile,opts);if(p.status!=='ok')return p;
 const solve=planner.solve(p.input,{guaranteeOnly:true,deterministicOnly:true,maxStates:opts.maxStates??10000,maxBranches:opts.maxBranches??50000,firstAllowed:m=>matchRoot(req,p,m)!==null});
 if(solve.status!=='certified')return solve;
 const token=matchRoot(req,p,solve.first);
 if(!token)return {status:'unsupported',reason:'certificate has no current root token'};
 return {...solve,decision:{kind:'select-action',token},intent:rootIntent(p,solve.first,token),
  scope:'research-only deterministic mirror witness; reproject each root; mandatory prompts require matching intent'};
}
function resolvePrompt(req,intent){
 // Actor-visible exact choices only. This is a proposal for a pure
 // policy integration, not authority to execute a native Store action.
 const p=req?.prompt,v=req?.observation;
 if(!intent||!p||req.seat!==intent.actorSeat||v?.actorSeat!==req.seat||v.globalTurn!==intent.turn||p.actingSeat!==req.seat||v.decisionKind!=='owner-prompt')return null;
 const meta=p.publicMetadata??{},source=p.source??{},choices=p.choices;
 if(source.classification!=='actor-choice'||!Array.isArray(choices)||meta.isSecret===true||!integer(meta.minimumCount)||!integer(meta.maximumCount))return null;
 const validChoice=c=>typeof c.token==='string'&&c.publicMetadata?.isOwnerVisible===true;
 const choose=xs=>xs.length>=meta.minimumCount&&xs.length<=meta.maximumCount?{kind:'select-choices',tokens:xs.map(x=>x.token)}:null;
 const sourceIs=(name)=>{try{return card(source.sourcePrinting).name===name;}catch{return false;}};
 function pokemon(ref,seat){
  if(!ref||ref.zone!=='bench')return null;
  const player=seat==='actor'?v.ownPublic:v.opponentPublic;
  if(player?.bench?.[ref.index]?.printing!==ref.printing)return null;
  const xs=choices.filter(c=>validChoice(c)&&c.kind==='pokemon'&&c.printing===ref.printing&&c.publicMetadata.ownerSeat===seat&&c.publicMetadata.targetZone==='bench'&&c.publicMetadata.benchIndex===ref.index);
  return xs.length===1?choose(xs):null;
 }
 if(intent.kind==='guzma'&&p.promptType==='ChoosePokemonPrompt'&&sourceIs('Guzma')){
  const seats=new Set(choices.filter(validChoice).map(c=>c.publicMetadata.ownerSeat));
  if(seats.size!==1)return null;
  return seats.has('actor')?pokemon(intent.promote,'actor'):seats.has('opponent')?pokemon(intent.opponent,'opponent'):null;
 }
 if(intent.kind==='door'&&sourceIs('Shadow Rider Calyrex VMAX')&&source.effectName==='Underworld Door'){
  if(p.promptType==='ChoosePokemonPrompt')return pokemon(intent.target,'actor');
  if(p.promptType==='ChooseCardsPrompt'&&meta.sourceZone==='hand'){
   const xs=choices.filter(c=>validChoice(c)&&c.kind==='card'&&c.publicMetadata.ownerSeat==='actor'&&c.publicMetadata.sourceZone==='hand'&&Object.hasOwn(P,c.printing)&&P[c.printing].category==='energy');
   return xs.length?choose(xs.slice(0,1)):null;
  }
 }
 if((intent.kind==='stretcher'||intent.kind==='seeker')&&sourceIs(intent.kind==='stretcher'?'Night Stretcher':'VS Seeker')&&p.promptType==='ChooseCardsPrompt'&&meta.sourceZone==='discard'){
  const xs=choices.filter(c=>validChoice(c)&&c.kind==='card'&&c.publicMetadata.ownerSeat==='actor'&&c.publicMetadata.sourceZone==='discard'&&Object.hasOwn(P,c.printing)&&P[c.printing].category===intent.card);
  return xs.length?choose(xs.slice(0,1)):null;
 }
 // Paid retreat prompt is intentionally not guessed: the native
 // payment prompt's authoritative source/selection contract must be
 // established in the real replay before an executor is installed.
 return null;
}
module.exports={project,recommend,resolvePrompt,counts,card,PK,TR};
