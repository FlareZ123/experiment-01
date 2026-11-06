'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,TARGET,publicTurnAndAttackEpisodes,
  settledAttackPayoffs,auditOriginalV8MirrorTerminal}=
  require('../simulation/evaluation/agent45-v8-terminal-mirror-public-episodes.cjs');

test('public game root episodes retain same-epoch actions for both seats',()=>{
  const roots=[
    {actionOrdinal:0,turnBefore:1,turnAfter:1,playerSlot:0,
      action:'PlayCardAction',card:'Rank 1'},
    {actionOrdinal:1,turnBefore:1,turnAfter:2,playerSlot:0,
      action:'PassTurnAction'},
    {actionOrdinal:2,turnBefore:2,turnAfter:2,playerSlot:1,
      action:'AttackAction',attack:'Test Attack'},
    {actionOrdinal:3,turnBefore:2,turnAfter:3,playerSlot:1,
      action:'PassTurnAction'}
  ];
  const e=publicTurnAndAttackEpisodes(roots,0,1);
  assert.equal(e.rootCount,4);
  assert.equal(e.byRole.source.passes,1);
  assert.equal(e.byRole.candidate.passes,1);
  assert.equal(e.byRole.candidate.attacks,1);
  assert.equal(e.distinctCandidateAttackTurns,1);
  assert.equal(e.clockResets,0);
  assert.equal(e.turns.length,2);
});
test('invalid discontinuous root ordinals are rejected',()=>{
  assert.throws(()=>publicTurnAndAttackEpisodes([
    {actionOrdinal:1,turnBefore:1,turnAfter:1,playerSlot:1,
      action:'PassTurnAction'}
  ],0,1));
});
test('attack packet separates settled real Prize gain and no next turn',()=>{
  const e=settledAttackPayoffs({declarations:2,settled:1,attacks:[
    {actionOrdinal:12,turnBefore:4,attackName:'Test A',
      triggerAction:'AttackAction',settledPromptChain:true,
      completionRootOrdinal:15,prizesBefore:[6,6],prizesAfter:[6,4],
      nextSourceSameEpochProven:false},
    {actionOrdinal:21,turnBefore:8,attackName:'Test B',
      triggerAction:'AttackAction',settledPromptChain:false}
  ]},1);
  assert.equal(e.declarations,2);
  assert.equal(e.settled,1);
  assert.equal(e.attacks[0].prizesTakenByAttack,2);
  assert.equal(e.attacks[0].nextOpponentRootVerified,false);
  assert.equal(e.attacks[1].prizesTakenByAttack,null);
});
test('pure mirror analysis rejects missing eight-attempt identity',()=>{
  assert.throws(()=>auditOriginalV8MirrorTerminal({
    diagnostic:{registered:[TARGET]},
    rawDevelopment:{rows:[]}
  }));
});
