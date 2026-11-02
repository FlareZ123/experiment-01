'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { choose, countSourceAttackLine, countsForOriginal } =
  require('./agent11-thorns-tagcall-first-attack.cjs');

/** @typedef {{count:number, english_proxy_card_id:string,type:string,name_en:string}} ManifestEntry */

/** @param {{canonical_id_count_sha256:string,entries:ManifestEntry[],counts:object}} manifest */
function candidateCategories(manifest) {
  const frozen = 'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4';
  assert.equal(manifest.canonical_id_count_sha256, frozen);
  const entries = manifest.entries;
  assert.equal(entries.reduce((s,e)=>s+e.count,0),60);
  const digest = createHash('sha256').update(entries
    .map(e=>e.english_proxy_card_id+':'+e.count+'\n').sort().join('')).digest('hex');
  assert.equal(digest, frozen);
  /** @param {string} id */
  const count = id => entries.filter(e=>e.english_proxy_card_id===id)
    .reduce((s,e)=>s+e.count,0);
  const basic = entries.filter(e=>e.type==='Pokémon'&&e.name_en!=='Dusclops')
    .reduce((s,e)=>s+e.count,0);
  const vulnerable = count('xy7-30') + count('swsh4-69');
  const directRescuers = [
    ['swsh8-225',4], ['swsh6-140',4], ['sm6-113',2],
    ['swsh10-146',2], ['sv6-163',1], ['me3-88',3]
  ];
  for(const [id,expected] of directRescuers) assert.equal(count(id),expected);
  const direct = directRescuers.reduce((s,[,n])=>s+n,0);
  const compressor=count('xy4-92');
  const carrier=count('swsh7-154');
  const safe = 60-basic-direct;
  const neutral=safe-compressor-carrier;
  assert.deepEqual({basic,vulnerable,direct,compressor,carrier,safe,neutral},
    {basic:17,vulnerable:5,direct:16,compressor:2,carrier:2,safe:27,neutral:23});
  return {basic,vulnerable,direct,compressor,carrier,safe,neutral};
}

/**
 * Exact valid-seven conditional first-turn no-Bench physical subevent:
 * - opening hand contains exactly one fragile Basic and h-1 cards from safe;
 * - first draw is also safe;
 * - those h safe cards contain no BOTH Compressor and Rescue Carrier.
 * Six unknown Prizes occur between hand and first draw. Their placement is
 * integrated by exchangeability; the draw's marginal safe probability is
 * (safe-h+1)/(total-h). This excludes an obvious two-Item recovery path.
 *
 * @param {{basic:number,vulnerable:number,direct:number,compressor:number,carrier:number,safe:number}} c
 * @param {number} [handSize]
 * @param {number} [total]
 * @returns {{numerator:bigint,denominator:bigint,validHandNumerator:bigint,conditionalProbability:number,unconditionalProbability:number}}
 */
function forcedSoloScreen(c,handSize=7,total=60) {
  const {basic,vulnerable,direct,compressor,carrier,safe}=c;
  assert.ok([basic,vulnerable,direct,compressor,carrier,safe,handSize,total]
    .every(n=>Number.isInteger(n)&&n>=0));
  assert.ok(vulnerable<=basic&&safe>=compressor+carrier&&
    total===basic+direct+safe&&handSize>=1&&total>handSize);
  const validHandNumerator=choose(total,handSize)-choose(total-basic,handSize);
  const pairless=choose(safe-compressor,handSize)+
    choose(safe-carrier,handSize)-
    choose(safe-compressor-carrier,handSize);
  const numerator=BigInt(vulnerable)*choose(safe,handSize-1)*
    BigInt(safe-handSize+1)*pairless;
  const denominator=choose(total,handSize)*BigInt(total-handSize)*
    choose(safe,handSize);
  const conditionalDenominator=validHandNumerator*BigInt(total-handSize)*
    choose(safe,handSize);
  return {numerator,denominator,validHandNumerator,
    conditionalProbability:Number(numerator)/Number(conditionalDenominator),
    unconditionalProbability:Number(numerator)/Number(denominator)};
}

/** @returns {object} */
function fromRepo() {
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const candidate=candidateCategories(manifest);
  const candidateExposure=forcedSoloScreen(candidate);
  const sourceRanks=[6,24,29].map(rank=>{
    const deck=roster.decks.find(d=>d.rank===rank);
    assert.ok(deck);
    const source=countSourceAttackLine(countsForOriginal(deck));
    const sourceOpenValid=1-Number(choose(56,7))/Number(choose(60,7));
    const bothValidConditionalPotential=candidateExposure.conditionalProbability*
      source.broaderProbability;
    const noMulliganPotential=candidateExposure.unconditionalProbability*
      sourceOpenValid*source.broaderProbability;
    return {rank,sourceOpenValid,sourceFirstAttackConditional:source.broaderProbability,
      bothValidConditionalPotential,noMulliganPotential};
  });
  return {candidate, candidateExposure,sourceRanks,
    status:'physical resource conjunction, not observed attack or game loss',
    noOpposingMulliganBonuses:true,
    candidateFirst:true,sourceSecond:true,
    sixPrizeMarginalIntegrated:true};
}

if (require.main===module) process.stdout.write(JSON.stringify(fromRepo(),
  (_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
module.exports={candidateCategories,forcedSoloScreen,fromRepo};
