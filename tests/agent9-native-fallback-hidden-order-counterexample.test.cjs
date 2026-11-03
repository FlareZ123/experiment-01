'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {fixture}=require('../simulation/twinleaf/hidden-deck-order-audit.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {classifyNativeTrainerAfterPass}=
  require('../simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs');

/**
 * Execute the exact pinned native bot with two unknown-deck orders, then pass
 * its actual proposal through Agent50's experimental owner/public filter.
 * This is an injected midgame policy counterexample, never a competitive game.
 *
 * @param {string} exactPrinting Public Item printing in the original fixture.
 * @returns {object} A bounded, information-set-equivalent decision contrast.
 */
function inheritedNativeHiddenOrderContrast(exactPrinting) {
  const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(base,name));
  const manager=initializeCards();
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction}=engine('game/store/actions/play-card-action');
  const definitions=engine('simple-bot/simple-bot-definitions');
  const options={
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  const states=[fixture(true),fixture(false)];
  for(const state of states) {
    const original=state.players[0].hand.cards[0];
    const replacement=manager.getCardByName(exactPrinting);
    assert.ok(replacement,'Missing pinned public printing: '+exactPrinting);
    replacement.id=original.id;
    state.players[0].hand.cards[0]=replacement;
  }
  const views=states.map(state=>actorObservation(state,0));
  assert.deepStrictEqual(views[0],views[1],
    'The actor-only root view must exclude concealed deck order');
  assert.deepStrictEqual(views[0].ownHand,[exactPrinting]);
  const catalog=new Map([[exactPrinting,{
    name:states[0].players[0].hand.cards[0].name,type:'Item'
  }]]);
  const nativeActions=states.map(state=>
    new SimpleTacticsAi({id:101},options,null).decodeNextAction(state));
  const proposals=nativeActions.map((action,index)=>
    classifyNativeTrainerAfterPass(views[index],action,catalog,PlayCardAction));
  const actionTypes=nativeActions.map(action=>action?.constructor.name??'NoAction');
  assert.deepStrictEqual(actionTypes,['PlayCardAction','PassTurnAction'],
    'Historical compiled full-bot hidden-order falsifier changed');
  assert.deepStrictEqual(proposals.map(row=>row.selected),[true,false],
    'Agent50 filter must expose the inherited information-set reversal');
  assert.equal(proposals[0].printing,exactPrinting);
  assert.equal(proposals[0].reason,
    'native-proposed-generic-unblocked-trainer');
  assert.equal(proposals[1].reason,'native-did-not-propose-play-card');
  return {
    exactPrinting,
    sameOwnerObservableState:true,
    sameOwnDeckMultiset:true,
    hiddenChange:'position of Arven in unrevealed 18-card owner deck',
    hiddenArvenFirstAction:actionTypes[0],
    hiddenArvenLastAction:actionTypes[1],
    experimentalFilterSelects:proposals.map(row=>row.selected),
    rawBotProposalInfoSafe:false,
    nativeStoreAcceptedOrPaperPlayable:null,
    competitiveGameQualified:false
  };
}

for(const printing of ['Pokegear SVI',"Trainers' Mail ROS"]) {
  test('native Trainer fallback inherits hidden-order action reversal: '+printing,
    ()=>{
      const result=inheritedNativeHiddenOrderContrast(printing);
      assert.equal(result.sameOwnerObservableState,true);
      assert.equal(result.rawBotProposalInfoSafe,false);
      assert.equal(result.competitiveGameQualified,false);
    });
}

module.exports={inheritedNativeHiddenOrderContrast};
