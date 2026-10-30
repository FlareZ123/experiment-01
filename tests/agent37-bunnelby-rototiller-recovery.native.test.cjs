'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withActorOwnerSingleSearch,actorSingleSearchInput}=
  require('../simulation/twinleaf/agent41-actor-owner-single-search.cjs');
const {actorAttackRecoveryInput}=require(
  '../simulation/twinleaf/agent37-attack-recovery-owner-prompt.cjs');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(ROOT,name));

/** @param {0|1} seat */
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let id=2000;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Native card missing '+printing);
    c.id=id++;
    return c;
  };
  owner.active.cards.push(card('Bunnelby PRC'));
  owner.active.energies.cards.push(card('Psychic Energy SVE'));
  const recovery=card('Technical Machine: Evolution PAR');
  owner.discard.cards.push(recovery);
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    for(let i=0;i<14;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,recovery,seat};
}

for(const seat of [0,1]){
  test('Bunnelby Omega Barrage Rototiller produces genuine owner-discard recovery, seat '+seat,()=>{
    const {store,state,owner,opponent,recovery}=stage(seat);
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    const {GamePhase}=native('game/store/state/state');
    store.dispatch(new AttackAction(owner.id,'Rototiller'));
    let prompt=null;
    for(let i=0;i<30;i++){
      prompt=state.prompts.find(p=>p.result===undefined);
      assert.ok(prompt,'Rototiller must produce an observable real prompt');
      if(prompt.constructor.name==='ChooseCardsPrompt')break;
      assert.equal(prompt.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(prompt.id,null));
    }
    assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
    assert.equal(prompt.message,'CHOOSE_CARD_TO_DECK');
    assert.equal(prompt.playerId,owner.id);
    assert.strictEqual(prompt.cards,owner.discard);
    assert.equal(state.phase,GamePhase.ATTACK);
    assert.equal(prompt.validate([recovery]),true);
    assert.equal(actorSingleSearchInput(state,seat),null,
      'Deck-to-hand prompt rules do not own discard-to-deck recovery');
    const projected=actorAttackRecoveryInput(state,seat);
    assert.equal(projected.prompt.source,'own-discard-to-deck');
    assert.deepEqual(projected.prompt.offered.map(c=>c.printing),
      ['Technical Machine: Evolution PAR']);
    class AddPlayerAction{}
    class BridgeStore{
      constructor(original){this.original=original;this.state=original.state;}
      dispatch(action){
        if(action instanceof AddPlayerAction)return this.state;
        return this.original.dispatch(action);
      }
    }
    class OwnerBot{
      constructor(id){this.client={id};}
      decodeNextAction(){return 'GENERIC_FALLBACK';}
    }
    const {audit}=withActorOwnerSingleSearch(()=>{
      const bridge=new BridgeStore(store);
      bridge.dispatch(new AddPlayerAction());
      const action=new OwnerBot(owner.id).decodeNextAction(state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.id,prompt.id);
      assert.deepEqual(action.result,[recovery]);
      bridge.dispatch(action);
    },{
      Store:BridgeStore,SimpleTacticsAi:OwnerBot,ResolvePromptAction,GamePhase,
      attackPhaseRecovery:true,attackPhaseEvolution:false,
      attackPhaseSearch:false
    });
    assert.equal(audit.attackPhaseRecoveryOptIn,true);
    assert.equal(audit.selected,1);
    assert.equal(audit.accepted,1);
    assert.equal(audit.nativePromptPostconditionsConfirmed,1);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(owner.discard.cards.includes(recovery),false);
    assert.equal(owner.deck.cards.includes(recovery),true);
    assert.equal(owner.deck.cards.length,15);
    assert.equal(opponent.active.getPokemonCard()?.fullName,
      'Shadow Rider Calyrex V CRE');
  });
}
