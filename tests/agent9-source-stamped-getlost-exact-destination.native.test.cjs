'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withSourceStampedGetLostOwner}=
  require('../simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} Pinned compiled Twinleaf module. */
const native=file=>require(path.join(output,file));

/**
 * Stage exactly the printed original rank-1 Girafarig LOT on a real pinned
 * Store, with physical public opposing discard resources. This is a controlled
 * effect fixture. It is never a naturally dealt 60-card game or win sample.
 * @param {0|1} actorSeat
 * @param {number} available
 * @returns {object}
 */
function stageNativeSource(actorSeat,available){
  const manager=initializeCards();
  const physical=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Pinned card printing absent: '+name);
    return card;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {State,GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {AddPlayerAction}=
    native('game/store/actions/add-player-action');
  const store=new Store({onStateChange(){}});
  store.state.gameSettings.format=Format.EXPANDED;
  const actorId=actorSeat===0?101:202;
  // Register this genuine Store through its real AddPlayerAction. One valid
  // 60-card Expanded player is enough to tag the Store; the controlled
  // after-registration board below deliberately bypasses normal setup.
  const legalRoster=['Girafarig LOT',
    ...Array.from({length:59},()=> 'Psychic Energy SVE')];
  store.dispatch(new AddPlayerAction(actorId,'Get Lost owner',legalRoster));
  assert.equal(store.state.players.length,1);
  const state=new State(),actor=new Player(),opponent=new Player();
  actor.id=actorId;
  opponent.id=actorSeat===0?202:101;
  const girafarig=physical('Girafarig LOT');
  actor.active.cards.push(girafarig);
  opponent.active.cards.push(physical('Dratini OBF'));
  const selected=[];
  for(let i=0;i<available;i++){
    const card=physical(i%2===0?
      'Darkness Energy MEE':'Psychic Energy SVE');
    opponent.discard.cards.push(card);
    selected.push(card);
  }
  state.players=actorSeat===0?[actor,opponent]:[opponent,actor];
  state.turn=4;
  state.activePlayer=actorSeat;
  state.phase=GamePhase.ATTACK;
  state.gameSettings.format=Format.EXPANDED;
  store.state=state;
  return {store,state,actor,opponent,girafarig,selected};
}

for(const actorSeat of [0,1]){
  for(const available of [0,1,2,3]){
    test('pinned printed Get Lost owner '+actorSeat+
        ' physical public discard '+available,()=>{
      let witnessed=null;
      const observed=withSourceStampedGetLostOwner(()=>{
        const f=stageNativeSource(actorSeat,available);
        const {AttackEffect}=native('game/store/effects/game-effects');
        const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
        const {ResolvePromptAction}=
          native('game/store/actions/resolve-prompt-action');
        f.store.reduceEffect(f.state,new AttackEffect(
          f.actor,f.opponent,f.girafarig.attacks[0]));
        const prompt=f.state.prompts.find(p=>p.result===undefined);
        assert.ok(prompt,'Original pinned printed Get Lost must prompt');
        assert.strictEqual(prompt.cards,f.opponent.discard);
        const expectedCount=Math.min(2,available);
        assert.equal(prompt.options.min,expectedCount);
        assert.equal(prompt.options.max,expectedCount);
        assert.equal(prompt.options.allowCancel,false);
        const bot=Object.create(SimpleTacticsAi.prototype);
        bot.client={id:f.actor.id};
        const answer=bot.decodeNextAction(f.state);
        assert.ok(answer instanceof ResolvePromptAction);
        assert.equal(answer.id,prompt.id);
        assert.deepEqual(answer.result,f.selected.slice(0,expectedCount));
        f.store.dispatch(answer);
        assert.equal(f.opponent.discard.cards.length,
          available-expectedCount);
        assert.equal(f.opponent.lostzone.cards.length,expectedCount);
        assert.ok(answer.result.every(card=>
          f.opponent.lostzone.cards.includes(card)&&
          !f.opponent.discard.cards.includes(card)));
        witnessed={
          actorSeat,available,
          publicDiscardBefore:available,
          publicDiscardAfter:f.opponent.discard.cards.length,
          publicLostZoneAfter:f.opponent.lostzone.cards.length
        };
        return true;
      },{followSequentialNativeStores:true});
      assert.equal(observed.result,true);
      assert.equal(observed.audit.printedSourcePromptMarks,1);
      assert.equal(observed.audit.actualOwnerSelections,1);
      assert.equal(observed.audit.acceptedStoreActions,1);
      assert.equal(observed.audit.postDispatchPublicDiscardDepletions,
        available===0?0:1);
      assert.equal(observed.audit.postDispatchExactLostZoneTransfers,
        available===0?0:1);
      assert.equal(observed.audit.postDispatchLostZoneTransferUnverified,0);
      assert.equal(observed.audit.inspectedConcealedCardIdentity,false);
      assert.equal(observed.audit.competitiveGamesQualified,0);
      const event=observed.audit.selectedEvents[0];
      assert.equal(event.exactLostZoneTransferConfirmed,available>0);
      assert.equal(event.lostZoneBefore,0);
      assert.equal(event.lostZoneAfter,witnessed.publicLostZoneAfter);
      console.log('AGENT9_GETLOST_PINNED_POSITIVE_DESTINATION',
        JSON.stringify({fixture:witnessed,
          confirmed:observed.audit.postDispatchExactLostZoneTransfers,
          competitiveGamesQualified:0}));
    });
  }
}
