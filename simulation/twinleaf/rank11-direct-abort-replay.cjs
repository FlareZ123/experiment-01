'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
const SEED=207674218;

/** @returns {object} Source-dealt, owner-deck search audit of one negative sample. */
function run(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(d=>d.rank===11);
  assert.equal(source?.status,'ready');
  const attempt=withRank11DirectBoostShake(0,()=>runMatch({
    deckA:source.cards,deckB:plan.candidate.cards,seed:SEED,
    maxActions:48,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true
  }));
  assert.equal(attempt.result.firstTurnSlot,0);
  assert.equal(attempt.policyAudit.opportunityTurn,1);
  assert.equal(attempt.policyAudit.aborted?.step,'garbodor-search');
  assert.equal(attempt.policyAudit.aborted?.ownerDeckSearch,true);
  assert.equal(attempt.policyAudit.completed,false);
  return {
    study:'rank11 authentic source owner-visible Garbodor search failure',
    sourceRank:11,sourceSeat:0,seed:SEED,
    sourceManifest:plan.manifestDigest,
    engine:plan.engineRevision,policyAudit:attempt.policyAudit,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
