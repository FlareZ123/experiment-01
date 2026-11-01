'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,exactConditionalHeld,original29HeldFirst8,
  sourceBasicPrintingIndex}=
  require('./agent18-original-source-supporter-opening.cjs');
const {loadTrainerTypes}=require('./agent3-jellicent-field-exposure.cjs');

const VERSION='agent18-original29-first8-supporter-contention-v1';

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b){const r=a%b;a=b;b=r;}
  return a;
}

/**
 * Number of physically held Supporter cards in 7 + the ordinary first draw,
 * conditioned on a Basic-valid seven and marginalizing over hidden Prizes.
 * The count includes duplicate copies of the same name, some of which are
 * poor choices. A printed card is not a legal/tactically useful root action.
 * @param {number} N Physical deck size.
 * @param {number} basic Number of Basic Pokémon.
 * @param {number} supporter Number of selected Supporter copies.
 * @param {number} [h] Opening hand size.
 * @returns {{exact:Array<{count:number,numerator:string,denominator:string,probability:number}>,atLeastTwo:number,atLeastThree:number}}
 */
function conditionalSupporterCount(N,basic,supporter,h=7){
  for(const v of [N,basic,supporter,h])
    assert.ok(Number.isSafeInteger(v)&&v>=0);
  assert.ok(basic>0&&h>0&&N>h&&basic+supporter<=N);
  const denominator=(choose(N,h)-choose(N-basic,h))*BigInt(N-h);
  assert.ok(denominator>0n);
  const counts=Array(Math.min(supporter,h+1)+1).fill(0n);
  for(let j=0;j<=Math.min(supporter,h);j++){
    // Choose j Supporters and at least one Basic in the opening seven.
    const openings=choose(supporter,j)*
      (choose(N-supporter,h-j)-
        choose(N-supporter-basic,h-j));
    counts[j]+=openings*BigInt(N-h-supporter+j);
    if(j<supporter)counts[j+1]+=openings*BigInt(supporter-j);
  }
  assert.equal(counts.reduce((a,b)=>a+b,0n),denominator);
  const exact=counts.map((num,count)=>{
    const div=gcd(num,denominator);
    return {count,numerator:String(num/div),
      denominator:String(denominator/div),
      probability:Number(num)/Number(denominator)};
  });
  const atLeastTwo=1-(exact[0]?.probability??0)-
    (exact[1]?.probability??0);
  const atLeastThree=1-(exact[0]?.probability??0)-
    (exact[1]?.probability??0)-(exact[2]?.probability??0);
  assert.ok(Math.abs(
    (1-exact[0].probability)-
      exactConditionalHeld(N,basic,supporter,h).probability)<1e-12);
  return {exact,atLeastTwo:Math.max(0,atLeastTwo),
    atLeastThree:Math.max(0,atLeastThree)};
}

/**
 * Exact original source 29 60s, unresolved finish ranks preserved.
 * @param {object} roster Original printed Limitless roster.
 * @param {Map<string,string>} trainerTypes Printed Trainer family.
 * @param {Map<string,boolean>} basicPrintings Exact-source Stage metadata.
 */
function firstEightFieldContention(roster,trainerTypes,basicPrintings){
  const published=original29HeldFirst8(roster,trainerTypes,basicPrintings);
  const rows=published.rows.map(row=>({
    rank:row.rank,archetype:row.archetype,
    basics:row.basicCopies,supporters:row.allSupporterCopies,
    distribution:conditionalSupporterCount(
      60,row.basicCopies,row.allSupporterCopies),
    // The narrow three-name shuffle option is a different selection axis.
    fiveFamilyDistribution:conditionalSupporterCount(
      60,row.basicCopies,row.fiveFamilyCopies)
  }));
  return {schema:VERSION,knownOriginal60s:rows.length,
    missingRanks:published.missingRanks,rows,
    competitiveQualifiedGames:0,
    caveat:'Multiplicity in a physical opening hand, not simultaneous legal Supporter plays or match wins.'};
}

function main(){
  const root=path.resolve(__dirname,'..');
  const roster=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const pokemon=roster.decks.flatMap(row=>
    row.cards.filter(card=>card.category==='Pokémon'));
  const basics=sourceBasicPrintingIndex(root,pokemon);
  const types=loadTrainerTypes(path.join(root,'resources/cards/en'));
  const report=firstEightFieldContention(roster,types,basics);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module)main();
module.exports={VERSION,conditionalSupporterCount,
  firstEightFieldContention,main};
