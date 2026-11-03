'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const registration = require('../results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json');
const {
  sourceTrace, nativeStatus, integrity
} = require('../simulation/evaluation/agent10-rank11-heldout-headway-4seed.cjs');

test('preregistration has four unique new source groups, both seats, eight pairs and three factors', () => {
  const old = require('../results/aichi-2026/registrations/agent10-rank11-funding-fresh-eight-seed-20261103.json');
  const retrospective = require('../results/aichi-2026/registrations/agent10-active-mega-counterfactual-20261103.json');
  const previousSeeds = new Set([
    ...old.seedGroups.map(x => x.seed),
    ...retrospective.trialRows.map(x => x.seed)
  ]);
  assert.equal(registration.seedGroups.length, 4);
  assert.equal(new Set(registration.seedGroups.map(x => x.seed)).size, 4);
  assert.ok(registration.seedGroups.every(x => !previousSeeds.has(x.seed)));
  assert.deepEqual(registration.seedGroups.map(x => x.candidateSlot), ['A','A','B','B']);
  assert.equal(registration.trialRows.length, 8);
  assert.equal(new Set(registration.trialRows.map(x => x.id)).size, 8);
  assert.equal(registration.totalNativeAttempts, 24);
  assert.deepEqual(Object.keys(registration.factors),
    ['control','staged','activeHeadway']);
  assert.equal(registration.factors.control.actorRank9MegaAbsolFundingRoot, false);
  assert.equal(registration.factors.staged.actorRank9MegaAbsolFundingRoot, true);
  assert.equal(registration.factors.staged.actorActiveMegaClawPriorityRoot, false);
  assert.equal(registration.factors.activeHeadway.actorActiveMegaClawPriorityRoot, true);
});

test('owner-only source trace separates accepted Energy, declarations, payment and opponent roots', () => {
  const row = {
    rootActionLedger: [
      {playerSlot:0,action:'AttackAction',attack:'Claw of Darkness',turnBefore:23},
      {playerSlot:1,action:'AttackAction',attack:'Motivate',turnBefore:24},
      {playerSlot:0,action:'RetreatAction',turnBefore:25}
    ],
    nativeAcceptedTargetSidecar: {events: [
      {playerSlot:0,storeAccepted:true,turnBefore:7,
        declared:{ownerHandPrinting:'Darkness Energy MEE',target:{slot:'active',index:0}},
        publicBoardChanges:[{seat:0}]},
      {playerSlot:1,storeAccepted:true,turnBefore:9,
        declared:{ownerHandPrinting:'Darkness Energy MEE'}},
      {playerSlot:0,storeAccepted:false,turnBefore:11,
        declared:{ownerHandPrinting:'Darkness Energy MEE'}}
    ]},
    sourceAttackSettlement:{attacks:[{
      attackName:'Claw of Darkness',turnBefore:23,settledPromptChain:true,
      prizesBefore:[6,6],prizesAfter:[4,6],nextSourceRoot:{turnBefore:24}
    }]}
  };
  const source=sourceTrace(row,0);
  assert.equal(source.firstClaw,23);
  assert.equal(source.sourceClawDeclarations,1);
  assert.equal(source.sourceMotivateDeclarations,0);
  assert.equal(source.sourceRetreatDeclarations,1);
  assert.equal(source.acceptedPhysicalDarknessRecipients.length,1);
  assert.deepEqual(source.acceptedPhysicalDarknessRecipients[0].declaredTarget,
    {slot:'active',index:0});
  assert.equal(source.clawSettlements[0].settled,true);
  assert.deepEqual(source.clawSettlements[0].prizesAfter,[4,6]);
});

test('integrity rejects a physical reroll despite identical printed sixties and starter', () => {
  const ref={sourceDeckFingerprint:'s',candidateDeckFingerprint:'c',
    fullPhysicalDealFingerprint:'physical-A',sourceDealFingerprint:'source-A',
    actualStarterSeat:1};
  const altered={...ref,fullPhysicalDealFingerprint:'physical-B'};
  assert.equal(integrity([ref],ref)[0].sameBothPlayerPhysicalDeal,true);
  const check=integrity([altered],ref)[0];
  assert.equal(check.sameSourcePrinted60,true);
  assert.equal(check.sameNativeStarter,true);
  assert.equal(check.sameBothPlayerPhysicalDeal,false);
  assert.deepEqual(nativeStatus({finished:false,endReason:'action-cap',
    actionCount:260}).qualifiedPaperGame,false);
});
