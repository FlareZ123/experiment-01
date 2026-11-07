'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./hood-t2-joint.cjs');

const VERSION='agent21-copycat-prize-access-multiplicity-v1';

/**
 * Exact multivariate-hypergeometric Prize-only access cut for a Mimikyu /
 * Dialga-GX counterline with any positive core-role multiplicities.
 *
 * A core role is missing only when every copy of that printing is Prized.
 * Each unprized Hisuian Heavy Ball can recover one Prized Basic Pokémon.
 * The cut occurs when more core roles are entirely Prized than there are
 * unprized Heavy Ball copies. This models only Prize placement, not actual
 * draw/search access or whether the counterline wins a game.
 *
 * @param {{
 *   mimikyuCopies?:number,
 *   dialgaCopies?:number,
 *   heavyBallCopies?:number,
 *   otherBasicCopies?:number,
 *   totalCards?:number,
 *   initialHandSize?:number,
 *   prizeCount?:number
 * }} [options]
 * @returns {object}
 */
function copycatPrizeAccessCut(options={}){
  assert.ok(options&&typeof options==='object'&&!Array.isArray(options));
  const {
    mimikyuCopies=1,
    dialgaCopies=1,
    heavyBallCopies=1,
    otherBasicCopies=12,
    totalCards=60,
    initialHandSize=7,
    prizeCount=6
  }=options;
  const integers=[
    mimikyuCopies,dialgaCopies,heavyBallCopies,otherBasicCopies,
    totalCards,initialHandSize,prizeCount
  ];
  if(integers.some(value=>!Number.isSafeInteger(value))||
    mimikyuCopies<1||dialgaCopies<1||heavyBallCopies<0||
    otherBasicCopies<0||totalCards<1||initialHandSize<1||
    prizeCount<0||initialHandSize+prizeCount>totalCards){
    throw new RangeError('Invalid copy counts or setup dimensions');
  }
  const basicCount=mimikyuCopies+dialgaCopies+otherBasicCopies;
  const otherNonBasics=totalCards-basicCount-heavyBallCopies;
  if(otherNonBasics<0)throw new RangeError('Card counts exceed the fixed deck');
  const totalPrizeWays=choose(totalCards,prizeCount);
  const totalOpeningWays=choose(totalCards,initialHandSize);
  const validOpeningProbability=
    1-choose(totalCards-basicCount,initialHandSize)/totalOpeningWays;
  if(!(validOpeningProbability>0))throw new RangeError('No valid Basic opening');

  let validJoint=0;
  let anyCorePrizedJoint=0;
  let cutJoint=0;
  for(let prizedMimikyu=0;prizedMimikyu<=mimikyuCopies;prizedMimikyu++){
    for(let prizedDialga=0;prizedDialga<=dialgaCopies;prizedDialga++){
      for(let prizedBall=0;prizedBall<=heavyBallCopies;prizedBall++){
        for(let prizedOtherBasic=0;
          prizedOtherBasic<=otherBasicCopies;prizedOtherBasic++){
          const prizedOtherNonBasic=prizeCount-prizedMimikyu-
            prizedDialga-prizedBall-prizedOtherBasic;
          if(prizedOtherNonBasic<0||
            prizedOtherNonBasic>otherNonBasics)continue;
          const prizeWays=choose(mimikyuCopies,prizedMimikyu)*
            choose(dialgaCopies,prizedDialga)*
            choose(heavyBallCopies,prizedBall)*
            choose(otherBasicCopies,prizedOtherBasic)*
            choose(otherNonBasics,prizedOtherNonBasic);
          const prizeProbability=prizeWays/totalPrizeWays;
          const remainingBasics=basicCount-prizedMimikyu-
            prizedDialga-prizedOtherBasic;
          const remainingCards=totalCards-prizeCount;
          const validGivenPrize=1-
            choose(remainingCards-remainingBasics,initialHandSize)/
            choose(remainingCards,initialHandSize);
          const joint=prizeProbability*validGivenPrize;
          validJoint+=joint;
          if(prizedMimikyu>0||prizedDialga>0)
            anyCorePrizedJoint+=joint;
          const missingCoreRoles=
            Number(mimikyuCopies-prizedMimikyu===0)+
            Number(dialgaCopies-prizedDialga===0);
          const unprizedBalls=heavyBallCopies-prizedBall;
          if(missingCoreRoles>unprizedBalls)cutJoint+=joint;
        }
      }
    }
  }
  assert.ok(Math.abs(validJoint-validOpeningProbability)<1e-12,
    'Prize partition must preserve the legal-opening probability');
  const immediatePrizeOnlyCut=cutJoint/validOpeningProbability;
  const anyCorePrized=anyCorePrizedJoint/validOpeningProbability;
  assert.ok(immediatePrizeOnlyCut>=0&&immediatePrizeOnlyCut<=1);
  assert.ok(anyCorePrized>=immediatePrizeOnlyCut);
  return {
    version:VERSION,
    totalCards,initialHandSize,prizeCount,
    mimikyuCopies,dialgaCopies,heavyBallCopies,otherBasicCopies,
    basicCount,otherNonBasics,
    validOpeningProbability,
    anyCorePrized,
    immediatePrizeOnlyCut,
    nonCut:1-immediatePrizeOnlyCut,
    assumptions:[
      'condition on an initial seven containing at least one Basic',
      'deal six Prize cards uniformly without replacement',
      'each unprized Heavy Ball is treated as available',
      'each Heavy Ball can recover one Prized Basic and takes its place as a Prize',
      'no later Prize-taking, discard recovery, draw/search or opponent actions'
    ],
    scoringAssumption:'Prize-only access obstruction; not a game win-rate estimate',
    paperPlayabilityCertified:false,
    strategicOptimalityCertified:false
  };
}

module.exports={VERSION,copycatPrizeAccessCut};
