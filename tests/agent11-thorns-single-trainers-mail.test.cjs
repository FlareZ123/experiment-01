'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const roster = require('../results/aichi-2026/full-decklists.json');
const opening = require('../results/aichi-2026/opening-hand-audit.json');
const { exactAccess } = require('../scripts/agent11-thorns-first-volt-access.cjs');
const { singleMailAccess, withMaxMulliganBonuses } =
  require('../scripts/agent11-thorns-single-trainers-mail.cjs');

const fixtures = [
  { rank:6, d:1, mail:3, base:9177359393312555306400n,
    rescued:1258962115066913136000n, total:10436321508379468442400n,
    allNum:280786541516936143210972545004800n, allDen:723434486475301475249684509200000n },
  { rank:24, d:3, mail:4, base:10624357699798492261920n,
    rescued:1804502105745057789840n, total:12428859805543550051760n,
    allNum:55020028179047314754322617632568694400n, allDen:118053656675472071238619766633802000000n },
  { rank:29, d:1, mail:2, base:9177359393312555306400n,
    rescued:889212398430828122640n, total:10066571791743383429040n,
    allNum:1648838222304359712638968560n, allDen:4433216818183665626434320000n }
];

for (const f of fixtures) {
  test(`original Aichi ${f.rank} once-Trainers-Mail source-only rescue`, () => {
    const deck = roster.decks.find(d => d.rank === f.rank);
    assert.ok(deck);
    assert.equal(deck.cards.reduce((n,c) => n+c.count, 0),60);
    const mail = deck.cards.filter(c => c.name === "Trainers' Mail");
    assert.equal(mail.length,1);
    assert.equal(mail[0].count,f.mail);
    assert.equal(mail[0].printing.set,'ROS');
    assert.equal(mail[0].printing.number,'92');
    const old = exactAccess(f.d);
    const m = singleMailAccess(f.d, f.mail);
    assert.equal(m.denominator,27166815688841901072000n);
    assert.equal(m.base,f.base);
    assert.equal(m.mailRescue,f.rescued);
    assert.equal(m.total,f.total);
    assert.equal(old.available * m.denominator,m.base * old.denominator);
    assert.equal(m.base + m.mailRescue,m.total);
    assert.ok(m.total < m.denominator);
    assert.equal(m.allHeldMailNumerator,f.allNum);
    assert.equal(m.allHeldMailDenominator,f.allDen);
    assert.ok(m.allHeldMailNumerator * m.denominator >=
      m.total * m.allHeldMailDenominator);
    assert.ok(m.allHeldMailNumerator < m.allHeldMailDenominator);
  });
}

test('maximum optional source mulligan gains preserve original printed starter eligibility', () => {
  const expected = [
    [1,3,14,0.340461748781253,0.386951612740452,0.390985903535151],
    [1,3,17,0.339266119714949,0.385690860179358,0.389697376451883],
    [3,4,14,0.394208147926194,0.460780246163052,0.469459691450095],
    [3,4,17,0.392794664602379,0.459302324778017,0.467926989400031],
    [1,2,14,0.340461748781253,0.373321137882786,0.374725143104723],
    [1,2,17,0.339266119714949,0.372068871017311,0.373462697102659]
  ];
  for (const [d,m,b,base,one,all] of expected) {
    const r = withMaxMulliganBonuses(d,m,b);
    assert.ok(Math.abs(r.withoutMail-base)<1e-12);
    assert.ok(Math.abs(r.oneMail-one)<1e-12);
    assert.ok(Math.abs(r.allHeldMail-all)<1e-12);
    assert.ok(r.omittedMass<1e-12);
  }
});

test('entire 29-authenticated-opponent field has all-Mail physically bounded line access', () => {
  assert.equal(opening.decks.length,29);
  assert.deepEqual(opening.decks.map(d=>d.rank),roster.decks.map(d=>d.rank));
  assert.ok(opening.decks.every(d=>d.unresolved_pokemon.length===0));
  const basics=opening.decks.map(d=>d.basic_count_known);
  const expected = [
    [1,3,0.39085247045,0.39497308318],
    [3,4,0.46530117042,0.47414225016],
    [1,2,0.37721809858,0.37865449481]
  ];
  for (const [d,m,one,all] of expected) {
    const cache=new Map();
    for(const b of new Set(basics))cache.set(b,withMaxMulliganBonuses(d,m,b));
    const avg=key=>basics.reduce((v,b)=>v+cache.get(b)[key],0)/basics.length;
    assert.ok(Math.abs(avg('oneMail')-one)<1e-10);
    assert.ok(Math.abs(avg('allHeldMail')-all)<1e-10);
    assert.ok(Math.max(...[...cache.values()].map(v=>v.omittedMass))<6e-10);
  }
});
