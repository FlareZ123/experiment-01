'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {holdPotentialReactiveTerminalLoss}=require(
  '../simulation/twinleaf/agent5-reactive-attachment-guard.cjs');

const first={kind:'attack',attackName:'Gnaw'};
const proposed={kind:'attach-special-energy',handIndex:0,
  printing:'Double Dragon Energy ROS',slot:'bench',index:1};
const selected=()=>({intent:proposed,
  receipt:{version:'arbiter-v2',baselineKind:'attack',
    selectedKind:'attach-special-energy',candidateCount:1,
    selectedPrinting:proposed.printing,
    selectedTarget:{slot:'bench',index:1},nativePlayability:'unverified',
    reason:'fund-public-bench-attack-before-turn-ending-root'}});
const view=()=>({decisionKind:'owner-root',globalTurn:4,
  ownHand:['Double Dragon Energy ROS'],
  ownPublic:{active:{name:'Venonat',printing:'Venonat MEW'},
    bench:[null,{name:'Regidrago V',printing:'Regidrago V SIT',
      hp:220,damage:210}],prizeCount:6},
  opponentPublic:{prizeCount:2,
    active:{name:'Minun',printing:'Minun PAR',abilities:['Buddy Pulse']},
    bench:[{name:'Plusle',printing:'Plusle PAR'}]}});

test('pure guard converts instant opponent-terminal Energy loss to attack hold',()=>{
  const result=holdPotentialReactiveTerminalLoss(view(),first,selected());
  assert.equal(result.safety.held,true);
  assert.strictEqual(result.intent,first);
  assert.equal(result.receipt.baselineKind,'attack');
  assert.equal(result.receipt.selectedKind,'attack');
  assert.equal(result.receipt.candidateCount,1);
  assert.equal(result.receipt.selectedPrinting,null);
  assert.equal(result.receipt.reason,
    'hold-visible-opponent-terminal-buddy-pulse');
  assert.equal(result.safety.exposure.triggerDamage,20);
});

test('nonterminal and non-triggering counterexamples preserve arbitration',()=>{
  const normal=view();normal.opponentPublic.bench=[];
  const result=holdPotentialReactiveTerminalLoss(normal,first,selected());
  assert.equal(result.safety.held,false);
  assert.strictEqual(result.intent,proposed);
  const pokemon=view();pokemon.ownPublic.bench[1].damage=0;
  assert.equal(holdPotentialReactiveTerminalLoss(pokemon,first,selected())
    .safety.held,false);
  const nonattack={kind:'bench-basic'};
  assert.equal(holdPotentialReactiveTerminalLoss(view(),nonattack,selected())
    .safety.held,false);
});

test('opponent concealed hand, prized identities and deck order stay isolated',()=>{
  const a=view(),b=structuredClone(a);
  a.opponentPrivate={hand:['hidden-a'],prizes:['hidden-a']};
  b.opponentPrivate={hand:['hidden-b'],prizes:['hidden-b']};
  a.unknownDeck=['a'];b.unknownDeck=['b'];
  const ra=holdPotentialReactiveTerminalLoss(a,first,selected());
  const rb=holdPotentialReactiveTerminalLoss(b,first,selected());
  assert.deepEqual(ra,rb);
});

test('no mutation of existing first choice or arbiter receipt',()=>{
  const f=Object.freeze({...first});
  const s=selected();
  Object.freeze(s.receipt);
  Object.freeze(s.intent);
  Object.freeze(s);
  const before=structuredClone(s);
  const result=holdPotentialReactiveTerminalLoss(view(),f,s);
  assert.deepEqual(s,before);
  assert.notStrictEqual(result.receipt,s.receipt);
  assert.strictEqual(result.intent,f);
});

test('guard accepts a global public three-Prize rule rather than a suffix guess',()=>{
  const v=view();
  v.ownPublic.bench[1]={name:'Trevenant & Dusknoir-GX',
    printing:'Trevenant & Dusknoir-GX SMP',hp:270,damage:250};
  v.opponentPublic.prizeCount=3;
  const alt=selected();
  alt.intent={kind:'attach-basic-energy',printing:'Psychic Energy MEE',
    handIndex:0,slot:'bench',index:1};
  assert.equal(holdPotentialReactiveTerminalLoss(v,first,alt).safety.held,false);
  const catalog={publicPokemonProfileIndex:new Map([
    ['Trevenant & Dusknoir-GX SMP',{prizesOnKnockout:3}]])};
  const result=holdPotentialReactiveTerminalLoss(v,first,alt,catalog);
  assert.equal(result.safety.held,true);
  assert.strictEqual(result.intent,first);
});
