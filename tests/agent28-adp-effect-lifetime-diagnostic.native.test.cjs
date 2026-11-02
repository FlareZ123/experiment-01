'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(OUT,name));
const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {CardList}=load('game/store/state/card-list');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {GamePhase}=load('game/store/state/state');
const {AttackAction}=load('game/store/actions/game-actions');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
const {Format}=load('game/store/card/card-types');
let nextId=210000;

/**
 * Staged physical board comparing the exact same global ADP flags while its
 * printed card remains in play or has since entered discard. Earlier native
 * tests independently establish that legitimate Altered Creation sets them.
 * A synthetic board transition isolates effect lifetime; it is NOT a match.
 * @param {0|1} seat
 * @param {boolean} adpStillInPlay
 */
function stage(seat,adpStillInPlay){
  const manager=initializeCards();
  /** @param {string} name */
  const make=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Native printing absent: '+name);
    card.id=nextId++;return card;
  };
  const source=new Player();source.id=101;source.name='ADP-effect-owner';
  const opponent=new Player();opponent.id=202;opponent.name='defender';
  const attacker=make('Shadow Rider Calyrex V CRE');
  const psychic=make('Psychic Energy SVE');
  source.active.cards.push(attacker,psychic);
  source.active.energies.cards.push(psychic);
  source.bench=Array.from({length:5},()=>new PokemonCardList());
  const adp=make('Arceus & Dialga & Palkia GX CEC');
  const dde=make('Double Dragon Energy ROS');
  if(adpStillInPlay){
    source.bench[0].cards.push(adp,dde);
    source.bench[0].energies.cards.push(dde);
  }else source.discard.cards.push(adp,dde);
  source.usedGX=true;
  source.alteredCreationDamage=true;
  source.usedAlteredCreation=true;
  opponent.active.cards.push(make('Duskull PRE'));
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench[0].cards.push(make('Shadow Rider Calyrex V CRE'));
  for(const player of [source,opponent]){
    for(let i=0;i<8;i++)player.deck.cards.push(make('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.activePlayer=seat;state.turn=4;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,source,opponent,attacker,adp,seat,adpStillInPlay};
}

for(const seat of [0,1]){
  test('native ADP global effect lifetime diagnostic seat '+seat,()=>{
    const present=stage(seat,true);
    const absent=stage(seat,false);
    for(const x of [present,absent]){
      assert.equal(x.source.usedGX,true);
      assert.equal(x.source.alteredCreationDamage,true);
      assert.equal(x.source.usedAlteredCreation,true);
      x.store.dispatch(new AttackAction(x.source.id,'Shadow Mist'));
      for(let n=0;n<20;n++){
        const pending=x.store.state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        assert.equal(pending.constructor.name,'WaitPrompt');
        x.store.dispatch(new ResolvePromptAction(pending.id,null));
      }
      assert.equal(x.store.hasPrompts(),false);
    }
    const inPlayDamage=present.opponent.active.damage;
    const afterDiscardDamage=absent.opponent.active.damage;
    console.log('ADP_NATIVE_LIFETIME_DAMAGE',JSON.stringify({seat,
      adpPresentDamage:inPlayDamage,adpDiscardedDamage:afterDiscardDamage,
      nativePhases:[present.store.state.phase,absent.store.state.phase]}));
    assert.ok(inPlayDamage>=10&&afterDiscardDamage>=10);
    assert.ok(inPlayDamage===10||inPlayDamage===40);
    assert.ok(afterDiscardDamage===10||afterDiscardDamage===40);
  });
}
