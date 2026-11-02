'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(output,name));

/**
 * Use the genuine Store's current native Ability reducer and visibility
 * predicate, never a manually invented boolean rule.
 * @param {object} store
 * @param {object} state
 * @param {object} player
 * @param {object} pokemon
 * @param {string} power
 * @returns {{visible:boolean,blocked:boolean}}
 */
function status(store,state,player,pokemon,power){
  const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const effect=new CheckPokemonPowersEffect(player,pokemon);
  store.reduceEffect(state,effect);
  return {
    visible:effect.powers.some(p=>p.name===power),
    blocked:IS_ABILITY_BLOCKED(store,state,player,pokemon)
  };
}

/**
 * Inject only a midgame printed-card configuration. Never call it a deal.
 * The Electrode-GX Stage 1 retains its real printed Voltorb ancestor.
 * @param {0|1} seat
 * @param {'klefki'|'plain'} own
 * @param {'wobbuffet'|'thorns'|'plain'} foe
 */
function stage(seat,own,foe){
  const manager=initializeCards();
  let id=430000+seat*1000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned card '+name);
    c.id=id++;
    return c;
  };
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {Format}=native('game/store/card/card-types');
  const owner=new Player(),enemy=new Player();
  owner.id=431;enemy.id=432;
  owner.name='published Raichu owner';enemy.name='active lock adversary';
  const ourActive=card(own==='klefki'?'Klefki SVI':'Pidgey MEW');
  const theirActive=card(foe==='wobbuffet'?'Wobbuffet PHF':
    foe==='thorns'?'Iron Thorns ex TWM':'Pidgey MEW');
  owner.active.cards.push(ourActive);
  enemy.active.cards.push(theirActive);
  const electrode=card('Electrode-GX CES');
  const evolution=new PokemonCardList();
  evolution.cards.push(card('Voltorb ROS'),electrode);
  owner.bench.push(evolution);
  for(const player of [owner,enemy]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let n=0;n<6;n++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.players=seat===0?[owner,enemy]:[enemy,owner];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,enemy,ourActive,theirActive,electrode};
}

test('both seats: Klefki disables opposing Active Wobbuffet/Thorns lock and exposes Electrode-GX',()=>{
  const cases=[
    {own:'plain',foe:'plain',blocked:false},
    {own:'klefki',foe:'plain',blocked:false},
    {own:'plain',foe:'wobbuffet',blocked:true},
    {own:'klefki',foe:'wobbuffet',blocked:false},
    {own:'plain',foe:'thorns',blocked:true},
    {own:'klefki',foe:'thorns',blocked:false}
  ];
  const rows=[];
  for(const seat of [0,1]){
    for(const scenario of cases){
      const x=stage(seat,scenario.own,scenario.foe);
      const energy=status(x.store,x.state,x.owner,x.electrode,'Extra Energy Bomb');
      assert.equal(energy.visible,!scenario.blocked,
        'Electrode visible mismatch '+JSON.stringify({seat,scenario,energy}));
      assert.equal(energy.blocked,scenario.blocked,
        'Electrode block mismatch '+JSON.stringify({seat,scenario,energy}));
      let lock=null;
      if(scenario.foe!=='plain'){
        const power=scenario.foe==='wobbuffet'?'Bide Barricade':'Initialization';
        lock=status(x.store,x.state,x.enemy,x.theirActive,power);
        assert.equal(lock.visible,scenario.own!=='klefki');
        assert.equal(lock.blocked,scenario.own==='klefki');
      }
      if(scenario.own==='klefki'){
        const klefki=status(x.store,x.state,x.owner,x.ourActive,'Mischievous Lock');
        assert.equal(klefki.visible,true);
        // A positive IS_ABILITY_BLOCKED with the printed named Ability
        // still visible is a distinct native-contract discrepancy. Record
        // both and let the actual Effect availability assertions stand.
        if(klefki.blocked)console.log('AGENT43_KLEFKI_SIGNAL_DISAGREEMENT',
          JSON.stringify({seat,scenario,klefki}));
      }
      rows.push({seat,...scenario,electrode:energy,opponentLock:lock});
    }
  }
  assert.equal(rows.length,12);
  console.log('AGENT43_NATIVE_KLEFKI_LOCK',JSON.stringify({
    rows,stageOnly:true,energyBombActivated:false,competitiveQualified:false
  }));
});
