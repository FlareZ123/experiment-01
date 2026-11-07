'use strict';
const assert=require('node:assert/strict');
const {runArm}=require('./agent7-root93-unown-powerglass-stage-native.cjs');
const VERSION='agent7-root93-powerglass-superpoison-source-reply-stage-v1';

/**
 * Developmental real Store reconstruction of the source's actual next attack
 * from archived v9 original roots 93→96. Opponent is deliberately committed
 * to that original AttackAction, regardless of newly visible Powerglass.
 * @returns {object}
 */
function run(){
  const arms=[];
  for(const seat of [0,1])for(const equip of [false,true])
    arms.push(runArm(seat,equip,true,true));
  for(const arm of arms){
    assert.equal(arm.afterSourceReply.reply,'Super Poison Breath');
    assert.equal(arm.afterSourceReply.ownerActivePrinting,'Unown AOR');
    assert.ok(arm.afterSourceReply.ownerActiveDamage>=20);
    const full=arm.afterFullPromptResolution;
    assert.deepEqual(full.pending,[]);
    if(arm.equipPowerglass){
      assert.equal(arm.candidateAttack,'Hidden Power');
      assert.equal(full.sourceTrubbishInDiscard,true);
      assert.equal(full.ownerRemainingPrizes,5);
      assert.equal(full.sourceActivePrinting,'Tapu Lele-GX GRI');
      assert.equal(full.prizePromptResolved,1);
      assert.equal(full.sourcePromotionPromptResolved,1);
    }else{
      assert.equal(arm.candidateAttack,null);
      assert.equal(full.sourceTrubbishInDiscard,false);
      assert.equal(full.ownerRemainingPrizes,6);
      assert.equal(full.sourceActivePrinting,'Trubbish FST');
    }
  }
  return {schema:VERSION,
    registration:'results/methodology/registrations/agent7-root93-powerglass-source-superpoison-stage-20261107.json',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceResponse:'fixed actual A observed next-turn Super Poison Breath, not source-adaptive',
    arms,qualification:'four staged Store interactions, zero original full games',
    competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
