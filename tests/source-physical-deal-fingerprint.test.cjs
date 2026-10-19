'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {fingerprintInitialSourceDeal:fingerprint}=
  require('../simulation/evaluation/source-physical-deal-fingerprint.cjs');
/** @param {string[]} cards */
const zone=cards=>({cards:cards.map(fullName=>({fullName,id:42}))});
const slot=(cards,tools=[],energy=[])=>({
  ...zone(cards),
  tools:tools.map(fullName=>({fullName,id:42})),
  energies:zone(energy)
});
function fixture(){
  const player={
    hand:zone(['Tag Call CEC','Guzma & Hala CEC']),
    deck:zone(['Double Colorless Energy SUM','Thunder Mountain LOT',
      'Quick Ball SSH','Lillie MEG']),
    prizes:[zone(['Guzma BUS']),zone(['Psychic Energy MEE'])],
    active:slot(['Iron Thorns ex TWM','Capture Energy RCL'],
      [],['Capture Energy RCL']),
    bench:[slot(['Iron Thorns ex TWM'])],
    discard:zone([]),lostzone:zone([]),stadium:zone([]),supporter:zone([])
  };
  return {turn:1,phase:2,prompts:[],players:[player,structuredClone(player)]};
}
test('returns digest and no opponent private printings or mutable references',()=>{
  const s=fixture(),before=structuredClone(s);
  const r=fingerprint(s,1,0);
  assert.match(r.digestSha256,/^[a-f0-9]{64}$/);
  assert.equal(r.schema,'initial-source-physical-position-sha256-v1');
  assert.deepEqual(s,before);
  assert.ok(!JSON.stringify(r).includes('Double Colorless'));
  assert.ok(Object.isFrozen(r));
});
test('same initial positions, different card runtime ids, same hash',()=>{
  const s=fixture(),other=structuredClone(s);
  other.players[1].deck.cards.forEach(c=>c.id=874);
  assert.equal(fingerprint(s,1,0).digestSha256,
    fingerprint(other,1,0).digestSha256);
});
test('hidden deck order and prizes each change the exact-source fingerprint',()=>{
  const s=fixture(),base=fingerprint(s,1,0).digestSha256;
  s.players[1].deck.cards.reverse();
  assert.notEqual(fingerprint(s,1,0).digestSha256,base);
  s.players[1].deck.cards.reverse();
  s.players[1].prizes.reverse();
  assert.notEqual(fingerprint(s,1,0).digestSha256,base);
});
test('own hand and Bench order remain relevant despite identical multiset',()=>{
  const s=fixture(),base=fingerprint(s,1,0).digestSha256;
  s.players[1].hand.cards.reverse();
  assert.notEqual(fingerprint(s,1,0).digestSha256,base);
  s.players[1].hand.cards.reverse();
  s.players[1].bench.push(slot(['Marshadow UNB']));
  assert.notEqual(fingerprint(s,1,0).digestSha256,base);
});
test('first pre-action stable root is required',()=>{
  const s=fixture();
  assert.throws(()=>fingerprint(s,1,1),/precede any player-turn action/);
  s.phase=8;
  assert.throws(()=>fingerprint(s,1,0),/PLAYER_TURN/);
  s.phase=2;
  s.prompts.push({result:undefined});
  assert.throws(()=>fingerprint(s,1,0),/setup prompts/);
});
test('actor seat and source positions are bound, no opponent alias',()=>{
  const s=fixture();
  s.players[0].deck.cards.reverse();
  assert.notEqual(fingerprint(s,0,0).digestSha256,
    fingerprint(s,1,0).digestSha256);
  assert.throws(()=>fingerprint(s,2,0));
});
