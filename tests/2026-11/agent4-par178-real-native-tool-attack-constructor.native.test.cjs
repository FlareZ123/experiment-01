'use strict';

// Real compiled pinned Twinleaf constructor contract. This file intentionally
// replaces a now-disproven artificial native-Tool-slot hook, and it should be
// run only when pinned vendor/twinleaf/ptcg-server/output is built. No CI
// dispatch or game is implied by checking it into the repository.
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=subpath=>require(path.join(ROOT,subpath));

const {Player}=native('game/store/state/player');
const {State}=native('game/store/state/state');
const {CheckPokemonAttacksEffect}=
  native('game/store/effects/check-effects');
const {Bunnelby}=native('sets/07-x-and-y/set-primal-clash/bunnelby');
const {TechnicalMachineEvolution}=
  native('sets/10-scarlet-and-violet/set-paradox-rift/technical-machine-evolution');
const {ActionEnumerator}=native('advanced-bot/action-enumerator');
const gameActions=native('game/store/actions/game-actions');
const cardActions=native('game/store/actions/play-card-action');
const {PokemonCard}=native('game/store/card/pokemon-card');
const {TrainerCard}=native('game/store/card/trainer-card');
const {EnergyCard}=native('game/store/card/energy-card');
const {Stage,TrainerType,SpecialCondition}=
  native('game/store/card/card-types');
const {PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {createKnownCapFreeActionEnumerator,EXPECTED_ENGINE_PIN}=
  require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');

const nativeDeps={ActionEnumerator,gameActions,cardActions,
  PokemonCard,TrainerCard,EnergyCard,Stage,TrainerType,SpecialCondition,
  PlayerType,SlotType};

function build(seat,attached){
  const state=new State();
  const actor=new Player();
  actor.id=100+seat;
  const foe=new Player();
  foe.id=101+seat;
  const bunnelby=new Bunnelby();
  const tm=new TechnicalMachineEvolution();
  actor.active.cards.push(bunnelby);
  if(attached)actor.active.tools.push(tm);
  state.players=seat===0?[actor,foe]:[foe,actor];
  state.activePlayer=seat;
  return {state,actor,bunnelby,tm};
}

for(const seat of [0,1]){
  test('seat '+seat+': native CheckPokemonAttacksEffect constructor preloads actual attached PAR178',()=>{
    const {actor,bunnelby,tm}=build(seat,true);
    assert.equal(actor.active.tools.includes(tm),true);
    assert.equal(bunnelby.tools.includes(tm),false,
      'printed PokemonCard.tools is not the attached Tool zone');
    const check=new CheckPokemonAttacksEffect(actor);
    assert.deepEqual(check.attacks,[tm.attacks[0]],
      'native constructor already supplies the actual Evolution attack');
    assert.equal(check.attacks[0].name,'Evolution');
  });

  test('seat '+seat+': native constructor omits unattached TM',()=>{
    const {actor,tm}=build(seat,false);
    assert.equal(actor.active.tools.includes(tm),false);
    const check=new CheckPokemonAttacksEffect(actor);
    assert.deepEqual(check.attacks,[]);
  });

  test('seat '+seat+': V3 Agent3 enumerator already supplies Tool-sourced real AttackAction',()=>{
    const {state,actor,tm}=build(seat,true);
    const adapted=createKnownCapFreeActionEnumerator({
      native:nativeDeps,enginePin:EXPECTED_ENGINE_PIN
    });
    const actions=adapted.attackActions(state,actor);
    const sourced=actions.filter(action=>action.name==='Evolution');
    assert.equal(sourced.length,1);
    assert.ok(sourced[0] instanceof gameActions.AttackAction);
    assert.deepEqual(sourced[0].__agent3AttackSource,{
      sourceKind:'active-tool',sourceSlot:'ACTIVE_TOOL',sourceIndex:0,
      sourceCardName:tm.name,sourceCardFullName:tm.fullName,
      attackName:'Evolution'
    });
    assert.equal(Object.getOwnPropertyDescriptor(sourced[0],
      '__agent3AttackSource').writable,false);
  });
}
