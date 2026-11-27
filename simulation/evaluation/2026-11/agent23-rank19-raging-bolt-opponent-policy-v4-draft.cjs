'use strict';
// Rank19 unified development policy; NOT registered in the shared worker.
// Empty capability set preserves the currently supported v3 interface.
const v3=require('./agent23-rank19-raging-bolt-opponent-policy-v3-moltres.cjs');
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const accel=require('./agent23-rank19-acceleration-draft.cjs');
const targets=require('./agent23-rank19-candidate-targets.cjs');
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
function sadaPreservesReserve(r){
 const o=r.observation.ownPublic,t=r.observation.opponentPublic.active,temple=bolt.templeMayApply(r.observation);
 const before=bolt.plan(o,t,temple);
 if(!before||!before.rank.some(Boolean))return false;
 const sp=accel.spec({effectName:"Professor Sada's Vitality",sourcePrinting:"Professor Sada's Vitality PAR"});
 const recipients=board(o).filter(s=>/^(?:Raging Bolt ex TEF(?: 123)?|Flutter Mane TEF(?: 78)?)$/.test(name(s.pokemon)));
 const groups=list(o.discard).filter(bolt.basic).map((e,i)=>recipients.map(s=>({printing:name(e),token:'hyp-'+i+'-'+s.zone+s.index,slot:s})));
 const after=accel.plan(o,t,temple,sp,groups);
 const p=after&&bolt.plan(after.next,t,temple);
 return !!p&&cmp(p.rank,before.rank);
}
function chooseRoot(r,caps){
 const o=r.observation.ownPublic,op=r.observation.opponentPublic,activeTarget=targets.target(op.active),remaining=o.prizeCount;
 const md=v3.tacticalRoot(r),mi=rootItem(r,md);
 const bd=caps.has(DISCARD)?bolt.root(r,DISCARD):null;
 const ad=caps.has(ATTACH)?accel.root(r,ATTACH):null,ai=rootItem(r,ad);
 const directAura=mi?.kind==='attack'&&mi.attackName==='Aura Burn';
 if(directAura)return md;
 if(bd&&activeTarget&&Number.isSafeInteger(remaining)&&activeTarget.prizes>=remaining)return bd;
 const viaGuzma=mi?.kind==='play-card'&&/^Guzma BUS(?: 115)?$/.test(name(mi.actorPrinting));
 const viaPivot=mi?.kind==='retreat'&&mol(mi.targetPrinting);
 // A ready, zero-discard Moltres route is preferable at the same Prize
 // value, or when it can reach a larger target. Don't lose a terminal Bolt.
 if(viaGuzma||viaPivot){
  const v=viaGuzma?Math.max(0,...list(op.bench).map(targets.auraPrizeValue)):targets.auraPrizeValue(op.active);
  if(!bd||!activeTarget||v>=activeTarget.prizes)return md;
 }
 if(bd){
  if(ad&&sada(ai?.actorPrinting)&&sadaPreservesReserve(r))return ad;
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
   return base.decide(r);
  }
  return chooseRoot(r,caps)??base.decide(r);
 }});
}
module.exports={POLICY_VERSION,createPolicy,chooseRoot,DISCARD,ATTACH};
