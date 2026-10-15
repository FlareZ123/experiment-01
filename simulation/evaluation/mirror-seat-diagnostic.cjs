'use strict';
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const plan=planAichi(1,{allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
if(!plan.candidate.cards)throw Error('rank1 not resolved');
const deck=plan.candidate.cards;
const counts={winA:0,winB:0,draw:0,unfinished:0,error:0,startedA:0,startedB:0,winnerFirst:0,winnerSecond:0};
const games=[];
for(let i=0;i<16;i++){
 const seed=2026101500+i;
 try{
  const g=runMatch({deckA:deck,deckB:deck,seed,maxActions:800,label:'identical-deck-seat-diagnostic'});
  const checked=g.verifiedByDrawLog===true && (g.firstTurnSlot===0||g.firstTurnSlot===1) &&
   g.firstTurnPlayerId===(g.firstTurnSlot===0?101:202) && g.firstTurnPlayerName===g.firstDrawLogName;
  if(checked)counts[g.firstTurnSlot===0?'startedA':'startedB']++;
  if(!g.finished)counts.unfinished++;
  else if(g.winner===0)counts.winA++;
  else if(g.winner===1)counts.winB++;
  else if(g.winner===3)counts.draw++;
  if(g.finished&&checked&&(g.winner===0||g.winner===1))counts[g.winner===g.firstTurnSlot?'winnerFirst':'winnerSecond']++;
  games.push({seed,finished:g.finished,winner:g.winner,firstSlot:checked?g.firstTurnSlot:null,actions:g.actions,turns:g.turns,prizes:g.prizesRemaining,attacks:g.attackTrace.length});
 }catch(e){counts.error++;games.push({seed,error:String(e.message||e)});}
}
console.log(JSON.stringify({purpose:'engine seat-fairness smoke not competitive evidence',candidateDigest:plan.candidateDigest,engine:plan.engineRevision,policy:'Twinleaf SimpleTacticsAi',counts,games},null,2));
