'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicSpecialAttackPayable}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));

/** @param {0|1} seat @returns {object} Original printed CardManager and Store. */
function originalDragon(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=90000;
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned original printing missing: '+name);
    found.id=id++;
    return found;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=121;opponent.id=222;
  owner.active.cards.push(card('Regidrago V SIT'));
  const fire=card('Fire Energy SVE');
  owner.active.cards.push(fire);
  owner.active.energies.cards.push(fire);
  owner.hand.cards.push(card('Grass Energy SVE'),
    card('Double Dragon Energy ROS'));
  opponent.active.cards.push(card('Pidgey MEW'));
  for(const p of [owner,opponent]){
    for(let i=0;i<5;i++)p.bench.push(new PokemonCardList());
    for(let i=0;i<10;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const types={
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),types);
  return {store,state,owner,opponent,seat,catalog};
}

/** @param {object} staged @returns {object} Actual Energy and subsequent native damage. */
function nativeContestedEnergy(staged){
  const {store,state,owner,opponent,seat,catalog}=staged;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const v=actorObservation(state,seat);
  const baseline=chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true});
  assert.equal(baseline.kind,'attach-basic-energy');
  assert.equal(baseline.printing,'Grass Energy SVE');
  const chosen=chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true,publicFlexibleEnergyContest:true});
  assert.deepEqual(chosen,{kind:'attach-special-energy',handIndex:1,
    printing:'Double Dragon Energy ROS',slot:'active',index:0});
  const attackBefore=v.ownPublic.active.attacks.find(a=>
    a.name==='Dragon Laser');
  assert.ok(attackBefore,'Original Regidrago V must print Dragon Laser');
  assert.equal(publicSpecialAttackPayable(v,catalog,
    v.ownPublic.active,attackBefore),false);

  const timeBefore=state.turn;
  store.dispatch(new PlayCardAction(owner.id,chosen.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(owner.active.energies.cards.some(c=>
    c.fullName==='Double Dragon Energy ROS'));
  assert.equal(owner.hand.cards.length,1);
  assert.equal(owner.hand.cards[0].fullName,'Grass Energy SVE');
  assert.equal(state.turn,timeBefore);
  assert.equal(state.activePlayer,seat);
  const afterward=actorObservation(state,seat);
  const attack=afterward.ownPublic.active.attacks.find(a=>
    a.name==='Dragon Laser');
  assert.equal(publicSpecialAttackPayable(afterward,catalog,
    afterward.ownPublic.active,attack),true);
  const next=chooseActorRootIntent(afterward,catalog,{
    publicContextSpecialEnergy:true,publicFlexibleEnergyContest:true});
  assert.deepEqual(next,{kind:'attack',attackName:'Dragon Laser'});
  const hpBefore=opponent.active.damage;
  store.dispatch(new AttackAction(owner.id,'Dragon Laser'));
  const prompts=[];
  for(let i=0;i<12;i++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    prompts.push(pending.constructor.name);
    assert.equal(pending.constructor.name,'WaitPrompt',
      'Native Dragon Laser should have only mandatory animation prompts');
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(store.hasPrompts(),false);
  assert.ok(opponent.active.damage>hpBefore,
    'Double Dragon choice must result in real printed attack damage');
  return {seat,nativeSpecialAttached:true,afterEnergyRoot:next.kind,
    attackName:next.attackName,damageBefore:hpBefore,
    damageAfter:opponent.active.damage,prompts,
    ownerTurnBefore:timeBefore,ownerTurnAfter:state.turn};
}

test('rank10 original Regidrago V mixed Basic/Double Dragon contest truly settles on both seats',()=>{
  for(const seat of [0,1]){
    const evidence=nativeContestedEnergy(originalDragon(seat));
    assert.equal(evidence.nativeSpecialAttached,true);
    assert.equal(evidence.attackName,'Dragon Laser');
    assert.ok(evidence.damageAfter>0);
    process.stdout.write('# FLEXIBLE_CONTEST_NATIVE '+
      JSON.stringify(evidence)+'\n');
  }
});
module.exports={originalDragon,nativeContestedEnergy};
