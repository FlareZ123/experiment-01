'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {shouldPrepareRaichu,SETUP_POKEMON}=
 require('./rank4-raichu-compressor-policy.cjs');
const VERSION='agent1-rank17-owner-visible-early-compressor-census-v1';
/** @param {object} state @param {0|1} seat @param {object} gamePhase */
function compressorOpportunity(state,seat,gamePhase){
 const p=state?.players?.[seat];
 if(!p||state.activePlayer!==seat||state.turn>2||
 state.phase!==gamePhase.PLAYER_TURN)return null;
 const visiblePredecessors=[p.active,...p.bench].map(slot=>
  slot.getPokemonCard()?.fullName).filter(name=>SETUP_POKEMON.has(name));
 const ownedHandCompressorCount=p.hand.cards.filter(c=>
  c.name==='Battle Compressor').length;
 return {turn:state.turn,sourceSeat:seat,ownedHandCompressorCount,
  visiblePredecessors,itemLocked:p.cannotPlayItemCards===true,
  pendingPrompt:state.prompts.some(x=>x.result===undefined),
  deckHasCards:p.deck.cards.length>0,
  tacticPrerequisitesSatisfied:shouldPrepareRaichu(
   state,p,gamePhase.PLAYER_TURN)};
}
/** @template T @param {()=>T} play @param {0|1} sourceSeat @param {object} [deps] */
function withCompressorOpportunityCensus(play,sourceSeat,deps={}){
 assert.equal(typeof play,'function');
 assert.ok(sourceSeat===0||sourceSeat===1);
 const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const SimpleTacticsAi=deps.SimpleTacticsAi??
  require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
 const GamePhase=deps.GamePhase??
  require(path.join(base,'game/store/state/state')).GamePhase;
 const original=Object.getOwnPropertyDescriptor(
  SimpleTacticsAi.prototype,'decodeNextAction');
 assert.equal(typeof original?.value,'function');
 const audit={version:VERSION,sourceSeat,rootCensus:[],
  sourceFirstTwoTurnDecisions:0,heldCompressorDecisions:0,
  visiblePredecessorDecisions:0,eligibleDecisions:0,
  eligibleCompressorSelected:0,readOnly:true,
  opponentHiddenZonesRead:false,paperQualified:false};
 function observedDecode(state){
  const actor=state.players?.findIndex(p=>p.id===this.client?.id);
  const snapshot=actor===sourceSeat?
   compressorOpportunity(state,sourceSeat,GamePhase):null;
  const selected=original.value.call(this,state);
  if(snapshot){
   const selectedKind=selected?.constructor?.name??null;
   const selectedCard=selectedKind==='PlayCardAction'?
    state.players[sourceSeat].hand.cards[selected.handIndex]?.name??null:null;
   const entry={...snapshot,selectedActionKind:selectedKind,selectedCard,
    actuallySelectedCompressor:selectedKind==='PlayCardAction'&&
     selectedCard==='Battle Compressor'};
   audit.sourceFirstTwoTurnDecisions++;
   if(entry.ownedHandCompressorCount>0)audit.heldCompressorDecisions++;
   if(entry.visiblePredecessors.length>0)audit.visiblePredecessorDecisions++;
   if(entry.tacticPrerequisitesSatisfied)audit.eligibleDecisions++;
   if(entry.tacticPrerequisitesSatisfied&&entry.actuallySelectedCompressor)
    audit.eligibleCompressorSelected++;
   audit.rootCensus.push(entry);
  }
  return selected;
 }
 Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
  ...original,value:observedDecode});
 try{return {result:play(),audit};}
 finally{Object.defineProperty(SimpleTacticsAi.prototype,
  'decodeNextAction',original);}
}
module.exports={VERSION,compressorOpportunity,withCompressorOpportunityCensus};
