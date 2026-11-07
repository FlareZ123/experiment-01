'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} Exact binomial. */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||k<0||k>n)return 0n;
  const m=Math.min(k,n-k);
  let value=1n;
  for(let i=1;i<=m;i++)value=value*BigInt(n-m+i)/BigInt(i);
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function ratio(numerator,denominator){
  assert.ok(denominator>0n);
  const divisor=gcd(numerator,denominator);
  return {
    numerator:(numerator/divisor).toString(),
    denominator:(denominator/divisor).toString(),
    probability:Number(numerator)/Number(denominator),
    percent:100*Number(numerator)/Number(denominator)
  };
}

/** Assert the exact printed-card multiplicities used by this model. */
function sourceCounts(){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=roster.decks.find(d=>d.rank===1);
  assert.ok(deck && deck.player==='Yasunori Kato');
  assert.equal(deck.category_counts['Pokémon'],18);
  const requiredSingles=[
    ['Mimikyu','GRI'],['Dialga-GX','UPR'],['Radiant Eternatus','CRZ']
  ];
  for(const [name,set] of requiredSingles){
    const c=deck.cards.find(card=>card.name===name && card.printing?.set===set);
    assert.equal(c?.count,1,'Expected one exact source '+name);
  }
  assert.equal(deck.cards.find(card=>card.name==="Lillie's Clefairy ex" &&
    card.printing?.set==='JTG')?.count,2);
  assert.equal(deck.cards.find(card=>card.name==='Hisuian Heavy Ball' &&
    card.printing?.set==='ASR')?.count,1);

  const basicNames=new Set([
    'Shadow Rider Calyrex V',"Lillie's Clefairy ex",'Tapu Lele-GX',
    'Trevenant & Dusknoir-GX','Latias ex','Dialga-GX','Mimikyu',
    'Girafarig','Marshadow','Radiant Eternatus'
  ]);
  const pokemon=deck.cards.filter(card=>card.category==='Pokémon');
  for(const card of pokemon){
    assert.ok(basicNames.has(card.name)||card.name==='Shadow Rider Calyrex VMAX',
      'Unexpected Pokémon stage in original source: '+card.name);
  }
  const basics=pokemon.filter(card=>basicNames.has(card.name))
    .reduce((total,card)=>total+card.count,0);
  assert.equal(basics,14);
  assert.equal(deck.cards.reduce((total,c)=>total+c.count,0),60);
  return {
    sourceRank:1,sourcePlayer:deck.player,sourceSize:60,
    basicPokemonCount:basics,threeDistinctRequiredBasicSingletons:3,
    requiredClefairyCopies:2,heavyBallCopies:1,
    otherBasics:basics-5,otherNonbasics:60-basics-1
  };
}

/**
 * Model 7 shuffled starting cards conditioned on >=1 Basic, followed by six
 * face-down Prizes from the remaining deck, without replacement.
 * This is exactly symmetric to choosing Prize cards first and legal starting
 * hand second; impossible opening hands carry zero legal-starting weight.
 *
 * For the precisely named Mimikyu/Dialga/Radiant singletons plus at least
 * one Clefairy, minimum prized Basic recoveries needed is:
 *    number of those three singletons Prized + both Clefairy Prized ? 1 : 0
 * Only one Heavy Ball exists, and its Prize recovery can resolve one Basic.
 *
 * @returns {object} Exact BigInt rational enumeration and source counts.
 */
function study(){
  const counts=sourceCounts();
  const allStartingSeven=choose(54,7);
  const cases=[];
  let totalLegalWeight=0n;
  let pairBlocked=0n;
  let exactLineBlocked=0n;
  let prizedBallBlock=0n;
  let overOneBallBlock=0n;

  // Mask bits 0/1/2 represent Prized Mimikyu, Dialga, Radiant.
  for(let mask=0;mask<8;mask++){
    const requiredSinglesPrized=[0,1,2]
      .reduce((n,bit)=>n+((mask>>bit)&1),0);
    const pairSinglesPrized=(mask&1)+((mask>>1)&1);
    for(let clefairyPrized=0;clefairyPrized<=2;clefairyPrized++){
      for(let heavyBallPrized=0;heavyBallPrized<=1;heavyBallPrized++){
        for(let otherBasicsPrized=0;
          otherBasicsPrized<=counts.otherBasics;otherBasicsPrized++){
          const otherNonbasicsPrized=6-requiredSinglesPrized-
            clefairyPrized-heavyBallPrized-otherBasicsPrized;
          if(otherNonbasicsPrized<0 ||
            otherNonbasicsPrized>counts.otherNonbasics)continue;
          const prizeWays=choose(2,clefairyPrized)*
            choose(counts.otherBasics,otherBasicsPrized)*
            choose(counts.otherNonbasics,otherNonbasicsPrized);
          const basicsPrized=requiredSinglesPrized+
            clefairyPrized+otherBasicsPrized;
          // Prize-first symmetry: remaining 54 contains 40+k nonbasics.
          const legalHandWays=allStartingSeven-
            choose(40+basicsPrized,7);
          const weight=prizeWays*legalHandWays;
          const needed=requiredSinglesPrized+Number(clefairyPrized===2);
          const ballCapacity=1-heavyBallPrized;
          const blocked=needed>ballCapacity;
          const pairUnreachable=pairSinglesPrized>ballCapacity;
          totalLegalWeight+=weight;
          if(pairUnreachable)pairBlocked+=weight;
          if(blocked){
            exactLineBlocked+=weight;
            if(heavyBallPrized)prizedBallBlock+=weight;
            else overOneBallBlock+=weight;
          }
          cases.push({
            mask,requiredSinglesPrized,clefairyPrized,heavyBallPrized,
            otherBasicsPrized,otherNonbasicsPrized,
            necessaryPrizeRecoveries:needed,
            ballRecoveryCapacity:ballCapacity,
            pairUnreachable,exactLineBlocked:blocked
          });
        }
      }
    }
  }
  assert.equal(exactLineBlocked,prizedBallBlock+overOneBallBlock);
  assert.ok(exactLineBlocked>=pairBlocked);
  const allUnconditionalPartitions=choose(60,6)*choose(54,7);
  // Crosscheck the exact legal opening probability.
  assert.equal(totalLegalWeight*choose(60,7),
    allUnconditionalPartitions*(choose(60,7)-choose(46,7)));
  const out={
    schema:'agent46-original-rank1-four-basics-heavyball-legal-opening-frontier-v1',
    counts,
    condition:'Uniform seven-card opening, at least one Basic; then six face-down Prize cards',
    retrievalAssumption:'Only original single Hisuian Heavy Ball can access one face-down Prized Basic before taking any Prizes',
    exactPayloadRequirements:'Mimikyu GRI, Dialga-GX UPR, Radiant Eternatus CRZ and >=1 Lillie Clefairy ex JTG',
    totalLegalWeightedCombinations:totalLegalWeight.toString(),
    legalInitialOpening:ratio(totalLegalWeight,allUnconditionalPartitions),
    earlierMimikyuDialgaBaselineUnreachable:ratio(pairBlocked,totalLegalWeight),
    fullExactPayloadStructurallyBlocked:ratio(exactLineBlocked,totalLegalWeight),
    additionalBlockBeyondEarlierPair:ratio(exactLineBlocked-pairBlocked,totalLegalWeight),
    blockedWithPrizedHeavyBall:ratio(prizedBallBlock,totalLegalWeight),
    blockedWithUnprizedHeavyBallButTwoOrMoreRequiredRecoveries:
      ratio(overOneBallBlock,totalLegalWeight),
    nominalPrerequisitePrizeAccessCeiling:
      ratio(totalLegalWeight-exactLineBlocked,totalLegalWeight),
    enumeratedPhysicalPrizeConfigurations:cases.length,
    noNaturalLineProbabilityInferred:true,
    competitivelyQualifiedGames:0
  };
  assert.ok(Math.abs(
    out.earlierMimikyuDialgaBaselineUnreachable.percent-2.366909103369581)<1e-9,
    'Reproduce prior independent Agent6 exact pair-plus-Ball frontier');
  return out;
}

if(require.main===module)
  process.stdout.write('AGENT46_CHAMPION_COPYCAT_PRIZE_FRONTIER '+
    JSON.stringify(study())+'\n');
module.exports={choose,gcd,ratio,sourceCounts,study};
