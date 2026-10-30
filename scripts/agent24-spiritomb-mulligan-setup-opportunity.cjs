'use strict';

const assert=require('node:assert/strict');
const {choose,directFirstEight}=require(
  './agent24-ace-nullifier-opening-frontier.cjs');
const {fromRepository}=require('./aichi-opening-basics.cjs');
const path=require('node:path');

const VERSION='agent24-exact-spiritomb-setup-bonus-v1';
const DECK=60,OPENING=7,PRIZES=6;
const SAMPLE=DECK-OPENING;
const LIVE=DECK-OPENING-PRIZES;

/**
 * Chance of seeing at least one Spiritomb among your opening seven
 * plus at most bonusDrawLimit cards from an opponent's mulligans, while
 * retaining ability to place this Basic at setup before either turn.
 *
 * Condition on a valid opening seven for the player's fixed toy 60.
 * Opponent repeats 7-card samples until a Basic appears.
 * Six unknown face-down Prizes are dealt after opening and before the
 * optional mulligan bonus draws. The next m marginal random samples
 * from the 53 unseen original cards remain exchangeable despite Prizes.
 *
 * The player chooses all bonus cards up to the explicit limit, benches
 * a drawn lock Basic if possible; it ignores Bench pressure, opposing
 * setup, timing after the game begins, and all competitive outcomes.
 *
 * @param {{lockCopies:number,totalBasics:number,opponentBasics:number,
 *   bonusDrawLimit?:number}} p
 * @returns {object}
 */
function model(p){
  const {lockCopies:K,totalBasics:B,opponentBasics:O}=p;
  const cap=p.bonusDrawLimit??6;
  for(const x of [K,B,O,cap])assert.ok(
    Number.isSafeInteger(x)&&x>=0);
  assert.ok(B>=1&&B<=DECK&&K<=B);
  assert.ok(O>=1&&O<=DECK);
  assert.ok(cap<=LIVE,'Cannot draw more bonus cards than remaining deck');
  const full=choose(DECK,OPENING);
  const valid=full-choose(DECK-B,OPENING);
  const validNoLock=choose(DECK-K,OPENING)-
    choose(DECK-B,OPENING);
  assert.ok(valid>0n&&validNoLock>=0n);
  const noLockOpening=Number(validNoLock)/Number(valid);
  const q=Number(choose(DECK-O,OPENING))/Number(full);
  let noLockBonus=0;
  for(let m=0;m<cap;m++){
    const noLockNextM=Number(choose(SAMPLE-K,m))/
      Number(choose(SAMPLE,m));
    noLockBonus+=(1-q)*q**m*noLockNextM;
  }
  // The geometric tail M >= cap is intentionally capped by policy:
  // only the first cap optional mulligan bonus draws are taken.
  noLockBonus+=q**cap*Number(choose(SAMPLE-K,cap))/
    Number(choose(SAMPLE,cap));
  const initialChance=1-noLockOpening;
  const fullChance=1-noLockOpening*noLockBonus;
  const direct=directFirstEight({lockCopies:K,totalBasics:B});
  assert.ok(Math.abs(direct.conditionedSetupBasicChance-initialChance)<
    1e-12);
  return {schema:VERSION,opponentBasics:O,lockCopies:K,
    totalBasics:B,bonusDrawLimit:cap,
    opponentInitialMulliganChance:q,
    opponentExpectedFailedInitialHands:q/(1-q),
    initialSetupLockChance:initialChance,
    setupLockChanceAfterBonusDraws:fullChance,
    percentagePointGain:100*(fullChance-initialChance),
    fullNativeGameOrMatchupWin:false};
}
function main(){
  const roster=fromRepository(path.resolve(__dirname,'..'));
  const rows=roster.rows.map(r=>({
    sourceRank:r.rank,sourceArchetype:r.archetype,
    sourceBasicCount:r.basicCount,
    scenarios:[1,2,3,4].map(lockCopies=>model({
      lockCopies,totalBasics:14,opponentBasics:r.basicCount,
      bonusDrawLimit:6
    }))
  }));
  assert.equal(rows.length,29);
  const top=rows.filter(x=>x.sourceBasicCount===4);
  assert.deepEqual(top.map(x=>x.sourceRank),[6,24,29]);
  return {schema:VERSION,sourceOriginalDecks:rows.length,
    unresolvedRanks:[23,25,28],sampledToyDeckBasics:14,
    voluntarilyDrawAtMostSixMulliganBonuses:true,
    sourceRanksWithFourBasics:top.map(x=>x.sourceRank),
    rows,competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,model,main};
