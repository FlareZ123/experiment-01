'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildActorCardCatalog,chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const P='Psychic Energy MEE',C=9;
const catalog={
  basics:new Set(),basicEnergies:new Set([P]),
  basicEnergyTypes:{Psychic:5},specialEnergies:new Set(),
  dragonPokemonPrintings:new Set(),ruleboxPokemonPrintings:new Set(),
  stages:{BASIC:0,STAGE_1:1,VMAX:5},colorlessEnergyType:C,
  specialConditions:{ASLEEP:1,PARALYZED:2,CONFUSED:3}
};
const restrictions=()=>({
  cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
  blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
  onlyAllowedAttackNameNextTurn:null,cannotRetreatNextTurn:false,
  cannotRetreatWhileActive:false
});
function view(){
  const active={
    printing:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',
    hp:320,damage:0,printed:{stage:5,types:[5],retreatCost:[C,C],resistance:[]},
    energies:[P,P],tools:[],specialConditions:[],abilityDetails:[],
    publicRestrictions:restrictions(),
    attacks:[{name:'Max Geist',cost:[C,C,C],damage:10,
      damageCalculation:null,gxAttack:false}]
  };
  const latias={
    printing:'Latias ex SSP',name:'Latias ex',hp:210,damage:0,
    printed:{stage:0,types:[5],retreatCost:[C,C],resistance:[]},
    energies:[P,P,P],tools:[],specialConditions:[],
    abilityDetails:[{name:'Skyliner',text:'Your Basic Pokémon in play have no Retreat Cost.'}],
    publicRestrictions:restrictions(),
    attacks:[{name:'Eon Blade',cost:[5,5,C],damage:200,
      damageCalculation:null,gxAttack:false}]
  };
  const defender={
    printing:'Combee OBF',name:'Combee',hp:50,damage:10,
    printed:{stage:0,types:[5],retreatCost:[C],resistance:[]},
    energies:[],tools:[],specialConditions:[],
    publicRestrictions:restrictions(),
    abilityDetails:[],
    attacks:[]
  };
  return {decisionKind:'owner-root',globalTurn:22,ownHand:['Float Stone BKT'],
    ownTurnResources:{retreatedTurn:0,toolPlayLocked:false},
    ownPublic:{active,bench:[latias],prizeCount:1,stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false,
        cannotUseGXAttacks:false,toolPlayLocked:false}},
    opponentPublic:{active:defender,bench:[],prizeCount:6,stadium:[]}};
}

test('v2 arbitration chooses a same-target free Float Stone before paying Psychic',()=>{
  const v=view();
  const choice=chooseActorRootIntent(v,catalog,{twoUnitPaidRetreatRootV2:true});
  assert.equal(choice?.kind,'attach-emergency-floatstone');
  assert.equal(choice?.benchIndex,0);
  assert.equal(choice?.targetAttackName,'Eon Blade');
  assert.equal(choice?.source,'agent42-paid-retreat-v2-floatstone-arbitration');
});

test('v2 selects paid Retreat when no safe held Float Stone route exists',()=>{
  const v=view();v.ownHand=[];
  const choice=chooseActorRootIntent(v,catalog,{twoUnitPaidRetreatRootV2:true});
  assert.equal(choice?.kind,'paid-retreat');
  assert.equal(choice?.source,'agent42-owner-two-unit-paid-retreat-v2');
  assert.equal(choice?.projectedTerminalWin,true);
  assert.deepEqual(choice?.discardEnergyIndices,[0,1]);
});

test('Tool Jammer or tool lock makes the free route unavailable, leaving paid KO line',()=>{
  const a=view();a.ownHand=['Float Stone BKT'];
  a.opponentPublic.active.tools=['Tool Jammer TEU'];
  assert.equal(chooseActorRootIntent(a,catalog,
    {twoUnitPaidRetreatRootV2:true})?.kind,'paid-retreat');
  const b=view();b.ownTurnResources.toolPlayLocked=true;
  assert.equal(chooseActorRootIntent(b,catalog,
    {twoUnitPaidRetreatRootV2:true})?.kind,'paid-retreat');
});

test('unused payable GX attack and nonlethal target veto the v2 paid branch',()=>{
  const a=view();
  a.ownPublic.active.attacks.push({
    name:'Shadow Storm-GX',gxAttack:true,cost:[5,5],damage:100,
    damageCalculation:null
  });
  assert.notEqual(chooseActorRootIntent(a,catalog,
    {twoUnitPaidRetreatRootV2:true})?.source,
    'agent42-owner-two-unit-paid-retreat-v2');
  const b=view();b.ownHand=[];b.opponentPublic.active.hp=240;
  assert.notEqual(chooseActorRootIntent(b,catalog,
    {twoUnitPaidRetreatRootV2:true})?.source,
    'agent42-owner-two-unit-paid-retreat-v2');
});

test('v2 is default-off and canonical native mapping still emits RetreatAction',()=>{
  const v=view();v.ownHand=[];
  assert.equal(chooseActorRootIntent(v,catalog)?.source,undefined);
  class AddPlayerAction{}
  class RetreatAction{
    constructor(clientId,benchIndex){Object.assign(this,{clientId,benchIndex});}
  }
  class PassTurnAction{}
  class AttackAction{}
  class PlayCardAction{}
  class SimpleTacticsAi{
    constructor(id=101){this.client={id};}
    decodeNextAction(){throw Error('hidden bot fallback must not run');}
  }
  const zone=()=>({cards:[]});
  const slot=()=>({cards:[],energies:zone(),tools:[],
    getPokemonCard:()=>undefined});
  const player=id=>({id,active:slot(),bench:[slot()],stadium:zone(),
    discard:zone(),lostzone:zone(),supporter:zone(),hand:zone(),
    deck:zone(),prizes:[]});
  class Store{
    constructor(activePlayer=0){this.state={turn:22,activePlayer,phase:2,
      players:[player(101),player(202)],prompts:[]};}
    dispatch(){return 'native-accepted';}
  }
  const beforeBot=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeStore=Store.prototype.dispatch;
  const result=withActorOnlyRootPolicy(()=>{
    let lastActionName=null;
    for(const [seat,playerId] of [[0,101],[1,202]]){
      const store=new Store(seat);store.dispatch(new AddPlayerAction());
      const action=new SimpleTacticsAi(playerId).decodeNextAction(store.state);
      assert.ok(action instanceof RetreatAction);
      assert.equal(action.benchIndex,0);
      store.dispatch(action);lastActionName=action.constructor.name;
    }
    return lastActionName;
  },{
    Store,SimpleTacticsAi,observe:(_state,seat)=>({...v,actorSeat:seat}),getCatalog:()=>catalog,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{RetreatAction,PassTurnAction,AttackAction},
    twoUnitPaidRetreatRootV2:true
  });
  assert.equal(result.result,'RetreatAction');
  assert.equal(result.audit.twoUnitPaidRetreatRootV2OptIn,true);
  assert.equal(result.audit.twoUnitPaidRetreatRootV2Selected,2);
  assert.deepEqual(result.audit.twoUnitPaidRetreatRootV2SelectedBySeat,[1,1]);
  assert.equal(result.audit.twoUnitPaidRetreatRootV2SelectedUnknownSeat,0);
  assert.equal(result.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeBot);
  assert.strictEqual(Store.prototype.dispatch,beforeStore);
});

test('pinned Twinleaf Confused enum reaches the live actor catalog',()=>{
  const base='../vendor/twinleaf/ptcg-server/output/game/store/card/';
  const {PokemonCard}=require(base+'pokemon-card');
  const {EnergyCard}=require(base+'energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition}=require(base+'card-types');
  const {PowerType}=require(base+'pokemon-types');
  assert.notEqual(SpecialCondition.CONFUSED,undefined);
  const actual=buildActorCardCatalog([],{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,SpecialCondition
  });
  assert.equal(actual.specialConditions.CONFUSED,SpecialCondition.CONFUSED);
});
