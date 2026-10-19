'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {buildBilateralReplyPacket} =
  require('../simulation/evaluation/aichi-bilateral-reply-packet.cjs');

function fixture() {
  const rootActionLedger = [
    {actionOrdinal:0,turnBefore:2,turnAfter:2,playerSlot:1,
      action:'PlayCardAction',card:'Guzma & Hala'},
    {actionOrdinal:1,turnBefore:2,turnAfter:3,playerSlot:1,
      action:'AttackAction',attack:'Volt Cyclone'},
    {actionOrdinal:2,turnBefore:3,turnAfter:3,playerSlot:0,
      action:'PlayCardAction',card:'Lillie\'s Determination'},
    {actionOrdinal:3,turnBefore:3,turnAfter:4,playerSlot:0,
      action:'AttackAction',attack:'Pale Moon-GX'},
    {actionOrdinal:4,turnBefore:4,turnAfter:4,playerSlot:1,
      action:'PlayCardAction',card:'Double Colorless Energy'}
  ];
  return {
    actions:5,rootActionLedger,
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    attackDeclarationTrace:[
      {actionOrdinal:1,turnBefore:2,turnAfter:3,playerSlot:1,
        triggerAction:'AttackAction',triggerPlayerSlot:1,attackName:'Volt Cyclone'},
      {actionOrdinal:3,turnBefore:3,turnAfter:4,playerSlot:0,
        triggerAction:'AttackAction',triggerPlayerSlot:0,attackName:'Pale Moon-GX'}
    ],
    finished:true,winner:0,endReason:'engine-game-end',
    prizesRemaining:[2,6],
    finalState:[{deckRemaining:15,handSize:6},{deckRemaining:12,handSize:4}],
    hiddenSourceHand:['should never be exported'],
    unseenDeck:['should never be exported']
  };
}
const args={sourceSeat:1,triggerTurn:2,
  expectedSourceAction:'AttackAction',expectedSourceDetail:'Volt Cyclone'};

test('source declaration, candidate attack reply and next source turn are distinct',()=>{
  const out=buildBilateralReplyPacket(fixture(),args);
  assert.equal(out.executedSourceRoot.attack,'Volt Cyclone');
  assert.equal(out.matchingSourceAttackDeclared,true);
  assert.equal(out.firstCandidateNextTurnRoot.action,'PlayCardAction');
  assert.deepEqual(out.candidateSameTurnAttackDeclarations.map(x=>x.attackName),
    ['Pale Moon-GX']);
  assert.equal(out.nextSourceTurnRoot.turn,4);
  assert.deepEqual(out.terminal.remainingDeck,[15,12]);
  assert.equal(out.sourceEffectVerified,false);
  assert.equal(out.qualifiedCompetitiveGame,false);
  assert.equal(JSON.stringify(out).includes('should never be exported'),false);
});

test('proposed attack without a real Store declaration cannot be promoted',()=>{
  const input=fixture();
  input.attackDeclarationTrace=input.attackDeclarationTrace.slice(1);
  const out=buildBilateralReplyPacket(input,args);
  assert.equal(out.matchingSourceAttackDeclared,false);
  assert.equal(out.executedSourceRoot.attack,'Volt Cyclone');
});

test('no source signature is recorded as null, despite other attacks',()=>{
  const input=fixture();
  input.rootActionLedger[1].attack='Shadow Mist';
  input.attackDeclarationTrace[0].attackName='Shadow Mist';
  input.rootActionLedger[3].action='PassTurnAction';
  input.rootActionLedger[3].attack=undefined;
  input.attackDeclarationTrace.pop();
  const out=buildBilateralReplyPacket(input,args);
  assert.equal(out.executedSourceRoot,null);
  assert.equal(out.firstCandidateNextTurnRoot,null);
  assert.deepEqual(out.candidateSameTurnAttackDeclarations,[]);
  assert.deepEqual(out.laterSourceAttackDeclarations,[]);
  assert.equal(out.finalRootTail.length,5);
});

test('forged attack actor fails closed',()=>{
  const input=fixture();
  input.attackDeclarationTrace[0].playerSlot=0;
  assert.throws(()=>buildBilateralReplyPacket(input,args),
    /Store declaration mismatches/);
});

test('missing Store root, bad turn sequence and illegal metadata fail closed',()=>{
  const input=fixture();
  input.rootActionLedger.pop();
  assert.throws(()=>buildBilateralReplyPacket(input,args),
    /Missing successful root/);
  input.rootActionLedger.push(fixture().rootActionLedger[4]);
  input.rootActionLedger[4].turnBefore=1;
  assert.throws(()=>buildBilateralReplyPacket(input,args),
    /Discontinuous Store turn/);
  assert.throws(()=>buildBilateralReplyPacket(fixture(),{
    ...args,expectedSourceAction:'ResolvePromptAction'}),
  /AssertionError/);
});

test('source Item acceptance does not assert damage, lock or strength',()=>{
  const input=fixture();
  input.rootActionLedger[0].card='Boost Shake';
  const out=buildBilateralReplyPacket(input,{
    sourceSeat:1,triggerTurn:2,expectedSourceAction:'PlayCardAction',
    expectedSourceDetail:'Boost Shake'});
  assert.equal(out.executedSourceRoot.card,'Boost Shake');
  assert.equal(out.matchingSourceAttackDeclared,false);
  assert.equal(out.sourceEffectVerified,false);
});

test('observed public attack board transitions match exact Store attack root',()=>{
  const game=fixture();
  game.attackDeclarationTrace[0].playerName='research-B';
  game.attackDeclarationTrace[1].playerName='research-A';
  game.publicAttackTransitionsProtocol='actual-store-public-attack-transitions-v1';
  game.publicAttackTransitions=[
    {actionOrdinal:1,turnBefore:2,turnAfter:3,triggerAction:'AttackAction',
      triggerPlayerSlot:1,promptPendingAfter:false,
      declarations:[{attackName:'Volt Cyclone',playerName:'research-B'}],
      before:[{active:{name:'Mewtwo',damage:0}},{active:{name:'Iron Thorns',damage:0}}],
      after:[{active:{name:'Mewtwo',damage:40}},{active:{name:'Iron Thorns',damage:0}}]},
    {actionOrdinal:3,turnBefore:3,turnAfter:4,triggerAction:'AttackAction',
      triggerPlayerSlot:0,promptPendingAfter:false,
      declarations:[{attackName:'Pale Moon-GX',playerName:'research-A'}],
      before:[{active:{name:'Mewtwo',damage:40}},{active:{name:'Iron Thorns',damage:0}}],
      after:[{active:{name:'Mewtwo',damage:40}},{active:{name:'Iron Thorns',damage:120}}]}
  ];
  const out=buildBilateralReplyPacket(game,{
    ...args,requirePublicAttackTransitions:true
  });
  assert.equal(out.sourceImmediatePublicAttackTransition.after[0].active.damage,40);
  assert.equal(out.candidateImmediatePublicAttackTransitions[0].after[1].active.damage,120);
  assert.equal(out.sourceEffectVerified,false);
  assert.equal(out.qualifiedCompetitiveGame,false);
  game.publicAttackTransitions[0].triggerPlayerSlot=0;
  assert.throws(()=>buildBilateralReplyPacket(game,{
    ...args,requirePublicAttackTransitions:true
  }),/Public attack observation/);
  delete game.publicAttackTransitions;
  assert.throws(()=>buildBilateralReplyPacket(game,{
    ...args,requirePublicAttackTransitions:true
  }),/AssertionError/);
});

test('attack damage settled after a real same-origin prompt, never on pending root',()=>{
  const roots=[
    {actionOrdinal:0,turnBefore:2,turnAfter:2,playerSlot:1,
      action:'AttackAction',attack:'Volt Cyclone',initiatingRootActionOrdinal:0},
    {actionOrdinal:1,turnBefore:2,turnAfter:3,playerSlot:1,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:0},
    {actionOrdinal:2,turnBefore:3,turnAfter:4,playerSlot:0,
      action:'PassTurnAction',initiatingRootActionOrdinal:2},
    {actionOrdinal:3,turnBefore:4,turnAfter:5,playerSlot:1,
      action:'PassTurnAction',initiatingRootActionOrdinal:3}
  ];
  const empty=[{active:{name:'Trevenant & Dusknoir-GX',damage:0}},
    {active:{name:'Iron Thorns ex',damage:0}}];
  const damaged=[{active:{name:'Trevenant & Dusknoir-GX',damage:140}},
    {active:{name:'Iron Thorns ex',damage:0}}];
  const game={
    actions:roots.length,rootActionLedger:roots,
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    attackDeclarationTrace:[{actionOrdinal:0,turnBefore:2,turnAfter:2,
      playerSlot:1,triggerAction:'AttackAction',triggerPlayerSlot:1,
      attackName:'Volt Cyclone',playerName:'research-B'}],
    publicAttackTransitionsProtocol:'actual-store-public-attack-transitions-v1',
    publicAttackTransitions:[{
      actionOrdinal:0,turnBefore:2,turnAfter:2,
      triggerAction:'AttackAction',triggerPlayerSlot:1,
      initiatingRootActionOrdinal:0,
      declarations:[{attackName:'Volt Cyclone',playerName:'research-B'}],
      before:empty,after:empty,promptPendingAfter:true,
      settled:{completionRootActionOrdinal:1,after:damaged,
        prizesRemaining:[6,6],deckRemaining:[32,30]}
    }],
    finished:false
  };
  const options={...args,requirePublicAttackTransitions:true};
  const packet=buildBilateralReplyPacket(game,options);
  assert.equal(packet.sourceImmediatePublicAttackTransition.after[0].active.damage,0);
  assert.equal(packet.sourceImmediatePublicAttackTransition.settled.after[0].active.damage,140);
  assert.equal(packet.sourceImmediatePublicAttackTransition.settled.completionRootActionOrdinal,1);
  assert.equal(packet.firstCandidateNextTurnRoot.action,'PassTurnAction');
  assert.equal(packet.sourceEffectVerified,false);
  game.publicAttackTransitions[0].settled.completionRootActionOrdinal=3;
  assert.throws(()=>buildBilateralReplyPacket(game,options),
    /Resolved public attack observation/);
});
