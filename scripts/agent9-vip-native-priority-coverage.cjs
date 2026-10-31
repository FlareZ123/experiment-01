'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {choose,openingCohold,run:sourceCensus,FIELD_RANKS,percent}=
  require('./agent9-crobat-vip-cohold.cjs');

const VERSION='agent9-first-owner-root-direct-vip-nine-originals-v1';

/**
 * The first ordinary turn always starts with one mandatory card draw, in
 * either physical seat. Count direct first-root VIP access conditional on
 * an initially Basic-valid seven, marginalizing unknown six Prize cards.
 *
 * @param {object} args Valid 60-card original list Basic/VIP counts.
 * @returns {{numerator:bigint,denominator:bigint}} Exact rational.
 */
function firstTurnDirectVip({basicCount:B,vipCount:V,total=60,opening=7}){
  assert.ok([B,V,total,opening].every(Number.isSafeInteger));
  assert.ok(B>=1&&V>=1&&B+V<=total&&opening>=1&&opening<total);
  const valid=choose(total,opening)-choose(total-B,opening);
  const noVipValid=choose(total-V,opening)-
    choose(total-V-B,opening);
  const remaining=BigInt(total-opening);
  return {numerator:valid*remaining-
    noVipValid*(remaining-BigInt(V)),
    denominator:valid*remaining};
}

function run(root=path.resolve(__dirname,'..')){
  const source=sourceCensus(root,FIELD_RANKS);
  const rows=source.rows.map(x=>{
    const direct=firstTurnDirectVip(x);
    const cohold=openingCohold(x).goingSecond;
    assert.equal(direct.denominator,cohold.denominator);
    assert.ok(cohold.numerator<=direct.numerator);
    const noCrobat=direct.numerator-cohold.numerator;
    return {rank:x.rank,archetype:x.archetype,
      basicCount:x.basicCount,vipCount:x.vipCount,
      crobatCount:x.crobatCount,
      firstTurnDirectVipPercent:percent(direct),
      directVipAndRetainableCrobatPercent:percent(cohold),
      conditionalCrobatConflictAmongDirectVipPercent:
        percent({numerator:cohold.numerator,
          denominator:direct.numerator}),
      directVipWithoutRetainableCrobatPercent:
        percent({numerator:noCrobat,denominator:direct.denominator}),
      firstTurnDrawAppliesBothSeats:true};
  });
  return {version:VERSION,rows,originalPublishedSourceCount:29,
    evaluatedCrobatVipSources:rows.length,rank11DirectCoverage:{
      firstTurnDirectVipPercent:rows.find(x=>x.rank===11)
        .firstTurnDirectVipPercent,
      relativeStructuralCrobatCollisionPercent:rows.find(x=>x.rank===11)
        .conditionalCrobatConflictAmongDirectVipPercent},
    completeFullField:false,competitiveQualifiedGames:0};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,firstTurnDirectVip,run};
