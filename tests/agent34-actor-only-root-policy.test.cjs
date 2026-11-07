'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,publicDispatchState,withActorOnlyRootPolicy,
  actorNativeActionReceipt,bindActorNativeStoreOrdinal}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={
  basics:new Set(['Shadow Rider Calyrex V CRE','Trubbish FST']),
  abilityBasics:new Set(['Shadow Rider Calyrex V CRE']),
  basicEnergies:new Set(['Psychic Energy MEE','Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:5,Darkness:7},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
const base=()=>({
  decisionKind:'owner-root',globalTurn:2,
  ownHand:['Shadow Rider Calyrex V CRE','Psychic Energy MEE'],
  ownPublic:{
    active:{energies:[],attacks:[{name:'Shadow Mist',cost:[5],gxAttack:false}],
      specialConditions:[],publicRestrictions:{}},
    bench:[null,null,null,null,null],publicTurnRestrictions:{attackLockTurnsRemaining:0}
  },
  ownTurnResources:{
    energyPlayedTurn:0,energyPlayLocked:false,pokemonPlayLocked:false
  }
});

test('visible Basic bench precedes basic Energy',()=>{
  const intent=chooseActorRootIntent(base(),catalog);
  assert.deepEqual(intent,{kind:'bench-basic',handIndex:0,benchIndex:0,
    printing:'Shadow Rider Calyrex V CRE'});
});
test('Iron Thorns direct line offers typed Thunder Mountain public root',()=>{
  const view=base();
  view.ownHand=['Thunder Mountain Prism Star LOT'];
  view.ownPublic.active.name='Iron Thorns ex';
  view.ownPublic.stadium=[];
  view.ownTurnResources.stadiumPlayedTurn=0;
  view.ownTurnResources.stadiumPlayLocked=false;
  assert.deepEqual(chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true
  }),{
    kind:'play-thunder-mountain',handIndex:0,
    printing:'Thunder Mountain Prism Star LOT'
  });
});

test('Iron Thorns does not re-play opponent-visible same-name Stadium',()=>{
  const view=base();
  view.ownHand=['Thunder Mountain Prism Star LOT'];
  view.ownPublic.active.name='Iron Thorns ex';
  view.ownPublic.stadium=[];
  view.opponentPublic={stadium:['Thunder Mountain Prism Star LOT']};
  assert.equal(chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true
  }).kind,'pass','The opponent already has the same Stadium in play');
  view.opponentPublic.stadium=[];
  assert.equal(chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true
  }).kind,'play-thunder-mountain');
});

test('Energy then printed-cost attack follows the same actor-only view',()=>{
  const view=base();
  view.ownHand=['Psychic Energy MEE','Energy Retrieval SVI'];
  view.ownPublic.bench=[{},null,null,null,null];
  const energy=chooseActorRootIntent(view,catalog);
  assert.equal(energy.kind,'attach-basic-energy');
  assert.equal(energy.handIndex,0);
  view.ownHand=[];
  view.ownPublic.active.energies=['Psychic Energy MEE'];
  view.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(chooseActorRootIntent(view,catalog),{
    kind:'attack',attackName:'Shadow Mist'});
});
test('unsupported hand cards and attack restrictions fail to actor-only Pass',()=>{
  const view=base();
  view.ownHand=['Shadow Rider Calyrex VMAX CRE','Double Colorless Energy SUM'];
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
  view.ownHand=[];
  view.ownPublic.bench=[{},null,null,null,null];
  view.ownPublic.active.energies=['Psychic Energy MEE'];
  view.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
});
test('real Store accepts native typed root, with reversible hook restoration',()=>{
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{constructor(id,name){this.clientId=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.clientId=id;}}
  class Store{
    constructor(){
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        specialConditions:[],energies:{cards:[]},tools:[]});
      const player=id=>({id,active:empty(),bench:Array.from({length:5},empty),
        hand:{cards:[]},deck:{cards:[]},prizes:[],
        stadium:{cards:[]},discard:{cards:[]},
        lostzone:{cards:[]},supporter:{cards:[]}});
      this.state={players:[player(10),player(20)],
        activePlayer:0,prompts:[],turn:2,phase:2};
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Generic hidden-state root must not run');}
  }
  const priorBot=SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore=Store.prototype.dispatch;
  const view=base();
  view.ownHand=['Psychic Energy MEE'];
  view.ownPublic.bench=[{},null,null,null,null];
  const x=withActorOnlyRootPolicy(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(10).decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    assert.deepEqual(action.target,{player:0,slot:1,index:0});
    store.dispatch(action);
    return action;
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>Object.freeze(view),getCatalog:()=>catalog,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorBot);
  assert.strictEqual(Store.prototype.dispatch,priorStore);
  assert.equal(x.audit.selectedRootDecisions,1);
  assert.equal(x.audit.acceptedActorRoots,1);
  assert.equal(x.audit.nativePhysicalConfirmed,0);
  assert.equal(x.audit.nativePhysicalUnconfirmed,1,
    'A Store submission with no mutation remains an unconfirmed effect');
  assert.equal(x.audit.publicTransitionChanges,0);
  assert.equal(x.audit.rejectedActorRoots,0);
  assert.equal(x.audit.unsupportedPromptFallbacks,0);
  assert.equal(x.audit.competitiveGameQualified,false);
});
test('pending native prompt fallback counted and never qualified',()=>{
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return 'NATIVE_PROMPT_FALLBACK';}
  }
  class AddPlayerAction{}
  class Store{
    constructor(){this.state={players:[{id:10},{id:20}],
      activePlayer:0,turn:2,
      prompts:[{playerId:10,result:undefined}]};}
    dispatch(){}
  }
  const result=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi(10).decodeNextAction(store.state);
  },{
    SimpleTacticsAi,Store,observe:()=>base(),getCatalog:()=>catalog,
    cardActions:{PlayCardAction:class{},PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction:class{},PassTurnAction:class{}}
  });
  assert.equal(result.result,'NATIVE_PROMPT_FALLBACK');
  assert.equal(result.audit.unsupportedPromptFallbacks,1);
  assert.equal(result.audit.selectedRootDecisions,0);
  assert.equal(result.audit.competitiveGameQualified,false);
});

test('numeric native colored and colorless attacks use numeric energy costs',()=>{
  for(const cost of [[5],[9],[5,9]]){
    const view=base();
    view.ownHand=[];
    view.ownPublic.bench=[{},null,null,null,null];
    view.ownPublic.active.energies=cost.length===2?['Psychic Energy MEE','Psychic Energy MEE']:['Psychic Energy MEE'];
    view.ownPublic.active.attacks=[{name:'Paid Attack',cost,gxAttack:false}];
    view.ownTurnResources.energyPlayedTurn=2;
    assert.equal(chooseActorRootIntent(view,catalog).kind,'attack');
  }
});

test('numeric native Asleep and Paralyzed prevent a payable attack',()=>{
  for(const status of [catalog.specialConditions.ASLEEP,catalog.specialConditions.PARALYZED]){
    const view=base();
    view.ownHand=[];
    view.ownPublic.bench=[{},null,null,null,null];
    view.ownPublic.active.energies=['Psychic Energy MEE'];
    view.ownPublic.active.specialConditions=[status];
    view.ownTurnResources.energyPlayedTurn=2;
    assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
  }
});

/**
 * Test only public Twinleaf-shaped zones. The opponent's concealed card
 * identities must never enter the native Store action witness.
 */
test('native root witness hashes public transitions without reading hidden card identities',()=>{
  const held=fullName=>({fullName});
  const activeCard={
    fullName:'Shadow Rider Calyrex V CRE',name:'Shadow Rider Calyrex V',
    hp:210,stage:2,cardType:[5],retreat:[9],weakness:[],resistance:[],
    attacks:[],powers:[]
  };
  const active=()=>({
    getPokemonCard:()=>activeCard,cards:[activeCard],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]
  });
  const empty=()=>({
    getPokemonCard:()=>null,cards:[],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]
  });
  const player=()=>({
    active:active(),bench:Array.from({length:5},empty),
    hand:{cards:[held('One concealed card')]},
    deck:{cards:[held('Secret first card')]},prizes:[{cards:[held('Prize card')]}],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]}
  });
  const state={turn:2,activePlayer:0,phase:3,players:[player(),player()]};
  const before=publicDispatchState({state});
  assert.equal(before.handCounts[1],1);
  assert.equal(before.attachedEnergyCounts[0],0);
  state.players[1].hand.cards[0]=held('Different concealed card');
  state.players[0].deck.cards[0]=held('Different unknown deck card');
  state.players[0].prizes[0].cards[0]=held('Different unknown Prize');
  assert.equal(publicDispatchState({state}).publicZonesSha256,
    before.publicZonesSha256,'unknown card identities must be omitted');
  state.players[0].active.energies.cards.push(held('Psychic Energy MEE'));
  const after=publicDispatchState({state});
  assert.notEqual(after.publicZonesSha256,before.publicZonesSha256);
  assert.deepEqual(after.attachedEnergyCounts,[1,0]);
  assert.deepEqual(after.activePrintings,
    ['Shadow Rider Calyrex V CRE','Shadow Rider Calyrex V CRE']);
  state.turn=3;
  const advanced=publicDispatchState({state});
  assert.equal(advanced.turn,3);
  assert.equal(advanced.publicZonesSha256,after.publicZonesSha256);
  assert.equal(publicDispatchState({state:null}),null);
});

test('actual Store wrapper attests an accepted owner Basic Energy zone mutation',()=>{
  const card=fullName=>({fullName,name:fullName,hp:210,
    stage:2,cardType:[5],retreat:[],weakness:[],resistance:[],
    attacks:[{name:'Shadow Mist',cost:[5]}],powers:[]});
  const pokemon=card('Shadow Rider Calyrex V CRE');
  const occupied=()=>({
    getPokemonCard:()=>pokemon,cards:[pokemon],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]
  });
  const empty=()=>({
    getPokemonCard:()=>null,cards:[],damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]
  });
  const player=(id,held)=>({
    id,active:occupied(),bench:[occupied(),...Array.from({length:4},empty)],
    hand:{cards:held.map(card)},deck:{cards:[]},prizes:[],
    stadium:{cards:[]},discard:{cards:[]},
    lostzone:{cards:[]},supporter:{cards:[]}
  });
  const state={players:[player(10,['Psychic Energy MEE']),player(20,[])],
    activePlayer:0,turn:2,phase:2,prompts:[]};
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action instanceof PlayCardAction){
        const owner=this.state.players.find(p=>p.id===action.id);
        const energy=owner.hand.cards.splice(action.handIndex,1)[0];
        owner.active.energies.cards.push(energy);
      }
      return true;
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw new Error('Hidden-State generic root used');}
  }
  const view=base();
  view.ownHand=['Psychic Energy MEE'];
  view.ownPublic.bench=[{},null,null,null,null];
  const actual=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const intentAction=new SimpleTacticsAi(10).decodeNextAction(state);
    assert.ok(intentAction instanceof PlayCardAction);
    store.dispatch(intentAction);
    assert.throws(()=>new SimpleTacticsAi(10).decodeNextAction({...state}),
      /Hidden-State generic root used/,
      'Speculative clone must never receive actor-only native root');
    return store.state;
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>view,getCatalog:()=>catalog,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:2},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.equal(actual.audit.acceptedActorRoots,1);
  assert.equal(actual.audit.publicTransitionWitnesses,1);
  assert.equal(actual.audit.publicTransitionChanges,1);
  assert.equal(actual.audit.nativePhysicalConfirmed,1);
  assert.equal(actual.audit.nonLiveSpeculativeFallbacks,1);
  assert.equal(actual.audit.nativePhysicalUnconfirmed,0);
  assert.equal(actual.audit.nativeRootAcceptances[0].nativePhysicalEffect,
    'confirmed-public-effect');
  assert.deepEqual(state.players[0].active.energies.cards.map(x=>x.fullName),
    ['Psychic Energy MEE']);
  assert.equal(state.players[0].hand.cards.length,0);
});

test('public Ability-Basic hand lock skips Ability Pokémon and permits other Basic',()=>{
  const view=base();
  view.ownHand=['Shadow Rider Calyrex V CRE','Trubbish FST'];
  view.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.deepEqual(chooseActorRootIntent(view,catalog),{
    kind:'bench-basic',handIndex:1,benchIndex:0,printing:'Trubbish FST'
  });
  view.ownHand=['Shadow Rider Calyrex V CRE'];
  assert.notEqual(chooseActorRootIntent(view,catalog).kind,'bench-basic');
  view.ownTurnResources.abilityPokemonPlayLocked=false;
  assert.deepEqual(chooseActorRootIntent(view,catalog),{
    kind:'bench-basic',handIndex:0,benchIndex:0,
    printing:'Shadow Rider Calyrex V CRE'
  });
});

test('lossless actor policy ordinal ties to physical headless Store clock',()=>{
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{constructor(id,name){this.id=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        specialConditions:[],energies:{cards:[]},tools:[]});
      const player=id=>({id,active:empty(),bench:Array.from({length:5},empty),
        hand:{cards:[]},deck:{cards:[]},prizes:[],
        stadium:{cards:[]},discard:{cards:[]},
        lostzone:{cards:[]},supporter:{cards:[]}});
      this.state={players:[player(10),player(20)],
        activePlayer:0,prompts:[],turn:2,phase:2};
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Generic hidden-state root must not run');}
  }
  const priorBot=SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore=Store.prototype.dispatch;
  const view=base();
  view.ownHand=['Psychic Energy MEE'];
  view.ownPublic.bench=[{},null,null,null,null];
  const played=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(10).decodeNextAction(store.state);
    const tagged=actorNativeActionReceipt(action);
    assert.equal(tagged.seat,0);
    assert.equal(tagged.policyDecisionOrdinal,1);
    assert.equal(tagged.nativeStoreActionOrdinal,undefined);
    const tied=bindActorNativeStoreOrdinal(action,17,0);
    assert.equal(tied.nativeStoreActionOrdinal,17);
    store.dispatch(action);
    return action;
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>view,getCatalog:()=>catalog,losslessNativeRootJoin:true,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorBot);
  assert.strictEqual(Store.prototype.dispatch,priorStore);
  assert.equal(played.audit.selectedRootDecisions,1);
  assert.equal(played.audit.acceptedActorRoots,1);
  assert.equal(played.audit.nativeRootJoinTruncated,false);
  assert.deepEqual(played.audit.nativeRootJoinReceipts.map(r=>({
    seat:r.seat,actor:r.policyDecisionOrdinal,store:r.nativeStoreActionOrdinal,
    accepted:r.accepted,kind:r.kind
  })),[{seat:0,actor:1,store:17,accepted:true,
    kind:'attach-basic-energy'}]);
  const unrelated=new PlayCardAction(10,0,{});
  assert.equal(actorNativeActionReceipt(unrelated),null);
  assert.equal(bindActorNativeStoreOrdinal(unrelated,17,0),null);
  assert.throws(()=>bindActorNativeStoreOrdinal(played.result,18,1));
});

test('generic Float Stone opt-in reaches the native actor root, not only the audit',()=>{
  const darkness='Darkness Energy MEE';
  const ownerView={
    decisionKind:'owner-root',globalTurn:12,
    ownHand:['Float Stone BKT'],
    ownTurnResources:{
      retreatedTurn:10,toolPlayLocked:false,
      energyPlayedTurn:12,pokemonPlayLocked:false
    },
    ownPublic:{
      active:{
        printing:'Mega Absol ex M1L',
        printed:{stage:0,types:[7],retreatCost:[9,9]},
        energies:[darkness],tools:[],
        attacks:[{name:'Claw of Darkness',damage:200,cost:[7,7,9]}],
        publicRestrictions:{},specialConditions:[]
      },
      bench:[{
        printing:'Mega Absol ex M1L',
        printed:{stage:0,types:[7],retreatCost:[9,9]},
        energies:[darkness,darkness,darkness],tools:[],
        attacks:[{name:'Claw of Darkness',damage:200,cost:[7,7,9]}],
        publicRestrictions:{},specialConditions:[]
      }],
      stadium:[],publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Iron Thorns ex TWM',tools:[]},
      bench:[],stadium:[]
    }
  };
  const actorCatalog={
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set([darkness]),specialEnergies:new Set(),
    basicEnergyTypes:{Darkness:7},colorlessEnergyType:9,
    specialConditions:{ASLEEP:1,PARALYZED:2},
    dragonPokemonPrintings:new Set()
  };
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AddPlayerAction{}
  class PassTurnAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        energies:{cards:[]},tools:[],specialConditions:[]});
      const player=id=>({
        id,active:empty(),bench:Array.from({length:5},empty),
        hand:{cards:[]},deck:{cards:[]},prizes:[],
        stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
        supporter:{cards:[]}
      });
      this.state={
        players:[player(10),player(20)],turn:12,activePlayer:0,
        phase:2,prompts:[]
      };
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction(this.client.id);}
  }
  function run(enabled){
    return withActorOnlyRootPolicy(()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      const action=new SimpleTacticsAi(10).decodeNextAction(store.state);
      store.dispatch(action);
      return action;
    },{
      genericFundedFloatStoneRoot:enabled,
      SimpleTacticsAi,Store,observe:()=>ownerView,
      getCatalog:()=>actorCatalog,
      GamePhase:{PLAYER_TURN:2,FINISHED:7},
      cardActions:{
        PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
        SlotType:{ACTIVE:1,BENCH:2}
      },
      gameActions:{
        AttackAction:class{},PassTurnAction,
        RetreatAction:class{},UseAbilityAction:class{}
      }
    });
  }
  const control=run(false);
  const treatment=run(true);
  assert.ok(control.result instanceof PassTurnAction);
  assert.ok(treatment.result instanceof PlayCardAction);
  assert.equal(treatment.result.handIndex,0);
  assert.deepEqual(treatment.result.target,{
    player:0,slot:1,index:0
  });
  assert.equal(control.audit.genericFundedFloatStoneRootOptIn,false);
  assert.equal(treatment.audit.genericFundedFloatStoneRootOptIn,true);
  assert.equal(treatment.audit.selectedRootDecisions,1);
  assert.equal(treatment.audit.competitiveGameQualified,false);
});


const naturalEvolutionCatalog={
  ...catalog,
  evolutions:new Map([['Garbodor BKP',{
    evolvesFrom:'Trubbish',stage:2,hasAbility:true
  }]]),
  stages:{BASIC:1,STAGE_1:2,STAGE_2:3,RESTORED:4,VMAX:5,VSTAR:6}
};
function garbodorView(actorSeat){
  const view=base();
  view.actorSeat=actorSeat;
  view.globalTurn=15;
  view.ownHand=['Garbodor BKP'];
  view.ownPublic.bench=[
    {name:'Trubbish',printing:'Trubbish FST',
      lastPlayedOrEvolvedTurn:9,printed:{stage:1},publicRestrictions:{}},
    {},{},{},{}
  ];
  view.ownTurnResources={
    ...view.ownTurnResources,
    pokemonPlayLocked:false,evolutionPlayLocked:false,
    abilityPokemonPlayLocked:false
  };
  return view;
}

test('natural evolution root is bilateral when its owner-seat filter is null',()=>{
  for(const seat of [0,1]){
    assert.equal(chooseActorRootIntent(
      garbodorView(seat),naturalEvolutionCatalog,
      {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:null}
    ).kind,'evolve-pokemon');
  }
});
test('natural evolution root can be scoped to physical source seat zero',()=>{
  const expected={
    kind:'evolve-pokemon',handIndex:0,printing:'Garbodor BKP',
    slot:'bench',index:0,from:'Trubbish FST'
  };
  assert.deepEqual(chooseActorRootIntent(
    garbodorView(0),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:0}
  ),expected);
  assert.equal(chooseActorRootIntent(
    garbodorView(1),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:0}
  ).kind,'pass');
});
test('natural evolution root can be scoped to physical candidate seat one',()=>{
  assert.equal(chooseActorRootIntent(
    garbodorView(0),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:1}
  ).kind,'pass');
  assert.equal(chooseActorRootIntent(
    garbodorView(1),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:1}
  ).kind,'evolve-pokemon');
});
test('invalid natural evolution owner seat is rejected and missing actor seat fails closed',()=>{
  assert.throws(()=>chooseActorRootIntent(
    garbodorView(0),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:2}
  ),/naturalEvolutionRootOwnerSeat/);
  assert.equal(chooseActorRootIntent(
    garbodorView(undefined),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,naturalEvolutionRootOwnerSeat:0}
  ).kind,'pass');
});
