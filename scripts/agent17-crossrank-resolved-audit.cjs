'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {TRIGGER_IDS}=require('../simulation/evaluation/agent17-crossrank-trigger-replay.cjs');

const EXPECTED=Object.freeze({
  '6:0:A:champion-reference':{
    seed:407516727,rank:6,sourceFirst:false,sourceOrdinal:27,
    settledOrdinal:30,candidateOrdinal:31,candidateAttack:'Pale Moon-GX',
    sourceReplyOrdinal:45
  },
  '6:0:A:new-moon-lockbreaker-v1':{
    seed:407516727,rank:6,sourceFirst:false,sourceOrdinal:26,
    settledOrdinal:29,candidateOrdinal:30,candidateAttack:null,
    sourceReplyOrdinal:37
  },
  '6:2:A:new-moon-lockbreaker-v1':{
    seed:2394734225,rank:6,sourceFirst:true,sourceOrdinal:39,
    settledOrdinal:42,candidateOrdinal:43,candidateAttack:null,
    sourceReplyOrdinal:52
  },
  '11:2:B:champion-reference':{
    seed:623585882,rank:11,sourceFirst:false,sourceOrdinal:22,
    settledOrdinal:null,candidateOrdinal:29,candidateAttack:null,
    sourceReplyOrdinal:41
  }
});

/** @returns {number} */
function printedVoltCycloneBaseDamage() {
  const cards=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../resources/cards/en/sv6.json'),'utf8'));
  const card=cards.find(card=>card.id==='sv6-77'&&
    card.name==='Iron Thorns ex');
  const attack=card?.attacks.find(attack=>attack.name==='Volt Cyclone');
  assert(attack && attack.damage==='140');
  return Number(attack.damage);
}

/**
 * Golden-action replay verification, not a new prospective sample.
 * @param {object} report
 * @returns {object}
 */
function audit(report) {
  assert.equal(report?.schema,'agent17-retrospective-crossrank-bilateral-store-v1');
  assert.equal(report.currentEnginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(report.originalCompiledRun,39193837824);
  assert.equal(report.originallyRegisteredTotal,48);
  assert.equal(report.originallyExecutedPartition0,24);
  assert.equal(report.retrospectiveReplayedRows,4);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.equal(report.rankingPermitted,false);
  assert(Array.isArray(report.rows) && report.rows.length===4);
  assert.deepEqual(report.rows.map(row=>row.id),TRIGGER_IDS);
  const damage=printedVoltCycloneBaseDamage();
  const done=[];
  for (const row of report.rows) {
    const rule=EXPECTED[row.id];
    assert(rule);
    assert.equal(row.seed,rule.seed);
    assert.equal(row.sourceRank,rule.rank);
    assert.equal(row.sourceActuallyFirst,rule.sourceFirst);
    assert.equal(row.verifiedFirstTurn,true);
    assert.equal(row.status,'engine-terminal');
    assert.equal(row.qualifiedCompetitiveGame,false);
    const packet=row.sourceReplyPacket;
    assert(packet && packet.qualifiedCompetitiveGame===false);
    assert.equal(packet.sourceSeat,rule.rank===6?1:0);
    assert.equal(packet.sourceTriggerTurn,rule.rank===6?
      (rule.sourceFirst?3:2):2);
    assert.equal(packet.executedSourceRoot?.ordinal,rule.sourceOrdinal);
    assert.equal(packet.firstCandidateNextTurnRoot?.ordinal,rule.candidateOrdinal);
    assert.equal(packet.nextSourceTurnRoot?.ordinal,rule.sourceReplyOrdinal);
    const candidate=packet.candidateSameTurnAttackDeclarations;
    assert(Array.isArray(candidate));
    assert.deepEqual(candidate.map(item=>item.attackName),
      rule.candidateAttack?[rule.candidateAttack]:[]);
    assert.equal(packet.sourceEffectVerified,false);
    assert.equal(packet.candidateReplyCompetenceVerified,false);
    if(rule.rank===6) {
      assert.equal(packet.executedSourceRoot.action,'AttackAction');
      assert.equal(packet.executedSourceRoot.attack,'Volt Cyclone');
      assert.equal(packet.matchingSourceAttackDeclared,true);
      const t=packet.sourceImmediatePublicAttackTransition;
      assert(t && t.promptPendingAfter===true && t.settled);
      assert.equal(t.actionOrdinal,rule.sourceOrdinal);
      assert.equal(t.settled.completionRootActionOrdinal,rule.settledOrdinal);
      assert.deepEqual(t.settled.prizesRemaining,[6,6]);
      const before=t.before[packet.candidateSeat].active;
      const after=t.settled.after[packet.candidateSeat].active;
      assert(before && after && before.name===after.name);
      assert.equal(after.damage-before.damage,damage);
      done.push({id:row.id,damage,defender:after.name,
        confirmedSourceRoot:rule.sourceOrdinal,
        confirmedPromptClosure:rule.settledOrdinal,
        candidateAttack:rule.candidateAttack});
    }else{
      assert.equal(packet.executedSourceRoot.action,'PlayCardAction');
      assert.equal(packet.executedSourceRoot.card,'Boost Shake');
      assert.equal(packet.matchingSourceAttackDeclared,false);
      assert.equal(packet.sourceImmediatePublicAttackTransition,null);
      assert.equal(row.sourcePolicyAudit?.nextTurnLockWitness?.equippedGarbodor,
        true,'Original Tool-equipped Garbodor witness lost');
      done.push({id:row.id,sourceItem:'Boost Shake',
        witnessedEquippedGarbodor:true,candidateAttack:null});
    }
    if(row.id==='6:0:A:new-moon-lockbreaker-v1'){
      assert.equal(row.rootActionLedgerSha256,
        '9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913');
      assert.equal(row.archivedRootLedgerMatched,true);
    }
  }
  return {
    schema:'agent17-four-trigger-retrospective-verification-v1',
    observedSelectedArms:4,uniquePhysicalSourceDeals:3,
    exactSourceAttackAndPromptDamageWitnesses:3,
    printedBaseDamage:damage,
    actualCandidateReplyAttacks:1,
    equippedGarbodorSetupWitnesses:1,
    originalRootLedgerByteStable:1,
    observations:done,competitiveQualifiedGames:0,
    selectionVerdict:'INCONCLUSIVE',
    claim:'One historically selected, mechanically verified comparison. No card-list winning probability inference.'
  };
}

module.exports={audit,EXPECTED,printedVoltCycloneBaseDamage};
if(require.main===module){
  assert.equal(process.argv.length,3,'Pass the forensic JSON artifact path');
  const report=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(audit(report),null,2)+'\n');
}
