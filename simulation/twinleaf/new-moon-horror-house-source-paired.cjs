'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Observe real candidate attack-copy prompt choices without changing them.
 * @param {()=>object} execute
 * @returns {{game:object,prompts:object[]}}
 */
function observe(execute){
  const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const prompts=[];
  SimpleTacticsAi.prototype.decodeNextAction=function traced(state){
    const pending=state.prompts.find(p=>p.result===undefined);
    const action=original.call(this,state);
    if(this.client.id===202&&pending?.constructor.name==='ChooseAttackPrompt'){
      prompts.push({turn:state.turn,selected:action?.result?.name??null,
        valid:pending.validate(action?.result??null),
        offered:pending.cards.map(c=>c.fullName),
        blocked:pending.options.blocked});
    }
    return action;
  };
  try{return {game:execute(),prompts};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}
const OPTIONS={
  strictPromptValidation:true,forestSealSearchCorrection:true,
  supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
  entryDrawLockCorrection:true,isolatePolicyRandomness:true,
  pendingEndTurnSwitchCleanupCorrection:true,captureDecisionTrace:true,
  captureCopycatTurnStartSeat:1
};
/**
 * Real source-dealt candidate physically B/second; only candidate tactics differ.
 * @param {string[]} candidate
 * @param {string[]} opponent
 * @param {number} seed
 * @param {boolean} policy
 */
function arm(candidate,opponent,seed,policy){
  const result=observe(()=>runMatch({...OPTIONS,deckA:opponent,deckB:candidate,
    seed,maxActions:300,...(policy?{newMoonOpeningHorrorHouseSeat:1}:{})}));
  assert.equal(result.game.firstTurnSlot,0,'Actual source must play first');
  assert.equal(result.game.verifiedByDrawLog,true);
  return result;
}
// __CONTINUE__
