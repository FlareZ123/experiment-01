'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {choosePublicContextSpecialEnergy}=require('./agent17-public-context-special-energy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=require('./agent5-owner-root-slice.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));
const ENERGY='Double Dragon Energy ROS',ATTACK='Gnaw';

/** @param {0|1} seat @returns {object} Genuine pinned Store in fixed staged position. */
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=1;
  const card=name=>{const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned card '+name);c.id=id++;return c;};
  const owner=new Player(),opponent=new Player();
  owner.id=111;opponent.id=222;
  owner.active.cards.push(card('Venonat MEW'));
  const psychic=card('Psychic Energy SVE');
  owner.active.cards.push(psychic);
  owner.active.energies.cards.push(psychic);
  for(let i=0;i<5;i++)owner.bench.push(new PokemonCardList());
  owner.bench[1].cards.push(card('Regidrago V SIT'));
  owner.hand.cards.push(card(ENERGY));
  opponent.active.cards.push(card('Pidgey MEW'));
  for(let i=0;i<5;i++)opponent.bench.push(new PokemonCardList());
  for(const p of [owner,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));p.prizes.push(prize);}
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=2;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const t={PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType};
  const catalog=buildActorCardCatalog(manager.getAllCards(),t);
  return {store,state,owner,opponent,seat,catalog,GamePhase};
}

/** @param {object} x @returns {object} Native attack with settled damage. */
function nativeAttack(x){
  const {AttackAction}=native('game/store/actions/game-actions');
  const damage=x.opponent.active.damage;
  x.store.dispatch(new AttackAction(x.owner.id,ATTACK));
  assert.ok(x.opponent.active.damage>damage,'Attack must settle real damage');
  assert.ok(x.state.turn>2||x.state.activePlayer!==x.seat||
    x.state.phase!==x.GamePhase.PLAYER_TURN,
    'Attack must end the current owner root');
  return {damageBefore:damage,damageAfter:x.opponent.active.damage,
    turn:x.state.turn,phase:x.state.phase,activeSeat:x.state.activePlayer};
}

/** @param {0|1} seat @returns {object} Two forks from same owner-visible root. */
function pairedNativeDecision(seat){
  const a=stage(seat),b=stage(seat);
  const av=actorObservation(a.state,seat),bv=actorObservation(b.state,seat);
  assert.deepEqual(av,bv,'Initial owner-visible root must match');
  const options={publicContextSpecialEnergy:true};
  const chosen=chooseActorRootIntent(av,a.catalog,options);
  assert.deepEqual(chosen,{kind:'attack',attackName:ATTACK});
  const alternative=choosePublicContextSpecialEnergy(bv,b.catalog);
  assert.deepEqual(alternative,{kind:'attach-special-energy',
    printing:ENERGY,handIndex:0,slot:'bench',index:1});
  const first=nativeAttack(a);
  assert.equal(a.owner.hand.cards[0].fullName,ENERGY);
  assert.equal(a.owner.bench[1].energies.cards.length,0);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const pre=rootPhysicalSnapshot(b.state,seat,alternative);
  b.store.dispatch(new PlayCardAction(b.owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1}));
  const post=rootPhysicalSnapshot(b.state,seat,alternative);
  assert.equal(rootPhysicalWitness(alternative,pre,post,b.GamePhase),
    'confirmed-public-effect');
  assert.deepEqual(b.owner.bench[1].energies.cards.map(c=>c.fullName),[ENERGY]);
  assert.equal(b.owner.hand.cards.length,0);
  assert.equal(b.state.turn,2);
  assert.equal(b.state.activePlayer,seat);
  assert.equal(b.store.hasPrompts(),false);
  const remaining=chooseActorRootIntent(actorObservation(b.state,seat),
    b.catalog,options);
  assert.deepEqual(remaining,{kind:'attack',attackName:ATTACK});
  const second=nativeAttack(b);
  assert.equal(first.damageAfter,second.damageAfter);
  return {seat,sameOwnerVisibleStart:true,chosen,alternative,
    attackFirst:first,attachThenAttack:second,
    alternateBenchEnergy:b.owner.bench[1].energies.cards.map(c=>c.fullName),
    attachedNative:true,sharedAttackSettled:true};
}
function run(){
  return {schema:'agent5-staged-priority-fork-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registration:'results/aichi-2026/registrations/agent5-staged-attack-special-arbitration-20261029.md',
    records:[pairedNativeDecision(0),pairedNativeDecision(1)],
    competitiveQualifiedGames:0,
    caveat:'Staged native decision; neither natural-deal frequency nor relative competitive utility.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stage,nativeAttack,pairedNativeDecision,run};
