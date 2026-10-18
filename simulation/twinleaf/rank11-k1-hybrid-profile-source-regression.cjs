'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {RANK11_K1_HYBRID_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');
const CASES=[
  {seed:1244180408,sourceSeat:0,expected:'vstar'},
  {seed:1325646358,sourceSeat:0,expected:'direct'},
  {seed:2026101804,sourceSeat:0,expected:'direct'},
  {seed:207674218,sourceSeat:0,expected:'k1-abort'},
  {seed:2674826499,sourceSeat:1,expected:'direct'},
  {seed:1497638016,sourceSeat:1,expected:'direct'}
];

/** @returns {object} Actual source-dealt composite-policy regression. */
function run(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(deck=>deck.rank===11);
  assert.equal(source?.status,'ready');
  const records=[];
  for(const t of CASES){
    const game=runWithResearchProfile({
      deckA:t.sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:t.sourceSeat===1?source.cards:plan.candidate.cards,
      seed:t.seed,rank11SourceSeat:t.sourceSeat,
      maxActions:t.expected==='vstar'?450:48,
      strictPromptValidation:true,
      forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true
    },RANK11_K1_HYBRID_PROFILE);
    assert.equal(game.researchPolicyProfile,RANK11_K1_HYBRID_PROFILE);
    const direct=game.rank11DirectPolicy;
    const vstar=game.rank11AutonomousPolicy;
    if(t.expected==='vstar'){
      assert.equal(vstar.completeAtDecisionBoundary,true);
      assert.equal(direct.opportunityTurn,null);
    } else if(t.expected==='direct'){
      assert.equal(direct.completed,true,
        'Source direct route changed under composed policy: '+JSON.stringify(t));
      assert.equal(vstar.opportunityDetected,false);
    } else {
      assert.equal(direct.aborted?.reason,'own-deck-search-established-no-Garbodor');
      assert.equal(direct.aborted?.ownerDeckSearch,true);
      assert.equal(direct.aborted?.garbodorInOwnerSearch,0);
      assert.deepEqual(direct.actions.map(x=>x.step),['vip','trubbish-search']);
    }
    records.push({
      ...t,actualFirstTurnSlot:game.firstTurnSlot,
      sourceActuallyFirst:game.firstTurnSlot===t.sourceSeat,
      direct,vstar,finished:game.finished,
      qualifiedForCompetitiveInference:false
    });
  }
  return{
    study:'rank11 source-dealt composite K1/direct/Star Alchemy and Supporter profile',
    version:RANK11_K1_HYBRID_PROFILE,
    sourceRank:11,candidateRank:1,sourceManifest:plan.manifestDigest,
    engine:plan.engineRevision,
    records,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
