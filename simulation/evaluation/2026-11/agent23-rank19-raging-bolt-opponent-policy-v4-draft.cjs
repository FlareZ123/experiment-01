'use strict';
// Rank19 unified development policy; NOT registered in the shared worker.
// Empty capability set preserves the currently supported v3 interface.
const v3=require('./agent23-rank19-raging-bolt-opponent-policy-v3-moltres.cjs');
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const accel=require('./agent23-rank19-acceleration-draft.cjs');
const targets=require('./agent23-rank19-candidate-targets.cjs');
const mobility=require('./agent23-rank19-mobility.cjs');
const locks=require('./agent23-rank19-lock-counterplay.cjs');
const POLICY_VERSION='agent23-rank19-raging-bolt-opponent-v4-draft';
const DISCARD='rank19-bellowing-discard-v1',ATTACH='rank19-attachment-set-v1';
const allowed=new Set([DISCARD,ATTACH]);
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const rootItem=(r,d)=>list(r.actionFrontier?.items).find(a=>a.token===d?.token);
const mol=x=>/^Galarian Moltres V CRE(?: 97)?$/.test(name(x));
const sada=x=>/^Professor Sada's Vitality PAR(?: 170)?$/.test(name(x));
const board=o=>[{zone:'active',index:0,pokemon:o?.active},...list(o?.bench).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(s=>s.pokemon);
const cmp=(a,b)=>a.some((x,i)=>x<b[i]&&a.slice(0,i).every((y,j)=>y===b[j]));
function accelerationPreservesReserve(r,item){
 const o=r.observation.ownPublic,t=r.observation.opponentPublic.active,temple=bolt.templeMayApply(r.observation);
 const before=bolt.plan(o,t,temple,bolt.threatPolicy(r.observation));
 if(!before)return false;
 const printing=name(item?.actorPrinting),effect=item?.kind==='use-ability'?item.publicMetadata?.abilityName:sada(printing)?"Professor Sada's Vitality":/^Raihan EVS(?: 152)?$/.test(printing)?'Raihan':null;
 const sp=accel.spec({effectName:effect,sourcePrinting:printing});
 if(!sp||sp.zone!=='discard')return false;
 const after=accel.publicPlan(r,sp),p=after&&bolt.plan(after.next,t,temple,bolt.threatPolicy(r.observation));
 return !!p&&(cmp(p.rank,before.rank)||(item.kind==='use-ability'&&after.rank[1]>0));
}
function chooseRoot(r,caps){
 const o=r.observation.ownPublic,op=r.observation.opponentPublic,activeTarget=targets.target(op.active),remaining=o.prizeCount;
 const cfg={discard:caps.has(DISCARD),attach:caps.has(ATTACH)};
 const terminal=mobility.attackRoot(r,cfg,true);if(terminal)return terminal;
 const unlock=locks.root(r,cfg);if(unlock)return unlock;
 const md=v3.tacticalRoot(r),mi=rootItem(r,md);
 const bd=caps.has(DISCARD)?bolt.root(r,DISCARD):null;
 const ad=caps.has(ATTACH)?accel.root(r,ATTACH):null,ai=rootItem(r,ad);
 const directAura=mi?.kind==='attack'&&mi.attackName==='Aura Burn';
 if(directAura&&activeTarget&&Number.isSafeInteger(remaining)&&activeTarget.prizes>=remaining)return md;
 if(bd&&activeTarget&&Number.isSafeInteger(remaining)&&activeTarget.prizes>=remaining)return bd;
 const move=mobility.root(r,{discard:caps.has(DISCARD),attach:caps.has(ATTACH)});
 if(move)return move;
 if(directAura)return md;
 const viaGuzma=mi?.kind==='play-card'&&/^Guzma BUS(?: 115)?$/.test(name(mi.actorPrinting));
 const viaPivot=mi?.kind==='retreat'&&mol(mi.targetPrinting);
 // A ready, zero-discard Moltres route is preferable at the same Prize
 // value, or when it can reach a larger target. Don't lose a terminal Bolt.
 if(viaGuzma||viaPivot){
  const v=viaGuzma?Math.max(0,...list(op.bench).map(targets.auraPrizeValue)):targets.auraPrizeValue(op.active);
  if(!bd||!activeTarget||v>=activeTarget.prizes)return md;
 }
 if(bd){
  if(ad&&accelerationPreservesReserve(r,ai))return ad;
  return bd;
 }
 if(ad){
  const ray=ai?.kind==='attack'&&ai.attackName==='Ultimate Ray';
  const gx=ai?.kind==='attack'&&ai.attackName==='Altered Creation-GX';
  const immediateRay=ray&&activeTarget&&activeTarget.remaining<=150&&Number.isSafeInteger(remaining)&&activeTarget.prizes>=remaining;
  if(immediateRay)return ad;
  // Prepare the target and discard fuel before spending the supporter or
  // ending the turn; this reuses the already-selected supported v3 actions.
  if(mi?.kind==='use-ability'&&mi.publicMetadata?.abilityName==='Direflame Wings')return md;
  if((ray||gx)&&mi?.kind==='play-card'&&mol(mi.actorPrinting)&&!board(o).some(s=>mol(s.pokemon)))return md;
  if(sada(ai?.actorPrinting)&&mi?.kind==='play-card'&&/^Battle Compressor PHF(?: 92)?$/.test(name(mi.actorPrinting))&&list(o.discard).filter(bolt.basic).length<2)return md;
  return ad;
 }
 return md;
}
function createPolicy({role,seat,policyVersion,config}){
 if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||Array.isArray(config))throw Error('RANK19_V4_INIT_MISMATCH');
 if(Object.keys(config).some(k=>k!=='draftPromptContracts'))throw Error('RANK19_V4_CONFIG_MISMATCH');
 const values=config.draftPromptContracts??[];
 if(!Array.isArray(values)||values.some(v=>!allowed.has(v))||new Set(values).size!==values.length)throw Error('RANK19_V4_CAPABILITY_MISMATCH');
 const caps=new Set(values),base=v3.createPolicy({role,seat,policyVersion:v3.POLICY_VERSION,config:{}});
 return Object.freeze({decide(r){
  if(!r||r.role!==role||r.seat!==seat||r.observation?.actorSeat!==seat)return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
  if(r.prompt){
   if(r.prompt.promptType==='DiscardEnergyPrompt'&&caps.has(DISCARD))return bolt.decideDiscard(r)??{kind:'abstain',reasonCode:'UNSUPPORTED_DISCARD_ENERGY_PROMPT'};
   if(r.prompt.promptType==='AttachEnergyPrompt'&&caps.has(ATTACH))return accel.decide(r)??{kind:'abstain',reasonCode:'UNSUPPORTED_ATTACH_ENERGY_PROMPT'};
   if(caps.has(ATTACH)&&r.prompt.promptType==='ChooseCardsPrompt'&&r.prompt.source?.effectName==='Raihan')return accel.raihanSearch(r)??{kind:'abstain',reasonCode:'UNSUPPORTED_RAIHAN_ATTACH_ENERGY_PROMPT'};
   return locks.prompt(r)??mobility.prompt(r,{discard:caps.has(DISCARD),attach:caps.has(ATTACH)})??base.decide(r);
  }
  const chosen=chooseRoot(r,caps);if(chosen)return chosen;
  const fallback=base.decide(r),item=rootItem(r,fallback);
  if(!item||item.kind==='pass'||item.kind==='attack'){
   const pressure=caps.has(DISCARD)?bolt.pressureRoot(r,DISCARD):null;
   const direct=mobility.attackRoot(r,{discard:caps.has(DISCARD),attach:caps.has(ATTACH)});
   return pressure??direct??fallback;
  }
  return fallback;
 }});
}
module.exports={POLICY_VERSION,createPolicy,chooseRoot,DISCARD,ATTACH};
