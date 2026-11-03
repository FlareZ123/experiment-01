'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  DITTO,ABILITY,ownerDittoStage1Receipt,
  chooseDittoStage1EvolutionIntent
}=require('../simulation/twinleaf/agent1-ditto-prism-actor-evolution.cjs');
const {
  chooseActorRootIntent,withActorOnlyRootPolicy
}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const STAGES={RESTORED:1,BASIC:2,STAGE_1:3,STAGE_2:4,VMAX:5,VSTAR:6};
const RAICHU='Alolan Raichu UNM';
const ELECTRODE='Electrode-GX CES';
const CAT={
  stages:STAGES,basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(),basicEnergyTypes:{Psychic:5},
  specialConditions:{ASLEEP:1,PARALYZED:2},
  evolutions:new Map([
    [RAICHU,{stage:STAGES.STAGE_1,evolvesFrom:'Pikachu',hasAbility:false}],
    [ELECTRODE,{stage:STAGES.STAGE_1,evolvesFrom:'Voltorb',hasAbility:true}],
    ['Stage 2 Example',{stage:STAGES.STAGE_2,evolvesFrom:'Stage 1 Example',
      hasAbility:false}]
  ])
};
function visible(printing=DITTO,played=1){
  return {printing,name:'Ditto Prism Star',printed:{stage:STAGES.BASIC},
    lastPlayedOrEvolvedTurn:played,
    abilities:[ABILITY],energies:[],attacks:[],tools:[],
    publicRestrictions:{cannotEvolveNextTurn:false},
    specialConditions:[]};
}
function view(){
  return {
    decisionKind:'owner-root',globalTurn:3,ownHand:[RAICHU],
    ownPublic:{active:visible(),bench:[null,null,null,null,null],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    ownTurnResources:{
      pokemonPlayLocked:false,evolutionPlayLocked:false,
      abilityPokemonPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:0
    }
  };
}
test('original rank17 Ditto may evolve via authenticated native Stage1 receipt only',()=>{
  const v=view();
  const receipt={activeAllowed:true,benchAllowed:[false,false,false,false,false]};
  assert.equal(chooseActorRootIntent(v,CAT).kind,'pass');
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,null),null);
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,
    {activeAllowed:false,benchAllowed:[]}),null);
  assert.deepEqual(chooseActorRootIntent(v,CAT,{
    dittoStage1Root:true,dittoStage1Receipt:receipt
  }),{
    kind:'evolve-pokemon',handIndex:0,printing:RAICHU,
    slot:'active',index:0,from:DITTO,
    sourceAbility:ABILITY,sourceDynamicStage1Verified:true,
    nativeEffectAndLocksVerified:false
  });
});
test('only actual Stage1, native-allowed named source, turn chronology and locks',()=>{
  const receipt={activeAllowed:true,benchAllowed:[]};
  const v=view();
  v.ownHand=['Stage 2 Example'];
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt),null);
  v.ownHand=[ELECTRODE];
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt)?.printing,ELECTRODE);
  v.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt),null);
  v.ownTurnResources.abilityPokemonPlayLocked=false;
  v.globalTurn=2;
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt),null);
  v.globalTurn=3;
  v.ownPublic.active.lastPlayedOrEvolvedTurn=3;
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt),null);
  v.ownPublic.active.lastPlayedOrEvolvedTurn=1;
  v.ownPublic.active.publicRestrictions.cannotEvolveNextTurn=true;
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt),null);
  v.ownPublic.active.publicRestrictions.cannotEvolveNextTurn=false;
  v.ownPublic.active.abilities=[];
  assert.equal(chooseDittoStage1EvolutionIntent(v,CAT,receipt),null);
});

test('owner native stage permission excludes face-down/foreign zones',()=>{
  const native=(name,allowed)=>({
    fullName:name,powers:[{name:ABILITY}],
    evolvesToStage:allowed?[STAGES.STAGE_1]:[],
  });
  const owner={
    active:{getPokemonCard:()=>native(DITTO,true)},
    bench:[
      {getPokemonCard:()=>native(DITTO,false)},
      {getPokemonCard:()=>native('Pikachu XY',true)}
    ]
  };
  Object.defineProperty(owner,'deck',{get(){
    throw Error('Native permission inspection cannot read owner deck');
  }});
  Object.defineProperty(owner,'prizes',{get(){
    throw Error('Native permission inspection cannot read owner Prizes');
  }});
  assert.deepEqual(ownerDittoStage1Receipt(owner,STAGES),{
    activeAllowed:true,benchAllowed:[false,false]
  });
});

test('actor root converts authenticated owner Ditto into actual native PlayCardAction',()=>{
  const source={
    fullName:DITTO,name:'Ditto Prism Star',stage:STAGES.BASIC,
    hp:40,cardType:[9],retreat:[],weakness:[],resistance:[],
    attacks:[],powers:[{name:ABILITY}],evolvesToStage:[STAGES.STAGE_1]
  };
  const evolution={
    fullName:RAICHU,name:'Alolan Raichu',stage:STAGES.STAGE_1,
    evolvesFrom:'Pikachu',hp:110,cardType:[3],retreat:[],
    weakness:[],resistance:[],attacks:[],powers:[]
  };
  const empty=()=>({cards:[],damage:0,specialConditions:[],
    tools:[],energies:{cards:[]},getPokemonCard(){return null;},
    getPokemons(){return this.cards;}});
  const occupied=card=>({
    cards:[card],damage:0,specialConditions:[],tools:[],
    energies:{cards:[]},pokemonPlayedTurn:1,
    getPokemonCard(){return this.cards[this.cards.length-1];},
    getPokemons(){return this.cards;}
  });
  const player=(id,active,hand)=>({
    id,active,bench:Array.from({length:5},empty),
    hand:{cards:hand},deck:{cards:[]},prizes:[],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]}
  });
  const state={phase:2,turn:3,activePlayer:0,prompts:[],
    players:[player(10,occupied(source),[evolution]),
      player(20,occupied({
        fullName:'Trubbish FST',name:'Trubbish',stage:STAGES.BASIC,
        cardType:[5],retreat:[],weakness:[],resistance:[],
        attacks:[],powers:[],hp:70
      }),[])]};
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
        assert.deepEqual(action.target,{player:0,slot:1,index:0});
        const owner=state.players[0];
        owner.active.cards.push(owner.hand.cards.splice(action.handIndex,1)[0]);
      }
      return true;
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('unqualified native fallback not requested');}
  }
  const original=Store.prototype.dispatch;
  const originalBot=SimpleTacticsAi.prototype.decodeNextAction;
  const observation=view();
  const output=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new SimpleTacticsAi(10).decodeNextAction(store.state));
    return store.state;
  },{
    Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>observation,getCatalog:()=>CAT,
    dittoStage1Root:true,
    cardActions:{
      PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:1,BENCH:2}
    },
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalBot);
  assert.equal(output.audit.dittoStage1RootOptIn,true);
  assert.equal(output.audit.typedIntentCounts['evolve-pokemon'],1);
  assert.equal(output.audit.acceptedActorRoots,1);
  assert.equal(output.audit.rejectedActorRoots,0);
  assert.equal(state.players[0].active.getPokemonCard().fullName,RAICHU);
});
