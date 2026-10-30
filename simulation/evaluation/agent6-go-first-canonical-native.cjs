'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {Store}=require('../../vendor/twinleaf/ptcg-server/output/game/store/store');
const {SimpleTacticsAi}=require('../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai');

/**
 * Test composition in both method-hook nesting orders under original Store.
 * Capture only the first settled real turn. Nothing is a competitive game.
 * @param {object} decks Frozen printed 60s, starting seed, and native options.
 * @param {0|1} sourceSeat Physical slot of the original Aichi opponent.
 * @param {[boolean,boolean]} preferences Winner-first preference by physical seat.
 * @param {'choice-outer'|'canonical-outer'} order Method-hook nesting order.
 * @returns {object} Original native player-turn draw-log proof.
 */
function runOne(decks,sourceSeat,preferences,order){
  const native=()=>captureSetupOnly(Store,()=>runMatch(decks),{
    sourceSeat,captureFirstTurnEvidence:true});
  let captured,choice,canonical;
  if(order==='choice-outer'){
    const result=withGoFirstChoice(preferences,
      ()=>withCanonicalActorOnlyPolicy(native));
    canonical=result.result;
    captured=canonical.result;
    choice=result.audit;
  }else{
    canonical=withCanonicalActorOnlyPolicy(
      ()=>withGoFirstChoice(preferences,native));
    captured=canonical.result.result;
    choice=canonical.result.audit;
  }
  assert.equal(captured.stoppedAtFirstTurn,true);
  assert.equal(captured.firstTurnEvidence?.verifiedByDrawLog,true);
  assert.equal(choice.choices.length,1);
  const observed=choice.choices[0];
  const winner=observed.seat;
  assert.ok(winner===0||winner===1);
  assert.equal(observed.chooseFirst,preferences[winner]);
  const first=captured.firstTurnEvidence.firstTurnSlot;
  assert.equal(first,preferences[winner]?winner:1-winner);
  assert.equal(canonical.audit.qualification.competitiveGames,0);
  assert.equal(canonical.audit.qualification.fullyActorOnly,false);
  return {order,preferences,winner,first,
    nativeDrawLogVerified:true,canonicalVersion:canonical.audit.version};
}

/** Run four rank-seat original-deck pairs, each with four nested controls. */
function run(){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const rows=[];
  for(const rank of [6,11]){
    const source=plan.opponents.find(x=>x.rank===rank);
    assert.equal(source?.status,'ready');
    for(const sourceSeat of [0,1]){
      const seed=sourceSeat===0?24941728:1460221882;
      const decks={deckA:sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:sourceSeat===1?source.cards:plan.candidate.cards,
        seed,maxActions:150,strictPromptValidation:true};
      const arms=[];
      for(const preferences of [[true,false],[false,true]]){
        for(const order of ['choice-outer','canonical-outer']){
          arms.push(runOne(decks,sourceSeat,preferences,order));
          assert.deepEqual(Object.getOwnPropertyDescriptor(
            SimpleTacticsAi.prototype,'decodeNextAction'),original);
        }
      }
      const winners=new Set(arms.map(x=>x.winner));
      assert.equal(winners.size,1);
      assert.equal(arms[0].first,arms[1].first);
      assert.equal(arms[2].first,arms[3].first);
      assert.notEqual(arms[0].first,arms[2].first);
      rows.push({rank,sourceSeat,seed,arms});
    }
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction'),original);
  return {schema:'agent6-canonical-go-first-nesting-v1',rows,
    nativeSetupControls:rows.length*4,competitiveQualifiedGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
