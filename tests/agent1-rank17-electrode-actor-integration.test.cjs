'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const ENERGY='Reversal Energy PAL';
const ELECTRODE={name:'Electrode-GX',printing:'Electrode-GX CES',
  abilities:['Extra Energy Bomb'],tools:[]};
const RAICHU={name:'Alolan Raichu',printing:'Alolan Raichu UNM',
  abilities:[],tools:[]};

/** Minimal Store and native bot fixtures testing the actual shared policy hook. */
function runCase(enabled){
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
  }
  class AttackAction{constructor(id,name){Object.assign(this,{id,name});}}
  class PassTurnAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        specialConditions:[],energies:{cards:[]},tools:[]});
      const player=id=>({id,active:empty(),
        bench:Array.from({length:5},empty),hand:{cards:[]},
        deck:{cards:[]},prizes:[],stadium:{cards:[]},discard:{cards:[]},
        lostzone:{cards:[]},supporter:{cards:[]}});
      this.state={players:[player(10),player(20)],
        activePlayer:0,turn:6,prompts:[],phase:2};
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Native hidden-state fallback not authorized');}
  }
  const priorBot=SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore=Store.prototype.dispatch;
  const detached={
    decisionKind:'owner-root',actorSeat:0,globalTurn:6,
    ownHand:[],
    ownPublic:{
      active:{name:'Pikachu',printing:'Pikachu XY',
        attacks:[],energies:[],abilities:[],tools:[],
        publicRestrictions:{},specialConditions:[]},
      bench:[ELECTRODE,RAICHU,null,null,null],
      discard:[ENERGY,ENERGY,ENERGY,ENERGY],
      stadium:[],deckCount:25,
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:null,bench:[],stadium:[]},
    ownTurnResources:{energyPlayLocked:false,energyPlayedTurn:0,
      pokemonPlayLocked:false,retreatedTurn:0,supporterPlayedTurn:0}
  };
  const catalog={
    basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
    basicEnergyTypes:{},colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}
  };
  const wrapped=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(10).decodeNextAction(store.state);
    assert.ok(action instanceof PassTurnAction);
    store.dispatch(action);
    return {actionKind:action.constructor.name};
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>Object.freeze(detached),getCatalog:()=>catalog,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction},
    rank17ElectrodeBombCensus:enabled
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorBot);
  assert.strictEqual(Store.prototype.dispatch,priorStore);
  return wrapped;
}
test('opt-in owner-root census observes four-card partial opportunity without changing native action',()=>{
  const disabled=runCase(false);
  const enabled=runCase(true);
  assert.deepEqual(disabled.result,enabled.result);
  assert.equal(disabled.audit.rank17ElectrodeBombCensus,undefined);
  const audit=enabled.audit.rank17ElectrodeBombCensus;
  assert.ok(audit);
  assert.equal(audit.ownerRootDecisions,1);
  assert.equal(audit.lineWithOneToFourDiscardEnergyRoots,1);
  assert.equal(audit.physicalNecessaryRoots,1);
  assert.deepEqual(audit.positiveRootIntentKinds,{pass:1});
  assert.equal(audit.sourceAbilityRootsActuallySelected,0);
  assert.equal(audit.competitivelyQualifiedGames,0);
  assert.equal(enabled.audit.competitiveGameQualified,false);
});

test('canonical option exposes only the opted-in root census without modifying result',()=>{
  const {withCanonicalActorOnlyPolicy}=require(
    '../simulation/evaluation/agent7-canonical-actor-composition.cjs');
  const cumulative={version:'unit-electrode',ownerRootDecisions:4,
    physicalNecessaryRoots:2,competitivelyQualifiedGames:0};
  const fake=(audit={})=>run=>({result:run(),audit});
  const adapters={
    root:fake({version:'root',selectedRootDecisions:4,
      rank17ElectrodeBombCensus:cumulative}),
    fog:fake({version:'fog'}),select:fake({version:'select'}),
    option:fake({version:'select-option'}),attack:fake({version:'attack'})
  };
  const noCensus=withCanonicalActorOnlyPolicy(()=>({value:9}),adapters);
  const withCensus=withCanonicalActorOnlyPolicy(
    ()=>({value:9}),adapters,{ownerElectrodeBombCensus:true});
  assert.deepEqual(noCensus.result,withCensus.result);
  assert.equal(noCensus.audit.ownerElectrodeBombCensusAudit,undefined);
  assert.strictEqual(withCensus.audit.ownerElectrodeBombCensusAudit,cumulative);
  assert.equal(withCensus.audit.ownerElectrodeBombCensusOptIn,true);
  assert.equal(withCensus.audit.qualification.competitiveGames,0);
});
