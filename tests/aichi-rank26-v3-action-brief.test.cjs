'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {PROFILE,summarize}=
  require('../scripts/aichi-rank26-v3-action-brief.cjs');

/** @returns {object} */
function stagedReport(){
  return {
    expectedPolicyProfile:PROFILE,
    competitiveWinRateCertified:false,
    selectedTrialIds:['pilot:26:0:new-moon-lockbreaker-v1:A'],
    records:[{
      trialId:'pilot:26:0:new-moon-lockbreaker-v1:A',
      rank:26,candidateEngineSlot:'A',seed:100,status:'completed',
      observedResearchPolicyProfile:PROFILE,
      firstTurn:{verifiedByDrawLog:true,firstTurnSlot:1},
      rank26PropagationPolicy:{
        actions:[{kind:'propagate'},{kind:'propagate'}]
      },
      rank26PumpPolicy:{actions:[{action:'PlayCardAction'}]},
      decisionTrace:[
        {playerSlot:1,turnBefore:1,actionOrdinal:10,
          action:'UseAbilityAction',ability:'Propagation'},
        {playerSlot:1,turnBefore:1,actionOrdinal:11,
          action:'PlayCardAction',card:'Exeggcute'},
        {playerSlot:0,turnBefore:1,actionOrdinal:12,
          action:'PlayCardAction',card:'Risky Ruins'},
        {playerSlot:1,turnBefore:1,actionOrdinal:13,
          action:'PlayCardAction',card:'Damage Pump'}
      ],
      cardsPlayedBySeat:[{}, {'Exeggcute':1,'Damage Pump':1}],
      attackDeclarationTrace:[],
      observedFinished:true,winner:'opponent'
    }]
  };
}
test('keeps two speculative selections separate from one actual root Propagation',()=>{
  const out=summarize(stagedReport());
  assert.equal(out.qualifiedCompetitiveGames,0);
  assert.equal(out.records[0].proposedRecoverySelections,2);
  assert.equal(out.records[0].rootPropagationActions,1);
  assert.equal(out.records[0].rootExeggcuteBenchActions,1);
  assert.equal(out.records[0].rootDamagePumpActions,1);
  assert.equal(out.records[0].rootRiskyRuinsActions,0);
  assert.equal(out.records[0].sourceFirstFromDrawLog,true);
  assert.equal(out.records[0].playedCardLedger.Exeggcute,1);
});
test('unobserved decision log remains null, and archive identity fails closed',()=>{
  const raw=stagedReport();
  raw.records[0].decisionTrace=null;
  assert.equal(summarize(raw).records[0].rootPropagationActions,null);
  raw.records[0].rank26PropagationPolicy=null;
  assert.equal(summarize(raw).records[0].proposedRecoverySelections,null);
  raw.expectedPolicyProfile='simple-default-v0';
  assert.throws(()=>summarize(raw),/complete source-locked/);
});
