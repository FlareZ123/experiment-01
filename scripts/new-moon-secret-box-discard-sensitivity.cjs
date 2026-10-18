'use strict';

const assert = require('node:assert/strict');
const variant = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const {choose} = require('./new-moon-lockbreak-access.cjs');
const {calculate: accessWithoutDiscardCost} =
  require('./new-moon-secret-box-blower-access.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while (b !== 0n) [a,b] = [b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator,denominator) {
  assert(numerator >= 0n && denominator > 0n);
  const d=gcd(numerator,denominator);
  return {numerator:String(numerator/d),denominator:String(denominator/d),
    probability:Number(numerator)/Number(denominator)};
}

/** @param {{numerator:string,denominator:string}} a
 * @param {{numerator:string,denominator:string}} b */
function add(a,b) {
  const an=BigInt(a.numerator),ad=BigInt(a.denominator);
  const bn=BigInt(b.numerator),bd=BigInt(b.denominator);
  return fraction(an*bd+bn*ad,ad*bd);
}

/**
 * Exact static first-eight-card event: legal initial seven (at least one of
 * 17 Basic Pokemon), no Field Blower directly visible, Secret Box visible,
 * >=3 designated non-Basic other cards visible, and >=1 Field Blower outside
 * the six Prizes. At least one Basic must be reserved for the Active Spot.
 * No play sequencing or actual discard acceptability is established.
 *
 * The first seven and subsequent normal draw are exchangeable as an eight-
 * card subset for this calculation, with legal-first-seven weight 7/8 if
 * exactly one Basic was drawn, and 1 if >=2 were drawn.
 *
 * @param {number} discardPoolCopies 0..40 among other non-Basics
 */
function discardConstrainedBox(discardPoolCopies) {
  const D=discardPoolCopies;
  assert(Number.isInteger(D) && D>=0 && D<=40);
  const basics=17, other=40-D;
  let validWeighted=0n;
  // With one Secret Box and no Field Blower in the eight, exactly seven
  // additional cards are Basic, designated-discard, or other.
  for(let b=1;b<=7;b++){
    const legalPositions=b===1?7n:8n;
    for(let d=3;d<=Math.min(D,7-b);d++){
      const o=7-b-d;
      if(o<0 || o>other)continue;
      validWeighted+=legalPositions*choose(basics,b)*choose(D,d)*
        choose(other,o);
    }
  }
  const legalInitial=choose(60,7)-choose(43,7);
  const prizeDen=choose(52,6);
  const prizeGood=prizeDen-choose(50,4);
  return fraction(validWeighted*choose(60,7)*prizeGood,
    8n*choose(60,8)*legalInitial*prizeDen);
}

/** @param {string[]} names @returns {number} */
function poolCount(names) {
  const selected=new Set(names);
  assert.equal(selected.size,names.length,'Duplicate designated card name');
  let total=0;
  for(const name of selected) {
    const rows=variant.entries.filter(row=>row.name_en===name);
    assert(rows.length>0,'Card missing from frozen 60: '+name);
    assert(rows.every(row=>row.name_en!=='Field Blower' &&
      row.name_en!=='Secret Box' &&
      (row.type!=='Pokémon'||row.name_en==='Dusclops')),
      'Protected Basic/search card designated: '+name);
    total+=rows.reduce((sum,row)=>sum+row.count,0);
  }
  return total;
}

const TIERS=Object.freeze([
  {id:'none',names:[]},
  {id:'vip-cologne',names:['Battle VIP Pass','Canceling Cologne']},
  {id:'plus-recovery',names:['Battle VIP Pass','Canceling Cologne',
    'Rescue Carrier','Ace Trainer']},
  {id:'plus-stadiums',names:['Battle VIP Pass','Canceling Cologne',
    'Rescue Carrier','Ace Trainer','Sky Field','Path to the Peak']},
  {id:'plus-supporter',names:['Battle VIP Pass','Canceling Cologne',
    'Rescue Carrier','Ace Trainer','Sky Field','Path to the Peak',
    "Lillie's Determination"]}
]);

/** @returns {object} */
function main() {
  assert.equal(variant.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(variant.counts.total,60);
  const eligible=variant.entries.filter(row=>
    (row.type!=='Pokémon'||row.name_en==='Dusclops') &&
    !['Field Blower','Secret Box'].includes(row.name_en));
  assert.equal(eligible.reduce((sum,row)=>sum+row.count,0),40);
  const prior=accessWithoutDiscardCost(17,2,1);
  const rows=[...TIERS.map(tier=>({...tier,
    designatedCopies:poolCount(tier.names)})),
    {id:'every-other-nonbasic',names:eligible.map(row=>row.name_en),
      designatedCopies:40}].map(row=>{
    const bridge=discardConstrainedBox(row.designatedCopies);
    return {...row,exclusiveBoxBridge:bridge,
      directOrBoxBridge:add(prior.direct,bridge)};
  });
  return {
    schema:'new-moon-secret-box-discard-pool-sensitivity-v1',
    candidateHash:variant.canonical_id_count_sha256,
    conditioning:'legal seven (>=1 of 17 Basics), six unknown Prizes, first ordinary draw',
    hypothesis:'An early Tool-equipped Garbodor; Item cards remain playable',
    originalOptimistic:prior,
    rows,
    limitations:'All designated copies are assumed retained in hand and acceptable as discards. Tiers are hypotheticals, not state-specific DCI or feasible played lines. Source first-turn Battle VIP Pass is often a key setup resource. No search contention, opponent retooling, alternate access or match strength is modeled.',
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={discardConstrainedBox,poolCount,TIERS,main};
