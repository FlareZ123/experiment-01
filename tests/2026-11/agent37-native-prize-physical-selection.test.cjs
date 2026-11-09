'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {assertPhysicalPrizePromptSelection}=
  require('../../simulation/twinleaf/agent37/native-prize-physical-selection.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {ChoosePrizePrompt}=require(path.join(ROOT,
  'game/store/prompts/choose-prize-prompt'));
const {GameMessage}=require(path.join(ROOT,'game/game-message'));

function run(){
  const ours=[{cards:[{fullName:'Psychic Energy MEE'}]},
    {cards:[{fullName:'Metal Energy MEE'}]}];
  const theirs=[{cards:[{fullName:'Water Energy MEE'}]}];
  const state={players:[{id:101,prizes:ours},{id:202,prizes:theirs}]};
  const own=new ChoosePrizePrompt(101,GameMessage.CHOOSE_PRIZE_CARD,
    {count:1});
  assert.strictEqual(assertPhysicalPrizePromptSelection(state,own,[ours[1]]),
    state.players[0]);
  assert.equal(own.validate([theirs[0]],state),true,
    'pinned validator accepts another owner Prize CardList');
  assert.throws(()=>assertPhysicalPrizePromptSelection(state,own,[theirs[0]]),
    /owner Prize choice must name physical lists in that owner Prize zone/);

  const forged={cards:[{fullName:'Foreign card'}]};
  assert.equal(own.validate([forged],state),true);
  assert.throws(()=>assertPhysicalPrizePromptSelection(state,own,[forged]),
    /owner Prize choice must name physical lists in that owner Prize zone/);

  const opponent=new ChoosePrizePrompt(101,GameMessage.CHOOSE_PRIZE_CARD,
    {count:1,useOpponentPrizes:true});
  assert.strictEqual(
    assertPhysicalPrizePromptSelection(state,opponent,[theirs[0]]),
    state.players[1]);
  assert.equal(opponent.validate([ours[0]],state),true);
  assert.throws(()=>
    assertPhysicalPrizePromptSelection(state,opponent,[ours[0]]),
  /owner Prize choice must name physical lists in that owner Prize zone/);

  const redirected=new ChoosePrizePrompt(101,GameMessage.CHOOSE_PRIZE_CARD,
    {count:1});
  redirected.perspectivePlayerId=202;
  assert.strictEqual(
    assertPhysicalPrizePromptSelection(state,redirected,[theirs[0]]),
    state.players[1]);
  assert.throws(()=>
    assertPhysicalPrizePromptSelection(state,redirected,[ours[0]]),
  /owner Prize choice must name physical lists in that owner Prize zone/);

  assert.throws(()=>assertPhysicalPrizePromptSelection(state,own,[forged,ours[0]]),
    /Prize selection must satisfy the native prompt contract/);
  return {
    schema:'agent37-native-prize-physical-selection-membership-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    validOwnChoice:true,validOpponentPrizesChoice:true,
    perspectiveOwnerRedirection:true,foreignPhysicalPrizeChoicesRejected:4,
    nativeValidatorFalsePositivesReproduced:3
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
