'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {fixture}=require('../simulation/twinleaf/redeemable-ticket-paper-regression.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {createOwnerDeckKnowledgeEpoch}=
  require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');

test('genuine Store Battle Compressor search does not spuriously revoke K1',()=>{
  const engine=name=>require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output',name));
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {Format}=engine('game/store/card/card-types');
  const stage=fixture(16);
  stage.state.turn=2;
  stage.state.gameSettings.format=Format.EXPANDED;
  const compressor=initializeCards().getCardByName('Battle Compressor PHF');
  assert.ok(compressor);
  compressor.id=998;
  stage.a.hand.cards.push(compressor);
  const known=createOwnerDeckKnowledgeEpoch();
  known.observeOwnerDeckSearch();
  const epochs=new Map([[stage.a.id,known]]);
  const prior=snapshotPrizeCardIdentities(stage.state);
  const prizeCopies=stage.a.prizes.flatMap(slot=>slot.cards);
  const index=stage.a.hand.cards.indexOf(compressor);
  stage.store.dispatch(new PlayCardAction(stage.a.id,index,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  assert.ok(stage.a.prizes.flatMap(slot=>slot.cards).every((card,i)=>
    card===prizeCopies[i]));
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
    prior,stage.state,epochs),[]);
  assert.deepEqual(known.snapshot(),{
    exactMembership:true,epoch:1,liveSearches:1,hiddenPrizeRedeals:0
  });
});
