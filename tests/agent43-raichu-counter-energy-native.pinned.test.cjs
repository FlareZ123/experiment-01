'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {nativeSinglePokemonChoices}=
  require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(output,name));

/**
 * Test physical Counter Energy vs Electro Rain under a Prize deficit.
 * The one-card/two-Energy ruling is sourced directly to the official
 * Japanese Pokémon TCG Q&A. No private opponent cards enter the policy.
 *
 * @param {0|1} seat
 */
function stage(seat){
  const cards=initializeCards();
  let id=437000+1000*seat;
  const card=name=>{
    const found=cards.getCardByName(name);
    assert.ok(found,'Missing native printing '+name);
    found.id=id++;
    return found;
  };
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {Format}=native('game/store/card/card-types');
  const owner=new Player(),opponent=new Player();
  owner.id=4371;opponent.id=4372;
  owner.name='Raichu original';opponent.name='Public opposing Active';
  owner.active.cards.push(card('Pikachu LOR'),card('Alolan Raichu UNM'));
  const counter=card('Counter Energy CIN');
  owner.active.energies.cards.push(counter);
  const target=card('Galarian Articuno V CRE');
  opponent.active.cards.push(target);
  for(const player of [owner,opponent]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let n=0;n<(player===owner?6:5);n++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    player.bench.push(new PokemonCardList());
  }
  const state=new State();
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,opponent,target,counter,seat};
}

/** @param {ReturnType<typeof stage>} x */
function settle(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const prompts=[];
  for(let k=0;k<50;k++){
    const p=x.state.prompts.find(prompt=>prompt.result===undefined);
    if(!p)return prompts;
    const row={kind:p.constructor.name,playerId:p.playerId,
      keys:Object.keys(p.options??{}).sort()};
    prompts.push(row);
    if(p.constructor.name==='WaitPrompt'){
      x.store.dispatch(new ResolvePromptAction(p.id,null));
      continue;
    }
    if(p.constructor.name==='ChoosePokemonPrompt'){
      const offered=nativeSinglePokemonChoices(x.state,p);
      row.offered=offered.map(c=>({seat:c.seat,zone:c.zone,index:c.index}));
      const selected=offered.find(c=>c.seat===1-x.seat&&c.zone==='active');
      assert.ok(selected,'Electro Rain must offer opponent Active target: '+
        JSON.stringify(row));
      assert.equal(p.validate([selected.physical],x.state),true);
      x.store.dispatch(new ResolvePromptAction(p.id,[selected.physical]));
      continue;
    }
    assert.fail('Unmodeled Electro Rain native prompt '+JSON.stringify(row));
  }
  assert.fail('Electro Rain exceeded bounded 50-prompt settlement');
}

test('real pinned Store: one Counter Energy yields two Electro Rain increments behind on Prizes in both seats',()=>{
  const {AttackAction}=native('game/store/actions/game-actions');
  for(const seat of [0,1]){
    const x=stage(seat);
    assert.equal(x.owner.prizes.length,6);
    assert.equal(x.opponent.prizes.length,5);
    assert.ok(x.owner.active.energies.cards.includes(x.counter));
    x.store.dispatch(new AttackAction(x.owner.id,'Electro Rain'));
    const prompts=settle(x);
    const actualDamage=x.opponent.active.damage;
    const physicallyDiscarded=x.owner.discard.cards.includes(x.counter);
    console.log('AGENT43_COUNTER_ELECTRORAIN_NATIVE',JSON.stringify({
      seat,prompts,actualDamage,physicallyDiscarded,
      ownerCounterAttached:x.owner.active.energies.cards.includes(x.counter),
      officialExpectedDamage:60,competitiveQualified:false
    }));
    assert.equal(actualDamage,60,
      'Official ruling requires two target choices for one Counter Energy');
    assert.equal(physicallyDiscarded,true,
      'One physical Counter Energy must move from owner Active to discard');
  }
});
