'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {plannedTrials}=require('../evaluation/agent41-prospective-canonical-scout.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('./agent24-native-lillie-settlement-audit.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const OLD_SHA={
  '6:2:A:champion-reference':
    '646d18531504d91435f4c743bd2460c2659a6cee4a7203b286996683d1985e8b',
  '6:2:A:new-moon-lockbreaker-v1':
    'd265f791ba8a6e352238bb02f9a48e23a7ab16af0549f2684689b2da31971f1c'
};
/**
 * Historic same-deal, same-sixty opt-in development-only positive controls.
 * Every loss, unchanged outcome, cap, prompt abort and source reply survives.
 * @returns {object}
 */
function main(){
  const frame=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  const registered=plannedTrials(frame).filter(x=>
    x.rank===6&&x.repeat===2&&x.candidateSlot==='A');
  assert.equal(registered.length,2);
  const cfg={...frame.frozenRunOptions,
    registeredTrials:registered,registeredFrameName:REG};
  delete process.env.AGENT2_SHUFFLE_SUPPORTER_DEV;
  const baseline=runDevelopment(cfg);
  assert.equal(baseline.rows.length,2);
  for(const row of baseline.rows){
    assert.equal(row.status,undefined);
    assert.equal(row.rootActionLedgerSha256,OLD_SHA[row.trial.id],
      'Frozen original historical root hash differs: stop comparison');
  }
  process.env.AGENT2_SHUFFLE_SUPPORTER_DEV='true';
  let treated;
  try{
    treated=withNativeLillieDrawSettlementAudit(()=>runDevelopment(cfg));
  }finally{
    delete process.env.AGENT2_SHUFFLE_SUPPORTER_DEV;
  }
  assert.equal(treated.result.rows.length,2);
  const records=treated.result.rows.map((row,i)=>{
    const original=baseline.rows[i];
    assert.equal(row.trial.id,original.trial.id);
    assert.equal(row.sourceDealFingerprint,original.sourceDealFingerprint);
    assert.equal(row.candidateSeat,original.candidateSeat);
    const policy=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.ownerShuffleSupporter??null;
    return {trial:row.trial.id,candidateSeat:row.candidateSeat,
      physicalDeal:row.sourceDealFingerprint,
      baselineStatus:original.status??'native-complete',
      treatmentStatus:row.status??'native-complete',
      baselineRootSha:original.rootActionLedgerSha256,
      treatedRootSha:row.rootActionLedgerSha256??null,
      baselineActions:original.actionCount,treatedActions:row.actionCount??null,
      baselineFinished:original.finished,treatedFinished:row.finished??null,
      baselineWinner:original.winner,treatedWinner:row.winner??null,
      shuffleAudit:policy};
  });
  const report={schema:'agent2-actor-shuffle-supporter-samedeal-v1',
    sameSourcePhysicalDealEveryArm:true,original60sUnchanged:true,
    historicalSelectedNotPreregisteredStrengthExperiment:true,
    qualifiedCompetitiveGames:0,registeredSource:REG,
    bothSeatsPolicyEnabled:true,baselineNoPolicyFlag:true,
    effects:treated.audit,records,
    interpretation:'An authentic noncompetitive Store action-space probe. No win-rate or source policy competence inference.'};
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module)main();
module.exports={main};
