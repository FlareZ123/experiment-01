'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {attestNativeTurnClosureLineage} =
  require('../simulation/evaluation/agent12-native-turn-closure-lineage.cjs');

const root=(ordinal,turnBefore,turnAfter,action,playerSlot,extras={})=>({
  actionOrdinal:ordinal,turnBefore,turnAfter,action,playerSlot,...extras
});

test('native original Store prompt closure belongs to initiating Boost Shake root',()=>{
  const rows=[
    root(0,0,1,'StartGameAction',-1),
    root(1,1,1,'PlayCardAction',0,{card:'Boost Shake'}),
    root(2,1,2,'ResolvePromptAction',-1,{initiatingRootActionOrdinal:1}),
    root(3,2,3,'PassTurnAction',1)
  ];
  const r=attestNativeTurnClosureLineage(rows);
  assert.equal(r.counts.nativeTurnEnds,2);
  assert.equal(r.counts.boundNativeTurnEnds,2);
  assert.equal(r.counts.promptClosedTerminals,1);
  assert.equal(r.counts.certainNonattackTerminalRoots,1);
  assert.equal(r.closures[0].initiatingRootAction,'PlayCardAction');
  assert.equal(r.closures[0].initiatingCardName,'Boost Shake');
  assert.equal(r.closures[0].terminalOrdinal,2);
  assert.equal(r.closures[0].actorSeat,0);
  assert.equal(r.closures[0].terminalPromptSeat,-1);
  console.log('PASS: native prompt turn-advance traces to owner original Item');
});

test('Stadium card PLAY differs from actual Stadium-use turn ending',()=>{
  const r=attestNativeTurnClosureLineage([
    root(0,0,1,'StartGameAction',-1),
    root(1,1,1,'PlayCardAction',0,{card:'Tropical Beach'}),
    root(2,1,2,'UseStadiumAction',0,{card:'Tropical Beach'}),
    root(3,2,3,'PassTurnAction',1)
  ]);
  assert.equal(r.closures[0].initiatingRootAction,'UseStadiumAction');
  assert.equal(r.closures[0].actionFamily,'stadium-use');
  assert.equal(r.counts.certainNonattackTerminalRoots,1);
  console.log('PASS: terminal credited to activating the Stadium, not playing it');
});

test('Perfection-like UseAbilityAction remains semantically attack-ambiguous',()=>{
  const r=attestNativeTurnClosureLineage([
    root(0,0,1,'StartGameAction',-1),
    root(1,1,1,'UseAbilityAction',0,{card:'Mewtwo & Mew-GX'}),
    root(2,1,2,'ResolvePromptAction',0,{initiatingRootActionOrdinal:1})
  ]);
  assert.equal(r.counts.ambiguousAbilityTerminals,1);
  assert.equal(r.counts.certainNonattackTerminalRoots,0);
  assert.equal(r.closures[0].actionFamily,'ability-or-delegated-attack');
  console.log('PASS: delegated attacks cannot inflate ordinary Ability-end counts');
});

test('missing prompt origin remains explicit unbound, not a credited terminal Item',()=>{
  const r=attestNativeTurnClosureLineage([
    root(0,0,1,'StartGameAction',-1),
    root(1,1,1,'PlayCardAction',0,{card:'Camping Gear'}),
    root(2,1,2,'ResolvePromptAction',-1,{initiatingRootActionOrdinal:null})
  ]);
  assert.equal(r.counts.nativeTurnEnds,1);
  assert.equal(r.counts.boundNativeTurnEnds,0);
  assert.equal(r.counts.unresolvedTerminals,1);
  assert.equal(r.unbound[0].status,'unbound-terminal-origin');
  console.log('PASS: orphan native prompt turn advance is unqualified');
});

test('replay clock reset must be partitioned before lineage calculation',()=>{
  assert.throws(()=>attestNativeTurnClosureLineage([
    root(0,0,1,'StartGameAction',-1),
    root(1,1,2,'PassTurnAction',0),
    root(2,0,1,'ResetGameAction',-1)
  ]));
  console.log('PASS: unpartitioned sudden-death epochs rejected');
});

test('native ledger must have complete ordinals with no silently omitted roots',()=>{
  assert.throws(()=>attestNativeTurnClosureLineage([
    root(0,0,1,'StartGameAction',-1),
    root(2,1,2,'PassTurnAction',0)
  ]));
  console.log('PASS: incomplete root ledger rejected');
});

test('empty accepted-ledger input is explicit zero evidence',()=>{
  const r=attestNativeTurnClosureLineage([]);
  assert.equal(r.counts.nativeTurnEnds,0);
  assert.equal(r.counts.boundNativeTurnEnds,0);
  assert.equal(r.competitiveGameQualified,false);
  console.log('PASS: empty ledger is no native turn evidence');
});
