'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,publicDispatchState,withActorOnlyRootPolicy,
  invokeActorRootIntentProvider,actorNativeActionReceipt,bindActorNativeStoreOrdinal}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {withCandidateOpponentPolicyRoles}=require('../simulation/twinleaf/agent44-role-scoped-policy-composition.cjs');
let pinnedStateUtils=null,pinnedPlayerType=null,pinnedSlotType=null;
try {
  ({StateUtils:pinnedStateUtils}=require('../vendor/twinleaf/ptcg-server/output/game/store/state-utils'));
  ({PlayerType:pinnedPlayerType,SlotType:pinnedSlotType}=
    require('../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action'));
} catch {
  // The pure-preflight workflow intentionally omits the submodule; the
  // Agent36 native workflow compiles it and executes the same regression.
}
const catalog={
  basics:new Set(['Shadow Rider Calyrex V CRE','Trubbish FST','Flittle SVI']),
  abilityBasics:new Set(['Shadow Rider Calyrex V CRE']),
  basicEnergies:new Set(['Psychic Energy MEE','Darkness Energy MEE','Psychic Energy SVE']),
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

test('MCTS root provider is actor-only, one-shot and certification-gated',()=>{
  const state={privateOpponentHand:['not-for-provider']};
  const sourceView=base();
  sourceView.ownHand=['Flittle SVI'];
  sourceView.ownPublic.active.attacks=[{name:'Ram',cost:[5],damage:10}];
  const view=Object.freeze({...sourceView,actorSeat:1});
  const budget={iterations:32,maxPlies:4,maxDecisionMs:250,seed:9};
  let providerContext=null;
  const selected=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,
    rootOptions:{rootIntentBudget:budget},
    capabilityFactory:context=>{
      assert.strictEqual(context.state,state,
        'only the trusted capability factory receives the live State');
      assert.equal(context.actorSeat,1);
      assert.deepEqual(context.budget,budget);
      return ()=>({
        status:'selected',
        intent:{kind:'attack',attackName:'Ram'},
        audit:{
          frontierComplete:true,
          bothSeatKnowledgeLedgersVerified:true,
          ownerLedgerInInformationSetKey:true,
          promptResolutionActorScoped:true,
          applicabilityEnvelopeId:'flittle-basic-psychic-v1',
          iterations:32,rootActionCount:2
        }
      });
    },
    provider:context=>{
      providerContext=context;
      assert.equal(Object.hasOwn(context,'state'),false);
      assert.equal(context.actorSeat,1);
      assert.deepEqual(context.budget,budget);
      assert.equal(typeof context.runSearch,'function');
      assert.equal(context.runSearch().status,'selected');
      return {status:'selected'};
    }
  });
  assert.equal(selected.status,'selected');
  assert.deepEqual(selected.intent,{
    kind:'attack',attackName:'Ram',
    source:'agent5-information-set-mcts-v1'
  });
  assert.equal(selected.searchAudit.applicabilityEnvelopeId,
    'flittle-basic-psychic-v1');
  assert.equal(Object.hasOwn(providerContext,'state'),false);

  const selectedWithoutSearch=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'selected'}),
    provider:()=>({status:'selected'})
  });
  assert.equal(selectedWithoutSearch.status,'abstained');
  assert.equal(selectedWithoutSearch.reason,
    'selected-without-one-successful-search');

  const sanitizedAbstention=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'abstained'}),
    provider:()=>({status:'abstained',reason:'secret-hidden-card-name'})
  });
  assert.equal(sanitizedAbstention.reason,'provider-abstained');

  const uncertified=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'selected',
      intent:{kind:'attack',attackName:'Shadow Mist'},
      audit:{frontierComplete:true,applicabilityEnvelopeId:'pilot'}}),
    provider:context=>{context.runSearch();return {status:'selected'};}
  });
  assert.equal(uncertified.status,'abstained');
  assert.equal(uncertified.reason,'native-search-certification-incomplete');

  const unsupported=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'selected',
      intent:{kind:'play-supporter',handIndex:0},
      audit:{frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
        ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
        applicabilityEnvelopeId:'pilot'}}),
    provider:context=>{context.runSearch();return {status:'selected'};}
  });
  assert.equal(unsupported.status,'abstained');
  assert.equal(unsupported.reason,
    'native-search-intent-outside-bounded-vocabulary');
});

test('certified MCTS root intent reaches the native actor action switch',()=>{
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){this.id=id;this.handIndex=handIndex;this.target=target;}
  }
  class AttackAction{constructor(id,name){this.clientId=id;this.name=name;}}
  class PassTurnAction{constructor(id){this.clientId=id;}}
  class Store{
    constructor(){
      const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
        specialConditions:[],energies:{cards:[]},tools:[]});
      const player=id=>({id,active:empty(),bench:Array.from({length:5},empty),
        hand:{cards:[]},deck:{cards:[]},prizes:[],stadium:{cards:[]},
        discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]}});
      this.state={players:[player(10),player(20)],activePlayer:0,
        prompts:[],turn:2,phase:2};
    }
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw new Error('hidden-state baseline should not run');}
  }
  const view=base();
  view.ownHand=['Flittle SVI'];
  view.ownPublic.active.energies=['Psychic Energy SVE'];
  view.ownPublic.active.attacks=[{name:'Ram',cost:[5],damage:10}];
  view.ownTurnResources.energyPlayedTurn=2;
  const budget={iterations:32,maxPlies:4,maxDecisionMs:250,seed:9};
  const result=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi(10).decodeNextAction(store.state);
  },{
    SimpleTacticsAi,Store,policyOwnerSeat:0,rootIntentBudget:budget,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>Object.freeze(view),getCatalog:()=>catalog,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction},
    createRootSearchCapability:context=>{
      assert.equal(context.actorSeat,0);
      return ()=>({status:'selected',
        intent:{kind:'attack',attackName:'Shadow Mist'},
        audit:{frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
          ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
          applicabilityEnvelopeId:'flittle-basic-psychic-v1',
          iterations:32,rootActionCount:2}});
    },
    rootIntentProvider:context=>{
      assert.equal(context.actorSeat,0);
      assert.equal(Object.hasOwn(context,'state'),false);
      context.runSearch();
      return {status:'selected'};
    }
  });
  assert.ok(result.result instanceof AttackAction,
    'MCTS typed intent must reach the existing native action switch');
  assert.equal(result.audit.rootIntentProvider.attempts,1);
  assert.equal(result.audit.rootIntentProvider.selected,1);
  assert.equal(result.audit.rootIntentProvider.abstained,0);
  assert.equal(result.audit.rootIntentProvider.lastIntentKind,'attack');
  assert.equal(result.audit.rootIntentProvider.lastSearchAudit.frontierComplete,true);
  assert.equal(result.audit.competitiveGameQualified,false);
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
      {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:null}
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
    {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0}
  ),expected);
  assert.equal(chooseActorRootIntent(
    garbodorView(1),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0}
  ).kind,'pass');
});
test('natural evolution root can be scoped to physical candidate seat one',()=>{
  assert.equal(chooseActorRootIntent(
    garbodorView(0),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:1}
  ).kind,'pass');
  assert.equal(chooseActorRootIntent(
    garbodorView(1),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:1}
  ).kind,'evolve-pokemon');
});
test('invalid natural evolution owner seat is rejected and missing actor seat fails closed',()=>{
  assert.throws(()=>chooseActorRootIntent(
    garbodorView(0),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:2}
  ),/garbodorResponseOwnerSeat/);
  assert.equal(chooseActorRootIntent(
    garbodorView(undefined),naturalEvolutionCatalog,
    {naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0}
  ).kind,'pass');
});



const {chooseGarbodorToolIntent,evaluateGarbodorToolIntent}=
  require('../simulation/twinleaf/agent36-garbotoxin-tool-intent.cjs');
const garbotoxinToolCatalog={
  ...catalog,
  toolPrintings:new Set(['Float Stone BKT','Float Stone PLF',
    'Forest Seal Stone SIT'])
};
function garbotoxinToolView({
  hand=['Float Stone BKT'],
  targetTools=[],
  targetAbilities=[{name:'Garbotoxin'}],
  opponentAbilities=[{name:'Perfection'}],
  targetSlot='bench',
  toolLocked=false,
  ownVRecipient=false,
  vstarToolAttached=false,
  vstarUsed=false
}={}){
  const view=base();
  view.ownPublic.active={...view.ownPublic.active,tools:[]};
  view.actorSeat=0;
  view.ownHand=hand;
  view.ownTurnResources={
    ...view.ownTurnResources,toolPlayLocked:toolLocked
  };
  view.ownPublic.publicTurnRestrictions={
    toolPlayLocked:toolLocked,vstarUsed
  };
  const garbodor={
    name:'Garbodor',printing:'Garbodor BKP',
    abilities:targetAbilities,tools:targetTools
  };
  const crobatV={
    name:'Crobat V',printing:'Crobat V DAA',
    abilities:[{name:'Dark Asset'}],
    tools:vstarToolAttached?['Forest Seal Stone SIT']:[]
  };
  if(targetSlot==='active'){
    view.ownPublic.active=garbodor;
    view.ownPublic.bench=[
      null,ownVRecipient?crobatV:null,null,null,null
    ];
  }else{
    view.ownPublic.bench=[
      null,garbodor,ownVRecipient?crobatV:null,null,null
    ];
  }
  view.opponentPublic={
    active:{
      name:'Mewtwo & Mew-GX',printing:'Mewtwo & Mew-GX UNM',
      abilities:opponentAbilities,tools:[]
    },
    bench:[null,null,null,null,null],
    publicTurnRestrictions:{}
  };
  return view;
}

test('Garbotoxin root prefers held Float Stone over Forest Seal Stone',()=>{
  const view=garbotoxinToolView({
    hand:['Forest Seal Stone SIT','Float Stone BKT']
  });
  assert.deepEqual(chooseGarbodorToolIntent(
    view,garbotoxinToolCatalog
  ),{
    kind:'attach-tool-candidate',printing:'Float Stone BKT',
    handIndex:1,slot:'bench',index:1,
    source:'agent36-garbotoxin-float-stone-v1'
  });
});

test('Star Alchemy deferral status is explicit and opt-in',()=>{
  const view=garbotoxinToolView({
    hand:['Forest Seal Stone SIT','Float Stone BKT'],
    ownVRecipient:true,vstarUsed:false
  });
  const immediate=evaluateGarbodorToolIntent(view,garbotoxinToolCatalog);
  assert.equal(immediate.starAlchemyDeferred,false);
  assert.equal(immediate.intent.printing,'Float Stone BKT');
  const deferred=evaluateGarbodorToolIntent(view,garbotoxinToolCatalog,{
    deferForStarAlchemy:true
  });
  assert.equal(deferred.starAlchemyDeferred,true);
  assert.equal(deferred.reason,'star-alchemy-available');
  assert.equal(deferred.intent,null);
});

test('Garbotoxin root locks immediately by default while Star Alchemy remains available',()=>{
  const intent=chooseGarbodorToolIntent(
    garbotoxinToolView({
      hand:['Forest Seal Stone SIT','Float Stone BKT'],
      ownVRecipient:true,vstarUsed:false
    }),
    garbotoxinToolCatalog
  );
  assert.equal(intent.printing,'Float Stone BKT');
});

test('immediate-lock default permits FSS fallback while Star Alchemy remains available',()=>{
  const intent=chooseGarbodorToolIntent(
    garbotoxinToolView({
      hand:['Forest Seal Stone SIT'],
      ownVRecipient:true,vstarUsed:false
    }),
    garbotoxinToolCatalog
  );
  assert.equal(intent.printing,'Forest Seal Stone SIT');
});
test('Garbotoxin root uses Forest Seal Stone fallback when Star Alchemy is unavailable',()=>{
  const intent=chooseGarbodorToolIntent(
    garbotoxinToolView({hand:['Forest Seal Stone SIT']}),
    garbotoxinToolCatalog
  );
  assert.equal(intent.printing,'Forest Seal Stone SIT');
  assert.equal(intent.source,'agent36-garbotoxin-fss-fallback-v1');
});
test('Garbotoxin root defers while an unused Star Alchemy can be used from hand',()=>{
  assert.equal(chooseGarbodorToolIntent(
    garbotoxinToolView({
      hand:['Forest Seal Stone SIT','Float Stone BKT'],
      ownVRecipient:true,vstarUsed:false
    }),
    garbotoxinToolCatalog,
    {deferForStarAlchemy:true}
  ),null);
});
test('actor-only Garbodor root forwards immediate-lock and deferral options',()=>{
  const view=garbotoxinToolView({
    hand:['Forest Seal Stone SIT','Float Stone BKT'],
    ownVRecipient:true,vstarUsed:false
  });
  view.actorSeat=0;
  const options={
    naturalEvolutionRoot:true,garbodorResponseOwnerSeat:0,
    garbotoxinToolRoot:true
  };
  const immediate=chooseActorRootIntent(view,garbotoxinToolCatalog,{
    ...options,garbotoxinToolRootDeferForStarAlchemy:false
  });
  assert.equal(immediate.source,'agent36-garbotoxin-float-stone-v1');
  const deferred=chooseActorRootIntent(view,garbotoxinToolCatalog,{
    ...options,garbotoxinToolRootDeferForStarAlchemy:true
  });
  assert.equal(deferred.kind,'pass');
  assert.equal(deferred.reason,'no-supported-owner-visible-root');
});

test('Garbotoxin root defers while Forest Seal Stone is attached to an unused V',()=>{
  assert.equal(chooseGarbodorToolIntent(
    garbotoxinToolView({
      hand:['Float Stone BKT'],
      ownVRecipient:true,vstarToolAttached:true,vstarUsed:false
    }),
    garbotoxinToolCatalog,
    {deferForStarAlchemy:true}
  ),null);
});
test('Garbotoxin root can proceed after VSTAR is used',()=>{
  const intent=chooseGarbodorToolIntent(
    garbotoxinToolView({
      hand:['Forest Seal Stone SIT','Float Stone BKT'],
      ownVRecipient:true,vstarUsed:true
    }),
    garbotoxinToolCatalog
  );
  assert.equal(intent.printing,'Float Stone BKT');
});
test('Garbotoxin root allows Forest Seal Stone fallback after VSTAR is used',()=>{
  const intent=chooseGarbodorToolIntent(
    garbotoxinToolView({
      hand:['Forest Seal Stone SIT'],
      ownVRecipient:true,vstarUsed:true
    }),
    garbotoxinToolCatalog
  );
  assert.equal(intent.printing,'Forest Seal Stone SIT');
  assert.equal(intent.source,'agent36-garbotoxin-fss-fallback-v1');
});
test('Garbotoxin root requires an opposing public Pokémon Ability',()=>{
  assert.equal(chooseGarbodorToolIntent(
    garbotoxinToolView({opponentAbilities:[]}),
    garbotoxinToolCatalog
  ),null);
});
test('Garbotoxin root requires an unequipped Garbotoxin Garbodor',()=>{
  assert.equal(chooseGarbodorToolIntent(
    garbotoxinToolView({targetTools:['Float Stone BKT']}),
    garbotoxinToolCatalog
  ),null);
  assert.equal(chooseGarbodorToolIntent(
    garbotoxinToolView({targetAbilities:[{name:'Trashalanche'}]}),
    garbotoxinToolCatalog
  ),null);
});
test('Garbotoxin root respects the public Tool-play lock',()=>{
  assert.equal(chooseGarbodorToolIntent(
    garbotoxinToolView({toolLocked:true}),
    garbotoxinToolCatalog
  ),null);
});
test('Garbotoxin root can target an Active Garbodor',()=>{
  const intent=chooseGarbodorToolIntent(
    garbotoxinToolView({targetSlot:'active'}),
    garbotoxinToolCatalog
  );
  assert.equal(intent.slot,'active');
  assert.equal(intent.index,0);
});
test('Garbotoxin root never reads the opponent hidden hand',()=>{
  const view=garbotoxinToolView();
  Object.defineProperty(view.opponentPublic,'hand',{
    get(){throw new Error('opponent hidden hand was read');}
  });
  assert.equal(chooseGarbodorToolIntent(
    view,garbotoxinToolCatalog
  ).printing,'Float Stone BKT');
});
test('Garbotoxin root shares the natural-evolution package owner-seat scope',()=>{
  const sourceView=garbotoxinToolView();
  const candidateView=garbotoxinToolView();
  candidateView.actorSeat=1;
  const sourceIntent=chooseActorRootIntent(
    sourceView,garbotoxinToolCatalog,
    {garbotoxinToolRoot:true,garbodorResponseOwnerSeat:0}
  );
  assert.equal(sourceIntent.source,'agent36-garbotoxin-float-stone-v1');
  assert.equal(chooseActorRootIntent(
    candidateView,garbotoxinToolCatalog,
    {garbotoxinToolRoot:true,garbodorResponseOwnerSeat:0}
  ).kind,'pass');
});
test('Garbotoxin root is bilateral when the package owner seat is null',()=>{
  const view=garbotoxinToolView();
  view.actorSeat=1;
  assert.equal(chooseActorRootIntent(
    view,garbotoxinToolCatalog,
    {garbotoxinToolRoot:true,garbodorResponseOwnerSeat:null}
  ).source,'agent36-garbotoxin-float-stone-v1');
});
test('Garbodor package owner seat requires an enabled package action',()=>{
  assert.throws(()=>chooseActorRootIntent(
    garbotoxinToolView(),garbotoxinToolCatalog,
    {garbodorResponseOwnerSeat:0}
  ),/requires a Garbodor response root/);
});


test('seat-scoped actor policies compose independently across candidate and opponent seats',()=>{
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){this.id=id;this.handIndex=handIndex;this.target=target;}
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
    decodeNextAction(){return 'NATIVE_BASELINE';}
  }
  const candidateView=base();
  candidateView.ownHand=['Psychic Energy MEE'];
  candidateView.ownPublic.bench=[{},null,null,null,null];
  const opponentView=base();
  opponentView.ownHand=['Shadow Rider Calyrex V CRE'];
  opponentView.ownPublic.bench=[null,null,null,null,null];
  class ResolvePromptAction{}
  const observedSeats=[];
  const sharedObserve=(state,seat)=>{
    observedSeats.push(seat);
    return Object.freeze({... (seat===0?candidateView:opponentView),actorSeat:seat});
  };
  const sharedDeps={
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    getCatalog:()=>catalog,getNativeTrainerCatalog:()=>({}),
    observe:sharedObserve,promptActions:{ResolvePromptAction},
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction}
  };
  const roleRun=withCandidateOpponentPolicyRoles(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.state.activePlayer=0;
    const candidateAction=new SimpleTacticsAi(10).decodeNextAction(store.state);
    store.state.activePlayer=1;
    const opponentAction=new SimpleTacticsAi(20).decodeNextAction(store.state);
    return {candidateAction,opponentAction};
  },{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps
  });
  assert.deepEqual(roleRun.roleSeatMap,{candidate:0,opponent:1});
  assert.ok(roleRun.result.candidateAction instanceof PlayCardAction);
  assert.ok(roleRun.result.opponentAction instanceof PlayCardAction);
  assert.equal(roleRun.result.candidateAction.target.player,0,
    'physical seat 0 own-side target is PlayerType.BOTTOM_PLAYER');
  assert.equal(roleRun.result.opponentAction.target.player,0,
    'physical seat 1 own-side target is also PlayerType.BOTTOM_PLAYER; seat is not the relative enum');
  assert.equal(roleRun.candidateAudit.policyOwnerSeat,0);
  assert.equal(roleRun.opponentAudit.policyOwnerSeat,1);
  assert.equal(roleRun.candidateAudit.nonOwnerSeatBypassCalls,1);
  assert.equal(roleRun.opponentAudit.nonOwnerSeatBypassCalls,0,
    'The inner candidate wrapper delegates the opponent seat to the outer opponent wrapper');
  assert.equal(roleRun.candidateAudit.selectedRootDecisions,1);
  assert.equal(roleRun.opponentAudit.selectedRootDecisions,1);
  assert.ok(observedSeats.includes(0)&&observedSeats.includes(1),
    'both roles must use the same common observer binding');

  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    candidatePolicyOptions:{observe:sharedObserve}
  }),/may not override shared runtime binding observe/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    opponentPolicyOptions:{stagedStore:new Store()}
  }),/may not override shared runtime binding stagedStore/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    candidatePolicyOptions:{promptActions:{ResolvePromptAction}}
  }),/may not override shared runtime binding promptActions/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:{...sharedDeps,stagedStore:new Store()}
  }),/test-only stagedStore seam/);

  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:0,commonDeps:sharedDeps
  }),/distinct physical seats/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    candidatePolicyOptions:{getCatalog:()=>catalog}
  }),/may not override shared runtime binding getCatalog/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    candidatePolicyOptions:{rootIntentProvider:()=>({status:'abstained'})}
  }),/may not override shared runtime binding rootIntentProvider/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    opponentPolicyOptions:{createRootSearchCapability:()=>()=>({status:'abstained'})}
  }),/may not override shared runtime binding createRootSearchCapability/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,
    commonDeps:{...sharedDeps,rootIntentProvider:()=>({status:'abstained'})}
  }),/must be supplied together/);
  const providerDeps={...sharedDeps,
    rootIntentProvider:()=>({status:'abstained'}),
    createRootSearchCapability:()=>()=>({status:'abstained'})
  };
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,commonDeps:providerDeps,
    candidatePolicyOptions:{rootIntentBudget:{
      iterations:32,maxPlies:4,maxDecisionMs:250,seed:9}},
    opponentPolicyOptions:{rootIntentBudget:{
      iterations:16,maxPlies:4,maxDecisionMs:250,seed:9}}
  }),/exactly equal MCTS budgets/);
});


test('pinned Twinleaf StateUtils resolves own Active/Bench targets for either acting seat', {
  skip:!pinnedStateUtils
},()=>{
  assert.equal(typeof pinnedStateUtils.getTarget,'function');
  const players=[0,1].map(id=>({
    id:id+10,
    active:{ownerSeat:id,zone:'active'},
    bench:Array.from({length:5},(_,index)=>({ownerSeat:id,zone:'bench',index}))
  }));
  const state={players};
  for(const seat of [0,1]){
    const actor=players[seat],opponent=players[1-seat];
    assert.equal(pinnedStateUtils.getTarget(state,actor,{
      player:pinnedPlayerType.BOTTOM_PLAYER,
      slot:pinnedSlotType.ACTIVE,index:0
    }),actor.active,`BOTTOM_PLAYER Active resolves to actor at physical seat ${seat}`);
    assert.equal(pinnedStateUtils.getTarget(state,actor,{
      player:pinnedPlayerType.BOTTOM_PLAYER,
      slot:pinnedSlotType.BENCH,index:3
    }),actor.bench[3],`BOTTOM_PLAYER Bench resolves to actor at physical seat ${seat}`);
    assert.equal(pinnedStateUtils.getTarget(state,actor,{
      player:pinnedPlayerType.TOP_PLAYER,
      slot:pinnedSlotType.ACTIVE,index:0
    }),opponent.active,`TOP_PLAYER Active resolves to opponent from physical seat ${seat}`);
    assert.equal(pinnedStateUtils.getTarget(state,actor,{
      player:pinnedPlayerType.TOP_PLAYER,
      slot:pinnedSlotType.BENCH,index:3
    }),opponent.bench[3],`TOP_PLAYER Bench resolves to opponent from physical seat ${seat}`);
  }
});
