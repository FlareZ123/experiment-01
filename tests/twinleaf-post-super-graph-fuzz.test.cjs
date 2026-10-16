'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {assertVendorCloneCompatibleSource,normalizeDeepClonePrototypes} =
  require('../simulation/twinleaf/normalize-deep-clone.cjs');
const {severClonePrototypeAliases} =
  require('../simulation/twinleaf/prototype-safe-simulator-hook.cjs');
const output = path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {deepClone} = require(path.join(output,'utils'));

/** @param {number} seed @returns {()=>number} */
function seeded(seed) {
  let state=seed>>>0;
  return () => {
    state ^= state<<13;
    state ^= state>>>17;
    state ^= state<<5;
    return state>>>0;
  };
}

class PrintedCard {
  /** @param {number} id @param {object} attack */
  constructor(id,attack) {
    this.fullName='Card-'+id;
    this.attacks=[attack];
    this.damageTakenLastTurn=0;
  }
}

/** Acyclic arrays, repeated references, live-class cards and object cycles. */
function makeGraph(seed) {
  const roll=seeded(seed);
  const attacks=Array.from({length:5},(_,i)=>({name:'Attack-'+i,damage:i*40}));
  const cards=Array.from({length:8},(_,i)=>
    new PrintedCard(i,attacks[roll()%attacks.length]));
  const shared=[cards[0],attacks[0],cards[1]];
  const loop={turn:seed};
  loop.self=loop;
  const root={
    players:[
      {active:{cards:[cards[0]]}, bench:[{cards:shared}], discard:{cards:[]}},
      {active:{cards:[cards[2]]}, bench:[{cards:cards.slice(3,6)}]}
    ],
    lastAttack:cards[0].attacks[0],
    playerLastAttack:{'101':{attack:cards[0].attacks[0]}},
    repeatedArrays:[shared,shared],
    loop,
    metadata:{seed,flags:[true,false,null]}
  };
  for(let i=0;i<18;i++) {
    const selected=roll()%4;
    if(selected===0)root.players[0].discard.cards.push(cards[roll()%cards.length]);
    else if(selected===1)root.players[0].discard.cards.push(attacks[roll()%attacks.length]);
    else if(selected===2)root.players[1].bench.push({cards:[cards[roll()%cards.length]]});
    else root.metadata['key-'+i]={ref:shared,attack:attacks[roll()%attacks.length]};
  }
  return root;
}

/** Verify exact primitive content, class prototypes and both-way aliases. */
function assertDetachedEquivalent(source,clone) {
  const forward=new Map();
  const reverse=new Map();
  function visit(src,dst) {
    if(src===null||typeof src!=='object') {
      assert.strictEqual(dst,src);
      return;
    }
    assert.ok(dst!==null&&typeof dst==='object');
    assert.notStrictEqual(src,dst,'source reference leaked');
    if(forward.has(src)) {
      assert.strictEqual(dst,forward.get(src),'repeated source alias split');
      return;
    }
    assert.equal(reverse.has(dst),false,'distinct source nodes collapsed');
    forward.set(src,dst);
    reverse.set(dst,src);
    assert.strictEqual(Object.getPrototypeOf(dst),Object.getPrototypeOf(src),
      'source class prototype changed');
    assert.deepEqual(Object.keys(dst).sort(),Object.keys(src).sort());
    for(const key of Object.keys(src))visit(src[key],dst[key]);
  }
  visit(source,clone);
  return forward.size;
}

test('96 pinned two-pass clone graphs preserve values, classes and alias topology', () => {
  let checked=0;
  for(let seed=1;seed<=96;seed++) {
    const source=makeGraph(seed);
    assert.doesNotThrow(()=>assertVendorCloneCompatibleSource(source));
    const precloned=deepClone(source);
    severClonePrototypeAliases(source,precloned);
    // Twinleaf Simulator's constructor performs a second clone, excluding
    // Card instances, even when a detached copy was passed into it.
    const postcloned=deepClone(precloned,[PrintedCard]);
    normalizeDeepClonePrototypes(source,postcloned);
    checked+=assertDetachedEquivalent(source,postcloned);
    postcloned.players[0].active.cards[0].damageTakenLastTurn=70;
    assert.equal(source.players[0].active.cards[0].damageTakenLastTurn,0);
  }
  assert.ok(checked>2000,'expected substantial repeated graph coverage');
});

test('object cycles remain supported; array self-cycles fail preflight', () => {
  const source={value:'loop'};
  source.self=source;
  assertVendorCloneCompatibleSource(source);
  const pre=deepClone(source);
  severClonePrototypeAliases(source,pre);
  const copy=deepClone(pre);
  normalizeDeepClonePrototypes(source,copy);
  assertDetachedEquivalent(source,copy);
  assert.strictEqual(copy.self,copy);

  const array=[];
  array.push(array);
  assert.throws(()=>assertVendorCloneCompatibleSource({array}),
    /cannot clone cyclic arrays/);
});
