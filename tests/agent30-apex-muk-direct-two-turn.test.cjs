'use strict';

/**
 * Agent 30: exact no-extra-draw, no-connector Regidrago V -> early Alolan Muk ->
 * second-turn Apex Dragon opening audit. Run directly with Node.
 *
 * Initial deal: seven hand cards, six Prizes, turn-one draw, turn-two draw.
 * Boost Shake searches the remaining deck for Muk and SHUFFLES before the
 * turn-two draw. All percentages are opportunity bounds without opposition.
 * This is intentionally a STRICT SUBSET of all playable two-turn sequences.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const original = require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const shake4 = require('../results/aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json');

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) r = (r * (n - i + 1)) / i;
  return Math.round(r);
}

/** @param {object} deck @returns {string} */
function canonicalSha(deck) {
  const rows = deck.cards.map(c => c.cardId + ':' + c.count + '\n').sort().join('');
  return crypto.createHash('sha256').update(rows, 'utf8').digest('hex');
}

/** @param {object} deck @returns {number[]} */
function categoryCounts(deck) {
  assert.equal(canonicalSha(deck), deck.deck_identity_sha256, 'fixed 60 must be unchanged');
  assert.equal(deck.total_cards, 60);
  const count = id => deck.cards.find(c => c.cardId === id)?.count ?? 0;
  const otherBasics = ['sm5-100', 'sv6pt5-47', 'sv5-120', 'sm2-60',
    'sv8-76', 'me2pt5-16'].reduce((s, id) => s + count(id), 0);
  // Grimer, Muk, Regidrago V, VSTAR, Shake, DDE, Grass+Fire, other Basics, rest.
  const counts = [count('sm1-57'), count('sm1-58'), count('swsh12-135'),
    count('swsh12-136'), count('swsh7-142'), count('xy6-97'),
    count('sve-1') + count('sve-2'), otherBasics];
  counts.push(60 - counts.reduce((a, b) => a + b, 0));
  assert.equal(counts[0], 2);
  assert.equal(counts[1], 2);
  assert.equal(counts[2], 4);
  assert.equal(counts[3], 3);
  assert.equal(counts[5], 4);
  assert.equal(counts[6], 6);
  assert.equal(counts[7], 6);
  assert.equal(counts.reduce((a, b) => a + b, 0), 60);
  return counts;
}

/**
 * Exact multivariate hypergeometric enumeration of the first 8 seen cards.
 * Grimer and Shake must be held by the first own turn; Regidrago V must
 * already be in the opening seven so it can be chosen as Active. One Muk
 * must remain unprized in deck for Shake. Turn one attaches DDE or basic
 * Grass/Fire to Regidrago, then Boost Shake evolves the Benched Grimer.
 * Turn two evolves Regidrago and completes GGF with DDE + a basic Energy.
 * One unrestricted natural turn-two draw may find the sole missing piece.
 *
 * Search, Supporters, opponent mulligan bonus draws, attacks, tools, switching,
 * hidden-information policy, and an opponent's interference are excluded.
 *
 * @param {object} deck
 * @returns {{setup:number, allEight:number, turnTwo:number, basicValid:number}}
 */
function opportunity(deck) {
  const n = categoryCounts(deck);
  const seen = Array(8).fill(0);
  const total = {setup:0, allEight:0, turnTwo:0};
  const den = choose(60, 8);
  const prizeDen = choose(52, 6);
  const prizeDenExcludeTarget = choose(51, 6);

  /** @param {number} i @param {number} left @param {number} ways */
  function enumerate(i, left, ways) {
    if (i < 8) {
      for (let x = 0; x <= Math.min(n[i], left); x++) {
        seen[i] = x;
        enumerate(i + 1, left - x, ways * choose(n[i], x));
      }
      return;
    }
    if (left > n[8]) return;
    const [grimer, muk, regidrago, vstar, shake, dde, basic] = seen;
    if (!grimer || !regidrago || !shake || muk === n[1]) return;
    const mukDeck = n[1] - muk;
    // Given 8 visible cards, each of them was equally likely to be the
    // eighth (turn-one draw). Active Regidrago must be among the first 7.
    const regidragoInitially = regidrago > 1 ? 1 : 7 / 8;
    const weight = ways * choose(n[8], left) / den * regidragoInitially;
    const mukSurvivesPrizes =
      1 - choose(52 - mukDeck, 6 - mukDeck) / prizeDen;
    total.setup += weight * mukSurvivesPrizes;

    // At least one Energy must be attachable on turn one.
    if (!dde && !basic) return;
    const missing = [3, 5, 6].filter(j => seen[j] === 0);
    if (!missing.length) {
      total.allEight += weight * mukSurvivesPrizes;
      total.turnTwo += weight * mukSurvivesPrizes;
    } else if (missing.length === 1) {
      const targetCount = n[missing[0]];
      // After 6 Prizes, 46 cards remain. Shake consumes one Muk from deck
      // and SHUFFLES, leaving 45. For a particular target card, the chance
      // it is unprized is 46/52. Conditional on its being unprized, Prizes
      // come from the other 51 cards, and at least one Muk must survive.
      const joint = targetCount * (46 / (52 * 45)) *
        (1 - choose(51 - mukDeck, 6 - mukDeck) / prizeDenExcludeTarget);
      total.turnTwo += weight * joint;
    }
  }
  enumerate(0, 8, 1);
  const basicValid = 1 - choose(48, 7) / choose(60, 7);
  return {...total, basicValid};
}


/**
 * Strict paid Dragon-copy branch. One Mysterious Treasure or Quick Ball held
 * by turn one discards one physical Dragon attack payload. If Grimer is not
 * held, that same Item fetches it from the surviving deck; if already held,
 * its restricted search may choose no target. Then attach Energy + Shake
 * Muk; turn two evolves Regidrago and completes the GGF attack cost.
 * No extra draws, no second search, no mobility, and no other acceleration.
 *
 * @param {object} deck
 * @returns {{setup:number,allEight:number,turnTwo:number,viaSearch:number,
 *   grimerHeld:number,basicValid:number}}
 */
function paidCopyOpportunity(deck) {
  const initial = categoryCounts(deck);
  const count = id => deck.cards.find(c => c.cardId === id)?.count ?? 0;
  const payloadIds = ['sv6-130', 'sm5-100', 'swsh11-136',
    'sv2-153', 'sv6pt5-47', 'sv5-120'];
  const payload = payloadIds.reduce((s, id) => s + count(id), 0);
  const tutor = count('sm6-113') + count('swsh8-237');
  const basicPayload = ['sm5-100','sv6pt5-47','sv5-120']
    .reduce((s, id) => s + count(id), 0);
  // Grimer, Muk, Regidrago V, VSTAR, Shake, DDE, basic Grass/Fire,
  // six copyable Dragon attack payloads, seven/six payable search Items,
  // other Basic starters, and the remaining cards.
  const n = [...initial.slice(0, 7), payload, tutor,
    initial[7] - basicPayload];
  n.push(60 - n.reduce((a,b) => a+b, 0));
  assert.equal(payload, 6);
  assert.equal(n[9], 3);
  assert.equal(n.reduce((a,b) => a+b, 0), 60);
  const seen = Array(10).fill(0);
  const total = {setup:0,allEight:0,turnTwo:0,viaSearch:0,grimerHeld:0};
  const den = choose(60, 8);
  /** @param {number} k @param {number} nDeck */
  const allPrized = (k, nDeck) =>
    choose(nDeck-k, 6-k) / choose(nDeck, 6);

  /** @param {number} i @param {number} left @param {number} ways */
  function enumerate(i, left, ways) {
    if (i < 10) {
      for (let x=0; x<=Math.min(n[i],left); x++) {
        seen[i]=x;
        enumerate(i+1,left-x,ways*choose(n[i],x));
      }
      return;
    }
    if (left > n[10]) return;
    const [g,m,r,v,s,d,b,p,t] = seen;
    if (!r || !s || !p || !t || m===n[1]) return;
    const weight=ways*choose(n[10],left)/den*(r>1?1:7/8);
    const M=n[1]-m;
    const G=n[0]-g;
    const needGrimerSearch = g===0;
    const survive = needGrimerSearch
      ? 1-allPrized(M,52)-allPrized(G,52)+allPrized(M+G,52)
      : 1-allPrized(M,52);
    total.setup+=weight*survive;
    if (!d && !b) return;
    const missing=[3,5,6].filter(j=>seen[j]===0);
    let joint;
    if (missing.length===0) {
      joint=survive;
      total.allEight+=weight*joint;
    } else if (missing.length===1) {
      const target=n[missing[0]];
      const remainingPrizeValid=needGrimerSearch
        ? 1-allPrized(M,51)-allPrized(G,51)+allPrized(M+G,51)
        : 1-allPrized(M,51);
      // Search consumes Grimer if absent from hand; Boost Shake consumes
      // Muk. 46 unprized deck cards become 44 or 45 after both searches.
      joint=target*46/(52*(needGrimerSearch?44:45))*remainingPrizeValid;
    } else return;
    const p=weight*joint;
    total.turnTwo+=p;
    total[needGrimerSearch?'viaSearch':'grimerHeld']+=p;
  }
  enumerate(0,8,1);
  return {...total,basicValid:1-choose(48,7)/choose(60,7)};
}

const paidA=paidCopyOpportunity(original);
const paidB=paidCopyOpportunity(shake4);
assert.ok(Math.abs(paidA.setup - 0.033515030805) < 1e-10);
assert.ok(Math.abs(paidA.allEight - 0.000485505995) < 1e-10);
assert.ok(Math.abs(paidA.turnTwo - 0.001011907390) < 1e-10);
assert.ok(Math.abs(paidB.setup - 0.038250700361) < 1e-10);
assert.ok(Math.abs(paidB.allEight - 0.000554863995) < 1e-10);
assert.ok(Math.abs(paidB.turnTwo - 0.001156256752) < 1e-10);
assert.ok(paidA.viaSearch > paidA.grimerHeld);
assert.ok(paidB.viaSearch > paidB.grimerHeld);
console.log('Paid copy route original/Shake4, conditional valid seven:',
  (100*paidA.turnTwo/paidA.basicValid).toFixed(9)+'%',
  (100*paidB.turnTwo/paidB.basicValid).toFixed(9)+'%');

const a = opportunity(original);
const b = opportunity(shake4);
// Independent ordered-physical-deal Monte Carlo at 600k each also produced
// 0.106333% / 0.131333% unconditional turn-two opportunities respectively.
assert.ok(Math.abs(a.setup - 0.025731854554) < 1e-10);
assert.ok(Math.abs(a.allEight - 0.000606384525) < 1e-10);
assert.ok(Math.abs(a.turnTwo - 0.001076361266) < 1e-10);
assert.ok(Math.abs(b.setup - 0.032763421395) < 1e-10);
assert.ok(Math.abs(b.allEight - 0.000791113317) < 1e-10);
assert.ok(Math.abs(b.turnTwo - 0.001396969010) < 1e-10);
assert.ok(a.turnTwo > a.allEight && b.turnTwo > b.allEight);
assert.ok(b.turnTwo > a.turnTwo);
for (const [name, values] of [['Apex v0', a], ['Shake4/Quick2', b]]) {
  console.log(name, JSON.stringify({
    unconditional: Object.fromEntries(['setup','allEight','turnTwo']
      .map(k => [k, (values[k] * 100).toFixed(9) + '%'])),
    conditionalValidOpening: Object.fromEntries(['setup','allEight','turnTwo']
      .map(k => [k, (values[k] * 100 / values.basicValid).toFixed(9) + '%']))
  }, null, 2));
}
console.log('PASS: exact first-eight plus post-Shake-shuffle turn-two combinatorics.');
module.exports = {opportunity, paidCopyOpportunity, categoryCounts, choose};
