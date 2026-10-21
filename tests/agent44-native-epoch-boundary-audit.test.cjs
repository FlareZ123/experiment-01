'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditNativeEpochBoundaries}=
  require('../simulation/evaluation/agent44-native-epoch-boundary-audit.cjs');

/** @returns {object} */
function fixture(){
  return {
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    suddenDeathClockResetProtocol:
      'actual-native-sudden-death-clock-transition-v1',
    rootActionLedger:[
      {actionOrdinal:0,playerSlot:0,action:'AttackAction',
        pendingPrompt:null,turnBefore:4,turnAfter:4},
      {actionOrdinal:1,playerSlot:0,action:'ResolvePromptAction',
        pendingPrompt:'WaitPrompt',initiatingRootActionOrdinal:0,
        turnBefore:4,turnAfter:0},
      {actionOrdinal:2,playerSlot:0,action:'ResolvePromptAction',
        pendingPrompt:'CoinFlipPrompt',initiatingRootActionOrdinal:0,
        turnBefore:0,turnAfter:0}
    ],
    suddenDeathClockResets:[{
      actionOrdinal:1,actingSeat:0,action:'ResolvePromptAction',
      pendingPrompt:'WaitPrompt',fromTurn:4,toTurn:0,
      fromPhase:2,toPhase:0,beforeSuddenDeath:false,
      afterSuddenDeath:true,enteredSetup:true
    }],
    hiddenSourceHand:['must-not-escape'],
    unseenPrizeCards:['must-not-escape']
  };
}

test('one correctly attributed native restart produces bounded evidence only',()=>{
  const game=fixture();
  const before=JSON.stringify(game);
  const out=auditNativeEpochBoundaries(game);
  assert.equal(out.shapeOk,true);
  assert.equal(out.nativeMarkersAuthentic,true);
  assert.equal(out.clockReversals.length,1);
  assert.deepEqual(out.clockReversals.map(x=>x.ordinal),[1]);
  assert.equal(out.clockReversals[0].nativeMarkerExact,true);
  assert.equal(out.crossEpochBilateralPacketAllowed,false);
  assert.equal(out.nativeNewDealFingerprintAuthenticated,false);
  assert.equal(out.paperTiebreakAndClockAuthenticated,false);
  assert.equal(out.qualifiedForCompetitiveInference,false);
  assert.equal(JSON.stringify(out).includes('must-not-escape'),false);
  assert.equal(JSON.stringify(game),before);
});

test('public pre-dispatch win predicates survive reset projection without hidden zones',()=>{
  const game=fixture();
  game.suddenDeathClockResets[0].preDispatchWinPredicates={
    schema:'agent3-native-reset-public-win-prestate-v1',
    players:[{noActive:true,noPrizes:false,occupiedBenchSlots:0},
      {noActive:true,noPrizes:false,occupiedBenchSlots:0}],
    nativeCheckWinnerPointsIfCheckedNow:[1,1],
    bothSeatsWouldScoreIfCheckedNow:true,
    preDispatchOnly:true,provesTransitionCause:false,
    competitiveQualified:false
  };
  const out=auditNativeEpochBoundaries(game);
  assert.deepEqual(out.clockReversals[0].marker.preDispatchWinPredicates,
    game.suddenDeathClockResets[0].preDispatchWinPredicates);
  assert.equal(out.nativeMarkersAuthentic,true);
  assert.equal(JSON.stringify(out).includes('must-not-escape'),false);
});

test('pre-reset public aggregate root chronology survives strict reset audit',()=>{
  const game=fixture();
  game.suddenDeathClockResets[0].recentNativePublicRootWindow=[
    {actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction',
      pendingPrompt:null,before:{turn:4,phase:2,players:[
        {inPlayPokemon:1,prizesRemaining:6,handSize:2,deckRemaining:30},
        {inPlayPokemon:1,prizesRemaining:6,handSize:2,deckRemaining:30}
      ]}}
  ];
  const out=auditNativeEpochBoundaries(game);
  assert.deepEqual(out.clockReversals[0].marker.recentNativePublicRootWindow,
    game.suddenDeathClockResets[0].recentNativePublicRootWindow);
  assert.equal(out.nativeMarkersAuthentic,true);
  assert.equal(JSON.stringify(out).includes('must-not-escape'),false);
});

test('unmarked turn reversal remains a hard authentication failure',()=>{
  const game=fixture();
  game.suddenDeathClockResets=[];
  const out=auditNativeEpochBoundaries(game);
  assert.equal(out.nativeMarkersAuthentic,false);
  assert.equal(out.clockReversals[0].nativeMarkerExact,false);
  assert.equal(out.clockReversals[0].nativeMarkerCount,0);
});

test('forged marker seat, prompt, setup and duplicate markers fail closed',()=>{
  for(const update of [
    mark=>{mark.actingSeat=1;},
    mark=>{mark.pendingPrompt='ConfirmPrompt';},
    mark=>{mark.enteredSetup=false;},
    mark=>{mark.afterSuddenDeath=false;}
  ]){
    const game=fixture();update(game.suddenDeathClockResets[0]);
    assert.equal(auditNativeEpochBoundaries(game).nativeMarkersAuthentic,false);
  }
  const repeated=fixture();
  repeated.suddenDeathClockResets.push({...repeated.suddenDeathClockResets[0]});
  const out=auditNativeEpochBoundaries(repeated);
  assert.equal(out.nativeMarkersAuthentic,false);
  assert.equal(out.clockReversals[0].nativeMarkerCount,2);
});

test('orphan reset marker is rejected even with otherwise monotone roots',()=>{
  const game=fixture();
  game.rootActionLedger[1].turnAfter=4;
  game.rootActionLedger[2].turnBefore=4;
  game.rootActionLedger[2].turnAfter=4;
  const out=auditNativeEpochBoundaries(game);
  assert.equal(out.clockReversals.length,0);
  assert.equal(out.orphanMarkers.length,1);
  assert.equal(out.nativeMarkersAuthentic,false);
});

test('unavailable native reset array is unknown, never success',()=>{
  const game=fixture();
  delete game.suddenDeathClockResets;
  const out=auditNativeEpochBoundaries(game);
  assert.equal(out.shapeOk,false);
  assert.equal(out.nativeMarkersAuthentic,false);
});
