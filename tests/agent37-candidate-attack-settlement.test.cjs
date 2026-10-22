'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {candidateAttackSettlement}=require(
  '../simulation/evaluation/agent37-candidate-attack-settlement.cjs');

/** @returns {object} Minimal fake public Store audit of one delegated attack. */
function fixture(){
  const initial=[{active:{name:'Mega Absol ex',damage:0}},
    {active:{name:'Mewtwo & Mew-GX',damage:0}}];
  const damaged=[{active:{name:'Mega Absol ex',damage:150}},
    {active:{name:'Mewtwo & Mew-GX',damage:0}}];
  return {
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    publicAttackTransitionsProtocol:'actual-store-public-attack-transitions-v1',
    rootActionLedger:[
      {actionOrdinal:0,playerSlot:1,turnBefore:21,
        action:'ResolvePromptAction',initiatingRootActionOrdinal:0},
      {actionOrdinal:1,playerSlot:1,turnBefore:21,
        action:'ResolvePromptAction',initiatingRootActionOrdinal:0},
      {actionOrdinal:2,playerSlot:0,turnBefore:22,
        action:'ResolvePromptAction',initiatingRootActionOrdinal:0},
      {actionOrdinal:3,playerSlot:0,turnBefore:22,
        action:'PlayCardAction',card:'Dark Patch'}
    ],
    attackDeclarationTrace:[{
      actionOrdinal:0,playerSlot:1,turnBefore:21,
      triggerAction:'ResolvePromptAction',attackName:'Poltergeist',
      playerName:'research-B'
    }],
    publicAttackTransitions:[{
      actionOrdinal:0,triggerPlayerSlot:1,
      initiatingRootActionOrdinal:0,
      turnBefore:21,triggerAction:'ResolvePromptAction',
      declarations:[{attackName:'Poltergeist',playerName:'research-B'}],
      before:initial,beforePrizesRemaining:[6,5],
      settled:{completionRootActionOrdinal:1,
        after:damaged,prizesRemaining:[6,5]}
    }],
    poltergeistEffectTrace:[{
      attackerSeat:1,actionOrdinal:0,
      assessment:{sourceHandTrainerCount:3,sourceHandTrainerNames:['Secret Box'],
        printedBaseDamage:150,defenderBefore:'Mega Absol ex',
        defenderPrintedHp:280,defenderDamageBefore:0,
        printedBaseDamageReachesPrintedRemainingHp:false,
        defenderInPlayChange:0,prizeChange:0}
    }]
  };
}

test('authentic prompt settlement, public board, printed base, opponent reply, redaction',()=>{
  const result=candidateAttackSettlement(fixture(),1);
  assert.equal(result.declarations,1);
  assert.equal(result.settled,1);
  assert.equal(result.withImmediateSourceReturn,1);
  const event=result.attacks[0];
  assert.equal(event.delegatedCopy,true);
  assert.equal(event.completionRootOrdinal,1);
  assert.equal(event.publicBoardAfter[0].active.damage,150);
  assert.deepEqual(event.prizesBefore,[6,5]);
  assert.equal(event.nextSourceRoot.action,'PlayCardAction');
  assert.equal(event.nextSourceRoot.card,'Dark Patch');
  assert.equal(event.nextSourceTurnActionCount,1);
  assert.deepEqual(event.nextSourceTurnActions,[{ordinal:3,action:'PlayCardAction',card:'Dark Patch'}]);
  assert.equal(event.sourceTurnActionsTruncated,false);
  assert.equal(event.printedPoltergeist.baseDamage,150);
  assert.equal(JSON.stringify(result).includes('Secret Box'),false,
    'Retrospective opponent hand names must never be exported');
  assert.equal(result.qualifiedForCompetitiveInference,false);
});

test('unfinished effect, missing response and missing printed audit are explicit',()=>{
  const game=fixture();
  game.publicAttackTransitions[0].settled=null;
  game.rootActionLedger=game.rootActionLedger.slice(0,1);
  game.poltergeistEffectTrace=[];
  const result=candidateAttackSettlement(game,1);
  assert.equal(result.settled,0);
  assert.equal(result.withImmediateSourceReturn,0);
  assert.equal(result.attacks[0].nextSourceRoot,null);
  assert.deepEqual(result.attacks[0].nextSourceTurnActions,[]);
  assert.equal(result.attacks[0].publicBoardAfter,null);
  assert.equal(result.attacks[0].printedPoltergeist,null);
});

test('a wrong physical actor or attack log is refused, not promoted',()=>{
  const wrong=fixture();
  wrong.publicAttackTransitions[0].triggerPlayerSlot=0;
  assert.throws(()=>candidateAttackSettlement(wrong,1),/missing from public/);
  const wrongRoot=fixture();
  wrongRoot.rootActionLedger[0].playerSlot=0;
  assert.throws(()=>candidateAttackSettlement(wrongRoot,1),/root action disagree/);
});

test('candidate without any declarations has an empty transport packet',()=>{
  const game=fixture();
  game.attackDeclarationTrace=[];
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.declarations,0);
  assert.deepEqual(out.attacks,[]);
});

test('all candidate declarations survive after unrelated earlier public attacks',()=>{
  const game=fixture();
  game.rootActionLedger.push(
    {actionOrdinal:4,playerSlot:1,turnBefore:23,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:4},
    {actionOrdinal:5,playerSlot:1,turnBefore:23,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:4}
  );
  game.attackDeclarationTrace.push({
    actionOrdinal:4,playerSlot:1,turnBefore:23,
    triggerAction:'ResolvePromptAction',attackName:'Poltergeist',
    playerName:'research-B'
  });
  game.publicAttackTransitions.unshift({
    actionOrdinal:3,triggerPlayerSlot:0,
    declarations:[{attackName:'Source Attack',playerName:'research-A'}]
  });
  game.publicAttackTransitions.push({
    actionOrdinal:4,triggerPlayerSlot:1,
    initiatingRootActionOrdinal:4,turnBefore:23,
    triggerAction:'ResolvePromptAction',
    declarations:[{attackName:'Poltergeist',playerName:'research-B'}],
    before:[{active:{name:'Mega Absol ex',damage:0}},{}],
    beforePrizesRemaining:[3,3],
    settled:{completionRootActionOrdinal:5,after:[{active:null},{}],
      prizesRemaining:[0,3]}
  });
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.declarations,2);
  assert.equal(out.settled,2);
  assert.deepEqual(out.attacks.map(row=>row.actionOrdinal),[0,4]);
  assert.equal(out.attacks[0].nextSourceRoot.card,'Dark Patch');
  assert.equal(out.attacks[1].nextSourceRoot,null);
  assert.deepEqual(out.attacks[1].prizesAfter,[0,3]);
  assert.equal(JSON.stringify(out).includes('Secret Box'),false);
});

test('native clock reset cannot splice later replay source roots onto earlier attack',()=>{
  const game=fixture();
  game.rootActionLedger[0].turnAfter=21;
  game.rootActionLedger[1].turnAfter=22;
  // A real Store reset has decreasing turnAfter. A separate replay may later
  // revisit turn 22; matching its turn number alone is insufficient.
  game.rootActionLedger[2].turnAfter=0;
  game.rootActionLedger[3].turnAfter=22;
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.settled,1);
  assert.equal(out.withImmediateSourceReturn,0);
  assert.equal(out.withVerifiedSameEpochSourceReturn,0);
  assert.equal(out.attacks[0].nextSourceRoot,null);
  assert.equal(out.attacks[0].firstClockResetAfterAttackOrdinal,2);
  assert.deepEqual(out.attacks[0].nextSourceTurnActions,[]);
});

test('complete contiguous Store chronology certifies same-episode source return',()=>{
  const game=fixture();
  game.rootActionLedger[0].turnAfter=21;
  game.rootActionLedger[1].turnAfter=22;
  game.rootActionLedger[2].turnAfter=22;
  game.rootActionLedger[3].turnAfter=22;
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.withImmediateSourceReturn,1);
  assert.equal(out.withVerifiedSameEpochSourceReturn,1);
  assert.equal(out.attacks[0].nextSourceRoot.ordinal,3);
  assert.equal(out.attacks[0].nextSourceSameEpochProven,true);
  assert.equal(out.attacks[0].firstClockResetAfterAttackOrdinal,null);
});

test('source turn actions stop at the later restart even after genuine reply',()=>{
  const game=fixture();
  game.rootActionLedger[0].turnAfter=21;
  game.rootActionLedger[1].turnAfter=22;
  game.rootActionLedger[2].turnAfter=22;
  game.rootActionLedger[3].turnAfter=22;
  game.rootActionLedger.push(
    {actionOrdinal:4,playerSlot:0,turnBefore:22,turnAfter:0,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:4},
    {actionOrdinal:5,playerSlot:0,turnBefore:22,turnAfter:22,
      action:'PlayCardAction',card:'Replay-only-stadium'}
  );
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.withVerifiedSameEpochSourceReturn,1);
  assert.equal(out.attacks[0].firstClockResetAfterAttackOrdinal,4);
  assert.deepEqual(out.attacks[0].nextSourceTurnActions,[
    {ordinal:3,action:'PlayCardAction',card:'Dark Patch'}
  ]);
  assert.equal(JSON.stringify(out).includes('Replay-only-stadium'),false);
});

test('missing or discontinuous turnAfter does not certify same-epoch return',()=>{
  const baseline=candidateAttackSettlement(fixture(),1);
  assert.equal(baseline.withImmediateSourceReturn,1,
    'Historical observation retained for backward-compatible reports');
  assert.equal(baseline.withVerifiedSameEpochSourceReturn,0,
    'Absent turnAfter fields do not prove uninterrupted Store epoch');
  const game=fixture();
  game.rootActionLedger[0].turnAfter=21;
  game.rootActionLedger[1].turnAfter=22;
  game.rootActionLedger[2].turnAfter=22;
  // The prior prompt claims advancement to 23, but the next physical
  // dispatch starts at 22. This is a gap, without a decreasing clock.
  game.rootActionLedger[2].turnAfter=23;
  game.rootActionLedger[3].turnAfter=22;
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.withImmediateSourceReturn,1);
  assert.equal(out.withVerifiedSameEpochSourceReturn,0,
    'A native chronological discontinuity must remain uncertified');
});

test('replay opening cannot masquerade as a settled attacking game board',()=>{
  const game=fixture();
  game.rootActionLedger[0].turnAfter=21;
  game.rootActionLedger[1].turnAfter=0;
  game.publicAttackTransitions[0].settled={
    completionRootActionOrdinal:1,
    after:[{active:{name:'Replay starter',damage:0}},{}],
    prizesRemaining:[6,6]
  };
  const out=candidateAttackSettlement(game,1);
  assert.equal(out.declarations,1);
  assert.equal(out.settled,0);
  assert.equal(out.crossEpochSettlementsRejected,1);
  assert.equal(out.withImmediateSourceReturn,0);
  assert.equal(out.attacks[0].settlementCrossesClockReset,true);
  assert.equal(out.attacks[0].settledPromptChain,false);
  assert.equal(out.attacks[0].publicBoardAfter,null);
  assert.equal(out.attacks[0].prizesAfter,null);
  assert.equal(out.attacks[0].completionRootOrdinal,null);
  assert.equal(out.attacks[0].firstClockResetAfterAttackOrdinal,1);
});

const {firstRootDivergence} = require('../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
test('first native printed-attack root change is identified by accepted root ordinal',()=>{
  const x=[{actionOrdinal:0,action:'PlayCardAction'}, {actionOrdinal:1,action:'AttackAction',attack:'Terminal Period'}];
  const y=[{actionOrdinal:0,action:'PlayCardAction'}, {actionOrdinal:1,action:'AttackAction',attack:'Claw of Darkness'}];
  assert.equal(firstRootDivergence(x,y).ordinal,1);
  assert.equal(firstRootDivergence(x,x),null);
});

test('native accepted target sidecar detects a label-silent earlier choice',()=>{
  const {acceptedTargetContrast}=require(
    '../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
  const sidecar=(ordinal,target)=>({
    schema:'actual-store-declared-target-sidecar-v1',
    rootOrdinalLinked:true,sha256:'fixture-'+target,
    observedTargetActions:1,events:[{
      rootActionOrdinal:ordinal,actionOrdinal:ordinal,
      playerSlot:0,turnBefore:7,action:'PlayCardAction',
      declared:{status:'captured',target:{player:2,slot:target,index:0}},
      visibility:'public-after-dispatch',storeAccepted:true,
      publicBoardChanges:[]
    }]
  });
  const baseline={nativeAcceptedTargetSidecar:sidecar(49,1)};
  const treatment={nativeAcceptedTargetSidecar:sidecar(49,2)};
  const divergence={ordinal:144};
  const result=acceptedTargetContrast(baseline,treatment,divergence);
  assert.equal(result.status,'different');
  assert.equal(result.observedPhysicalTargetChangeBeforeRootLabelChange,true);
  assert.deepEqual(result.firstDifferingAcceptedRootOrdinals,{
    baseline:49,treatment:49
  });
  assert.equal(result.baseline.rootOrdinalLinked,true);
  assert.equal(result.treatment.acceptedTargetRoots,1);
  const same=acceptedTargetContrast(baseline,baseline,divergence);
  assert.equal(same.status,'same-observed-targets');
  assert.equal(same.observedPhysicalTargetChangeBeforeRootLabelChange,false);
  const earlierLabels=acceptedTargetContrast(baseline,treatment,{ordinal:39});
  assert.equal(earlierLabels.observedPhysicalTargetChangeBeforeRootLabelChange,
    false,'later physical change cannot explain an earlier root-label change');
  const silentLabels=acceptedTargetContrast(baseline,treatment,null);
  assert.equal(silentLabels.observedPhysicalTargetChangeBeforeRootLabelChange,
    true,'identical full labels still cannot prove equal physical targets');
});

test('missing native accepted target evidence remains explicitly unobserved',()=>{
  const {acceptedTargetContrast}=require(
    '../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
  const observation=acceptedTargetContrast({}, {}, {ordinal:39});
  assert.equal(observation.status,'target-unobserved');
  assert.equal(observation.observedPhysicalTargetChangeBeforeRootLabelChange,
    false);
  assert.equal(observation.baseline.acceptedTargetRoots,null);
});

test('first-divergence native actor settlement reuses public attack witness',()=>{
  const {sourceAttackAtRoot} = require(
    '../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
  const game=fixture();
  const event=sourceAttackAtRoot(game,1,0);
  assert.equal(event.attackName,'Poltergeist');
  assert.equal(event.actorSeat,1);
  assert.equal(event.promptSettled,true);
  assert.equal(event.nativePublicBoardAfter[0].active.damage,150);
  assert.equal(event.prizesAfter[0],6);
  assert.equal(event.settlementCrossesClockReset,false);
  assert.equal(sourceAttackAtRoot(game,1,1234),null);
});

test('same-head accepted-target observer parity gates complete native projections',()=>{
  const {compareObserverProjection}=require(
    '../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
  const source=i=>({
    trial:{id:'fixture-'+i,seed:100+i},
    sourceDealFingerprint:'deal-'+i,actualStarterSeat:i%2,
    verifiedFirstTurn:true,actionCount:12,finished:true,
    winner:0,finalPrizes:[4,6],endReason:'engine-game-end'
  });
  const sidecar={rootOrdinalLinked:true};
  const sourceRows=Array.from({length:4},(_,i)=>source(i));
  const makeBundle=(observed=false)=>({
    development:{rows:sourceRows.map(row=>({
      ...row,...(observed?{nativeAcceptedTargetSidecar:sidecar}:{})
    }))},
    games:new Map(sourceRows.map(row=>['native-'+row.trial.id,{
      rootActionLedger:[{actionOrdinal:0,action:'PlayCardAction',
        playerSlot:0,turnBefore:1}]
    }]))
  });
  const off=makeBundle(),on=makeBundle(true);
  const pass=compareObserverProjection(off,on);
  assert.equal(pass.checked,4);
  assert.equal(pass.passed,4);
  assert.equal(pass.complete,true);
  on.games.get('native-fixture-1').rootActionLedger[0].action=
    'RetreatAction';
  const changed=compareObserverProjection(off,on);
  assert.equal(changed.complete,false);
  assert.equal(changed.passed,3);
  assert.equal(changed.rows[1].rootLabelsEqual,false);
  on.games.get('native-fixture-1').rootActionLedger[0].action=
    'PlayCardAction';
  on.development.rows[2].nativeAcceptedTargetSidecar.rootOrdinalLinked=false;
  const unlinked=compareObserverProjection(off,on);
  assert.equal(unlinked.complete,false);
  assert.equal(unlinked.rows[0].targetLinked,false,
    'Shared sidecar fixture must flag every row if linkage is rejected');
});

test('first-divergence native runner restores process and Store capture hook',()=>{
  const {replayNativePolicy}=require(
    '../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
  const headless=require('../simulation/twinleaf/headless.cjs');
  const original=headless.runMatch;
  const saved=process.env.AGENT49_POTENTIAL_KO_ROOT_DEV;
  process.env.AGENT49_POTENTIAL_KO_ROOT_DEV='before-test';
  try{
    assert.throws(()=>replayNativePolicy(true,()=>{
      assert.equal(process.env.AGENT49_POTENTIAL_KO_ROOT_DEV,'true');
      assert.notStrictEqual(headless.runMatch,original);
      throw new Error('test-executor-abort');
    }),/test-executor-abort/);
    assert.strictEqual(headless.runMatch,original);
    assert.equal(process.env.AGENT49_POTENTIAL_KO_ROOT_DEV,'before-test');
    const result=replayNativePolicy(false,opts=>{
      assert.equal(process.env.AGENT49_POTENTIAL_KO_ROOT_DEV,'false');
      assert.equal(opts.actorOnlyComposition,true);
      assert.equal(opts.nativeAcceptedTargets,true);
      assert.equal(opts.paperSupporterQuota,true);
      return {rows:Array.from({length:4},()=>({}))};
    });
    assert.equal(result.games.size,0);
    const disabled=replayNativePolicy(false,opts=>{
      assert.equal(opts.nativeAcceptedTargets,false);
      return {rows:Array.from({length:4},()=>({}))};
    },false);
    assert.equal(disabled.games.size,0);
    assert.strictEqual(headless.runMatch,original);
  }finally{
    if(saved===undefined)delete process.env.AGENT49_POTENTIAL_KO_ROOT_DEV;
    else process.env.AGENT49_POTENTIAL_KO_ROOT_DEV=saved;
  }
});

test('unchanged Store roots certify complete legacy label equality',()=>{
  const {compareNativePairs}=require('../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs');
  const rows=Array.from({length:4},(_,i)=>({trial:{id:'same-'+i,seed:i},sourceDealFingerprint:'deal',verifiedFirstTurn:true,actualStarterSeat:0}));
  const games=new Map(rows.map(row=>['trial-'+row.trial.id,{rootActionLedger:[{actionOrdinal:0,turnBefore:1,playerSlot:0,action:'PassTurnAction'}]}]));
  const b={development:{rows},games};
  assert.equal(compareNativePairs(b,b).pairs.every(row=>row.priorNativeRootLabelsIdentical),true);
});
