'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  choose, fraction, basicCountFromPrintedDeck,
} = require('./aichi-rank15-dual-lock-prize-ceiling.cjs');

/**
 * Separate Stage2 chains:
 * AOR Vileplume: 2 Oddish, 2 Gloom, 2 AOR Vileplume.
 * BCR Stoutland: 2 Lillipup, 2 Herdier, 1 BCR Stoutland.
 * Physical feasibility requires at least one of each chain's roles
 * unprized; this makes no prediction about actual play decisions.
 *
 * @param {number} basicCount Number of source-printed Basic Pokemon in 60.
 * @returns {object}
 */
function rank2InitialPrizeLockTopology(basicCount) {
  assert.ok(Number.isInteger(basicCount) &&
    basicCount >= 4 && basicCount <= 53);
  const names = [
    'Neither distinct Stage2 chain physically feasible',
    'Only AOR Vileplume Item-lock chain feasible',
    'Only BCR Stoutland Supporter-lock chain feasible',
    'Both Item and Supporter lock chains physically feasible',
  ];
  const directCounts = Array(4).fill(0n);
  const legalWeighted = Array(4).fill(0n);
  const otherBasics = basicCount - 4;
  const otherNonBasics = 60 - 11 - otherBasics;

  for (let oddish = 0; oddish <= 2; oddish++) {
    for (let gloom = 0; gloom <= 2; gloom++) {
      for (let vileplume = 0; vileplume <= 2; vileplume++) {
        for (let lillipup = 0; lillipup <= 2; lillipup++) {
          for (let herdier = 0; herdier <= 2; herdier++) {
            for (let stoutland = 0; stoutland <= 1; stoutland++) {
              for (let otherBasic = 0;
                otherBasic <= Math.min(6, otherBasics); otherBasic++) {
                const otherNonBasic = 6 - oddish - gloom - vileplume -
                  lillipup - herdier - stoutland - otherBasic;
                const ways = choose(2, oddish) * choose(2, gloom) *
                  choose(2, vileplume) * choose(2, lillipup) *
                  choose(2, herdier) * choose(1, stoutland) *
                  choose(otherBasics, otherBasic) *
                  choose(otherNonBasics, otherNonBasic);
                const validSeven = choose(54, 7) -
                  choose(54 - basicCount + oddish + lillipup + otherBasic, 7);
                const itemLock = oddish < 2 && gloom < 2 && vileplume < 2;
                const supporterLock = lillipup < 2 && herdier < 2 &&
                  stoutland === 0;
                const key = itemLock && supporterLock ? 3 :
                  itemLock ? 1 : supporterLock ? 2 : 0;
                directCounts[key] += ways;
                legalWeighted[key] += ways * validSeven;
              }
            }
          }
        }
      }
    }
  }
  const all = directCounts.reduce((sum, v) => sum + v, 0n);
  const legal = legalWeighted.reduce((sum, v) => sum + v, 0n);
  assert.equal(all, choose(60, 6));
  assert.equal(legal * choose(60, 7),
    choose(60, 6) * choose(54, 7) *
      (choose(60, 7) - choose(60 - basicCount, 7)));
  const categories = names.map((name, i) => ({
    name,
    randomSixPrizes: fraction(directCounts[i], all),
    givenLegalOpening: fraction(legalWeighted[i], legal),
  }));
  return {
    printedBasicCount:basicCount,
    categories,
    itemLockStage2AvailableGivenLegalOpening: fraction(
      legalWeighted[1] + legalWeighted[3], legal),
    supporterLockStage2AvailableGivenLegalOpening: fraction(
      legalWeighted[2] + legalWeighted[3], legal),
    jointItemAndSupporterLockChainsAvailableGivenLegalOpening: fraction(
      legalWeighted[3], legal),
    onlyPhysicalNecessaryCardsCounted:true,
    qualifiesCompetitiveResults:false,
  };
}

/** @param {string} root Repository checkout root. */
function fromSourceManifest(root=path.resolve(__dirname,'..')) {
  const field=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=field.decks.find(d=>d.rank===2);
  assert.ok(deck,'Missing authentic rank2 source');
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  const count=(name,set)=>deck.cards
    .filter(c=>c.name===name&&c.printing.set===set)
    .reduce((s,c)=>s+c.count,0);
  assert.deepEqual([
    count('Oddish','UNB'),count('Gloom','UNB'),
    count('Vileplume','AOR'),
    count('Lillipup','CEC'),count('Herdier','SUM'),
    count('Stoutland','BCR'),
  ],[2,2,2,2,2,1]);
  const model=rank2InitialPrizeLockTopology(basicCountFromPrintedDeck(deck,root));
  assert.equal(model.printedBasicCount,14);
  return {rank:2,player:deck.player,archetype:deck.archetype,...model};
}

if(require.main===module){
  process.stdout.write(JSON.stringify(fromSourceManifest(),null,2)+'\n');
}

module.exports={rank2InitialPrizeLockTopology,fromSourceManifest};
