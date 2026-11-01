'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,chooseRagingBoltNominalKo}=
  require('../simulation/twinleaf/agent50-raging-bolt-nominal-ko.cjs');

const burst={name:'Burst Roar',damage:0,cost:[9]};
const thunder={name:'Bellowing Thunder',damage:70,
  damageCalculation:2,cost:[4,6]};
const basics=new Set([
  'Lightning Energy MEE','Fighting Energy MEE','Darkness Energy MEE'
]);
const catalog={basicEnergies:basics};

function view(){
  return {
    decisionKind:'owner-root',
    ownPublic:{
      active:{printing:'Raging Bolt ex TEF',
        energies:['Double Dragon Energy ROS','Lightning Energy MEE']},
      bench:[{printing:'Sandy Shocks ex PAR',
        energies:['Fighting Energy MEE']},null,null,null,null]
    },
    opponentPublic:{active:{hp:140,damage:0,tools:[]}},
    ownHand:[],
  };
}

test('rank-19 exact-print nominal 140 KO uses Basic on Active and Bench',()=>{
  assert.equal(VERSION,'agent50-raging-bolt-public-basic-energy-nominal-ko-v1');
  const proposal=chooseRagingBoltNominalKo(view(),[burst,thunder],catalog);
  assert.equal(proposal?.attackName,'Bellowing Thunder');
  assert.equal(proposal?.availableBasic,2);
  assert.equal(proposal?.requiredBasic,2);
  assert.equal(proposal?.nominalDamage,140);
});

test('Double Dragon is never counted as Basic for Bellowing Thunder damage',()=>{
  const v=view();
  v.opponentPublic.active.hp=210;
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog),null);
  v.ownPublic.bench[0].energies.push('Darkness Energy MEE');
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog).
    availableBasic,3);
});

test('printed nominal threshold uses remaining HP and ceiling',()=>{
  const v=view();
  v.opponentPublic.active.hp=210;
  v.opponentPublic.active.damage=70;
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog).
    requiredBasic,2);
  v.opponentPublic.active.damage=60;
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog),null);
});

test('wrong printing, missing attack or unpayable Bellowing preserves baseline',()=>{
  const v=view();
  v.ownPublic.active.printing='Raging Bolt ex XYZ';
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog),null);
  v.ownPublic.active.printing='Raging Bolt ex TEF';
  assert.equal(chooseRagingBoltNominalKo(v,[burst],catalog),null);
  assert.equal(chooseRagingBoltNominalKo(v,[thunder,burst],catalog),null);
});

test('missing or invalid visible board refuses to infer a knockout',()=>{
  const v=view();
  v.opponentPublic.active=null;
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog),null);
  v.opponentPublic.active={hp:140,damage:0};
  v.ownPublic.bench[0].energies=undefined;
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog),null);
  v.ownPublic.bench[0].energies=['Fighting Energy MEE'];
  v.opponentPublic.active.damage=140;
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog),null);
});

test('private opponent identities and card order cannot alter actor intent',()=>{
  const a=view(),b=view();
  a.hiddenOpponentHand=['Boss\'s Orders'];b.hiddenOpponentHand=['N'];
  a.hiddenOpponentPrizeOrder=[1,2];b.hiddenOpponentPrizeOrder=[2,1];
  assert.deepEqual(chooseRagingBoltNominalKo(a,[burst,thunder],catalog),
    chooseRagingBoltNominalKo(b,[burst,thunder],catalog));
});

test('policy never mutates detached actor observation or offered attacks',()=>{
  const v=view();
  Object.freeze(v.ownPublic.active.energies);
  Object.freeze(v.ownPublic.bench[0].energies);
  Object.freeze(v.ownPublic.bench);
  Object.freeze(v.ownPublic);
  Object.freeze(v.opponentPublic.active);
  Object.freeze(v);
  Object.freeze(burst);Object.freeze(thunder);
  assert.equal(chooseRagingBoltNominalKo(v,[burst,thunder],catalog).
    attackName,'Bellowing Thunder');
});

test('existing actor root changes one attack only when public threshold is met',()=>{
  const {chooseActorRootIntent}=
    require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=view();
  v.globalTurn=3;
  v.ownPublic.active.energies=['Lightning Energy MEE','Fighting Energy MEE'];
  v.ownPublic.active.attacks=[
    {...burst,cost:[9],damage:0},
    {...thunder,cost:[4,6],damage:70,damageCalculation:2}
  ];
  v.ownPublic.active.specialConditions=[];
  v.ownPublic.active.publicRestrictions={};
  v.ownPublic.publicTurnRestrictions={attackLockTurnsRemaining:0};
  v.ownTurnResources={energyPlayedTurn:3,energyPlayLocked:false,
    pokemonPlayLocked:false};
  const rootCatalog={...catalog,basics:new Set(),abilityBasics:new Set(),
    basicEnergyTypes:{Lightning:4,Fighting:6},
    colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}};
  assert.equal(chooseActorRootIntent(v,rootCatalog).attackName,'Burst Roar');
  assert.equal(chooseActorRootIntent(v,rootCatalog,
    {ragingBoltNominalKoRoot:true}).attackName,'Bellowing Thunder');
  // The fixture has THREE public Basic Energy, including one on the Bench.
  // 210 nominal damage is still payable; 211 HP requires a fourth card.
  v.opponentPublic.active.hp=211;
  assert.equal(chooseActorRootIntent(v,rootCatalog,
    {ragingBoltNominalKoRoot:true}).attackName,'Burst Roar');
});

test('reversible genuine wrapper forwards opt-in without altering disabled baseline',()=>{
  const {withActorOnlyRootPolicy}=
    require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=view();
  v.globalTurn=3;
  v.ownPublic.active.energies=['Lightning Energy MEE','Fighting Energy MEE'];
  v.ownPublic.active.attacks=[
    {...burst,cost:[9],damage:0},
    {...thunder,cost:[4,6],damage:70,damageCalculation:2}
  ];
  v.ownPublic.active.specialConditions=[];
  v.ownPublic.active.publicRestrictions={};
  v.ownPublic.publicTurnRestrictions={attackLockTurnsRemaining:0};
  v.ownTurnResources={energyPlayedTurn:3,energyPlayLocked:false,
    pokemonPlayLocked:false};
  const actorCatalog={...catalog,basics:new Set(),abilityBasics:new Set(),
    basicEnergyTypes:{Lightning:4,Fighting:6},
    colorlessEnergyType:9,specialConditions:{ASLEEP:2,PARALYZED:0}};
  const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]});
  const player=id=>({id,active:empty(),
    bench:Array.from({length:5},empty),hand:{cards:[]},
    deck:{cards:[]},prizes:[],stadium:{cards:[]},discard:{cards:[]},
    lostzone:{cards:[]},supporter:{cards:[]}});
  class AddPlayerAction{}
  class Store{
    constructor(){this.state={players:[player(10),player(20)],
      activePlayer:0,prompts:[],turn:3,phase:2};}
    dispatch(){return true;}
  }
  class AttackAction{
    constructor(id,name){this.clientId=id;this.name=name;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw new Error('Generic policy must never see root');}
  }
  const decode=SimpleTacticsAi.prototype.decodeNextAction;
  const dispatch=Store.prototype.dispatch;
  function choice(enabled){
    return withActorOnlyRootPolicy(()=>{
      const store=new Store();store.dispatch(new AddPlayerAction());
      const result=new SimpleTacticsAi(10).decodeNextAction(store.state);
      assert.ok(result instanceof AttackAction);
      return result.name;
    },{
      ragingBoltNominalKoRoot:enabled,
      SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
      observe:()=>v,getCatalog:()=>actorCatalog,
      cardActions:{PlayCardAction:class{},PlayerType:{BOTTOM_PLAYER:0},
        SlotType:{ACTIVE:1,BENCH:2}},
      gameActions:{AttackAction,PassTurnAction:class{}}
    });
  }
  const baseline=choice(false),enabled=choice(true);
  assert.equal(baseline.result,'Burst Roar');
  assert.equal(enabled.result,'Bellowing Thunder');
  assert.match(enabled.audit.version,/agent50-raging-bolt-public-basic-energy/);
  assert.doesNotMatch(baseline.audit.version,/agent50-raging-bolt/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
  assert.strictEqual(Store.prototype.dispatch,dispatch);
  assert.equal(baseline.audit.competitiveGameQualified,false);
  assert.equal(enabled.audit.competitiveGameQualified,false);
});
