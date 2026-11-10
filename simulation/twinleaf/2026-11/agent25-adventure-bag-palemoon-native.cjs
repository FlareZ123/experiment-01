'use strict';

const assert=require('node:assert/strict');
const {stage,solve}=
  require('./agent25-adventure-bag-cape-native.cjs');
const {prepare,reply,afterReply}=
  require('./agent25-cape-palemoon-counterreply-native.cjs');
const {withNumericShufflePromptValidation}=
  require('../agent33-shuffle-prompt-numeric-validation.cjs');

/**
 * Four independent native original-printed-60 conditioned branches:
 * authentic Adventure Bag two-Tool first turn, original rank1 paid
 * Pale Moon-GX, then owner decision to Pass or spend a real spare Jet.
 * Existing reversible paper-correct delayed-GX switch cleanup is delegated
 * to the previously validated source native actor continuation.
 */
function probe(seat,useJet){
  const x=stage(seat);
  prepare(x);
  const opening=solve(x);
  const sourceCounter=reply(x);
  const ownerCounter=afterReply(x,sourceCounter,useJet);
  assert.equal(sourceCounter.sourceNativeGXUsed,true);
  assert.equal(ownerCounter.capedVileplumeKnockedOut,!useJet);
  assert.equal(ownerCounter.opponentActualPrizeGain,useJet?0:1);
  return {seat,originalSixties:true,opening,sourceCounter,
    ownerCounter,qualifiedGames:0};
}

function run(){
  const checked=withNumericShufflePromptValidation(()=>{
    const rows=[];
    for(const seat of [0,1])
      for(const useJet of [false,true])
        rows.push(probe(seat,useJet));
    return rows;
  });
  assert.ok(checked.audit.checked>=4);
  return {candidate:'Adventure Bag Cape Sentinel v1',
    conditionedOriginalRank1PaleMoon:true,
    outcomes:'native no-Jet pass KO versus actual Jet rescue',
    fixedOriginalSixties:true,
    eligibleGames:0,shufflePaperHook:checked.audit,
    rows:checked.result};
}
module.exports={probe,run};
if(require.main===module)
  process.stdout.write('AGENT25_ADVENTURE_BAG_PALEMOON '+JSON.stringify(run())+'\n');
