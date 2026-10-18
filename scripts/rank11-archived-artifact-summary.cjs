'use strict';

const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {createHash} = require('node:crypto');

const INPUT_FILES = Object.freeze([
  'rank11-autonomous-source-regression.json',
  'rank11-autonomous-comparison.json',
  'aichi-rank11-newmoon-autonomous-pair.json'
]);

/** @param {string} name @returns {{source:object,sha256:string}} */
function read(name) {
  const bytes=readFileSync(name);
  return {source:JSON.parse(bytes.toString('utf8')),
    sha256:createHash('sha256').update(bytes).digest('hex')};
}
/** @param {object|null|undefined} audit @returns {object|null} */
function summarizeAudit(audit) {
  if (!audit) return null;
  return {
    version:audit.version,
    sourceSeat:audit.sourceSeat,
    opportunityDetected:audit.opportunityDetected,
    attemptedActions:audit.attemptedActions,
    completeAtDecisionBoundary:audit.completeAtDecisionBoundary,
    aborted:audit.aborted,
    nextTurnLockWitness:audit.nextTurnLockWitness
  };
}
/**
 * Small, inspectable transcript for archived source experiments.
 * This reports engine observations; no calculated game win rate is valid.
 * @returns {object}
 */
function summarize() {
  const files=Object.fromEntries(INPUT_FILES.map(name=>[name,read(name)]));
  const source=files[INPUT_FILES[0]].source;
  const comparison=files[INPUT_FILES[1]].source;
  const paired=files[INPUT_FILES[2]].source;
  assert.equal(source.archivedSeed,1244180408);
  assert.equal(source.opponentRank,11);
  assert.equal(source.policyAudit?.attemptedActions,11);
  assert.equal(source.policyAudit?.completeAtDecisionBoundary,true);
  assert.equal(comparison.sourceOpponentRank,11);
  assert.equal(comparison.outcomes?.length,4);
  assert.equal(comparison.competitiveWinRateCertified,false);
  assert.equal(paired.rows?.length,4);
  assert.equal(paired.strengthCertified,false);
  return {
    audit:'rank11-archived-source-policy-experiments-v1',
    sourceFiles:INPUT_FILES.map(name=>({path:name,sha256:files[name].sha256})),
    sourceRegression:{
      engine:source.engine,seed:source.archivedSeed,
      policyAudit:summarizeAudit(source.policyAudit),
      control:{finished:source.control?.finished,winner:source.control?.winner,
        actions:source.control?.actions,turns:source.control?.turns,
        prizes:source.control?.remainingPrizes},
      automatic:{finished:source.automatic?.finished,
        winner:source.automatic?.winner,actions:source.automatic?.actions,
        turns:source.automatic?.turns,prizes:source.automatic?.remainingPrizes},
      opponentFirstResponse:(source.automatic?.firstOpponentResponse||[])
        .slice(0,8).map(x=>({action:x.action,card:x.card,attack:x.attack,
          turnBefore:x.turnBefore}))
    },
    commonCampaign:{
      seedProtocol:'decorrelated-slots-v3',
      scheduled:comparison.outcomes.length,
      opponentOpportunitiesDetected:comparison.opponentOpportunitiesDetected,
      completedAutomaticLines:comparison.completedAutomaticLines,
      arms:comparison.outcomes.map(arm=>({
        trialId:arm.trialId,candidate:arm.candidateId,
        candidateSlot:arm.candidateEngineSlot,seed:arm.seed,
        status:arm.status,actualStartingOrder:arm.actualStartingOrder,
        audit:summarizeAudit(arm.sourcePolicyAudit),
        engineWinner:arm.winnerObservedByEngine,
        engineFinished:arm.observedFinished,
        actions:arm.actions,turns:arm.turns,endReason:arm.endReason,
        candidateAttackCount:arm.candidateAttacks?.length,
        opponentAttackCount:arm.opponentAttacks?.length,
        opponentFirstTurn:(arm.opposingFirstTurnDecisions||[]).slice(0,8)
          .map(x=>({action:x.action,card:x.card,attack:x.attack})),
        candidateResponse:(arm.candidateResponseDecisions||[]).slice(0,8)
          .map(x=>({action:x.action,card:x.card,attack:x.attack}))
      }))
    },
    archivedSourceFirstPolicyPair:{
      seed:paired.rows[0]?.sourceFirstSeed,
      arms:paired.rows.map(arm=>({
        candidate:arm.candidateId,profile:arm.policy,
        engineWinner:arm.outcome?.winnerIndex,
        engineFinished:arm.outcome?.finished,
        turns:arm.outcome?.turns,actions:arm.outcome?.actions,
        candidateAttacks:arm.outcome?.candidateAttacks?.length,
        opponentAttacks:arm.outcome?.rank11Attacks?.length,
        audit:summarizeAudit(arm.outcome?.rank11AutonomousPolicy)
      }))
    },
    competitiveWinRateCertified:false,
    sourceRuleAndBotCompetenceQualified:false
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(summarize(),null,2)+'\n');
}
module.exports={summarize};
