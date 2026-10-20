'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');

const VERSION='agent1-actor-evolution-source-pairs-v1';
const SEEDS=Object.freeze([101,509,2026,7777,11021,22111,33333,44444]);
const SETTINGS=Object.freeze({
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Run an unchanged source-dealt game with one development-only root toggle.
 * The wrapper remains unqualified because unsupported prompts use native
 * generic bot decisions. No result here is a tournament win-rate estimate.
 * @param {string[]} deckA @param {string[]} deckB
 * @param {number} seed @param {boolean} enabled
 * @returns {object}
 */
function arm(deckA,deckB,seed,enabled){
 const test=withActorOnlyRootPolicy(()=>runMatch({
  deckA,deckB,seed,maxActions:128,
  label:'agent1-natural-evolution-dev-'+(enabled?'on':'off'),
  strictPromptValidation:true,
  captureInitialFullPhysicalDeal:true
 }),{naturalEvolutionRoot:enabled});
 const a=test.audit,g=test.result;
 const evolutions=a.nativeRootAcceptances.filter(row=>
   row.kind==='evolve-pokemon').map(row=>({
     turn:row.globalTurn,seat:row.seat,printing:row.intent.printing,
     accepted:row.accepted,physicalEffect:row.nativePhysicalEffect??null
   }));
 return {
  seed,enabled,gameActions:g.actions,gameTurns:g.turns,
  finished:g.finished,endReason:g.endReason,winner:g.winner,
  deckHashes:g.deckHashes,firstTurnSlot:g.firstTurnSlot,
  initialDealDigest:digest(g.initialFullPhysicalDealFingerprint),
  selectedActorRoots:a.selectedRootDecisions,
  acceptedActorRoots:a.acceptedActorRoots,
  rejectedActorRoots:a.rejectedActorRoots,
  rootIntentCounts:a.typedIntentCounts,
  physicallyConfirmedRootActions:a.nativePhysicalConfirmed,
  genericPromptFallbacks:a.unsupportedPromptFallbacks,
  nativePhysicalEvolutionWitnesses:evolutions.filter(x=>
    x.physicalEffect==='confirmed-public-effect').length,
  evolutionEvents:evolutions,
  competitiveGameQualified:false
 };
}

/** @returns {object} Frozen-seed, both-seat development evidence. */
function run(){
 const plan=planAichi(1,SETTINGS);
 const opponent=plan.opponents.find(x=>x.rank===10);
 assert.equal(plan.candidate.cards?.length,60);
 assert.equal(opponent?.status,'ready');
 assert.equal(opponent.cards.length,60);
 const pairs=[];
 for(const seed of SEEDS){
  const baseline=arm(plan.candidate.cards,opponent.cards,seed,false);
  const enabled=arm(plan.candidate.cards,opponent.cards,seed,true);
  assert.deepEqual(enabled.deckHashes,baseline.deckHashes);
  assert.equal(enabled.firstTurnSlot,baseline.firstTurnSlot);
  assert.equal(enabled.initialDealDigest,baseline.initialDealDigest,
    'A pair changed its physical starting deal');
  pairs.push({seed,baseline,enabled,identicalStartingDeal:true});
 }
 return {
  schema:VERSION,engine:plan.engineRevision,
  source:plan.source,manifestDigest:plan.manifestDigest,
  sourceRanks:[1,10],fixedCandidateDeckDigest:plan.candidateDigest,
  seeds:SEEDS,maximumActionsPerArm:128,
  pairs,paperLegalPlayingStrengthValidated:false,
  qualifiedCompetitiveGames:0,
  caveat:'Both policies retain generic prompt fallback. Small two-rank source-dealt developmental control only.'
 };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={VERSION,SEEDS,SETTINGS,arm,run};
