'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const roster = require('../results/aichi-2026/full-decklists.json');
const { exactAccess } = require('../scripts/agent11-thorns-first-volt-access.cjs');
const { singleMailAccess } = require('../scripts/agent11-thorns-single-trainers-mail.cjs');

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
