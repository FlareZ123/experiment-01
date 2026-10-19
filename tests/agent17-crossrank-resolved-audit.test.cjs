'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {TRIGGER_IDS}=
  require('../simulation/evaluation/agent17-crossrank-trigger-replay.cjs');
const {audit,EXPECTED,printedVoltCycloneBaseDamage}=
  require('../scripts/agent17-crossrank-resolved-audit.cjs');

function fixture() {
  return {
    schema:'agent17-retrospective-crossrank-bilateral-store-v1',
    currentEnginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalCompiledRun:39193837824,
    originallyRegisteredTotal:48,
    originallyExecutedPartition0:24,
    retrospectiveReplayedRows:4,qualifiedCompetitiveGames:0,
    rankingPermitted:false,
    rows:TRIGGER_IDS.map(id=>{
      const e=EXPECTED[id],isRank6=e.rank===6;
      const target={name:isRank6?'Trevenant & Dusknoir-GX':'Garbodor',damage:0};
      const before=[{active:{...target}},{active:{...target}}];
      const after=[{active:{...target}},{active:{...target}}];
      if(isRank6)after[0].active.damage=140;
      const packet={
        sourceSeat:isRank6?1:0,candidateSeat:isRank6?0:1,
        sourceTriggerTurn:isRank6?(e.sourceFirst?3:2):2,
        executedSourceRoot:{
          ordinal:e.sourceOrdinal,
          action:isRank6?'AttackAction':'PlayCardAction',
          ...(isRank6?{attack:'Volt Cyclone'}:{card:'Boost Shake'})
        },
        matchingSourceAttackDeclared:isRank6,
        sourceImmediatePublicAttackTransition:isRank6?{
          actionOrdinal:e.sourceOrdinal,promptPendingAfter:true,
          before,settled:{completionRootActionOrdinal:e.settledOrdinal,
            after,prizesRemaining:[6,6]}
        }:null,
        firstCandidateNextTurnRoot:{ordinal:e.candidateOrdinal},
        nextSourceTurnRoot:{ordinal:e.sourceReplyOrdinal},
        candidateSameTurnAttackDeclarations:e.candidateAttack?
          [{attackName:e.candidateAttack}]:[],
        sourceEffectVerified:false,candidateReplyCompetenceVerified:false,
        qualifiedCompetitiveGame:false
      };
      return {
        id,seed:e.seed,sourceRank:e.rank,sourceActuallyFirst:e.sourceFirst,
        verifiedFirstTurn:true,status:'engine-terminal',
        qualifiedCompetitiveGame:false,
        sourcePolicyAudit:isRank6?{}:{
          nextTurnLockWitness:{equippedGarbodor:true}
        },
        rootActionLedgerSha256:id==='6:0:A:new-moon-lockbreaker-v1'?
          '9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913':null,
        archivedRootLedgerMatched:id==='6:0:A:new-moon-lockbreaker-v1'?true:null,
        sourceReplyPacket:packet
      };
    })
  };
}

test('source printed Iron Thorns ex attack has 140 damage',()=>{
  assert.equal(printedVoltCycloneBaseDamage(),140);
});

test('four golden mechanics rows qualify only as retrospective response packets',()=>{
  const output=audit(fixture());
  assert.equal(output.exactSourceAttackAndPromptDamageWitnesses,3);
  assert.equal(output.actualCandidateReplyAttacks,1);
  assert.equal(output.equippedGarbodorSetupWitnesses,1);
  assert.equal(output.uniquePhysicalSourceDeals,3);
  assert.equal(output.competitiveQualifiedGames,0);
  assert.equal(output.selectionVerdict,'INCONCLUSIVE');
});

test('altered printed effect delta or prompt completion fails',()=>{
  const a=fixture();
  a.rows[0].sourceReplyPacket.sourceImmediatePublicAttackTransition.settled
    .after[0].active.damage=130;
  assert.throws(()=>audit(a),/AssertionError/);
  const b=fixture();
  b.rows[1].sourceReplyPacket.sourceImmediatePublicAttackTransition.settled
    .completionRootActionOrdinal=99;
  assert.throws(()=>audit(b),/AssertionError/);
});

test('source card/action, actor, original root fingerprint and ranking all fail closed',()=>{
  const changes=[
    x=>{x.rows[3].sourceReplyPacket.executedSourceRoot.card='Rare Candy';},
    x=>{x.rows[2].sourceReplyPacket.sourceSeat=0;},
    x=>{x.rows[1].rootActionLedgerSha256='0'.repeat(64);},
    x=>{x.rows[0].qualifiedCompetitiveGame=true;},
    x=>{x.rankingPermitted=true;},
    x=>{x.rows[3].sourcePolicyAudit.nextTurnLockWitness.equippedGarbodor=false;},
    x=>{x.rows.reverse();}
  ];
  for(const corrupt of changes){
    const x=fixture();
    corrupt(x);
    assert.throws(()=>audit(x),/AssertionError/);
  }
});
