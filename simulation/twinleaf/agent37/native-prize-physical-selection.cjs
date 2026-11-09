'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const {ChoosePrizePrompt}=require(path.join(ROOT,
  'game/store/prompts/choose-prize-prompt'));

/**
 * Native ChoosePrizePrompt.validate accepts any count-correct, nonempty
 * CardList[] even when the lists do not belong to the target Prize zone.
 * Confirm actual reference ownership before an agent calls Store.dispatch.
 *
 * @param {{players:Array<{id:number,prizes:Array<{cards:any[]}>}>}} state
 * @param {ChoosePrizePrompt} prompt
 * @param {Array<{cards:any[]}>} selected
 * @returns {{id:number,prizes:Array<{cards:any[]}>}} Physical target player.
 */
function assertPhysicalPrizePromptSelection(state,prompt,selected){
  assert.ok(prompt instanceof ChoosePrizePrompt,
    'physical Prize selection requires a native ChoosePrizePrompt');
  assert.ok(Array.isArray(selected)&&prompt.validate(selected,state),
    'Prize selection must satisfy the native prompt contract');
  const owner=state.players.find(player=>
    player.id===prompt.getPerspectivePlayerId());
  assert.ok(owner,'native Prize prompt must have a physical perspective owner');
  const target=prompt.options.useOpponentPrizes
    ?state.players.find(player=>player.id!==owner.id):owner;
  assert.ok(target,'native Prize prompt must have a physical target player');
  assert.ok(selected.every(prize=>
    target.prizes.includes(prize)&&prize.cards.length>0),
  'owner Prize choice must name physical lists in that owner Prize zone');
  return target;
}

module.exports={assertPhysicalPrizePromptSelection};
