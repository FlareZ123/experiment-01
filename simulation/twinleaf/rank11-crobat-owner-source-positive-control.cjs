'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {withRank11CrobatTerminalPolicy}=
  require('./rank11-crobat-terminal-policy.cjs');

/**
 * Frozen historical positive control only. The portable policy itself has
 * no seed, rank-turn, or root-ordinal matching. Run this once to validate
 * genuine Store action and prompt chaining before using fresh deals.
 * @returns {object}
 */
function run(){
  const seed=1111464409;
  const rank11=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(d=>d.rank===11);
  assert.equal(rank11?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  const args=[candidate,rank11.cards,1,seed,350,true,true,false,false,true];
  const ordinary=runArm(...args);
  const {result:patched,audit}=
    withRank11CrobatTerminalPolicy(0,()=>runArm(...args));
  assert.equal(ordinary.firstTurnSlot,0);
  assert.equal(patched.firstTurnSlot,0);
  assert.equal(patched.verifiedByDrawLog,true);
  assert.deepEqual(patched.deckHashes,ordinary.deckHashes);
  const prefix=game=>game.rootActionLedger.filter(r=>r.actionOrdinal<220)
    .map(r=>({ordinal:r.actionOrdinal,turn:r.turnBefore,
      slot:r.playerSlot,action:r.action,card:r.card??null}));
  assert.deepEqual(prefix(ordinary),prefix(patched),
    'The untouched preceding historical source roots should remain identical');
  const fang=patched.publicAttackTransitions.find(e=>
    e.turnBefore===23 && e.triggerPlayerSlot===0 &&
    e.declarations.some(d=>d.attackName==='Venomous Fang'));
  return {
    schema:'rank11-crobat-owner-policy-historical-positive-control-v1',
    seed,retrospectiveOnly:true,
    publishedRank:11,candidate:'New Moon Lockbreaker v1 English proxy',
    policy:audit,originalPrefixBefore220Identical:true,
    original:{finished:ordinary.finished,winner:ordinary.winner,
      prizes:ordinary.prizesRemaining,turn:ordinary.turns},
    alternative:{finished:patched.finished,winner:patched.winner,
      prizes:patched.prizesRemaining,turn:patched.turns},
    venomousFangPublicTransition:fang??null,
    qualifiedCompetitiveGames:0,
    scope:'Preselected development regression. No candidate win-rate claim.'
  };
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(r.policy.attempts.length===0 ||
     !r.policy.attempts.some(x=>x.status==='attack-declared'))process.exitCode=1;
}
module.exports={run};
