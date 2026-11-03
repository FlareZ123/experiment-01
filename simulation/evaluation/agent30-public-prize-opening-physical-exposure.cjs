'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {
  fromRepository,conditionalPhysicalAccess
}=require('../../scripts/agent17-field-firstturn-trainer-access.cjs');
const {PRINT_RULES}=
  require('./agent30-public-prize-trainer-necessary.cjs');

const VERSION='agent30-public-prize-early-physical-hold-original29-v1';

/**
 * An original paper-source card count for exact printed Prize-conditional
 * Trainers. Native offers, positive paper action legality, and strategy
 * are explicitly outside this function.
 * @param {object} deck Complete source deck row.
 */
function countSourcePrizeGatedTrainers(deck){
  assert.ok(Array.isArray(deck.cards));
  const eligible=new Set(Object.keys(PRINT_RULES));
  let copies=0;
  const byPrinting={};
  for(const card of deck.cards){
    if(card.category!=='Trainer')continue;
    const printing=card.name+' '+card.printing.set;
    if(!eligible.has(printing))continue;
    copies+=card.count;
    byPrinting[printing]=(byPrinting[printing]??0)+card.count;
  }
  return {copies,byPrinting};
}

/**
 * Return physical-hand probabilities conditional on the initial 7 containing
 * an eligible Basic, with one later *normal* draw. Prize six are marginalized.
 * This is not a playable opportunity probability or Native policy result.
 *
 * @param {string} [root]
 */
function analyze(root=path.resolve(__dirname,'../..')){
  const sourcePath=path.join(root,'results/aichi-2026/full-decklists.json');
  const src=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
  const base=fromRepository(root);
  assert.equal(src.decks.length,29);
  assert.deepEqual(src.missing_full_lists.map(r=>r.rank).sort((a,b)=>a-b),
    [23,25,28]);
  const basicByRank=new Map(base.rows.map(r=>[r.rank,r.basicCopies]));
  const rows=src.decks.map(deck=>{
    const b=basicByRank.get(deck.rank);
    assert.ok(Number.isSafeInteger(b)&&b>=1&&b<=60);
    const {copies,byPrinting}=countSourcePrizeGatedTrainers(deck);
    assert.ok(copies+b<=60,'Basic and Trainer categories are disjoint');
    return {
      rank:deck.rank,archetype:deck.archetype,
      authenticOriginalSource60:true,
      basicCopies:b,
      publicPrizeGatedPhysicalCopies:copies,byPrinting,
      acceptedBasicSeven:conditionalPhysicalAccess(60,b,copies,7,0),
      acceptedBasicSevenPlusOneNormalDraw:
        conditionalPhysicalAccess(60,b,copies,7,1)
    };
  }).sort((a,b)=>a.rank-b.rank);
  const totals=Object.fromEntries(Object.keys(PRINT_RULES).map(name=>
    [name,rows.reduce((n,row)=>n+(row.byPrinting[name]??0),0)]));
  assert.deepEqual(totals,{
    'Counter Catcher PAR':10,'Roxanne ASR':2,'Special Red Card CRI':3
  });
  const ranksWithCopies=rows.filter(row=>row.publicPrizeGatedPhysicalCopies>0)
    .map(row=>row.rank);
  assert.deepEqual(ranksWithCopies,[3,5,7,8,12,14,21,22,26,32]);
  const mean=field=>rows.reduce((n,row)=>n+row[field].probability,0)/rows.length;
  return {
    version:VERSION,sourceManifestSha256:createHash('sha256')
      .update(fs.readFileSync(sourcePath)).digest('hex'),
    sourceBasicIndexVersion:base.version,
    originalFullSources:rows.length,
    missingOriginalRanks:[23,25,28],
    exactPrintedCardCopyTotals:totals,
    totalPhysicalCopies:Object.values(totals).reduce((x,y)=>x+y,0),
    originalRankCountWithPrintedCopies:ranksWithCopies.length,
    ranksWithCopies,
    equalOriginalMeanAcceptedBasicOpeningSeven:mean('acceptedBasicSeven'),
    equalOriginalMeanAcceptedBasicSevenPlusOneDraw:
      mean('acceptedBasicSevenPlusOneNormalDraw'),
    rows,
    boundary:{
      hypotheticalStart:'Both players have six Prizes: all three printed Prize prerequisites fail; quantify only potential physical holdings, no card plays',
      source:'29 authenticated original printed 60s; missing 23, 25, 28 excluded rather than imputed',
      opening:'Uniform seven physical cards conditioned on at least one printed Basic; subsequent one ordinary card draw after six hidden Prizes are dealt and marginalized',
      excludes:'Player Bench promotion, opponent mulligan bonus cards, extra draw/search/discard, prizes actually taken during prior turn, Supporter use, native enumeration, paid effects, chosen play, competent opponent and terminal results',
      allCertifiedPaperPlayableActions:0,
      competitivelyQualifiedGames:0,
      estimatedWinRate:null
    }
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(analyze(),null,2)+'\n');
module.exports={VERSION,countSourcePrizeGatedTrainers,analyze};
