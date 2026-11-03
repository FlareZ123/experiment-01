'use strict';

const assert=require('node:assert/strict');
const source=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {choose}=require('./agent5-adp-thorton-prize-availability.cjs');
const {bonusOffers,originalBasicCounts}=
  require('./agent32-adp-field-mulligan-offers.cjs');

const VERSION='agent32-original29-forced-solo-setup-bonus-v1';
const ID=new Set(['sm12-156','swsh12-135','sm2-60','swsh3-104']);

/** @param {number} n @param {number} k */
function combinationProbability(n,k){
  return Number(choose(n,k))/Number(choose(53,k));
}

/**
 * Probability, conditional on a legal initial seven, that its sole Basic
 * is still the ONLY Basic available after accepting every opponent bonus.
 * The original starting Active cannot be replaced by a bonus card.
 *
 * Simultaneous both-player mulligans restart both and award no bonus.
 * m>=1 distribution is ((1-qA)(1-qB) qB^m)/(1-qAqB).
 *
 * All opening bonus cards come after six Prizes, but after marginalizing
 * random Prizes the next m physical cards are uniform among 53 unseen.
 *
 * @param {number} candidateBasics
 * @param {number} opponentBasics
 * @param {number} [maxBonus=32]
 * @returns {object}
 */
function solo(candidateBasics,opponentBasics,maxBonus=32){
  assert.ok(Number.isSafeInteger(candidateBasics)&&
    candidateBasics>=1&&candidateBasics<=60);
  assert.ok(Number.isSafeInteger(opponentBasics)&&
    opponentBasics>=1&&opponentBasics<=60);
  assert.ok(Number.isSafeInteger(maxBonus)&&
    maxBonus>=0&&maxBonus<=46);
  const h=choose(60,7)-choose(60-candidateBasics,7);
  const alone=BigInt(candidateBasics)*choose(60-candidateBasics,6);
  assert.ok(alone<=h);
  const pAlone=Number(alone)/Number(h);
  const b=bonusOffers(candidateBasics,opponentBasics);
  const qA=b.candidateMulliganProbability.fraction;
  const qB=b.opponentMulliganProbability.fraction;
  const p0=1-(1-qA)*qB/(1-qA*qB);
  const common=(1-qA)*(1-qB)/(1-qA*qB);
  let pNoBackup=0,sumWeight=0;
  const firstFew=[];
  for(let m=0;m<=maxBonus;m++){
    const weight=m===0?p0:common*qB**m;
    const noExtraBasic=combinationProbability(54-candidateBasics,m);
    const term=weight*noExtraBasic;
    pNoBackup+=term;
    sumWeight+=weight;
    if(m<=6)firstFew.push({
      bonusCards:m,probabilityOfBonusCount:weight,
      probabilityNoExtraBasicGivenSoleSeven:noExtraBasic,
      weightedNoExtraBasicMass:term
    });
  }
  const tail=(1-qA)*qB**(maxBonus+1)/(1-qA*qB);
  assert.ok(Math.abs(sumWeight+tail-1)<1e-11);
  const lower=pAlone*pNoBackup;
  const upper=lower+pAlone*tail;
  assert.ok(lower>=0&&upper<=1);
  return {
    sourceBasicCount:opponentBasics,
    candidateBasicCount:candidateBasics,
    pExactlyOneBasicInLegalInitialSeven:pAlone,
    noBonusForcedSolo:pAlone,
    opponentMulliganBonusMass:1-p0,
    forcedSoloAfterAllOptionalBonusLower:lower,
    forcedSoloAfterAllOptionalBonusUpper:upper,
    residualOpponentBonusTailBound:pAlone*tail,
    firstFew,
    scope:'Forced to show only one Basic in the opening field, before either player acts. Players can search/Bench on their own turns; no actual donk or win outcome.'
  };
}

/** @returns {object} */
function main(maxBonus=32){
  assert.equal(source.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  const basics=source.cards.reduce((n,row)=>
    n+(ID.has(row.id)?row.count:0),0);
  assert.equal(basics,7);
  const counts={};
  for(const row of source.cards.filter(r=>ID.has(r.id)))counts[row.id]=row.count;
  assert.deepEqual(counts,{
    'sm12-156':2,'swsh12-135':3,'sm2-60':1,'swsh3-104':1
  });
  const field=originalBasicCounts();
  assert.equal(field.find(x=>x.rank===1).basicCopies,14);
  const rows=field.map(entry=>({
    rank:entry.rank,archetype:entry.archetype,
    originalBasicCopies:entry.basicCopies,
    adp:solo(basics,entry.basicCopies,maxBonus),
    champion:solo(14,entry.basicCopies,maxBonus)
  }));
  const mean=key=>rows.reduce((s,row)=>s+row[key].forcedSoloAfterAllOptionalBonusLower,0)/rows.length;
  return {
    version:VERSION,
    fixedCandidateSHA:source.canonicalCardsSha256,
    candidateBasicPrintings:counts,
    championReferenceRank:1,
    championBasicCount:14,
    authenticOriginalCount:rows.length,
    originalMissing:[23,25,28],
    maxBonus,
    identicalNoBonusBaseline:{
      candidate:rows[0].adp.noBonusForcedSolo,
      champion:rows[0].champion.noBonusForcedSolo
    },
    equalOriginalMeanLower:{
      adp:mean('adp'),champion:mean('champion'),
      gap:mean('adp')-mean('champion')
    },
    highExposureADPLeleOrCrobatRank26Lower:
      rows.find(x=>x.rank===26).adp.forcedSoloAfterAllOptionalBonusLower*
      (counts['sm2-60']+counts['swsh3-104'])/basics,
    rows,
    qualifiedWins:0,
    limitations:'Exact solo Basic available at initial field flip after all optional source bonus cards, bounded by tiny tail. No own turn, Basic bench search, draw Abilities, opponent attack, KO, clock or match outcome.'
  };
}

if(require.main===module){
  const max=process.argv[2]===undefined?32:Number(process.argv[2]);
  process.stdout.write(JSON.stringify(main(max),null,2)+'\n');
}
module.exports={VERSION,ID,combinationProbability,solo,main};
