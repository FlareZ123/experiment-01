'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {ownerBallDonorOpportunity,VERSION}=
  require('./agent25-owner-quickball-hns-cost-v2.cjs');
const registration=require('../../results/als/registrations/agent25-native-v2-quickball-source-staging-canary-20261106.json');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * Staged native Quick Ball root and prompt custody, not a complete match.
 * @param {0|1} seat
 * @param {'Shuppet M5'|'Grass Energy MEE'} paymentName
 * @returns {object}
 */
function arm(seat,paymentName){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.source.active.cards.length=0;
  f.source.active.cards.push(f.card('Dhelmise M5'));
  const ball=f.card('Quick Ball SSH');
  const payment=f.card(paymentName);
  const compressor=f.card('Battle Compressor PHF');
  const target=f.card('Dhelmise M5');
  f.source.hand.cards.push(ball,payment,compressor);
  f.source.deck.cards.push(target);
  const ballIndex=f.source.hand.cards.indexOf(ball);
  assert.ok(ballIndex>=0);
  f.store.dispatch(new PlayCardAction(f.source.id,ballIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=f.state.prompts.find(x=>x.result===undefined);
  assert.equal(prompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(prompt.message,'CHOOSE_CARD_TO_DISCARD');
  assert.equal(prompt.sourceCard,undefined,
    'Original pinned ChooseCardsPrompt has no native sourceCard');
  assert.ok(f.source.supporter.cards.includes(ball),
    'Actual physical Quick Ball must be staged in owner supporter zone');
  assert.ok(!f.source.hand.cards.includes(ball));
  assert.ok(prompt.cards.cards.includes(payment));
  const hit=ownerBallDonorOpportunity(f.state,seat);
  if(paymentName==='Shuppet M5'){
    assert.strictEqual(hit?.card,payment,
      'V2 must choose the genuine offered physical Shuppet donor');
    assert.strictEqual(hit.owner,f.source);
  }else{
    assert.equal(hit,null,
      'V2 must decline a held non-HNS Energy as donor payment');
  }
  assert.equal(prompt.validate([payment],f.state),true);
  f.store.dispatch(new ResolvePromptAction(prompt.id,[payment]));
  assert.ok(f.source.discard.cards.includes(payment),
    'Genuine Store must settle donor/energy physical hand payment');
  return {seat,paymentName,promptId:prompt.id,
    nativePromptSourceCard:prompt.sourceCard??null,
    nativeQuickBallPhysicalId:ball.id,
    nativeStagedQuickBall:true,
    v2FoundOwnerDonor:hit?.card===payment,
    chosenCardId:hit?.card?.id??null,
    paidCardId:payment.id,
    validNativePrompt:true,
    genuineStoreMovedPayment:true,
    naturalOriginal60:false,qualifiedGames:0};
}

function study(){
  assert.equal(registration.version,
    'agent25-v2-native-quickball-source-staging-canary-precommit');
  const results=[];
  for(const seat of registration.seats){
    for(const payment of registration.payments)results.push(arm(seat,payment));
  }
  assert.equal(results.length,4);
  return {version:VERSION,registration:registration.version,
    pinnedNative:registration.nativePin,
    results,allPassed:true,stagedBoardOnly:true,qualifiedGames:0};
}
module.exports={arm,study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
