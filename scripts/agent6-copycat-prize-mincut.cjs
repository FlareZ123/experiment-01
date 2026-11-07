'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./hood-t2-joint.cjs');

const TOTAL=60;
const HAND=7;
const PRIZES=6;

/**
 * Exact probability of immediate Prize-only unavailability for the champion's
 * two Basic singletons (Mimikyu GRI and Dialga-GX UPR) and one Hisuian Heavy
 * Ball. A single Heavy Ball recovers one Prized Basic, never two. This models
 * only unrecovered initial Prize configurations, independent of whether the
 * Copycat line would otherwise be legal, funded, accessible, or winning.
 *
 * Each initial hand is seven uniformly random cards; conditioned on at least
 * one Basic (a valid opening). Six Prizes are then dealt uniformly from the
 * remaining 53 cards. It marginalizes the omitted 7-card hand by first
 * selecting the six Prize cards and counting valid hands from the remaining 54.
 *
 * @param {{basicCount?:number}} [options] All 60 cards must include exactly
 *   one Mimikyu Basic, one Dialga-GX Basic, one Hisuian Heavy Ball Item.
 * @returns {object} Exact sums with separate event components.
 */
function prizeMinCut(options={}){
  const basicCount=options.basicCount??14;
  assert.ok(Number.isSafeInteger(basicCount)&&basicCount>=2&&
    basicCount<=TOTAL-1);
  const otherBasics=basicCount-2;
  const otherNonBasics=TOTAL-basicCount-1;
  const ways=choose(TOTAL,PRIZES);
  const validOpeningProbability=
    1-choose(TOTAL-basicCount,HAND)/choose(TOTAL,HAND);
  let validJoint=0,anyCore=0,bothCore=0,heavyAndAny=0,
    bothAndHeavy=0,cut=0;
  for(let mimikyu=0;mimikyu<=1;mimikyu++){
    for(let dialga=0;dialga<=1;dialga++){
      for(let heavyBall=0;heavyBall<=1;heavyBall++){
        for(let ordinaryBasic=0;ordinaryBasic<=otherBasics;ordinaryBasic++){
          const ordinaryOther=PRIZES-mimikyu-dialga-heavyBall-ordinaryBasic;
          if(ordinaryOther<0||ordinaryOther>otherNonBasics)continue;
          const probability=choose(otherBasics,ordinaryBasic)*
            choose(otherNonBasics,ordinaryOther)/ways;
          const remainingBasics=basicCount-mimikyu-dialga-ordinaryBasic;
          const remainingNonBasics=TOTAL-PRIZES-remainingBasics;
          const validGivenPrize=
            1-choose(remainingNonBasics,HAND)/choose(TOTAL-PRIZES,HAND);
          const joint=probability*validGivenPrize;
          validJoint+=joint;
          const any=mimikyu===1||dialga===1;
          const both=mimikyu===1&&dialga===1;
          const heavy=heavyBall===1&&any;
          if(any)anyCore+=joint;
          if(both)bothCore+=joint;
          if(heavy)heavyAndAny+=joint;
          if(both&&heavyBall===1)bothAndHeavy+=joint;
          if(both||heavy)cut+=joint;
        }
      }
    }
  }
  assert.ok(Math.abs(validJoint-validOpeningProbability)<1e-12);
  const conditional=n=>n/validOpeningProbability;
  const result={
    basicCount,
    validOpeningProbability,
    atLeastOneCorePrized:conditional(anyCore),
    bothCorePrized:conditional(bothCore),
    heavyBallPrizedWithAtLeastOneCore:conditional(heavyAndAny),
    allThreePrized:conditional(bothAndHeavy),
    immediatePrizeOnlyCut:conditional(cut),
    nonCut:1-conditional(cut),
    scoringAssumption:'none: prize-only access mechanism, not game win rate',
    paperPlayAssumptions:['one Heavy Ball retrieves at most one Basic',
      'no Prize-taking or other Prize recovery before the counterline']
  };
  assert.ok(Math.abs(result.immediatePrizeOnlyCut-
    (result.bothCorePrized+result.heavyBallPrizedWithAtLeastOneCore-
    result.allThreePrized))<1e-12);
  return result;
}

module.exports={prizeMinCut,TOTAL,HAND,PRIZES};
