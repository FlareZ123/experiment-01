'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=
  require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(OUTPUT,name));

/**
 * Construct one deliberately injected, publicly known third-turn native Store.
 * It isolates printed card applicability and effect settlement; it is not a
 * naturally dealt tournament game or evidence of a match win.
 *
 * @returns {{store:object,state:object,owner:object,opponent:object,
 * card:(printing:string)=>object,PokemonCardList:Function}}
 */
function fixture(){
  const manager=initializeCards();
  let nextId=10100;
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Exact pinned native printing not found: '+printing);
    found.id=++nextId;
    return found;
  };
  const {State,GamePhase}=load('game/store/state/state');
  const {GameSettings}=load('game/core/game-settings');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {Store}=load('game/store/store');
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.active.cards.push(card('Klefki SVI'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  for(const player of [owner,opponent]){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Water Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.players=[owner,opponent];
  state.gameSettings=new GameSettings();
  state.rules=state.gameSettings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,opponent,card,PokemonCardList};
}

/** @param {object} player */
function prizeCount(player){
  return player.prizes.filter(p=>p.cards.length>0).length;
}

/**
 * Resolve only prompts whose meaning this fixture explicitly models.
 * @param {object} store
 * @param {object} opponent
 * @param {object|null} waterTarget
 * @returns {string[]}
 */
function drain(store,opponent,waterTarget=null){
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const kinds=[];
  for(let attempt=0;attempt<25;attempt++){
    const next=store.state.prompts.find(p=>p.result===undefined);
    if(!next)break;
    const kind=next.constructor.name;
    let result;
    if(kind==='WaitPrompt'||kind==='ShuffleDeckPrompt'){
      result=kind==='WaitPrompt'?null:
        store.state.players[0].deck.cards.slice();
    }else if(kind==='ChoosePokemonPrompt'){
      result=opponent.bench.filter(p=>p.cards.length>0).slice(0,2);
      assert.equal(result.length,2,'Two intended Bench targets absent');
    }else if(kind==='ChooseCardsPrompt'){
      assert.ok(waterTarget,'Unexpected Water-target prompt');
      result=[waterTarget];
    }else if(kind==='ChoosePrizePrompt'){
      const player=store.state.players.find(p=>
        p.id===next.getPerspectivePlayerId());
      assert.ok(player);
      result=player.prizes.filter(p=>p.cards.length>0)
        .slice(0,next.options.count);
    }else{
      throw new Error('Unmodeled native prompt '+kind);
    }
    store.dispatch(new ResolvePromptAction(next.id,result));
    kinds.push(kind);
  }
  assert.deepEqual(store.state.prompts.filter(p=>p.result===undefined),[],
    'Native prompt queue remained unresolved');
  return kinds;
}

test('native Archie canPlay incorrectly permits draw-only Supporter without Water target',()=>{
  const x=fixture();
  const archie=x.card("Archie's Ace in the Hole PRC");
  x.owner.hand.cards.push(archie);
  for(let i=0;i<8;i++)x.owner.deck.cards.push(x.card('Water Energy SVE'));
  const before=x.owner.deck.cards.length;
  assert.equal(x.owner.discard.cards.length,0);
  assert.equal(x.owner.bench.every(s=>s.cards.length===0),true);
  assert.equal(archie.canPlay(x.store,x.state,x.owner),true,
    'Pinned canPlay branch unexpectedly stopped permitting illegal draw-only Archie');
  const {PlayCardAction}=load('game/store/actions/play-card-action');
  x.store.dispatch(new PlayCardAction(x.owner.id,0));
  assert.equal(x.owner.hand.cards.length,5,
    'Pinned draw-only Archie branch no longer resolves as source indicates');
  assert.equal(x.owner.deck.cards.length,before-5);
  assert.equal(x.owner.bench.every(s=>s.cards.length===0),true);
  assert.equal(x.owner.discard.cards.some(c=>c.name==='Baxcalibur'),false);
  // Expected paper-rule outcome: reject the initial Supporter action entirely.
  // Official FAQ 9827: https://www.pokemon-card.com/rules/faq/details.php?id=9827
});

test('native Archie has a separate valid Water Stage-2 positive control',()=>{
  const x=fixture();
  const archie=x.card("Archie's Ace in the Hole PRC");
  const baxcalibur=x.card('Baxcalibur PAL');
  x.owner.hand.cards.push(archie);
  x.owner.discard.cards.push(baxcalibur);
  for(let i=0;i<8;i++)x.owner.deck.cards.push(x.card('Water Energy SVE'));
  assert.equal(archie.canPlay(x.store,x.state,x.owner),true);
  const {PlayCardAction}=load('game/store/actions/play-card-action');
  x.store.dispatch(new PlayCardAction(x.owner.id,0));
  // The printed Stage 2 is eligible through Archie's card effect.
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const choose=x.store.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='ChooseCardsPrompt');
  assert.ok(choose,'Expected genuine Water Pokémon selection');
  x.store.dispatch(new ResolvePromptAction(choose.id,[baxcalibur]));
  assert.ok(x.owner.bench.some(s=>s.getPokemonCard()?.name==='Baxcalibur'));
  assert.equal(x.owner.hand.cards.length,5);
  assert.equal(x.owner.discard.cards.includes(baxcalibur),false);
  // Official FAQ 9828: https://www.pokemon-card.com/rules/faq/details.php?id=9828
});

test('native Aqua Storm ignores active Telescopic Sight during five-Basic-Water discard',()=>{
  const x=fixture();
  x.owner.active.cards.length=0;
  x.owner.active.cards.push(x.card('Kyogre CEL'));
  for(let i=0;i<3;i++){
    const e=x.card('Water Energy SVE');
    x.owner.active.cards.push(e);
    x.owner.active.energies.cards.push(e);
  }
  const sight=x.card('Telescopic Sight VIV');
  x.owner.active.cards.push(sight);
  x.owner.active.tools.push(sight);
  const opponentTargets=[];
  for(let i=0;i<2;i++){
    const t=x.opponent.bench[i];
    t.cards.push(x.card('Regidrago VSTAR SIT'));
    opponentTargets.push(t);
  }
  for(let i=0;i<5;i++)x.owner.deck.cards.push(x.card('Water Energy SVE'));
  for(let i=0;i<5;i++)x.opponent.deck.cards.push(x.card('Water Energy SVE'));
  const before=opponentTargets.map(p=>p.damage);
  const {AttackAction}=load('game/store/actions/game-actions');
  x.store.dispatch(new AttackAction(x.owner.id,'Aqua Storm'));
  const prompts=drain(x.store,x.opponent);
  assert.ok(prompts.includes('ChoosePokemonPrompt'));
  assert.deepEqual(opponentTargets.map(p=>p.damage),[250,250],
    'Pinned direct damage path unexpectedly applied or reduced damage');
  assert.equal(prizeCount(x.owner),6,'250 raw damage leaves 280 HP VSTAR alive');
  assert.deepEqual(before,[0,0]);
  // Paper-correct five Energy + Sight: 280 on each, four Prizes from two KOs.
  // Official Sight: https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh4/160/
  // This injected Store test is a mechanical discrepancy witness, not a game.
});
