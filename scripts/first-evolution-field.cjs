'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {mulliganProbability, loadBasicIndex, audit} = require('./aichi_opening_audit.cjs');
const {bonusExactly, bonusAtLeast} = require('./aichi_bonus_draws.cjs');
const {naturalEvolutionChance, countsFromDeck} = require('./first-evolution-natural.cjs');

/**
 * Exactly marginalizes the two-player mulligan protocol. Take every optional
 * bonus card offered, capped at 45 to keep both ordinary turn draws possible.
 * Tail mass K >= 45 is aggregated without truncating the distribution.
 * @param {number} opponentBasics
 * @param {{basicCount:number,targetBasicCount:number,stageOneCount:number}} counts
 * @returns {number}
 */
function weightedNaturalEvolutionChance(opponentBasics, counts) {
  if (!Number.isInteger(opponentBasics) || opponentBasics < 1 || opponentBasics > 60) {
    throw new RangeError('Invalid opposing Basic count');
  }
  const pA = mulliganProbability(opponentBasics);
  const pB = mulliganProbability(counts.basicCount);
  const chance = bonusDraws => naturalEvolutionChance({
    deckSize:60,openingSize:7,prizeCount:6,...counts,bonusDraws,
  }).conditional;
  let value = 0;
  for (let k = 0; k < 45; k++) value += bonusExactly(pA,pB,k) * chance(k);
  value += bonusAtLeast(pA,pB,45) * chance(45);
  return value;
}

if (require.main === module) {
  const root = path.resolve(__dirname,'..');
  const dir = path.join(root,'results/aichi-2026');
  const source = JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
  const candidateFiles = [
    ['champion-reference',source.decks.find(d=>d.rank===1)],
    ['hood-shield-v1',JSON.parse(fs.readFileSync(path.join(dir,'candidate-hood-shadow-rider.json'),'utf8'))],
    ['temple-v1',JSON.parse(fs.readFileSync(path.join(dir,'candidate-temple-shadow-rider.json'),'utf8'))],
  ];
  const stageIndex = loadBasicIndex(path.join(root,'resources/cards/en'));
  const counts = candidateFiles.map(([name,deck])=>({name,...countsFromDeck(deck,stageIndex)}));
  const ranks = audit(source.decks,stageIndex);
  for (const row of ranks) {
    const result={rank:row.rank,archetype:row.archetype,opponentBasics:row.basicCount};
    for (const candidate of counts) result[candidate.name]=weightedNaturalEvolutionChance(row.basicCount,candidate);
    process.stdout.write(JSON.stringify(result)+'\n');
  }
}

module.exports={weightedNaturalEvolutionChance};
