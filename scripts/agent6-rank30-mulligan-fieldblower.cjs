'use strict';

const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const opening=require('../results/aichi-2026/opening-hand-audit.json');

const DECK=60;
const OPENING=7;
const PRIZES=6;
const MAX_EXTRA=DECK-OPENING-PRIZES-1;
const RANKS=[6,24,29];
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  const r=Math.min(k,n-k);
  let value=1n;
  for(let i=1;i<=r;i++)
    value=value*BigInt(n-r+i)/BigInt(i);
  return value;
}

/** @param {number} basicCount @returns {number} */
function validSeven(basicCount){
  return 1-Number(choose(DECK-basicCount,OPENING))/
    Number(choose(DECK,OPENING));
}

/**
 * Conditional probability of holding at least one of `copies` direct
 * printing copies in the initial seven plus the mandatory first draw and
 * `bonus` opponent-mulligan compensation cards. The original seven
 * contain at least one Basic; the named printing is non-Basic.
 *
 * Six hidden Prizes are allocated between the initial seven and subsequent
 * draws. Exchangeability of the unseen 53 cards preserves this marginal.
 *
 * @param {number} basics
 * @param {number} copies
 * @param {number} bonus
 * @returns {number}
 */
function directPrintingAccess(basics,copies,bonus){
  assert.ok(Number.isInteger(bonus)&&bonus>=0&&bonus<=MAX_EXTRA);
  const valid=choose(DECK,OPENING)-choose(DECK-basics,OPENING);
  const noPrintingInValidSeven=
    Number(choose(DECK-copies,OPENING)-
      choose(DECK-copies-basics,OPENING))/Number(valid);
  const additional=bonus+1;
  const noPrintingInAdditional=
    Number(choose(DECK-OPENING-copies,additional))/
    Number(choose(DECK-OPENING,additional));
  return 1-noPrintingInValidSeven*noPrintingInAdditional;
}

/** @param {object} deck @param {string} name @returns {number} */
function count(deck,name){
  return deck.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
}

/** @returns {object} */
function run(){
  const rank30=field.decks.find(d=>d.rank===30);
  assert.ok(rank30);
  assert.equal(opening.fully_resolved,29);
  const sourceAudit=opening.decks.find(d=>d.rank===30);
  assert.ok(sourceAudit);
  assert.deepEqual(sourceAudit.unresolved_pokemon,[]);
  const sourceBasics=sourceAudit.basic_count_known;
  assert.equal(rank30.cards.filter(c=>c.category==='Pokémon')
    .reduce((n,c)=>n+c.count,0),sourceBasics,
  'Shared audit confirms all sixteen original rank-30 Pokémon are Basic');
  const blowerCount=count(rank30,'Field Blower');
  const floatCount=count(rank30,'Float Stone');
  const latiasCount=count(rank30,'Latias ex');
  const clefairyCount=count(rank30,"Lillie's Clefairy ex");
  assert.deepEqual([sourceBasics,blowerCount,floatCount,
    latiasCount,clefairyCount],[16,3,1,1,3]);

  const thorns=RANKS.map(rank=>{
    const source=field.decks.find(d=>d.rank===rank);
    assert.ok(source);
    const sourceAudit=opening.decks.find(d=>d.rank===rank);
    assert.ok(sourceAudit);
    assert.deepEqual(sourceAudit.unresolved_pokemon,[]);
    const basics=sourceAudit.basic_count_known;
    assert.equal(source.cards.filter(c=>c.category==='Pokémon')
      .reduce((n,c)=>n+c.count,0),basics);
    const jammer=count(source,'Tool Jammer');
    assert.equal(count(source,'Iron Thorns ex'),4);
    assert.deepEqual([basics,jammer],[4,1]);
    return {rank,basics,jammer};
  });
  const ownerValid=validSeven(sourceBasics);
  const opponentValid=validSeven(thorns[0].basics);

  // When both initial hands lack a Basic, both retry without compensation.
  // The first non-double-mulligan setup outcome partitions into
  // both-valid, rank30-valid/opponent-invalid, opponent-valid/rank30-invalid.
  const repeat=(1-ownerValid)*(1-opponentValid);
  const rank30FrozenOpponentInvalid=
    ownerValid*(1-opponentValid)/(1-repeat);
  const opponentFrozenRank30Invalid=
    (1-ownerValid)*opponentValid/(1-repeat);
  const bothValid=ownerValid*opponentValid/(1-repeat);
  assert.ok(Math.abs(rank30FrozenOpponentInvalid+
    opponentFrozenRank30Invalid+bothValid-1)<1e-12);

  // The opponent keeps redealing until a legal Basic appears. For each
  // rank30-frozen/opponent-invalid setup the payable mulligan count N
  // is geometric: P(N=n)=p(1-p)^(n-1), n>=1.
  const noBonus=directPrintingAccess(sourceBasics,blowerCount,0);
  let withMaximumBonus=(1-rank30FrozenOpponentInvalid)*noBonus;
  const distribution=[{
    mulligans:0,probability:1-rank30FrozenOpponentInvalid}];
  for(let n=1;n<=MAX_EXTRA;n++){
    const probability=rank30FrozenOpponentInvalid*opponentValid*
      Math.pow(1-opponentValid,n-1);
    withMaximumBonus+=probability*
      directPrintingAccess(sourceBasics,blowerCount,n);
    if(n<=8)distribution.push({mulligans:n,probability});
  }
  const upperTail=rank30FrozenOpponentInvalid*
    Math.pow(1-opponentValid,MAX_EXTRA);

  // Illustrative narrow direct-eight coholding events. Clefairy and
  // Latias are two Basics, so any eight-card set containing both passes
  // the seven-card Basic-opening condition automatically.
  const directFourNumerator=choose(58,6)-2n*choose(55,6)+choose(52,6);
  const directFour=Number(directFourNumerator)/
    Number(choose(60,8))/ownerValid;
  const jammerDirect=directPrintingAccess(thorns[0].basics,1,0);

  return {
    schema:'agent6-original-rank30-vs-thorns-setup-mulligan-access-v1',
    assumptions:[
      'Both players use original authenticated 60-card printing counts and the independent resolved Basic-opening audit',
      'Independent shuffled source/opponent decks',
      'Each opening seven must include a Basic; simultaneous mulligans do not award a bonus',
      'Rank30 takes all offered compensating cards and mandatory first draw',
      'Rank30 rewards from opponent mulligans after original valid seven, with six Prize cards set',
      'No card searches, supporters, ability draws, opponent decisions, tool attachments, Energy funding, or native match outcomes',
      'Tail with at least 47 offered bonuses is bounded, not assumed playable'
    ],
    rank30:{basicCount:sourceBasics,fieldBlowerCount:blowerCount,
      floatStoneCount:floatCount,latiasCount,clefairyCount},
    thorns,
    probabilities:{
      rank30LegalInitialSeven:ownerValid,
      thornsLegalInitialSeven:opponentValid,
      firstNonDoubleMulliganRank30ValidThornsInvalid:
        rank30FrozenOpponentInvalid,
      firstNonDoubleMulliganThornsValidRank30Invalid:
        opponentFrozenRank30Invalid,
      firstNonDoubleMulliganBothValid:bothValid,
      expectedRank30BonusCards:rank30FrozenOpponentInvalid/opponentValid,
      rank30FieldBlowerFirstActionNoBonus:noBonus,
      rank30FieldBlowerFirstActionAllBonusLowerBound:
        withMaximumBonus,
      rank30FieldBlowerFirstActionAllBonusUpperBound:
        withMaximumBonus+upperTail,
      bonusTailProbabilityBound:upperTail,
      rank30LatiasFloatStoneClefairyFieldBlowerDirectEight:directFour,
      thornsToolJammerDirectEight:jammerDirect,
      independentDirectEightCoincidence:directFour*jammerDirect
    },
    bonusDistributionPrefix:distribution,
    competitivenessQualified:false
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,choose,validSeven,directPrintingAccess};
