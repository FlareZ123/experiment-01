'use strict';
const assert=require('node:assert/strict');
const candidate=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {loadRegisteredStartingBasicCounts,exactBonusMultiplicity}=
  require('./agent1-original-field-mulligan-bonus.cjs');
const {EVENTS}=require('./agent27-adp-conditional-bonus-counts.cjs');
const AXES=['mechanical','dragons','dragonsEnergy','dragonsEnergyCompressor'];
/**
 * Strict physical-access bounds when every offered opponent-mulligan bonus
 * is accepted. Multi-bonus cases use monotonic hand access for the lower
 * bound and the probability ceiling one for the upper bound.
 * @param {{rank:number,basics:number,archetype:string}[]} field
 * @returns {object} Rank-complete 29-source conditional resource bounds.
 */
function fieldBounds(field){
  assert.equal(field.length,29);
  const rows=field.map(source=>{
    const offer=exactBonusMultiplicity(7,source.basics,1);
    const one=offer.candidateOffered[0].probability;
    const tail=offer.candidateOfferTail;
    const no=1-one-tail;
    assert.ok(no>=0&&one>=0&&tail>=0&&Math.abs(no+one+tail-1)<1e-12);
    const axes=Object.fromEntries(AXES.map(axis=>{
      const p0=Number(EVENTS.noBonus[axis])/Number(EVENTS.noBonus.denominator);
      const p1=Number(EVENTS.oneBonus[axis])/Number(EVENTS.oneBonus.denominator);
      assert.ok(p1>=p0);
      const lower=no*p0+(one+tail)*p1;
      const upper=no*p0+one*p1+tail;
      return [axis,{noBonus:p0,oneBonus:p1,lower,upper}];
    }));
    return {rank:source.rank,archetype:source.archetype,basicCopies:source.basics,
      candidateBonusNone:no,candidateBonusExactlyOne:one,
      candidateBonusTwoOrMore:tail,axes};
  }).sort((a,b)=>a.rank-b.rank);
  const mean=fn=>rows.reduce((s,r)=>s+fn(r),0)/rows.length;
  const equallyWeighted=Object.fromEntries(AXES.map(axis=>[
    axis,{lower:mean(r=>r.axes[axis].lower),
      upper:mean(r=>r.axes[axis].upper),
      noBonus:rows[0].axes[axis].noBonus,
      exactOneBonus:rows[0].axes[axis].oneBonus}
  ]));
  return {originals:29,missingRanks:[23,25,28],
    bonusFrequency:{any:mean(r=>1-r.candidateBonusNone),
      exactlyOne:mean(r=>r.candidateBonusExactlyOne),
      twoOrMore:mean(r=>r.candidateBonusTwoOrMore)},
    equallyWeighted,rows,qualifiedGames:0};
}
/** @returns {object} Validated fixed source one-bonus field sensitivity. */
function main(){
  assert.equal(candidate.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  const src=loadRegisteredStartingBasicCounts();
  assert.ok(src.candidates.some(c=>c.name==='ADP Thorton Regidrago v2'&&c.basics===7));
  return fieldBounds(src.originals);
}
module.exports={AXES,fieldBounds,main};
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
