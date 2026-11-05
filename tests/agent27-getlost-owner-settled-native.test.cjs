'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withSourceStampedGetLostOwner}=
  require('../simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const load=moduleName=>require(path.join(output,moduleName));

/**
 * An actual pinned native Store, genuine two legal 60-card player registrations,
 * then a staged source attack reducer with a conserved opponent public discard.
 * This is a source-effect fixture, not a naturally selected full-game attack.
 * @param {0|1} seat
 * @param {number} offered
 */
function fixture(seat,offered){
  const manager=initializeCards();
  for(const name of ['Girafarig LOT','Dratini OBF','Psychic Energy SVE'])
    assert.ok(manager.getCardByName(name),'Missing native '+name);
  const {Store}=load('game/store/store');
  const {AddPlayerAction}=
    load('game/store/actions/add-player-action');
  const {GamePhase}=load('game/store/state/state');
  const basic=['Girafarig LOT',...Array(59).fill('Psychic Energy SVE')];
  const opponentDeck=['Dratini OBF',...Array(59).fill('Psychic Energy SVE')];
  const store=new Store({onStateChange(){}});
  const sourceId=seat===0?101:202;
  const otherId=seat===0?202:101;
  const nameDecks=seat===0?
    [[sourceId,'source',basic],[otherId,'opponent',opponentDeck]]:
    [[otherId,'opponent',opponentDeck],[sourceId,'source',basic]];
  for(const [id,name,deck] of nameDecks)
    store.dispatch(new AddPlayerAction(id,name,deck));
  const state=store.state;
  assert.equal(state.players.length,2);
  const owner=state.players[seat],other=state.players[1-seat];
  assert.equal(owner.id,sourceId);
  assert.equal(other.id,otherId);
  // Clear incomplete ordinary setup. Actual source and prompt reducers run on
  // native classes, with all physical cards conserved between native zones.
  state.prompts.length=0;
  store.promptItems.length=0;
  store.waitItems.length=0;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  const source=owner.deck.cards.find(c=>c.fullName==='Girafarig LOT');
  const otherBasic=other.deck.cards.find(c=>c.fullName==='Dratini OBF');
  assert.ok(source&&otherBasic);
  owner.deck.moveCardTo(source,owner.active);
  other.deck.moveCardTo(otherBasic,other.active);
  const selected=other.deck.cards.slice(0,offered);
  other.deck.moveCardsTo(selected,other.discard);
  assert.equal(other.discard.cards.length,offered);
  return {store,state,owner,other,source,selected};
}

for(const seat of [0,1]){
  for(const offered of [1,2,3]){
    test('real pinned Get Lost owner seat '+seat+
      ' moves public '+offered+' card(s) exactly into Lost Zone',()=>{
      const {AttackEffect}=load('game/store/effects/game-effects');
      const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
      const {ResolvePromptAction}=
        load('game/store/actions/resolve-prompt-action');
      const result=withSourceStampedGetLostOwner(()=>{
        const f=fixture(seat,offered);
        f.source.reduceEffect(f.store,f.state,
          new AttackEffect(f.owner,f.other,f.source.attacks[0]));
        const chosen=SimpleTacticsAi.prototype.decodeNextAction.call(
          {client:{id:f.owner.id}},f.state);
        assert.ok(chosen instanceof ResolvePromptAction);
        assert.equal(chosen.result.length,Math.min(offered,2));
        const expected=chosen.result.slice();
        f.store.dispatch(chosen);
        assert.equal(f.state.prompts[0].result,chosen.result);
        console.log('AGENT27_GETLOST_STAGED_NATIVE',JSON.stringify({
          seat,offered,selected:expected.map(c=>({id:c.id,name:c.fullName})),
          actualDiscard:f.other.discard.cards.map(c=>c.id),
          actualLostZone:f.other.lostzone.cards.map(c=>c.id),
          otherIsCurrent:f.store.state.players[1-seat]===f.other,
          storeStateIsOriginal:f.store.state===f.state,
          allPlayers:f.store.state.players.map(p=>({
            id:p.id,discard:p.discard.cards.length,lostzone:p.lostzone.cards.length
          }))
        }));
        assert.equal(f.other.discard.cards.length,offered-expected.length);
        for(const card of expected){
          assert.ok(f.other.lostzone.cards.includes(card));
          assert.ok(!f.other.discard.cards.includes(card));
        }
        return {moved:expected.length,remaining:f.other.discard.cards.length};
      },{followSequentialNativeStores:true});
      assert.equal(result.audit.printedSourcePromptMarks,1);
      assert.equal(result.audit.actualOwnerSelections,1);
      assert.equal(result.audit.acceptedStoreActions,1);
      assert.equal(result.audit.verifiedNativePromptSettlements,1);
      assert.equal(result.audit.nativeUnsettledSourcePrompts,0);
      assert.equal(result.audit.postDispatchExactLostZoneTransfers,1);
      assert.equal(result.audit.postDispatchLostZoneTransferUnverified,0);
      assert.equal(result.result.moved,Math.min(offered,2));
      assert.equal(result.audit.competitiveGamesQualified,0);
    });
  }
}
