'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

/** @param {string} name */
const load=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));
const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {CardList}=load('game/store/state/card-list');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {GamePhase}=load('game/store/state/state');
const {AttackAction,RetreatAction}=load('game/store/actions/game-actions');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
const {Format}=load('game/store/card/card-types');

let id=850000;

/**
 * Staged, original pinned Store test with physically shared Energy records.
 * This is a mechanical fixture, not a shuffled game or a result against any
 * authenticated opponent original 60.
 * @param {0|1} seat
 * @param {boolean} retreatIntoMega
 * @param {number} energyCount
 */
function stage(seat,retreatIntoMega,energyCount=1){
  const manager=initializeCards();
  /** @param {string} name */
  const make=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing exact pinned card '+name);
    card.id=id++;
    return card;
  };
  const owner=new Player();owner.id=101;owner.name='sentinel-lopunny';
  const opponent=new Player();opponent.id=202;opponent.name='defender';
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  const bunny=make('Buneary PFL');
  const mega=make('Mega Lopunny ex PFL');
  const current=retreatIntoMega?owner.bench[0]:owner.active;
  current.cards.push(bunny,mega);
  for(let i=0;i<energyCount;i++){
    const energy=make('Psychic Energy SVE');
    current.cards.push(energy);
    current.energies.cards.push(energy);
  }
  if(retreatIntoMega){
    owner.active.cards.push(make('Bunnelby PRC'));
    const stone=make('Float Stone BKT');
    owner.active.cards.push(stone);
    owner.active.tools.push(stone);
  }else{
    owner.bench[0].cards.push(make('Bunnelby PRC'));
  }
  opponent.active.cards.push(make('Arceus & Dialga & Palkia GX CEC'));
  opponent.bench[0].cards.push(make('Duskull PRE'));
  for(const player of [owner,opponent]){
    for(let j=0;j<8;j++)player.deck.cards.push(make('Psychic Energy SVE'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(make('Psychic Energy SVE'));
      return prize;
    });
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent,bunny,mega,seat,retreatIntoMega};
}

/** @param {ReturnType<typeof stage>} x */
function settleAttack(x){
  x.store.dispatch(new AttackAction(x.owner.id,'Gale Thrust'));
  const prompts=[];
  for(let i=0;i<18;i++){
    const p=x.store.state.prompts.find(row=>row.result===undefined);
    if(!p)break;
    prompts.push(p.constructor.name);
    assert.equal(p.constructor.name,'WaitPrompt',
      'unexpected native prompt while verifying baseline damage');
    x.store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(x.store.hasPrompts(),false);
  return prompts;
}

for(const seat of [0,1]){
  test('native exact Mega Lopunny PFL seat '+seat+
    ' does 60 from already Active with one physical Energy',()=>{
    const x=stage(seat,false);
    assert.equal(x.mega.hp,330);
    assert.equal(x.mega.attacks.find(a=>a.name==='Gale Thrust').damage,60);
    const prompts=settleAttack(x);
    assert.equal(x.opponent.active.damage,60);
    assert.equal(x.owner.getPrizeLeft(),6);
    assert.equal(x.opponent.getPrizeLeft(),6);
    console.log('SENTINEL_MEGA_BASE',JSON.stringify({seat,damage:60,prompts}));
  });
  test('native source seat '+seat+
    ' Float Stone RetreatAction promotes evolved Mega and enables 230 Gale Thrust',()=>{
    const x=stage(seat,true);
    x.store.dispatch(new RetreatAction(x.owner.id,0));
    assert.strictEqual(x.owner.active.getPokemonCard(),x.mega);
    assert.equal(x.owner.retreatedTurn,x.store.state.turn);
    assert.equal(x.owner.active.energies.cards.length,1);
    const prompts=settleAttack(x);
    assert.equal(x.opponent.active.damage,230);
    assert.equal(x.owner.getPrizeLeft(),6);
    assert.equal(x.opponent.getPrizeLeft(),6);
    console.log('SENTINEL_MEGA_MOVED',JSON.stringify({seat,damage:230,prompts}));
  });
}
