'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {postgameAttackModalityLedger,createPostgameAttackTape}=
  require('../../simulation/evaluation/2026-11/agent13-postgame-attack-modality-ledger.cjs');

const root=(n,turn,seat,action,extra={})=>({
  actionOrdinal:n,turnBefore:turn,turnAfter:turn,playerSlot:seat,action,...extra
});
const card=(id,printing)=>({id,printing});
const zone=(count,active,discard=[])=>({
  prizes:Array.from({length:6},(_,i)=>i<count?[card(i+100,'Prize')]:[]),
  active:{cards:active?[active]:[]},discard
});
const snap=(ordinal,ownerPrizes=6,active=card(2,'Crobat V DAA'),discard=[])=>({
  rootOrdinal:ordinal,
  physicalZones:[zone(ownerPrizes,card(1,'Mewtwo & Mew-GX UNM')),
    zone(6,active,discard)]
});
const tape=(...snapshots)=>({postAcceptedRoots:snapshots});

test('50703-style three paid-copy prize episodes coexist with zero ordinary roots',()=>{
  const roots=[root(0,20,0,'PlayCardAction'),
    root(1,20,0,'UseAbilityAction',{ability:'Perfection'}),
    root(2,20,0,'ResolvePromptAction',{pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:1,
      attackChoice:{printing:'Gengar & Mimikyu-GX TEU',attackName:'Poltergeist',sourceIndex:0,attackIndex:0}}),
    root(3,20,0,'ResolvePromptAction'),
    root(4,21,1,'AttackAction',{attack:'Cross Fusion Strike'}),
    root(5,22,0,'UseAbilityAction',{ability:'Perfection'}),
    root(6,22,0,'ResolvePromptAction',{pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:5,
      attackChoice:{printing:'Gengar & Mimikyu-GX TEU',attackName:'Poltergeist',sourceIndex:0,attackIndex:0}}),
    root(7,22,0,'ResolvePromptAction'),
    root(8,24,0,'UseAbilityAction',{ability:'Perfection'}),
    root(9,24,0,'ResolvePromptAction',{pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:8,
      attackChoice:{printing:'Gengar & Mimikyu-GX TEU',attackName:'Poltergeist',sourceIndex:0,attackIndex:0}}),
    root(10,24,0,'ResolvePromptAction')];
  roots[3].turnAfter=21;roots[4].turnAfter=22;
  roots[7].turnAfter=23;
  const s=[snap(0),snap(1),snap(2,6),snap(3,4,null,[card(2,'Crobat V DAA')]),
    snap(4,4),snap(5,4),snap(6,4),snap(7,1,null),
    snap(8,1),snap(9,1),snap(10,0,null)];
  const led=postgameAttackModalityLedger({rootActionLedger:roots,
    physicalZoneTape:tape(...s),nativeFinished:true});
  assert.equal(led.perfectionInitiations,3);
  assert.equal(led.ordinaryRootAttackInitiations,1);
  assert.deepEqual(led.events.filter(e=>e.modality.startsWith('perfection'))
    .map(e=>e.observedSameTurnPrizeDelta),[2,3,1]);
  assert.equal(led.observedPerfectionCopyChoices,3);
  assert.equal(led.events[0].nextOpponentRoot.ordinal,4);
  assert.equal(led.events[0].physicalPerfectionReceipt.actualPrizesTaken,2);
  assert.equal(led.competitiveGameQualified,false);
});

test('choice without true settlement stays unknown even with zero Prizes',()=>{
  const roots=[root(0,3,0,'PlayCardAction'),
    root(1,3,0,'UseAbilityAction',{ability:'Perfection'}),
    root(2,3,0,'ResolvePromptAction',{pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:1,
      attackChoice:{printing:'Gengar & Mimikyu-GX TEU',attackName:'Poltergeist'}})];
  const led=postgameAttackModalityLedger({rootActionLedger:roots,
    physicalZoneTape:tape(snap(0),snap(1),snap(2)),nativeFinished:false});
  assert.equal(led.events[0].observedSameTurnPrizeDelta,0);
  assert.equal(led.events[0].copyChoiceStatus,'observed');
  assert.equal(led.events[0].nativeSettlementStatus,'unknown');
  assert.equal(led.events[0].opponentResponseStatus,'unobserved');
});

test('settled zero-Prize copy remains representable, and follow-through observed',()=>{
  const roots=[root(0,6,0,'PlayCardAction'),
    root(1,6,0,'UseAbilityAction',{ability:'Perfection'}),
    root(2,6,0,'ResolvePromptAction',{pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:1,
      attackChoice:{printing:'Tapu Lele-GX GRI',attackName:'Energy Drive'}}),
    root(3,7,1,'PlayCardAction')];
  roots[2].turnAfter=7;
  const led=postgameAttackModalityLedger({rootActionLedger:roots,
    physicalZoneTape:tape(snap(0),snap(1),snap(2),snap(3)),nativeFinished:false});
  assert.equal(led.events[0].observedSameTurnPrizeDelta,0);
  assert.equal(led.events[0].nativeSettlementStatus,'observed');
  assert.equal(led.events[0].nextOpponentRoot.action,'PlayCardAction');
});

test('ordinary AttackAction is unchanged and requires its own Store settlement',()=>{
  const roots=[root(0,4,1,'AttackAction',{attack:'Motivate',turnAfter:5}),
    root(1,5,0,'PlayCardAction')];
  const led=postgameAttackModalityLedger({rootActionLedger:roots,
    publicAttackTransitions:[{actionOrdinal:0,turnBefore:4,
      triggerPlayerSlot:1,triggerAction:'AttackAction',settled:{after:[{},{}]}}]});
  assert.equal(led.ordinaryRootAttackInitiations,1);
  assert.equal(led.perfectionInitiations,0);
  assert.equal(led.events[0].ordinaryAttackName,'Motivate');
  assert.equal(led.events[0].observedSameTurnPrizeDelta,null);
  assert.equal(led.events[0].nativeSettlementStatus,'observed');
  assert.equal(led.events[0].physicalPrizeEvidenceStatus,'unavailable');
});

test('missing copied-attack choice cannot masquerade as successful copy',()=>{
  const roots=[root(0,10,1,'PlayCardAction'),
    root(1,10,1,'UseAbilityAction',{ability:'Perfection'}),
    root(2,11,0,'PassTurnAction')];
  const result=postgameAttackModalityLedger({rootActionLedger:roots,
    nativeFinished:false});
  assert.equal(result.perfectionInitiations,1);
  assert.equal(result.events[0].copyChoiceStatus,'unknown');
  assert.equal(result.events[0].nativeSettlementStatus,'unknown');
  assert.equal(result.events[0].observedSameTurnPrizeDelta,null);
});

test('misaligned or missing physical receipt fails closed',()=>{
  const roots=[root(0,1,0,'PlayCardAction'),
    root(1,1,0,'UseAbilityAction',{ability:'Perfection'})];
  assert.throws(()=>postgameAttackModalityLedger({rootActionLedger:roots,
    physicalZoneTape:tape(snap(0))}),/full physical/i);
  assert.throws(()=>postgameAttackModalityLedger({rootActionLedger:roots,
    physicalZoneTape:tape(snap(0),snap(9))}),/exactly/i);
});

test('wrong epoch cannot manufacture next-opponent response',()=>{
  const roots=[root(0,20,0,'AttackAction',{attack:'Motivate',turnAfter:21}),
    root(1,0,1,'PlayCardAction')];
  assert.equal(postgameAttackModalityLedger({rootActionLedger:roots})
    .events[0].nextOpponentRoot,null);
});

test('genuine post-dispatch read-only callback produces physical Prize timeline',()=>{
  const c={fullName:'Mewtwo & Mew-GX UNM'};
  const enemy={fullName:'Crobat V DAA'};
  const owner={prizes:Array.from({length:6},()=>({cards:[{}]})),
    active:{cards:[c]},discard:{cards:[]}};
  const opponent={prizes:Array.from({length:6},()=>({cards:[{}]})),
    active:{cards:[enemy]},discard:{cards:[]}};
  const store={state:{players:[owner,opponent]}};
  const observer=createPostgameAttackTape();
  observer.onRootStoreCreated(store);
  observer.onRootActionDispatched(store,{},0);
  observer.onRootActionDispatched(store,{},1);
  opponent.active.cards=[];opponent.discard.cards=[enemy];
  owner.prizes[0].cards=[];owner.prizes[1].cards=[];
  observer.onRootActionDispatched(store,{},2);
  const result=observer.result();
  assert.equal(result.postAcceptedRoots.length,3);
  assert.equal(result.capturesFullDeckCustody,false);
  assert.equal(result.postAcceptedRoots[0].physicalZones[1].active.cards[0].id,
    result.postAcceptedRoots[2].physicalZones[1].discard[0].id);
  assert.equal(JSON.stringify(result).includes('UNSHARED_HIDDEN_CARD'),false);
  assert.throws(()=>observer.onRootActionDispatched({}, {},3));
});
