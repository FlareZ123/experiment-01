'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {plannedTrials}=require('../evaluation/agent41-prospective-canonical-scout.cjs');
const {withNativeSupporterScoreDisposition}=require(
  './agent2-native-supporter-score-disposition.cjs');
const REG='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const root=path.resolve(__dirname,'../..');

function classify(tactic){
  if(tactic.heldSupporterPrintings.length===0)return 'no-supporter-held';
  if(tactic.evaluations.length===0)return 'held-but-no-score-evaluation';
  if(tactic.evaluations.every(x=>x.score==='undefined'))
    return 'all-simulation-scores-undefined';
  const finite=tactic.evaluations.filter(x=>Number.isFinite(x.score));
  if(finite.length===0)return 'all-scores-unavailable';
  if(!Number.isFinite(tactic.baseline)||
     !Number.isFinite(tactic.supporterBonus))
    return 'unknown-threshold';
  const threshold=tactic.baseline-tactic.supporterBonus;
  if(finite.some(x=>x.score>threshold))return 'positive-score-while-pass';
  return 'all-scores-below-bonus-threshold';
}

/**
 * Noninterference replay of a previously selected original Store fixture.
 * Captures the native bot's actual candidate scoring path before Pass.
 * @returns {object}
 */
function main(){
  const plan=JSON.parse(fs.readFileSync(path.join(root,REG),'utf8'));
  const trials=plannedTrials(plan).filter(x=>
    x.rank===6&&x.repeat===2&&x.candidateSlot==='A');
  assert.equal(trials.length,2);
  const options={...plan.frozenRunOptions,
    registeredTrials:trials,registeredFrameName:REG};
  const control=runDevelopment(options);
  const {result:audited,audit}=withNativeSupporterScoreDisposition(
    ()=>runDevelopment(options),{maxDecisions:1024});
  assert.equal(audited.rows.length,control.rows.length);
  for(let i=0;i<control.rows.length;i++){
    const a=control.rows[i],b=audited.rows[i];
    assert.equal(a.status,undefined);
    assert.equal(b.status,undefined);
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256,
      'Native Score observer changed actual accepted Store root decisions');
    assert.equal(a.finished,b.finished);
    assert.equal(a.winner,b.winner);
    assert.equal(a.actionCount,b.actionCount);
  }
  const pass=audit.events.filter(x=>x.nativeFinalAction==='PassTurnAction');
  const samples=pass.map(e=>{
    const t=e.tactics[0];
    const candidateSeat=audited.rows.find(row=>row.trial.candidateId===
      'champion-reference')?.candidateSeat??0;
    return {turn:e.turn,seat:e.seat,
      role:e.seat===candidateSeat?'candidate':'source',
      held:t?.heldSupporterPrintings??[],
      baseline:t?.baseline??null,
      supporterBonus:t?.supporterBonus??null,
      evaluations:t?.evaluations??[],
      disposition:t?classify(t):'tactic-not-invoked'};
  });
  const reasons={};
  for(const e of samples)
    reasons[e.disposition]=(reasons[e.disposition]??0)+1;
  const result={schema:'agent2-native-supporter-score-disposition-samedeal-v1',
    sourceRegistration:REG,enginePin:plan.enginePin,
    historicalOnly:true,qualifiedCompetitiveGames:0,
    control:audit.events.length?control.rows.map(x=>({
      id:x.trial.id,sourceDeal:x.sourceDealFingerprint,
      rootSha:x.rootActionLedgerSha256,actions:x.actionCount,
      finished:x.finished,winner:x.winner})):[],
    observerAudit:{nativeDecisions:audit.nativeDecisions,
      supporterTacticCalls:audit.supporterTacticCalls,
      storedTacticDecisionEvents:audit.storedTacticDecisionEvents,
      dropped:audit.dropped,storedPasses:audit.storedPasses,
      storedPassesHoldingSupporters:audit.storedPassesHoldingSupporters,
      storedPassesWithEvaluations:audit.storedPassesWithEvaluations,
      storedPassesAllEvaluationsUndefined:
        audit.storedPassesAllEvaluationsUndefined},
    passReasonCounts:reasons,
    candidatePassExamples:samples.filter(x=>x.role==='candidate').slice(0,16),
    sourcePassExamples:samples.filter(x=>x.role==='source').slice(0,16),
    notes:'Native bot score observations, not paper-legal playable Supporter proof. Same historical deal; no new independent trials.'};
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={classify,main};
