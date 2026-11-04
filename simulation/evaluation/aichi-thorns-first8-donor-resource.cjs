'use strict';

const {choose,analyzeAichiThornsDonorOptions}=
  require('./aichi-thorns-physical-energy-donor-census.cjs');

const VERSION='aichi-thorns-direct-first-eight-energy-event-v1';

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x,y){
  while(y!==0n)[x,y]=[y,x%y];
  return x;
}

/** @param {bigint} n @param {bigint} d @returns {object} */
function rational(n,d){
  if(d<=0n||n<0n||n>d)throw new Error('INVALID_PROBABILITY');
  const k=gcd(n,d);
  return {fraction:String(n/k)+'/'+String(d/k),probability:Number(n)/Number(d)};
}

/**
 * Probability of a seven-card valid opener with exactly k copies among
 * the eight original Energy cards, conditioned only on 4 legal Basics.
 * Returns numerator (count of hands), not probability.
 * @param {number} k
 * @returns {bigint}
 */
function validSevenWithEnergy(k){
  let handCount=0;
  for(let basic=1;basic<=4;basic++){
    const other=7-k-basic;
    if(other>=0&&other<=48)
      handCount+=choose(4,basic)*choose(48,other);
  }
  return BigInt(choose(8,k))*BigInt(handCount);
}

/**
 * A legal 7-card opener, followed by exactly one normal draw. The
 * composition of the three physically seen Energy cards is uniform
 * over C(8,3) physical-copy triples conditional on their count.
 *
 * This is a physical card-exposure event, not a playable board or attack.
 * @param {object} field Complete original source deck manifest.
 * @param {(cards:string[],stadiums:string[])=>boolean|null} canPay Printed cost only.
 * @returns {object}
 */
function firstEightPhysicalDonorExposure(field,canPay){
  const census=analyzeAichiThornsDonorOptions(field,canPay);
  const allSeven=BigInt(choose(60,7));
  const validSeven=allSeven-BigInt(choose(56,7));
  const nextDrawOptions=53n;
  // Exactly three Energy in 8: either 2 in first seven and then
  // one of 6 remaining Energy, or 3 in first seven and then 48
  // remaining non-Energy. Both require a Basic in the first seven.
  const joint=validSevenWithEnergy(2)*6n+
    validSevenWithEnergy(3)*48n;
  const denom=allSeven*nextDrawOptions;
  const validDenom=validSeven*nextDrawOptions;
  const physicalTriples=BigInt(choose(8,3));
  return {
    version:VERSION, source:'original Aichi 2026 ranks 6,24,29',
    firstSevenBasicCount:4,allEnergyCopies:8,otherCardCopies:48,
    legalSevenOnly:true,oneNormalDraw:true,
    optionalOpponentMulliganDraws:false,
    actualAttachments:false,
    conditionalValidOpening:rational(validSeven,allSeven),
    jointValidAndExactlyThreeEnergyInFirstEight:rational(joint,denom),
    exactlyThreeEnergyGivenLegalSeven:rational(joint,validDenom),
    sourceOptions:census.rosters.map(row=>{
      const stratum=row.strata.find(s=>
        s.subsetSize===3&&s.stadiums.length===0);
      if(!stratum||stratum.totalPhysicalSubsets!==56)
        throw new Error('MISSING_THREE_CARD_DONOR_STRATUM');
      const mixed=BigInt(stratum.mixedDonorSafety);
      return {
        rank:row.rank,player:row.player,
        mixedDonorOptionPhysicalTriples:stratum.mixedDonorSafety,
        payableBeforeTransferPhysicalTriples:stratum.payableBeforeDonation,
        allThreeCardPhysicalTriples:56,
        mixedConditionalOnThreeVisibleEnergy:rational(mixed,physicalTriples),
        mixedCompositionAmongFirstEightGivenLegalSeven:
          rational(joint*mixed,validDenom*physicalTriples)
      };
    }),
    limitation:'Direct random first seven and one normal draw only; no extra draws, search, actual attachments, benches, Stadium, decision policy, paper-game outcomes or win inference',
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const field=require('../../results/aichi-2026/full-decklists.json');
  const {canPayVoltCost}=require('./agent45-volt-cyclone-donor-debt.cjs');
  process.stdout.write(JSON.stringify(firstEightPhysicalDonorExposure(
    field,canPayVoltCost),null,2)+'\n');
}
module.exports={VERSION,gcd,rational,validSevenWithEnergy,
  firstEightPhysicalDonorExposure};
