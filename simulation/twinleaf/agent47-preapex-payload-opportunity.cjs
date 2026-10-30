'use strict';

const assert=require('node:assert/strict');
const {chooseActorHandDiscard}=
  require('./agent47-actor-hand-discard.cjs');
const {directlyReadyApex}=
  require('./agent47-apex-discard-frontier.cjs');

const VERSION='agent47-preapex-future-payload-observation-v1';
const DRAGONS=new Set([
 'Dragapult ex TWM','Dialga-GX UPR','Mega Dragonite ex ASC',
 'Noivern ex PAL','Kyurem SFA','Regidrago V SIT'
]);
const REGIDRAGO=new Set(['Regidrago V SIT','Regidrago VSTAR SIT']);

/**
 * Read-only, actor-information-safe audit of legal discard alternatives
 * *before* Apex Dragon is immediately payable. It makes no future-turn
 * payoff, action-optimality, or match win probability claim.
 *
 * @param {{actor:object,prompt:{menu:string[][]}}} input
 * @returns {object}
 */
function inspectFutureApexDiscard(input){
 assert.ok(input?.actor && Array.isArray(input?.prompt?.menu));
 const actor=input.actor,own=actor.ownPublic;
 const candidatePokemon=[own.active,...own.bench].filter(Boolean);
 const regidragoOnBoard=candidatePokemon.some(p=>REGIDRAGO.has(p.printing));
 const activeVstar=own.active?.printing==='Regidrago VSTAR SIT';
 const directlyReady=directlyReadyApex(actor);
 const baseline=chooseActorHandDiscard(input).printings;
 const menu=input.prompt.menu;
 const payloadMenus=menu.filter(names=>names.some(name=>DRAGONS.has(name)));
 const baselineAlreadyDiscards=baseline.some(name=>DRAGONS.has(name));
 const priorPayload=own.discard?.some(name=>DRAGONS.has(name))===true;
 const candidates=payloadMenus.filter(names=>
  JSON.stringify(names)!==JSON.stringify(baseline));
 // Strict opportunity: a printed Dragapult/Dialga/etc. is in a native-valid
 // alternate hand-discard multiset while a Regidrago line is publicly present
 // and Apex cannot attack immediately. No proposed player action is made.
 const opportunity=regidragoOnBoard&&!directlyReady&&
   !baselineAlreadyDiscards&&candidates.length>0;
 let reason='preapex-alternative-payload';
 if(!regidragoOnBoard)reason='no-own-regidrago-on-board';
 else if(directlyReady)reason='apex-already-directly-ready';
 else if(baselineAlreadyDiscards)reason='baseline-already-discards-dragon';
 else if(payloadMenus.length===0)reason='no-valid-payload-discard-menu';
 const ownCounts=new Map();
 for(const name of actor.ownHand)
  ownCounts.set(name,(ownCounts.get(name)??0)+1);
 const soleCopyAlternative=candidates.some(names=>names.some(name=>
  DRAGONS.has(name)&&ownCounts.get(name)===1));
 return {
  version:VERSION,reason,opportunity,
  activeVstar,regidragoOnBoard,directlyReady,
  priorPayloadInPublicDiscard:priorPayload,
  alternativeMenus:candidates.length,
  baselineAlreadyDiscards,soleCopyAlternative,
  requiredDiscardCount:input.prompt.requiredCount,
  globallyObservedTurn:actor.globalTurn
 };
}
module.exports={VERSION,DRAGONS,REGIDRAGO,inspectFutureApexDiscard};
