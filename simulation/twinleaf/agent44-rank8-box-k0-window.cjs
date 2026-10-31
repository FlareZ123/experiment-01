'use strict';

const assert=require('node:assert/strict');

const VERSION='agent44-rank8-source-k0-box-shake-exposure-v1';
const BASIC_ITEMS=new Map([
  ['Quick Ball',1],['Ultra Ball',2],['Battle VIP Pass',0]
]);
const TOOLS=new Set(['Float Stone','Muscle Band']);

/**
 * Evaluate only cards physically in the acting player's own hand and its
 * public Bench, without consulting the unseen deck or face-down Prizes.
 * It reports necessary K0 resource coexistence, never a legal lock or turn.
 *
 * @param {{handNames:string[],benchNames:(string|null)[],benchTools:string[][],activeName?:string|null,itemLocked:boolean,toolLocked:boolean}} view
 * @returns {object}
 */
function inspectRank8K0BoxShake(view){
  assert.ok(Array.isArray(view.handNames)&&Array.isArray(view.benchNames));
  const names=view.handNames;
  const used=new Set();
  const select=name=>{
    const index=names.findIndex((n,i)=>n===name&&!used.has(i));
    if(index<0)return false;
    used.add(index);
    return true;
  };
  const box=select('Secret Box');
  const shakeHeld=names.includes('Boost Shake');
  const inPlayTrubbish=view.activeName==='Trubbish'||
    view.benchNames.includes('Trubbish');
  const benchFree=view.benchNames.includes(null);
  const canPlaceTrubbish=inPlayTrubbish||benchFree;
  const toolHeld=names.some(name=>TOOLS.has(name));
  const trubbishHeld=names.includes('Trubbish');
  const availableItems=[...BASIC_ITEMS].filter(([name])=>names.includes(name));
  const searcher=availableItems.reduce((best,item)=>
    !best||item[1]<best[1]?item:best,null);
  // Box Item must fetch Shake when it is absent from hand. A held Basic
  // search Item must therefore remain available for a missing Trubbish.
  // If Shake is already in hand, Box can instead fetch the search Item.
  let reservedBasicSearch=null;
  let searchDiscardCost=0;
  if(!inPlayTrubbish&&!trubbishHeld){
    if(searcher){
      reservedBasicSearch=searcher[0];
      searchDiscardCost=searcher[1];
    }
  }
  if(shakeHeld)select('Boost Shake');
  if(trubbishHeld&&!inPlayTrubbish)select('Trubbish');
  if(reservedBasicSearch!==null)select(reservedBasicSearch);
  if(toolHeld){
    const first=names.find(name=>TOOLS.has(name));
    select(first);
  }
  const remainingAfterPreservation=names.length-used.size;
  const boxCanPay=box&&remainingAfterPreservation>=3;
  const searchCanPay=searchDiscardCost===0||
    remainingAfterPreservation-3>=searchDiscardCost;
  const missingTrubbish=!inPlayTrubbish&&!trubbishHeld;
  const boxFetchShakeBeforeSearcherPayment=box&&!shakeHeld&&
    canPlaceTrubbish&&(!missingTrubbish||reservedBasicSearch!==null)&&
    boxCanPay&&!view.itemLocked&&!view.toolLocked;
  const boxFetchShake=boxFetchShakeBeforeSearcherPayment&&searchCanPay;
  // Secret Box can simultaneously obtain a Stadium and Supporter. The
  // newly fetched cards cannot fund Box's own upfront three-card discard,
  // but could fund a subsequent Quick/Ultra Ball discard after Box resolves.
  // K0 cannot verify those still-unseen extra categories, so keep them as a
  // separately flagged, conditional search subsidy rather than a confirmed
  // executable opportunity.
  const postBoxSearcherDiscardShortfall=Math.max(0,
    searchDiscardCost-Math.max(0,remainingAfterPreservation-3));
  const boxFetchShakePotentialAuxiliaryPayment=
    boxFetchShakeBeforeSearcherPayment&&!searchCanPay&&
    postBoxSearcherDiscardShortfall<=2;
  const boxHeldShake=box&&shakeHeld&&canPlaceTrubbish&&boxCanPay&&
    !view.itemLocked&&!view.toolLocked;
  const directShake=shakeHeld&&canPlaceTrubbish&&
    (inPlayTrubbish||trubbishHeld||reservedBasicSearch!==null)&&
    (toolHeld||names.includes('Adventure Bag'))&&
    !view.itemLocked&&!view.toolLocked;
  return {
    version:VERSION,
    boxHeld:box,shakeHeld,inPlayTrubbish,trubbishHeld,
    benchFree,toolHeld,availableItems:availableItems.map(x=>x[0]),
    missingTrubbish,prioritizedBasicSearcher:reservedBasicSearch,
    remainingAfterPreservation,
    boxThreePhysicalDiscardCapacity:boxCanPay,
    additionalSearchDiscardCost:searchDiscardCost,
    additionalSearchDiscardCapacity:searchCanPay,
    postBoxSearcherDiscardShortfall,
    boxFetchShakeBeforeSearcherPayment,
    boxFetchShakePotentialAuxiliaryPayment,
    boxFetchShake,boxHeldShake,directShake,
    anyK0Window:boxFetchShake||boxHeldShake||directShake,
    anyK0OrConditionalAuxiliaryWindow:
      boxFetchShakePotentialAuxiliaryPayment||
      boxFetchShake||boxHeldShake||directShake,
    qualification:'K0 hand-and-visible-Board necessary-resource screen only; all deck/Prize targets, native prompts, opponent effects, strategy and actual first-turn success unverified'
  };
}

module.exports={VERSION,BASIC_ITEMS,TOOLS,inspectRank8K0BoxShake};
