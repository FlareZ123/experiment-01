'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {sourceState}=require('./hidden-source-deck-policy.cjs');
const {installSupporterDecisionHook}=require('./supporter-decision-hook.cjs');
const {installOwnDeckDeterminizationHook}=require('./own-deck-determinization-hook.cjs');
const {liveCardDamageSnapshots}=require('./simulator-leak-observer.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=p=>require(path.join(output,p));

/** Isolated, source-inventory scenario; no competitive rate is measured. */
function auditDetachedOwnDeck() {
  const a=sourceState(false,14),b=sourceState(true,14);
  const {PlaySupporterTactic}=engine('simple-bot/simple-tactics/play-supporter-tactic');
  const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const defs=engine('simple-bot/simple-bot-definitions');
  const {Card}=engine('game/store/card/card');
  const opts={tactics:[PlaySupporterTactic],promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  const snapshot=data=>({
    order:data.fixture.a.deck.cards.slice(),
    active:data.fixture.a.active.cards.slice(),
    hand:data.fixture.a.hand.cards.slice(),
    damageTakenLastTurn:liveCardDamageSnapshots(data.fixture.state,Card)
  });
  const beforeA=snapshot(a),beforeB=snapshot(b);
  const score=data=>{
    const f=data.fixture;
    // PlayCardAction indexes the actor hand and board, it carries no Card object.
    const action=new PlayCardAction(f.a.id,0,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    return new PlaySupporterTactic(opts).evaluateAction(f.state,f.a.id,action);
  };
  const restoreSupporter=installSupporterDecisionHook();
  let scores;
  try {
    const restoreSampling=installOwnDeckDeterminizationHook({
      seed:20261016,samples:12,
      assumeNoKnownDeckOrder:true,assumeDeckContentsKnown:true,
      isolateGameState:true,assumeIndexBasedAction:true
    });
    try {scores=[score(a),score(b)];}
    finally {restoreSampling();}
  } finally {restoreSupporter();}
  assert.equal(scores[0],scores[1],
    'Detached evaluation must score equivalent hidden-order worlds equally');
  assert.deepEqual(snapshot(a),beforeA,'First live hand/active/deck references moved');
  assert.deepEqual(snapshot(b),beforeB,'Second live hand/active/deck references moved');
  return {mode:'opt-in-detached-full-state-own-deck-sampling',
    sourceRank:10,sourceDeckCount:60,unknownOrderCards:14,
    pairedScores:scores,sourceZonesPreserved:true,
    scope:'Artificial K1 scenario with index-based Research action; no live games or win-rate claims'};
}
if(require.main===module)console.log(JSON.stringify(auditDetachedOwnDeck(),null,2));
module.exports={auditDetachedOwnDeck};
