'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceLineReplyPacket}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');

/** @param {boolean} marked @returns {object} */
function fixture(marked){
  const roots=[
    {actionOrdinal:0,playerSlot:1,action:'AttackAction',attack:'Volt Cyclone',
      pendingPrompt:null,turnBefore:2,turnAfter:3},
    {actionOrdinal:1,playerSlot:0,action:'PassTurnAction',
      pendingPrompt:null,turnBefore:3,turnAfter:4},
    {actionOrdinal:2,playerSlot:0,action:'ResolvePromptAction',
      pendingPrompt:'WaitPrompt',initiatingRootActionOrdinal:0,
      turnBefore:4,turnAfter:0}
  ];
  const resets=marked?[{
    actionOrdinal:2,actingSeat:0,action:'ResolvePromptAction',
    pendingPrompt:'WaitPrompt',fromTurn:4,toTurn:0,
    fromPhase:3,toPhase:1,beforeSuddenDeath:false,
    afterSuddenDeath:true,enteredSetup:true
  }]:[];
  return {
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    suddenDeathClockResetProtocol:
      'actual-native-sudden-death-clock-transition-v1',
    rootActionLedger:roots,suddenDeathClockResets:resets,
    attackDeclarationTrace:[],actions:roots.length,
    initialSourceDealFingerprint:{seat:1,digestSha256:'f'.repeat(64)},
    firstTurnSlot:1,verifiedByDrawLog:true,
    hiddenOpponentHand:['never-export'],unseenPrizeCards:['never-export']
  };
}

test('strict source-line rejection retains verified native episode boundary',()=>{
  const game=fixture(true), before=JSON.stringify(game);
  assert.throws(()=>sourceLineReplyPacket(game,6,
    {turn2:{completed:true}},1),error=>{
      assert.match(error.message,/Malformed chronological Store root/);
      assert.equal(error.nativePublicRootArchive.sourceDealFingerprint,
        'f'.repeat(64));
      assert.equal(error.nativePublicRootArchive.sourceDealFingerprintSeat,1);
      assert.equal(error.nativePublicRootArchive.actualStarterSeat,1);
      assert.equal(error.nativePublicRootArchive.verifiedFirstTurn,true);
      assert.equal(error.nativeEpochBoundaryEvidence.nativeMarkersAuthentic,true);
      assert.equal(error.nativeEpochStructuralPartitionFailure,undefined);
      const partition=error.nativeEpochStructuralPartition;
      assert.ok(partition);
      assert.equal(partition.actionCount,3);
      assert.equal(partition.outerRegisteredTrials,1);
      assert.equal(partition.observedEpisodeCount,2);
      assert.equal(partition.boundaries.length,1);
      assert.equal(partition.boundaries[0].actionOrdinal,2);
      assert.equal(partition.boundaries[0].episodeBefore,0);
      assert.equal(partition.boundaries[0].episodeAfter,1);
      assert.equal(partition.competitiveQualified,false);
      assert.equal(partition.requiresPerEpisodeDealAndTiebreakCertification,true);
      assert.equal(JSON.stringify(partition).includes('never-export'),false);
      return true;
    });
  assert.equal(JSON.stringify(game),before);
});

test('unmarked reset preserves original strict error and partition failure',()=>{
  const game=fixture(false);
  assert.throws(()=>sourceLineReplyPacket(game,6,
    {turn2:{completed:true}},1),error=>{
      assert.match(error.message,/Malformed chronological Store root/);
      assert.equal(error.nativeEpochBoundaryEvidence.nativeMarkersAuthentic,false);
      assert.equal(error.nativeEpochStructuralPartition,undefined);
      assert.match(error.nativeEpochStructuralPartitionFailure,
        /Native reset ledger does not match observed clock reversal/);
      return true;
    });
});
