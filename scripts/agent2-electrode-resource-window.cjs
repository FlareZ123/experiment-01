'use strict';

const ZONE = Object.freeze({OPEN:0, DRAW:1, PRIZE:2, DECK:3});
const CAPACITY = [7, 2, 6, 45];

/** @param {number} n @param {number} k @returns {number} */
function falling(n, k) {
  let p = 1;
  for (let i = 0; i < k; i += 1) p *= n - i;
  return p;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k > n || k < 0) return 0;
  return falling(n, k) / falling(k, k);
}

/**
 * Exact 60-card, five-unique-singleton resource observation model.
 * Identities are [Electrode Basic, Arven Supporter, Quick Ball Item,
 * Curry Item, Glasses Tool]. All other 55 cards contain 14 Basics.
 *
 * Resource routing assumes a drawn Arven can get an unprized Item and Tool,
 * and a drawn Quick Ball (or Arven-fetched Ball if Curry already drawn)
 * can get Electrode when in deck. Omits discards, prize rescue, search
 * prohibition, active promotion, Supporter-turn constraints, all other
 * search/draw effects, abilities and gameplay. Not a setup or win rate.
 *
 * @returns {object} Conditional probabilities given legal initial seven.
 */
function resourceWindow() {
  const event = {direct:0, arvenElectrode:0,
    arvenQuickBall:0, arvenFetchQuickBall:0, union:0};
  const denom = falling(60, 5);
  const validStart = 1 - choose(45, 7) / choose(60, 7);

  for (let encoded = 0; encoded < 1024; encoded += 1) {
    const zones = [];
    let value = encoded;
    for (let k = 0; k < 5; k += 1) {
      zones.push(value % 4);
      value = Math.floor(value / 4);
    }
    const count = CAPACITY.map((_,zone) =>
      zones.filter(z => z === zone).length);
    if (count.some((n,zone) => n > CAPACITY[zone])) continue;
    const pZone = count.reduce((p,n,zone) =>
      p * falling(CAPACITY[zone], n), 1) / denom;
    const pLegal = zones[0] === ZONE.OPEN ? 1 :
      1 - choose(41, 7 - count[0]) / choose(55, 7 - count[0]);
    const weight = pZone * pLegal;
    const observed = z => z === ZONE.OPEN || z === ZONE.DRAW;
    const [E,A,Q,C,G] = zones;
    const direct = observed(E) && observed(C) && observed(G);
    const arvenElectrode = observed(E) && observed(A) &&
      C !== ZONE.PRIZE && G !== ZONE.PRIZE;
    const arvenQuickBall = E === ZONE.DECK && observed(Q) &&
      observed(A) && C !== ZONE.PRIZE && G !== ZONE.PRIZE;
    const arvenFetchQuickBall = E === ZONE.DECK &&
      Q === ZONE.DECK && observed(A) && observed(C) &&
      G !== ZONE.PRIZE;
    if (direct) event.direct += weight;
    if (arvenElectrode) event.arvenElectrode += weight;
    if (arvenQuickBall) event.arvenQuickBall += weight;
    if (arvenFetchQuickBall) event.arvenFetchQuickBall += weight;
    if (direct || arvenElectrode || arvenQuickBall ||
        arvenFetchQuickBall) event.union += weight;
  }
  return {
    schema:'electrode-five-singleton-restricted-resource-window-v1',
    validStart,
    conditional: Object.fromEntries(Object.entries(event)
      .map(([name,p]) => [name,p/validStart])),
    qualifiedForGameInference:false
  };
}

module.exports = {resourceWindow};
if (require.main === module) {
  process.stdout.write(JSON.stringify(resourceWindow(),null,2) + '\n');
}
