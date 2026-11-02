'use strict';

const { choose } = require('./agent43-muk-search-eight-bound.cjs');

/**
 * Exact first-eight-card, Basic-valid initial-seven and six-Prize census
 * for an identifiable Grass Basic that only Quick Ball can search among
 * this candidate's hand search Items. This does not model paying Quick Ball,
 * opening Active, retreat, or actually declaring an attack.
 *
 * @param {{targetCopies:number,quickCopies:number,totalBasic:number}} options
 * @returns {object}
 */
function targetBasicQuickAccess(options) {
  const { targetCopies,quickCopies,totalBasic } = options;
  if (![targetCopies,quickCopies,totalBasic].every(n=>Number.isInteger(n)&&n>=0)
    || targetCopies>totalBasic || totalBasic+quickCopies>60)
    throw new RangeError('Invalid nonnegative card category counts');
  const nonTargetBasic=totalBasic-targetCopies;
  const rest=60-totalBasic-quickCopies;
  const denominator=choose(60,8);
  const basicValid=1-choose(60-totalBasic,7)/choose(60,7);
  let direct=0,quickSearch=0;
  for(let target=0;target<=Math.min(targetCopies,8);target++){
    for(let quick=0;quick<=Math.min(quickCopies,8-target);quick++){
      for(let basic=0;basic<=Math.min(nonTargetBasic,8-target-quick);basic++){
        const other=8-target-quick-basic;
        if(other>rest)continue;
        const p=choose(targetCopies,target)*choose(quickCopies,quick)
          *choose(nonTargetBasic,basic)*choose(rest,other)/denominator;
        const startingBasics=target+basic;
        const validWeight=startingBasics===0?0:
          startingBasics===1?7/8:1;
        if(target>0)direct+=p*validWeight;
        else if(quick>0 && targetCopies>0) {
          // All remaining copies are in the unseen 52 physical positions;
          // exactly 6 positions are Prize slots, the other 46 are deck.
          const allPrized=targetCopies<=6?
            choose(52-targetCopies,6-targetCopies)/choose(52,6):0;
          quickSearch+=p*validWeight*(1-allPrized);
        }
      }
    }
  }
  return {
    targetCopies,quickCopies,totalBasic,
    basicValidInitialSeven:basicValid,
    directConditional:direct/basicValid,
    idealizedQuickSearchConditional:quickSearch/basicValid,
    unionConditional:(direct+quickSearch)/basicValid,
    itemPaymentModeled:false,activeMobilityModeled:false,
    qualifiesGames:false
  };
}

if(require.main===module){
  const quick3=targetBasicQuickAccess({
    targetCopies:1,quickCopies:3,totalBasic:12
  });
  const quick2=targetBasicQuickAccess({
    targetCopies:1,quickCopies:2,totalBasic:12
  });
  process.stdout.write(JSON.stringify({
    kind:'agent2-alchemy-budew-quick-ball-prize-first8-v1',
    source:'unchanged Agent43 60 vs one-Quick-for-Shake full60',
    quick3,quick2,
    differencePercentagePoints:
      100*(quick2.unionConditional-quick3.unionConditional),
    note:'Opportunity only; exact six Prize distribution; zero games'
  },null,2)+'\n');
}
module.exports={targetBasicQuickAccess};
