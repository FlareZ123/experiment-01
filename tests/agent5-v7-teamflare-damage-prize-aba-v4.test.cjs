'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  summarizeMatch
} = require('../simulation/evaluation/agent5-v7-teamflare-damage-prize-aba-v4.cjs');

test('forensic runner remains explicitly developmental',()=>{
  assert.equal(VERSION,'agent5-v7-teamflare-native-damage-prize-aba-forensic-v4');
});

test('attempt summary preserves attack, damage, KO, Prize and terminal statuses',()=>{
  const summary=summarizeMatch({
    phase:'B',label:'registered-label',trialId:'6:201:B:champion-reference',
    status:'returned',
    attackAudit:{attacks:[
      {effects:[
        {effectType:'DealDamageEffect',damage:100},
        {effectType:'KnockOutEffect',damage:null}
      ],settlement:{complete:true}},
      {effects:[{effectType:'PutCountersEffect',damage:null}],settlement:{complete:false}}
    ]},
    prizeAudit:{records:[{}],exactOwnerHandTransfers:1},
    nativeFinished:false,nativeWinner:null
  });
  assert.equal(summary.phase,'B');
  assert.equal(summary.trialId,'6:201:B:champion-reference');
  assert.equal(summary.attackActions,2);
  assert.equal(summary.damageEffects,1);
  assert.equal(summary.damageCounterEffects,1);
  assert.equal(summary.damagePipelineEffects,2);
  assert.equal(summary.knockOutEffects,1);
  assert.equal(summary.completedAttackPromptChains,1);
  assert.equal(summary.prizePromptRecords,1);
  assert.equal(summary.prizeTransfersToOwnerHand,1);
  assert.equal(summary.nativeFinished,false);
});
