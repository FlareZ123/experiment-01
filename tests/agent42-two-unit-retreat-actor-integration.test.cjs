'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const PSY='Psychic Energy MEE';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const C=9,P=5;
const catalog={
  basics:new Set(),
  basicEnergies:new Set([PSY]),
  basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
  specialConditions:{ASLEEP:1,PARALYZED:2}
};
const pokemon=count=>({
  printing:VMAX,name:'Shadow Rider Calyrex VMAX',damage:0,
  printed:{stage:1,types:[P],retreatCost:[C,C]},
  energies:Array(count).fill(PSY),tools:[],specialConditions:[],
  publicRestrictions:{},
  attacks:[{name:'Max Geist',cost:[C,C,C],damage:10}]
});
function view(){
  return {decisionKind:'owner-root',globalTurn:34,ownHand:['Float Stone BKT'],
    ownTurnResources:{retreatedTurn:0,energyPlayedTurn:34,
      pokemonPlayLocked:false,energyPlayLocked:false},
    ownPublic:{active:pokemon(2),bench:[pokemon(3),pokemon(2)],
      prizeCount:6,stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{printing:'Lunatone OBF',damage:10,
      printed:{hp:90},energies:[],tools:[]},bench:[],
      prizeCount:6,stadium:[]}
  };
}
test('default-off canonical original rank1 keeps existing funded Float Stone root',()=>{
  const v=view();
  const baseline=chooseActorRootIntent(v,catalog,
    {fundedVmaxFloatStoneRoot:true});
  assert.equal(baseline?.kind,'attach-emergency-floatstone');
});
test('optional two-Card Retreat outranks Tool only with public payable fee',()=>{
  const v=view();
  const choice=chooseActorRootIntent(v,catalog,{
    fundedVmaxFloatStoneRoot:true,twoUnitPaidRetreatRoot:true
  });
  assert.equal(choice?.kind,'paid-retreat');
  assert.equal(choice?.source,'agent42-owner-two-unit-paid-retreat-v1');
  assert.deepEqual(choice?.discardEnergyIndices,[0,1]);
  assert.equal(choice?.projectedPrintedDamage,160);
  assert.equal(choice?.benchIndex,0);
  assert.equal(choice?.nativeStorePaymentVerified,false);
});
test('optional two-unit paper proposal fails closed for one Active Psychic',()=>{
  const v=view();
  v.ownPublic.active.energies=[PSY];
  const choice=chooseActorRootIntent(v,catalog,
    {twoUnitPaidRetreatRoot:true});
  assert.notEqual(choice?.source,'agent42-owner-two-unit-paid-retreat-v1');
});
test('default-off root intent is symmetric across player-seat independent view',()=>{
  const v=view();v.actorSeat=0;
  const a=chooseActorRootIntent(v,catalog,
    {twoUnitPaidRetreatRoot:true});
  v.actorSeat=1;
  const b=chooseActorRootIntent(v,catalog,
    {twoUnitPaidRetreatRoot:true});
  assert.deepEqual(a,b);
});
test('genuine native-neutral canonical root maps opt-in payment to RetreatAction',()=>{
  class AddPlayerAction{}
  class RetreatAction{
    constructor(clientId,benchIndex){
      Object.assign(this,{clientId,benchIndex});
    }
  }
  class PassTurnAction{}
  class AttackAction{}
  class PlayCardAction{}
  class SimpleTacticsAi{
    constructor(){this.client={id:101};}
    decodeNextAction(){throw Error('Must not fall back to hidden bot');}
  }
  // Native-root dispatch auditing calls publicPlayer for each seat.
  // Synthetic players need the native-visible zone shape even though this
  // test exercises only action mapping, not physical Retreat settlement.
  const zone=()=>({cards:[]});
  const slot=()=>({cards:[],energies:zone(),tools:[],
    getPokemonCard:()=>undefined});
  const player=id=>({
    id,active:slot(),bench:[slot()],
    stadium:zone(),discard:zone(),lostzone:zone(),supporter:zone(),
    hand:zone(),deck:zone(),prizes:[]
  });
  class Store{
    constructor(){this.state={turn:34,activePlayer:0,phase:2,
      players:[player(101),player(202)],prompts:[]};}
    dispatch(){return 'native-accepted';}
  }
  const beforeBot=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeStore=Store.prototype.dispatch;
  const result=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi().decodeNextAction(store.state);
    assert.ok(action instanceof RetreatAction);
    assert.equal(action.clientId,101);
    assert.equal(action.benchIndex,0);
    store.dispatch(action);
    return action.constructor.name;
  },{
    Store,SimpleTacticsAi,
    observe:()=>view(),getCatalog:()=>catalog,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{RetreatAction,PassTurnAction,AttackAction},
    twoUnitPaidRetreatRoot:true
  });
  assert.equal(result.result,'RetreatAction');
  assert.equal(result.audit.twoUnitPaidRetreatRootOptIn,true);
  assert.equal(result.audit.twoUnitPaidRetreatRootSelected,1);
  assert.equal(result.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeBot);
  assert.strictEqual(Store.prototype.dispatch,beforeStore);
});
