'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {joinSettledNativeTurnEnds}=
  require('../simulation/evaluation/agent12-native-settled-recovery-lineage-bridge.cjs');
const {traceAcceptedOwnerRootRecoveries}=
  require('../simulation/twinleaf/agent16-root-recovery-trace.cjs');

const ledgerRow=(actionOrdinal,turnBefore,turnAfter,action,playerSlot,extra={})=>
  ({actionOrdinal,turnBefore,turnAfter,action,playerSlot,...extra});
const accepted=(nativeRootOrdinal,seat,globalTurn,kind,alternatives=[])=>({
  nativeRootOrdinal,seat,globalTurn,kind,alternatives,accepted:true
});
const deferred={kind:'attach-special-energy',printing:'Capture Energy RCL',
  reason:'later-root-may-recover'};
const fullLedger=()=>[
  ledgerRow(0,0,1,'StartGameAction',-1),
  ledgerRow(1,1,1,'PlayCardAction',0,{card:'Quick Ball'}),
  ledgerRow(2,1,1,'PlayCardAction',0,{card:'Boost Shake'}),
  ledgerRow(3,1,1,'ResolvePromptAction',0,{
    pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:2}),
  ledgerRow(4,1,2,'ResolvePromptAction',-1,{
    pendingPrompt:'WaitPrompt',initiatingRootActionOrdinal:2}),
  ledgerRow(5,2,2,'PassTurnAction',1),
  ledgerRow(6,2,3,'ResolvePromptAction',-1,{
    pendingPrompt:'WaitPrompt',initiatingRootActionOrdinal:5})
];

test('genuine native WaitPrompt closes earlier Boost Shake root, with full lineage',()=>{
  const original=[
    accepted(1,0,1,'play-quick-ball',[deferred]),
    accepted(2,0,1,'play-boost-shake'),
    accepted(5,1,2,'pass')
  ];
  const joined=joinSettledNativeTurnEnds(original,fullLedger());
  assert.equal(joined.acceptedOwnerEvents,3);
  assert.equal(joined.nativeSettledTurnEndsJoined,2);
  assert.equal(joined.nonAttackPassNativeEnds,1);
  assert.equal(joined.unmatchedLedgerClosures,0);
  assert.equal(joined.ledgerUnboundNativeEnds,0);
  assert.equal(joined.events[0].nativeSettledTurnAfter,undefined);
  assert.equal(joined.events[1].nativeSettledTurnAfter,2);
  assert.equal(joined.events[1].nativeTurnEndReceipt.rootOrdinal,2);
  assert.equal(joined.events[1].nativeTurnEndReceipt.terminalOrdinal,4);
  assert.equal(joined.events[1].nativeTurnEndReceipt.terminalPromptType,'WaitPrompt');
  assert.equal(original[1].nativeSettledTurnAfter,undefined,
    'Read-only join must preserve original owner evidence');
  const withReceipt=traceAcceptedOwnerRootRecoveries(joined.events);
  const withoutReceipt=traceAcceptedOwnerRootRecoveries(original);
  assert.equal(withReceipt.expiredAtTurnEnd,1);
  assert.equal(withReceipt.closedOnNextOwnerTurn,0);
  assert.equal(withoutReceipt.expiredAtTurnEnd,0);
  assert.equal(withoutReceipt.censoredAfterLastRoot,1);
  assert.equal(withoutReceipt.closedOnNextOwnerTurn,0);
});

test('incomplete pending Item prompt cannot count as settled turn end',()=>{
  const ledger=fullLedger().slice(0,4);
  const rows=[
    accepted(1,0,1,'play-quick-ball',[deferred]),
    accepted(2,0,1,'play-boost-shake')
  ];
  const joined=joinSettledNativeTurnEnds(rows,ledger);
  assert.equal(joined.nativeSettledTurnEndsJoined,0);
  assert.equal(joined.events[1].nativeTurnEndReceipt,undefined);
  const trace=traceAcceptedOwnerRootRecoveries(joined.events);
  assert.equal(trace.censoredAfterLastRoot,1);
  assert.equal(trace.expiredAtTurnEnd,0);
});

test('future native closure evidence cannot be injected or assigned to wrong actor',()=>{
  const l=fullLedger();
  assert.throws(()=>joinSettledNativeTurnEnds([
    {...accepted(2,0,1,'play-boost-shake'),nativeSettledTurnAfter:2}
  ],l),/caller-injected/);
  assert.throws(()=>joinSettledNativeTurnEnds([
    accepted(2,1,1,'play-boost-shake')
  ],l),/physical seat/);
  assert.throws(()=>joinSettledNativeTurnEnds([
    accepted(2,0,2,'play-boost-shake')
  ],l),/global turn/);
  assert.throws(()=>joinSettledNativeTurnEnds([
    accepted(2,0,1,'play-boost-shake'),
    accepted(2,0,1,'play-boost-shake')
  ],l),/Duplicate owner-root ordinal/);
  assert.throws(()=>joinSettledNativeTurnEnds([
    accepted(3,0,1,'play-boost-shake')
  ],l),/Only original Store owner actions/);
});

test('an unbound native prompt leaves its root terminal status unknown',()=>{
  const l=fullLedger();
  l[4].initiatingRootActionOrdinal=null;
  const joined=joinSettledNativeTurnEnds([
    accepted(1,0,1,'play-quick-ball',[deferred]),
    accepted(2,0,1,'play-boost-shake')
  ],l);
  assert.equal(joined.ledgerUnboundNativeEnds,1);
  assert.equal(joined.nativeSettledTurnEndsJoined,0);
  assert.equal(joined.events[1].nativeSettledTurnAfter,undefined);
});

test('a genuine native later-turn witness is analysis-only and never a policy input',()=>{
  const joined=joinSettledNativeTurnEnds([],fullLedger());
  assert.equal(joined.nativeSettledTurnEndsJoined,0);
  assert.equal(joined.unmatchedLedgerClosures,2);
  assert.equal(joined.postgameOnly,true);
  assert.equal(joined.policyDecisionSafe,false);
  assert.equal(joined.competitiveQualifiedGames,0);
});
