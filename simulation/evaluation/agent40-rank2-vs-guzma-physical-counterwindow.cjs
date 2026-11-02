'use strict';

/**
 * Actor-independent physical-card counterwindow screen, original Aichi rank2
 * Bunnelby setup going second versus the exact original rank6/1 list going
 * first. This is a resource conjunction, never a card-action or game result.
 */
const assert=require('node:assert/strict');
const {binomial}=require('../twinleaf/agent6-owner-tagcall-hala-offer.cjs');
const {
  legalSevenProbability,possibleRank2Bonuses,
  sampleOpeningBonusScreen,originalRank2Pool
}=require('./agent40-rank2-mulligan-bonus-tm-screen.cjs');

const VERSION='agent40-rank2-guzma-opposing-physical-window-v1';
const PAIRS=Object.freeze([
  {rank:6,eligibleBasics:4,physicalGuzma:3,
    archetype:'Iron Thorns ex'},
  {rank:1,eligibleBasics:14,physicalGuzma:1,
    archetype:'Shadow Rider Calyrex'}
]);

/**
 * Conditional on the opposing INITIAL legal seven containing >=1 Basic:
 * by the opponent's second ordinary draw, has the opponent physically seen
 * >=2 eligible Basics and >=1 Guzma? >=2 Basics are needed to establish
 * an Active and own Benched Pokemon for a Guzma switch. Prize cards are
 * marginalized as random unknown positions. The player must still make
 * actual legal board decisions in a game.
 *
 * Let k=7+bonusCards+normalDraws. Inclusion-exclusion conditioned on the
 * first seven Basic-valid yields:
 *   P(B>=2,G>=1,initial B>=1)
 *      = P(initial B>=1)-P(total G=0,initial B>=1)
 *        -P(total B=1,initial B>=1)
 *        +P(total G=0,total B=1,initial B>=1).
 * The last two terms locate the sole Basic among the initial seven at 7/k.
 *
 * @param {number} basics Original printed eligible Basic count.
 * @param {number} guzma Original printed Guzma count.
 * @param {number} bonusCards Voluntary opposing bonus cards actually drawn.
 * @param {number} normalDraws Ordinary draws through the counter-turn.
 * @returns {number} Conditional physical co-presence probability.
 */
function opponentGuzmaBenchAccess(basics,guzma,bonusCards,normalDraws=2){
  for(const n of [basics,guzma,bonusCards,normalDraws])
    assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(basics>=1&&guzma>=1&&basics+guzma<=60);
  const k=7+bonusCards+normalDraws;
  assert.ok(k<=54,'Six unknown Prizes must remain out of hand');
  const a=legalSevenProbability(basics);
  const ratio=(top,bottom)=>Number(top)/Number(bottom);
  const gAbsent=ratio(binomial(60-guzma,k),binomial(60,k))*
    (1-ratio(binomial(60-guzma-basics,7),binomial(60-guzma,7)));
  const exactlyOneBasic=ratio(
    BigInt(basics)*binomial(60-basics,k-1),binomial(60,k))*7/k;
  const exactlyOneAndNoG=ratio(
    BigInt(basics)*binomial(60-basics-guzma,k-1),
    binomial(60,k))*7/k;
  const probability=1-(gAbsent+exactlyOneBasic-exactlyOneAndNoG)/a;
  assert.ok(probability>=-1e-12&&probability<=1+1e-12);
  return Math.min(1,Math.max(0,probability));
}

/**
 * Direct independent unordered initial-seven + subsequent-draw
 * hypergeometric two-stage oracle used to cross-check inclusion-exclusion.
 */
function independentOpponentOracle(basics,guzma,bonusCards,normalDraws=2){
  const extras=bonusCards+normalDraws;
  const other=60-basics-guzma;
  let favorable=0n;
  const initialDenominator=binomial(60,7)-binomial(60-basics,7);
  const nextDenominator=binomial(53,extras);
  for(let b=1;b<=Math.min(basics,7);b++)
    for(let g=0;g<=Math.min(guzma,7-b);g++){
      const z=7-b-g;
      const start=binomial(basics,b)*binomial(guzma,g)*
        binomial(other,z);
      for(let b2=0;b2<=Math.min(basics-b,extras);b2++)
        for(let g2=0;g2<=Math.min(guzma-g,extras-b2);g2++){
          const z2=extras-b2-g2;
          if(b+b2<2||g+g2<1)continue;
          favorable+=start*binomial(basics-b,b2)*
            binomial(guzma-g,g2)*binomial(other-z,z2);
        }
    }
  return Number(favorable)/Number(initialDenominator*nextDenominator);
}

/**
 * Normalize mutually exclusive final simultaneous-mulligan outcomes.
 * Original rank2 source is assigned the SECOND starting turn, permitting
 * first-turn Bunnelby TM attack. Its opponent goes first, then has 2
 * ordinary draws by its first post-setup Guzma turn.
 *
 * @param {number[]} sourceReadinessByBonus Conditionally valid source 7
 *   card-location opportunities m=0..maxBonus.
 * @param {{eligibleBasics:number,physicalGuzma:number,rank:number}} opponent
 * @param {number} sourceBonusCap Blind cap 0..maxBonus.
 */
function assessJointCounterwindow(sourceReadinessByBonus,opponent,
  sourceBonusCap){
  assert.ok(Array.isArray(sourceReadinessByBonus)&&
    sourceReadinessByBonus.length>=1);
  const N=sourceReadinessByBonus.length-1;
  assert.ok(Number.isSafeInteger(sourceBonusCap)&&
    sourceBonusCap>=0&&sourceBonusCap<=N);
  const {eligibleBasics:B,physicalGuzma:G}=opponent;
  const d=possibleRank2Bonuses(B,N);
  const a=d.rank2Legal,b=d.opponentLegal;
  const norm=1-(1-a)*(1-b);
  const common=a*b/norm;
  const sourceBonus=a*(1-b)/norm;
  const opponentBonus=(1-a)*b/norm;
  const source0=sourceReadinessByBonus[0];
  const opponent0=opponentGuzmaBenchAccess(B,G,0);
  // Both valid: no bonus for either player.
  const commonValue=common*source0*opponent0;
  // Source initially valid, opponent mulligans M times. Source may accept
  // min(M,cap) optional cards. Opponent's final seven is still valid.
  let sourceValue=0;
  for(let m=1;m<=N;m++)
    sourceValue+=b*(1-b)**(m-1)*
      sourceReadinessByBonus[Math.min(sourceBonusCap,m)]*opponent0;
  // Exact tail because the chosen cap <= N.
  sourceValue+=(1-b)**N*
    sourceReadinessByBonus[sourceBonusCap]*opponent0;
  // Opponent valid, source mulligans N times. Source gets no bonus.
  // The opponent may accept all N bonuses. Beyond sampled max, its
  // physical opportunity is monotone nondecreasing but at most one.
  let oppValue=0;
  for(let n=1;n<=N;n++)
    oppValue+=a*(1-a)**(n-1)*source0*
      opponentGuzmaBenchAccess(B,G,n);
  const oppTail=(1-a)**N;
  const lowerTail=oppTail*source0*
    opponentGuzmaBenchAccess(B,G,N);
  const upperTail=oppTail*source0;
  const lower=commonValue+sourceBonus*sourceValue+
    opponentBonus*(oppValue+lowerTail);
  const upper=commonValue+sourceBonus*sourceValue+
    opponentBonus*(oppValue+upperTail);
  const sourceRate=common*source0+
    sourceBonus*(b*Array.from({length:N},(_,i)=>i+1)
      .reduce((s,m)=>s+(1-b)**(m-1)*
        sourceReadinessByBonus[Math.min(m,sourceBonusCap)],0)+
      (1-b)**N*sourceReadinessByBonus[sourceBonusCap])+
    opponentBonus*source0;
  return {version:VERSION,opponentRank:opponent.rank,
    sourceIsSecondPlayer:true,sourceBonusCap,
    sourceSetupOpportunity:sourceRate,
    opposingGuzmaAndOwnBenchAtMostSecondDraw:opponent0,
    jointPhysicalCounterwindowLower:lower,
    jointPhysicalCounterwindowUpper:upper,
    conditionalOpposingResourceGivenSourceOpportunity:
      sourceRate>0?[lower/sourceRate,upper/sourceRate]:null,
    exhaustiveOutcomeWeights:{bothValid:common,
      sourceValidOpponentInitiallyInvalid:sourceBonus,
      opponentValidSourceInitiallyInvalid:opponentBonus},
    tail:{
      extraOpponentBonusProbabilityConditionalBranch:oppTail,
      lowerTail,upperTail
    },
    caveat:'Two-player physical co-presence, not actual original opponent action, complete legal source line, or win'};
}

if(require.main===module){
  const samples=Number(process.argv[2]??200000);
  const maxBonus=Number(process.argv[3]??25);
  const seed=Number(process.argv[4]??2102664725);
  const screen=sampleOpeningBonusScreen(
    originalRank2Pool(),samples,seed,maxBonus);
  process.stdout.write(JSON.stringify({
    version:VERSION,source:{samples,seed,maxBonus},
    comparisons:PAIRS.map(opponent=>({
      opponent,
      noBonus:assessJointCounterwindow(screen.conditionalReady,opponent,0),
      cap3:assessJointCounterwindow(screen.conditionalReady,opponent,
        Math.min(3,maxBonus)),
      takeAllUpToSampledMax:assessJointCounterwindow(
        screen.conditionalReady,opponent,maxBonus)
    })),
    competitivelyQualifiedGames:0
  })+'\n');
}
module.exports={VERSION,PAIRS,opponentGuzmaBenchAccess,
  independentOpponentOracle,assessJointCounterwindow};
