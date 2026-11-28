'use strict';
/*
 * Experimental *separate* v3g fixed 60: one Ace -> one Gladion.
 * Does not modify or admit v3. A Gladion root is offered only after a
 * complete physical 60-card owner zone census proves singleton Dusknoir is
 * in own Prizes, with a fresh K1 deck snapshot; never guess a Prize slot.
 * Does NOT play a native game or authorize any fixture/CI dispatch.
 */
const parent=require('./agent1-newmoon-v3-finisher-slice.cjs');
const POLICY_VERSION='agent1-newmoon-v3g-gladion-rescue-research-v1';
const DECK_PATH='results/als/new-moon-dusknoir-gladion-prize-rescue-v3g-60.json';
const DECK_SHA='1a5f094b06f79ff9168ca68c71fbb5f57db5352ecfe4877db48d6b93e51fcfc0';
const has=(x,s)=>typeof x==='string'&&x.includes(s);
const isInt=x=>Number.isSafeInteger(x);
const targetPrint=x=>has(x,'Dusknoir')&&!has(x,'Trevenant & Dusknoir-GX');
const holders=own=>[own?.active,...(Array.isArray(own?.bench)?own.bench:[])].filter(Boolean);
function countInPlay(own){
 const p=holders(own);
 let n=0;
 for(const x of p){
  if(typeof x.printing!=='string'||!Array.isArray(x.evolutionPrintings)||
   x.evolutionPrintings.length<1||
   !x.evolutionPrintings.includes(x.printing)||
   !Array.isArray(x.energies)||!Array.isArray(x.tools))return null;
  // Actor-observation-contract.visiblePokemon returns slot.cards.map(printing)
  // including the top/current Pokémon. Adding a separate 1 double counts it.
  n+=x.evolutionPrintings.length+x.energies.length+x.tools.length;
 }
 return n;
}
function fullyPrizedDusknoir(view){
 const o=view?.ownPublic,k=view?.ownerK1,h=view?.ownHand;
 if(!o||!k||k.exactMembershipKnown!==true||
  k.invalidationReason!==null||!Array.isArray(k.knownPrintings)||
  !Array.isArray(h)||!Array.isArray(o.bench)||!Array.isArray(o.prizeSlots)||
  !Array.isArray(o.discard)||!Array.isArray(o.lostZone)||
  !Array.isArray(o.resolvingSupporter)||!Array.isArray(o.stadium)||
  !isInt(o.deckCount)||!isInt(o.prizeCount)||o.prizeCount<1||
  o.prizeSlots.length!==o.prizeCount||o.handCount!==h.length)
  return false;
 let deckN=0;
 for(const row of k.knownPrintings){
  if(!row||typeof row.printing!=='string'||!isInt(row.copies)||row.copies<0)
   return false;
  if(targetPrint(row.printing)&&row.copies>0)return false;
  deckN+=row.copies;
 }
 if(deckN!==o.deckCount)return false;
 const zones=[h,o.discard,o.lostZone,o.resolvingSupporter,o.stadium];
 if(zones.some(z=>z.some(x=>typeof x!=='string'||targetPrint(x))))return false;
 const cards=countInPlay(o);
 if(cards===null||holders(o).some(x=>targetPrint(x.printing)||
  x.evolutionPrintings.some(targetPrint)))return false;
 // All 60 physical card positions are accounted for. With a legally fixed
 // singleton and none outside Prizes, its Prize membership is certain.
 const physicalTotal=deckN+o.prizeCount+h.length+o.discard.length+
  o.lostZone.length+o.resolvingSupporter.length+o.stadium.length+cards;
 return physicalTotal===60;
}
function activeStageNeed(view) {
 const o=view?.ownPublic,all=holders(o),hand=view?.ownHand;
 return Array.isArray(hand)&&all.some(x=>has(x.printing,'Dusclops')||
  has(x.printing,'Duskull'))&&
  !all.some(x=>targetPrint(x.printing))&&!hand.some(targetPrint);
}
function chooseRoot(request){
 const v=request?.observation,items=request?.actionFrontier?.items;
 if(!v||v.decisionKind!=='owner-root'||request.prompt!==null||
  !Array.isArray(items)||!activeStageNeed(v)||!fullyPrizedDusknoir(v)||
  !isInt(v.globalTurn)||v.ownTurnResources?.supporterPlayedTurn!==0||
  v.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
  return null;
 if(parent.chooseCertifiedLethal(v,items))return null;
 const hit=items.find(i=>i.kind==='play-card'&&
  has(i.actorPrinting,'Gladion')&&
  i.publicMetadata?.cardType==='trainer'&&
  isInt(i.publicMetadata.handIndex)&&
  has(v.ownHand[i.publicMetadata.handIndex],'Gladion'));
 return hit?{decision:{kind:'select-action',token:hit.token},
  reason:'V3G_PRIZE_PROVEN_STAGE2_GLADION_SUPPORTER_RESCUE'}:null;
}
function choosePrize(prompt,seat,pending,turn){
 if(!pending||!isInt(turn)||pending.turn!==turn||!prompt||
  prompt.actingSeat!==seat||prompt.source?.classification!=='actor-choice'||
  prompt.source?.sourceKind!=='card-effect'||
  !has(prompt.source?.sourcePrinting,'Gladion')||
  !Array.isArray(prompt.choices))return null;
 const p=prompt.publicMetadata;
 let valid=false,kind;
 if(prompt.promptType==='ChooseCardsPrompt'&&
   p?.selectionType==='card-combination'&&
   p.minimumCount===1&&p.maximumCount===1&&
   ['prize','prizes'].includes(p.sourceZone)){
   valid=true;kind='card';
 }
 if(prompt.promptType==='ChoosePrizePrompt'&&
   p?.selectionType==='prize-slots'&&p.requiredCount===1){
   valid=true;kind='prize-slot';
 }
 if(!valid||p.ownerSeat!=='actor'||p.isOwnerVisible!==true)return null;
 const target=prompt.choices.find(x=>x.kind===kind&&targetPrint(x.printing)&&
  x.publicMetadata?.isOwnerVisible===true&&
  x.publicMetadata?.ownerSeat==='actor'&&
  (x.publicMetadata?.sourceZone===p.sourceZone||
   (kind==='prize-slot'&&x.publicMetadata?.selectionType==='prize-slots')));
 return target?{decision:{kind:'select-choices',tokens:[target.token]},
  reason:'V3G_GLADION_SELECT_REVEALED_PRIZED_DUSKNOIR'}:null;
}
function wrapAudit(request,x){
 const decision=x.decision,available=request?.prompt?.choices??
  request?.actionFrontier?.items??[];
 const tokens=decision.token?[decision.token]:decision.tokens??[];
 return {decision,policyAudit:{
  schema:'agent6-policy-audit-v1',policyVersion:POLICY_VERSION,
  decisionKind:request?.observation?.decisionKind??'unknown',
  decisionType:decision.kind,selectionRuleCode:x.reason,
  tieBreakCode:'NONE',selectedTokens:tokens,
  evaluations:available.map(item=>({token:item.token,
   status:tokens.includes(item.token)?'rule-selected':'not-evaluated',
   score:null,reasonCode:tokens.includes(item.token)?x.reason:'V3G_NONSELECTED'}))
 }};
}
function createPolicy({role,seat,policyVersion,config}){
 if(role!=='candidate'||![0,1].includes(seat)||
  policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||
  Array.isArray(config)||Object.keys(config).length!==0)
  throw Error('V3G_RESEARCH_PROFILE_MISMATCH');
 const base=parent.createPolicy({role,seat,policyVersion:parent.POLICY_VERSION,config:{}});
 let pending=null;
 function decideWithAudit(request){
  const v=request?.observation;
  if(request?.role!==role||request?.seat!==seat||v?.actorSeat!==seat){
   pending=null;
   const out=base.decideWithAudit(request);
   return {...out,policyAudit:{...out.policyAudit,policyVersion:POLICY_VERSION}};
  }
  if(pending&&v.globalTurn!==pending.turn)pending=null;
  if(v.decisionKind==='owner-prompt'&&pending){
   const x=choosePrize(request.prompt,seat,pending,v.globalTurn);
   pending=null;
   if(x)return wrapAudit(request,x);
   // Do not delegate to v3's unrelated owner-prompt search handler after
   // the Gladion choice fails; abstain rather than expose wrong Prize.
   return wrapAudit(request,{decision:{kind:'abstain',
     reasonCode:'HIDDEN_PRIZE_IDENTITY'},reason:'V3G_NO_OWNER_VISIBLE_DUSKNOIR'});
  }
  if(v.decisionKind==='owner-root'&&request.prompt===null){
   pending=null;
   const x=chooseRoot(request);
   if(x){
    pending={turn:v.globalTurn};
    return wrapAudit(request,x);
   }
  }
  const out=base.decideWithAudit(request);
  return {...out,policyAudit:{...out.policyAudit,policyVersion:POLICY_VERSION}};
 }
 return {decide:r=>decideWithAudit(r).decision,decideWithAudit};
}
module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,
 fullyPrizedDusknoir,chooseRoot,choosePrize};
