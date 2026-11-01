'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,original29HeldFirst8,sourceBasicPrintingIndex}=
  require('./agent18-original-source-supporter-opening.cjs');
const {loadTrainerTypes}=require('./agent3-jellicent-field-exposure.cjs');

const VERSION='agent18-coupled-mulligan-supporter-supply-v1';

/**
 * Exact physical first-draw distribution, with a hypothetical owner accepting
 * every opponent-mulligan bonus that leaves one ordinary draw available.
 * Both-invalid seven-card rounds reset simultaneously; the owner is Basic-
 * valid in the final setup. Prizes are independent hidden positions.
 *
 * @param {number} basic Own Basic Pokémon count.
 * @param {number} supporter Own counted Supporter count, disjoint from Basics.
 * @param {number} opponentBasic Opponent Basic Pokémon count.
 * @param {{deckSize?:number,handSize?:number,prizes?:number}} [config]
 */
function coupledFirstDrawSupporter(basic,supporter,opponentBasic,config={}){
  const n=config.deckSize??60,h=config.handSize??7,prizes=config.prizes??6;
  for(const x of [n,h,prizes,basic,supporter,opponentBasic])
    assert.ok(Number.isSafeInteger(x)&&x>=0);
  assert.ok(h>=1&&n-h-prizes>=1&&basic>0&&opponentBasic>0);
  assert.ok(basic+supporter<=n&&opponentBasic<=n);
  const c=(a,k)=>Number(choose(a,k));
  const total=c(n,h),valid=c(n,h)-c(n-basic,h);
  const pOwn=valid/total;
  const pOpponent=(total-c(n-opponentBasic,h))/total;
  const qOpponent=1-pOpponent;
  const denom=1-(1-pOwn)*qOpponent;
  assert.ok(pOwn>0&&pOpponent>0&&denom>0);
  const noSupportGivenValid=(c(n-supporter,h)-
    c(n-supporter-basic,h))/valid;
  const possibleDraws=n-h-prizes;
  const noSupportAfterDraw=(count)=>
    c(n-h-supporter,count)/c(n-h,count);
  const boundedProbability=x=>Math.max(0,Math.min(1,x));
  const withoutBonus=boundedProbability(
    1-noSupportGivenValid*noSupportAfterDraw(1));
  const noBonusMass=pOpponent/denom;
  let noSupportMass=noBonusMass*noSupportAfterDraw(1);
  let accountedMass=noBonusMass;
  for(let mulligans=1;mulligans<possibleDraws;mulligans++){
    const mass=pOwn*pOpponent*qOpponent**mulligans/denom;
    noSupportMass+=mass*noSupportAfterDraw(mulligans+1);
    accountedMass+=mass;
  }
  const cappedTail=pOwn*qOpponent**possibleDraws/denom;
  noSupportMass+=cappedTail*noSupportAfterDraw(possibleDraws);
  accountedMass+=cappedTail;
  assert.ok(Math.abs(accountedMass-1)<1e-10);
  const withAllAvailableBonus=boundedProbability(
    1-noSupportGivenValid*noSupportMass);
  assert.ok(withAllAvailableBonus+1e-12>=withoutBonus);
  assert.ok(withAllAvailableBonus<=1+1e-12);
  return {
    basic,supporter,opponentBasic,withoutBonus,
    withAllAvailableBonus,
    gainPercentagePoints:100*(withAllAvailableBonus-withoutBonus),
    ownerValidOpeningProbability:pOwn,
    opponentValidOpeningProbability:pOpponent,
    bonusOfferedProbability:1-noBonusMass,
    expectedBonusOffered:pOwn*qOpponent/(pOpponent*denom),
    maxBonusToPreserveOrdinaryDraw:possibleDraws-1,
    cappedTailProbability:cappedTail,
    qualifyingGames:0,
    limitation:'Hypothetical all-available bonus choice; ignores card play, prompts, locks, actual game and win rate.'
  };
}

/**
 * Source held Supporter prior against rank1 14-Basic reference and
 * hypothetical four-Basic counterfield; this is not a performance comparison.
 * @param {object} printed29 Exact source manifest and resolved card metadata.
 * @param {Map<string,string>} types
 * @param {Map<string,boolean>} basics
 */
function fieldCoupledFirstDrawSupporters(printed29,types,basics){
  const base=original29HeldFirst8(printed29,types,basics);
  const champion=base.rows.find(row=>row.rank===1);
  assert.equal(champion?.basicCopies,14);
  return {schema:VERSION,original60Count:base.authenticatedDecks,
    missingRanks:base.missingRanks,championBasicCopies:champion.basicCopies,
    original29:base.rows.map(row=>({
      rank:row.rank,archetype:row.archetype,
      basicCopies:row.basicCopies,supporterCopies:row.allSupporterCopies,
      vsRank1FourteenBasic:coupledFirstDrawSupporter(
        row.basicCopies,row.allSupporterCopies,champion.basicCopies),
      vsFourBasicOpponent:coupledFirstDrawSupporter(
        row.basicCopies,row.allSupporterCopies,4)
    })),competitivelyQualifiedGames:0};
}

function main(){
  const root=path.resolve(__dirname,'..');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const cards=roster.decks.flatMap(d=>
    d.cards.filter(c=>c.category==='Pokémon'));
  const basics=sourceBasicPrintingIndex(root,cards);
  const types=loadTrainerTypes(path.join(root,'resources/cards/en'));
  const out=fieldCoupledFirstDrawSupporters(roster,types,basics);
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  return out;
}
if(require.main===module)main();
module.exports={VERSION,coupledFirstDrawSupporter,
  fieldCoupledFirstDrawSupporters,main};
