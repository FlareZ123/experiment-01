'use strict';
const assert=require('node:assert/strict');
const {runArm}=require('./agent7-root93-unown-powerglass-stage-native.cjs');
const VERSION='agent7-root93-unown-powerglass-postattack-prize-stage-v1';

/**
 * Opt-in follow-up of the previously successful stage: resolve the second
 * Powerglass prompt after Unown's KO attack, physically take a Prize and
 * promote the source's legal Bench Pokémon. Both seats and unequipped controls.
 * @returns {object}
 */
function run(){
  const arms=[];
  for(const seat of [0,1])for(const equip of [false,true])
    arms.push(runArm(seat,equip,true));
  for(const arm of arms){
    const receipt=arm.afterFullPromptResolution;
    assert.deepEqual(receipt.pending,[]);
    if(arm.equipPowerglass){
      assert.equal(receipt.ownerRemainingPrizes,5);
      assert.equal(receipt.prizePromptResolved,1);
      assert.equal(receipt.sourcePromotionPromptResolved,1);
      assert.equal(receipt.sourceActivePrinting,'Tapu Lele-GX GRI');
    }else{
      assert.equal(receipt.ownerRemainingPrizes,6);
      assert.equal(receipt.sourceActivePrinting,'Trubbish FST');
    }
  }
  return {
    schema:VERSION,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registration:'results/methodology/registrations/agent7-root93-powerglass-prize-continuation-20261107.json',
    sourceResponse:'intentionally passive source Pass in staged contract',
    arms,
    qualification:'mechanical stage only, no original 60-card game',
    competitiveGamesQualified:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
