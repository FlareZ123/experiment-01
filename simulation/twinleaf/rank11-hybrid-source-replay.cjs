'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11AutonomousOpener}=require('./rank11-autonomous-opener.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');

const CASES=[
  {seed:1244180408,expected:'vstar',maxActions:450},
  {seed:2026101804,expected:'direct',maxActions:48},
  {seed:2026101806,expected:'direct',maxActions:48},
  {seed:2026101817,expected:'direct',maxActions:48},
  {seed:2026101820,expected:'direct',maxActions:48}
];

/**
 * Historical, published authentic deals only. Verifies opt-in policy
 * composition without changing established profile behavior or claiming
 * game outcome competence.
 * @returns {object}
 */
function run() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank11=plan.opponents.find(deck=>deck.rank===11);
  assert.equal(rank11?.status,'ready');
  const rows=[];
  for(const entry of CASES){
    const request={
      deckA:rank11.cards,deckB:plan.candidate.cards,seed:entry.seed,
      maxActions:entry.maxActions,strictPromptValidation:true,
      forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true
    };
    const direct=withRank11DirectBoostShake(0,()=>
      withRank11AutonomousOpener(0,()=>runMatch(request),{
        allowSecondGlobalTurn:true,
        version:'rank11-vstar-own-first-v2-composed'
      })
    );
    const vstar=direct.result;
    const game=vstar.result;
    const auditD=direct.policyAudit;
    const auditV=vstar.policyAudit;
    assert.equal(game.deckHashes?.length,2);
    if(entry.expected==='vstar'){
      assert.equal(auditV.completeAtDecisionBoundary,true,
        'Archived first-start Back Order line lost under composition');
      assert.equal(auditD.opportunityTurn,null,
        'Disjoint VSTAR source line unexpectedly activated direct policy');
    }else{
      assert.equal(auditD.completed,true,
        'Source-second held-Shake line lost under composition: '+entry.seed);
      assert.equal(auditV.opportunityDetected,false,
        'VSTAR route should not hijack the held-Shake line');
    }
    rows.push({
      seed:entry.seed,firstTurnSlot:game.firstTurnSlot,
      expectedRoute:entry.expected,direct:auditD,vstar:auditV,
      gameFinished:game.finished,
      qualifiedForCompetitiveInference:false
    });
  }
  return {
    study:'pinned source-dealt rank11 composed-direct-and-vstar policy',
    engineRevision:plan.engineRevision,
    policy:'rank11-composed-direct-v1-and-own-first-vstar-v2',
    sourceRank:11,candidateReferenceRank:1,
    rows,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
