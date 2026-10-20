'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseNaturalEvolutionIntent,isNaturalStageStep}=
  require('../simulation/twinleaf/agent1-actor-evolution-frontier.cjs');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const stages={RESTORED:1,BASIC:2,STAGE_1:3,STAGE_2:4,VMAX:5,VSTAR:6};
const catalog={
 basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
 basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
 specialConditions:{ASLEEP:2,PARALYZED:0},stages,
 evolutions:new Map([
  ['Shadow Rider Calyrex VMAX CRE',{stage:5,evolvesFrom:'Shadow Rider Calyrex V',hasAbility:true}],
  ['Regidrago VSTAR SIT',{stage:6,evolvesFrom:'Regidrago V',hasAbility:true}],
  ['Garbodor BKP',{stage:3,evolvesFrom:'Trubbish',hasAbility:true}],
  ['Stage 2 Example',{stage:4,evolvesFrom:'Garbodor',hasAbility:false}]
 ])
};
const basic=(name,printing,stage,played=1)=>({
 name,printing,printed:{stage},lastPlayedOrEvolvedTurn:played,
 publicRestrictions:{cannotEvolveNextTurn:false},
 energies:[],attacks:[],specialConditions:[]
});
const view=()=>({
 decisionKind:'owner-root',globalTurn:3,
 ownHand:['Shadow Rider Calyrex VMAX CRE'],
 ownPublic:{
  active:basic('Trubbish','Trubbish FST',2),
  bench:[basic('Shadow Rider Calyrex V','Shadow Rider Calyrex V CRE',2),null,null,null,null],
  stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}
 },
 ownTurnResources:{
  pokemonPlayLocked:false,evolutionPlayLocked:false,abilityPokemonPlayLocked:false,
  energyPlayLocked:false,energyPlayedTurn:0
 }
});

test('normal V to VMAX Bench evolution is an owner-visible native-neutral action',()=>{
 const intent=chooseActorRootIntent(view(),catalog,{naturalEvolutionRoot:true});
 assert.deepEqual(intent,{
  kind:'evolve-pokemon',handIndex:0,
  printing:'Shadow Rider Calyrex VMAX CRE',slot:'bench',index:0,
  from:'Shadow Rider Calyrex V CRE'
 });
 assert.equal(chooseActorRootIntent(view(),catalog).kind,'pass');
});
test('natural-stage adjacency accepts Stage 1, Stage 2, VMAX, VSTAR only',()=>{
 assert.equal(isNaturalStageStep(2,5,stages),true);
 assert.equal(isNaturalStageStep(2,6,stages),true);
 assert.equal(isNaturalStageStep(2,3,stages),true);
 assert.equal(isNaturalStageStep(3,4,stages),true);
 assert.equal(isNaturalStageStep(2,4,stages),false);
 assert.equal(isNaturalStageStep(3,5,stages),false);
 assert.equal(isNaturalStageStep(4,2,stages),false);
});
test('turn chronology, play locks, ability lock and target lock fail closed',()=>{
 const first=view();first.globalTurn=2;
 assert.equal(chooseNaturalEvolutionIntent(first,catalog),null);
 const fresh=view();fresh.ownPublic.bench[0].lastPlayedOrEvolvedTurn=3;
 assert.equal(chooseNaturalEvolutionIntent(fresh,catalog),null);
 const unknown=view();delete unknown.ownPublic.bench[0].lastPlayedOrEvolvedTurn;
 assert.equal(chooseNaturalEvolutionIntent(unknown,catalog),null);
 const locked=view();locked.ownTurnResources.evolutionPlayLocked=true;
 assert.equal(chooseNaturalEvolutionIntent(locked,catalog),null);
 const lockedPokemon=view();lockedPokemon.ownTurnResources.pokemonPlayLocked=true;
 assert.equal(chooseNaturalEvolutionIntent(lockedPokemon,catalog),null);
 const lockedAbility=view();lockedAbility.ownTurnResources.abilityPokemonPlayLocked=true;
 assert.equal(chooseNaturalEvolutionIntent(lockedAbility,catalog),null);
 const blocked=view();blocked.ownPublic.bench[0].publicRestrictions.cannotEvolveNextTurn=true;
 assert.equal(chooseNaturalEvolutionIntent(blocked,catalog),null);
});
test('known Stage 2 does not leap over Stage 1 without a card effect',()=>{
 const v=view();v.ownHand=['Stage 2 Example'];
 v.ownPublic.bench[0]=basic('Garbodor','Garbodor BKP',3);
 assert.equal(chooseNaturalEvolutionIntent(v,catalog)?.printing,'Stage 2 Example');
 v.ownPublic.bench[0]=basic('Garbodor','Garbodor BKP',2);
 assert.equal(chooseNaturalEvolutionIntent(v,catalog),null);
 v.ownPublic.bench[0]=basic('Trubbish','Trubbish FST',2);
 assert.equal(chooseNaturalEvolutionIntent(v,catalog),null);
});
test('VSTAR direct evolution uses exactly visible predecessor and Active slot',()=>{
 const v=view();v.ownHand=['Regidrago VSTAR SIT'];
 v.ownPublic.active=basic('Regidrago V','Regidrago V SIT',2);
 v.ownPublic.bench=[null,null,null,null,null];
 assert.deepEqual(chooseNaturalEvolutionIntent(v,catalog),{
  kind:'evolve-pokemon',handIndex:0,printing:'Regidrago VSTAR SIT',
  slot:'active',index:0,from:'Regidrago V SIT'
 });
});

test('wrapper emits PlayCardAction with real target and witnesses the face-up stack',()=>{
 const printed=(name,stage)=>({
  fullName:name,name:name.replace(/ (CRE|SIT)$/,''),
  stage,hp:210,cardType:[5],retreat:[],weakness:[],resistance:[],
  attacks:[],powers:[]
 });
 const basicCard=printed('Shadow Rider Calyrex V CRE',2);
 const evolvedCard=printed('Shadow Rider Calyrex VMAX CRE',5);
 const slot=cards=>({
  cards,damage:0,specialConditions:[],tools:[],energies:{cards:[]},
  getPokemonCard(){return this.cards[this.cards.length-1]??null;},
  getPokemons(){return this.cards;}
 });
 const player=(id,hand)=>({
  id,active:slot([printed('Trubbish FST',2)]),
  bench:[slot([basicCard]),slot([]),slot([]),slot([]),slot([])],
  hand:{cards:hand},deck:{cards:[]},prizes:[],stadium:{cards:[]},
  discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]}
 });
 const state={phase:2,turn:3,activePlayer:0,prompts:[],
  players:[player(10,[evolvedCard]),player(20,[])]};
 class AddPlayerAction{}
 class PlayCardAction{
  constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
 }
 class AttackAction{constructor(id,name){Object.assign(this,{id,name});}}
 class PassTurnAction{constructor(id){this.id=id;}}
 class Store{
  constructor(){this.state=state;}
  dispatch(action){
   if(action instanceof PlayCardAction){
    assert.deepEqual(action.target,{player:0,slot:2,index:0});
    const owner=state.players[0];
    owner.bench[0].cards.push(owner.hand.cards.splice(action.handIndex,1)[0]);
   }
   return true;
  }
 }
 class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('no generic root');}
 }
 const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
 const oldDispatch=Store.prototype.dispatch;
 const result=withActorOnlyRootPolicy(()=>{
  const store=new Store();store.dispatch(new AddPlayerAction());
  store.dispatch(new SimpleTacticsAi(10).decodeNextAction(store.state));
  return store.state;
 },{
  Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:2,FINISHED:7},
  observe:()=>view(),getCatalog:()=>catalog,naturalEvolutionRoot:true,
  cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:1,BENCH:2}},
  gameActions:{AttackAction,PassTurnAction}
 });
 assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
 assert.strictEqual(Store.prototype.dispatch,oldDispatch);
 assert.equal(result.audit.nativePhysicalConfirmed,1);
 assert.equal(result.audit.acceptedActorRoots,1);
 assert.equal(result.audit.rejectedActorRoots,0);
 assert.equal(result.audit.typedIntentCounts['evolve-pokemon'],1);
 assert.equal(state.players[0].bench[0].getPokemonCard().fullName,
  'Shadow Rider Calyrex VMAX CRE');
});
