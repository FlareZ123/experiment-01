'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const engine=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const TARGETS=[
  'Secret Box','Boost Shake','Quick Ball','Ultra Ball','Battle VIP Pass',
  'Float Stone','Muscle Band','Trubbish','Garbodor','Temple of Sinnoh',
  'Dark Patch','VS Seeker','Iono','Crispin','Adventure Bag'
];

/**
 * A read-only, non-policy source scout on one previously disclosed original
 * physical deal. The experiment author is deliberately permitted to inspect
 * the native private source deck before an owner search for **diagnostics**;
 * no card decision or game result is conditioned upon this privileged look.
 * Therefore the output is a preparation aid for later explicit synthetic
 * mechanics fixtures, not an owner-visible game policy.
 *
 * @template T
 * @param {()=>T} execute Original native match.
 * @returns {{result:T,scout:object|null}}
 */
function withFirstSourceTurnScout(execute){
  const {SimpleTacticsAi}=require(path.join(engine,'simple-bot/simple-tactics-ai'));
  const {GamePhase}=require(path.join(engine,'game/store/state/state'));
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  let scout=null;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const owner=state.players.find(p=>p.id===this.client?.id);
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!scout&&owner?.id===101&&state.turn===1&&state.activePlayer===0&&
       state.phase===GamePhase.PLAYER_TURN&&!pending){
      const hand=owner.hand.cards;
      const deck=owner.deck.cards;
      scout={
        physicalOriginalSourceNoEdits:true,
        policyConsumedPrivilegedDeckKnowledge:false,
        observedSourceTurn:state.turn,
        sourceSeat:0,
        hand:hand.map(c=>c.fullName),
        active:owner.active.getPokemonCard()?.fullName??null,
        bench:owner.bench.map(s=>s.getPokemonCard()?.fullName??null),
        handCounts:Object.fromEntries(TARGETS.map(name=>[
          name,hand.filter(c=>c.name===name).length])),
        deckCounts:Object.fromEntries(TARGETS.map(name=>[
          name,deck.filter(c=>c.name===name).length])),
        ownPrizeSize:owner.prizes.reduce((n,s)=>n+s.cards.length,0),
        ownDeckSize:deck.length,
        ownHandSize:hand.length,
        noSearchOrInfoActionYet:true
      };
    }
    return previous.call(this,state);
  };
  try{return {result:execute(),scout};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=previous;}
}

function main(){
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const rank8=plan.opponents.find(d=>d.rank===8);
  assert.equal(rank8?.status,'ready');
  const request={
    deckA:rank8.cards,deckB:plan.candidate.cards,
    seed:1260748957,maxActions:80,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true
  };
  initializeCards();
  const control=runMatch(request);
  const scanned=withFirstSourceTurnScout(()=>runMatch(request));
  assert.ok(scanned.scout,'Previous source-first source seed did not reach first turn');
  assert.deepEqual(scanned.result.decisionTrace,control.decisionTrace,
    'Privileged research-only first-turn scout altered native play');
  assert.deepEqual(scanned.result.deckHashes,control.deckHashes);
  return {
    schema:'agent44-native-original-rank8-firstturn-source-scout-v1',
    seed:request.seed,sourceSeat:0,
    source60Original:true,decisionTraceUnchanged:true,
    privilegedDeckDiagnosticOnly:true,
    competitiveQualifiedGames:0,
    scout:scanned.scout,
    caveat:'Researcher-only access to concealed owner deck used to prepare a later separately marked synthetic mechanics fixture. No owner action or policy informed by that knowledge.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={TARGETS,withFirstSourceTurnScout,main};
