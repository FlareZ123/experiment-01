'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {proveNativePivot} = require('../scripts/agent35-native-donor-settlement-proof.cjs');

/** @returns {[object,object]} */
function cohort() {
  const baselineRows = ['6:0:A:champion-reference',
    '6:0:A:new-moon-lockbreaker-v1',
    '11:2:B:champion-reference',
    '11:2:B:new-moon-lockbreaker-v1'].map((id,i) => ({
      trial:{id,seed:i<2?1:2}, candidateSeat:i<2?0:1,
      sourceDealFingerprint:i<2?'source6':'source11',actualStarterSeat:i<2?0:1,
      qualifiesForCompetitiveInference:false,
      rootActionLedgerSha256:'control-'+i, rootActionLedger:[],
      finished:i<2, actionCount:i<2?30:260
    }));
  const control = {attempted:4,competitiveQualifiedGames:0,
    ownerCompressorBenchedOptIn:true,rows:baselineRows};
  const treatment = structuredClone(control);
  const row = treatment.rows[3];
  row.rootActionLedgerSha256='treated-3';
  row.sourceActuallyFirst=false;
  row.rootActionLedger=[
    {actionOrdinal:198,turnBefore:51,turnAfter:51,
      playerSlot:1,action:'RetreatAction'},
    {actionOrdinal:199,turnBefore:51,turnAfter:51,
      playerSlot:1,action:'UseAbilityAction',ability:'Perfection'},
    {actionOrdinal:201,turnBefore:51,playerSlot:1,
      action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:199,
      attackChoice:{printing:'Gengar & Mimikyu-GX TEU',
        attackName:'Horror House-GX'}},
    {actionOrdinal:205,turnBefore:52,playerSlot:0,
      action:'AttackAction',attack:'Terminal Period'}
  ];
  row.actorOnlyDecisionCoverage={detailedComponentAudits:{root:{
    nativeRootAcceptances:[
      {seat:1,kind:'paid-retreat',accepted:true,
        nativePhysicalEffect:'confirmed-public-effect',
        before:{activePrintings:['Mega Absol ex M1L','Duskull VIV']},
        after:{activePrintings:['Mega Absol ex M1L','Mewtwo & Mew-GX UNM']}},
      {seat:1,kind:'perfection',accepted:true,
        nativePhysicalEffect:'attack-needs-declaration',
        intent:{donorPrinting:'Gengar & Mimikyu-GX TEU',
          attackName:'Horror House-GX'}}
    ]
  }}};
  row.candidateAttackSettlement={settled:1,attacks:[{
    actionOrdinal:201,attackName:'Horror House-GX',
    delegatedCopy:true,settledPromptChain:true,
    settlementCrossesClockReset:false,
    completionRootOrdinal:204,nextSourceSameEpochProven:true,
    nextSourceRoot:{ordinal:205,action:'AttackAction',attack:'Terminal Period'},
    prizesBefore:[6,6],prizesAfter:[6,6]
  }]};
  return [control,treatment];
}

test('positive archived shape requires actual physical retreat, copy and next-source action',()=>{
  const [control,treatment]=cohort();
  const receipt=proveNativePivot(control,treatment);
  assert.equal(receipt.qualifiedCompetitiveGames,0);
  assert.equal(receipt.rows[3].selectedRetreatOrdinal,198);
  assert.equal(receipt.rows[3].settledAtOrdinal,204);
  assert.equal(receipt.rows[3].sourceReplyRootOrdinal,205);
});

test('failure-closed against mere intention, unsettled copy, false opponent continuation',()=>{
  for(const mutate of [
    t=>{t.rows[3].actorOnlyDecisionCoverage.detailedComponentAudits.root.nativeRootAcceptances[0].accepted=false;},
    t=>{t.rows[3].candidateAttackSettlement.attacks[0].settledPromptChain=false;},
    t=>{t.rows[3].candidateAttackSettlement.attacks[0].nextSourceSameEpochProven=false;},
    t=>{t.rows[3].rootActionLedger=t.rows[3].rootActionLedger.slice(0,-1);},
    t=>{t.rows[3].candidateAttackSettlement.attacks[0].prizesAfter=[5,6];},
    t=>{t.rows[3].rootActionLedger[2].attackChoice.printing='Unknown';},
    t=>{t.rows[3].sourceDealFingerprint='different physical deal';},
    t=>{t.rows[2].rootActionLedgerSha256='unanticipated off-target change';}
  ]) {
    const [control,treatment]=cohort();
    mutate(treatment);
    assert.throws(()=>proveNativePivot(control,treatment));
  }
});
