'use strict';

const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0&&n<=60);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  const count=Math.min(k,n-k);
  let v=1n;
  for(let i=1;i<=count;i++)
    v=v*BigInt(n-i+1)/BigInt(i);
  return v;
}

/** @param {bigint} a @param {bigint} b */
function gcd(a,b){
  while(b!==0n){const next=a%b;a=b;b=next;}
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function ratio(numerator,denominator){
  assert.ok(denominator>0n);
  assert.ok(numerator>=0n&&numerator<=denominator);
  const div=gcd(numerator,denominator);
  return Object.freeze({
    numerator:String(numerator/div),
    denominator:String(denominator/div),
    probability:Number(numerator)/Number(denominator)
  });
}

/** Exact printed rank-9 source cardinalities; fail on unintended list edits. */
function sourceCensus(){
  const deck=field.decks.find(d=>d.rank===9);
  assert.ok(deck,'Authenticated original rank9 required');
  const count=name=>deck.cards.filter(c=>c.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  const expected={
    'Voltorb':1,'Mega Absol ex':1,'Battle Compressor':1,
    'Electrode-GX':2,'Prism Energy':4,'Darkness Energy':2,
    'Telepathic Psychic Energy':1
  };
  for(const [name,n] of Object.entries(expected))
    assert.equal(count(name),n,'Original printed source changed: '+name);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(deck.cards.filter(c=>c.category==='Energy')
    .reduce((n,c)=>n+c.count,0),7);
  const otherBasicNames=[
    'Unown','Toedscool','Sableye V','Gengar & Mimikyu-GX',
    'Dedenne-GX','Squawkabilly ex'
  ];
  const otherBasic=otherBasicNames.reduce((n,name)=>n+count(name),0);
  assert.equal(otherBasic,9);
  return Object.freeze({
    rank:9,sourceCardCount:60,startingBasicCount:otherBasic+2,
    voltorb:1,megaAbsol:1,battleCompressor:1,
    electrode:2,prismEnergy:4,otherEnergy:3,
    otherBasics:otherBasic,otherNonBasics:39
  });
}

/**
 * Enumerate disjoint physical nine-card observations:
 * starting seven, ordered T1 draw, ordered T2 draw. Condition on a
 * valid original Basic-containing seven. The six Prize cards are then
 * allocated uniformly among the remaining 51 physical cards, equivalent to
 * laying Prizes down between the actual seven and the first draws.
 *
 * Strict DIRECT route: Voltorb, Mega, Compressor and >=1 Electrode among
 * first nine; the Voltorb-by-T1 variant excludes Voltorb as ninth card.
 * A deck-population condition additionally asks for >=3 of the seven
 * original Energy still physically in the deck after all nine observed
 * cards and six Prizes. All three-card original Energy subsets can pay
 * Mega Absol's DDC cost under normal Energy rules; no gameplay modeled.
 *
 * @returns {object}
 */
function originalRank9DirectCompressorBombOpportunity(){
  const source=sourceCensus();
  const denom=(choose(60,7)-choose(49,7))*53n*52n*choose(51,6);
  let direct=0n,directWithDeckEnergy=0n,timedWithDeckEnergy=0n;
  let timedWithThreePrism=0n;
  for(let e=1;e<=2;e++){
    for(let energySeen=0;energySeen<=7;energySeen++){
      for(let otherBasics=0;otherBasics<=9;otherBasics++){
        const other=9-(3+e+energySeen+otherBasics);
        if(other<0||other>39)continue;
        const combinations=choose(2,e)*choose(7,energySeen)*
          choose(9,otherBasics)*choose(39,other);
        const basics=2+otherBasics;
        const start=2n*(choose(9,7)-choose(9-basics,7));
        const voltorbFinal=choose(8,7)-choose(8-(basics-1),7);
        const voltorbByT1=start-voltorbFinal;
        assert.ok(voltorbByT1>=0n&&voltorbByT1<=start);
        let prizeWays=0n;
        for(let prized=0;prized<=6;prized++){
          const remaining=7-energySeen-prized;
          if(remaining>=3)prizeWays+=
            choose(7-energySeen,prized)*
            choose(51-(7-energySeen),6-prized);
        }
        direct+=combinations*start*choose(51,6);
        directWithDeckEnergy+=combinations*start*prizeWays;
        timedWithDeckEnergy+=combinations*voltorbByT1*prizeWays;
      }
    }
  }

  // The staged native test selects exactly three original Prism Energy, a
  // stricter subcase of the source's 7-Energy generic route.
  for(let e=1;e<=2;e++){
    for(let prismSeen=0;prismSeen<=4;prismSeen++){
      for(let otherEnergySeen=0;otherEnergySeen<=3;otherEnergySeen++){
        for(let otherBasics=0;otherBasics<=9;otherBasics++){
          const other=9-(3+e+prismSeen+otherEnergySeen+otherBasics);
          if(other<0||other>39)continue;
          const combinations=choose(2,e)*choose(4,prismSeen)*
            choose(3,otherEnergySeen)*choose(9,otherBasics)*
            choose(39,other);
          const basics=2+otherBasics;
          const start=2n*(choose(9,7)-choose(9-basics,7));
          const voltorbByT1=start-(
            choose(8,7)-choose(8-(basics-1),7));
          let prizeWays=0n;
          for(let prized=0;prized<=6;prized++){
            if(4-prismSeen-prized>=3)
              prizeWays+=choose(4-prismSeen,prized)*
                choose(51-(4-prismSeen),6-prized);
          }
          timedWithThreePrism+=combinations*voltorbByT1*prizeWays;
        }
      }
    }
  }
  assert.ok(timedWithThreePrism<=timedWithDeckEnergy);
  assert.ok(timedWithDeckEnergy<=directWithDeckEnergy);
  assert.ok(directWithDeckEnergy<=direct);
  return Object.freeze({
    source,
    schema:'rank9-original-direct-9-observed-energy-prizes-v1',
    validSeven:ratio(choose(60,7)-choose(49,7),choose(60,7)),
    directFourPiecesBySecondTurn:ratio(direct,denom),
    directFourPiecesAndThreeEnergyInDeck:ratio(directWithDeckEnergy,denom),
    voltorbByFirstTurnAndThreeEnergyInDeck:ratio(timedWithDeckEnergy,denom),
    voltorbByFirstTurnAndThreePrismInDeck:ratio(timedWithThreePrism,denom),
    countOnlyDirectDraws:true,
    extraDrawSearchMulliganAndOpponentActionsModeled:false,
    probabilityOfSuccessfulAttackCertified:false,
    competitivelyQualifiedGames:0
  });
}

if(require.main===module){
  const out=originalRank9DirectCompressorBombOpportunity();
  process.stdout.write('AGENT29_RANK9_EXACT_DIRECT_WINDOW '+
    JSON.stringify(out)+'\n');
}

module.exports={choose,gcd,ratio,sourceCensus,
  originalRank9DirectCompressorBombOpportunity};
