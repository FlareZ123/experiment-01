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
function rootIntentActionKeyForTest(intent){
  if(intent.kind==='pass')return 'PASS_TURN';
  if(intent.kind==='attack')return 'ATTACK_ACTION:'+intent.attackName;
  if(intent.kind==='attach-basic-energy')
    return 'PLAY_CARD_ACTION:'+intent.handIndex+':0:1:'+intent.index;
  return null;
}
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
  sourceView.ownHand=['Psychic Energy SVE'];
  sourceView.ownPublic.active.energies=['Psychic Energy SVE'];
  sourceView.ownPublic.active.attacks=[{name:'Ram',cost:[5],damage:10}];
  sourceView.ownTurnResources.energyPlayedTurn=2;
  const view=Object.freeze({...sourceView,actorSeat:1});
  const budget={iterations:32,maxPlies:4,maxDecisionMs:250,seed:9};
  let providerContext=null;
  const selected=invokeActorRootIntentProvider({
    rootIntentActionKey:rootIntentActionKeyForTest,
    state,actorSeat:1,view,catalog,
    rootOptions:{rootIntentBudget:budget},
    capabilityFactory:context=>{
      assert.strictEqual(context.state,state,
        'only the trusted capability factory receives the live State');
      assert.equal(context.actorSeat,1);
      assert.deepEqual(context.budget,budget);
      return ()=>({
        status:'selected',
        intent:{kind:'pass'},
        audit:{
          frontierComplete:true,
          bothSeatKnowledgeLedgersVerified:true,
          ownerLedgerInInformationSetKey:true,
          promptResolutionActorScoped:true,
          applicabilityEnvelopeId:'flittle-basic-psychic-v1',
          iterations:32,completedIterations:32,maxPlies:4,
          maxDecisionMs:250,seed:9,elapsedMs:12.5,
          timeoutStatus:'completed',cPuct:1.4,
          maxActionTransitions:1,seatActionTransitions:[0,32],
          rolloutPaths:Array.from({length:32},(_,iteration)=>({
            iteration,actions:[{seat:1,actionKey:'PASS_TURN'}]
          })),rootActionCount:2,selectedActionKey:'PASS_TURN'
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
      return {status:'selected',intent:{kind:'pass'}};
    }
  });
  assert.equal(selected.status,'selected');
  assert.deepEqual(selected.intent,{
    kind:'pass',reason:'mcts-root-pass',
    source:'agent5-information-set-mcts-v1'
  });
  assert.equal(selected.searchAudit.applicabilityEnvelopeId,
    'flittle-basic-psychic-v1');
  assert.equal(selected.searchAudit.iterations,32);
  assert.equal(selected.searchAudit.completedIterations,32);
  assert.equal(selected.searchAudit.maxPlies,4);
  assert.equal(selected.searchAudit.maxDecisionMs,250);
  assert.equal(selected.searchAudit.seed,9);
  assert.equal(selected.searchAudit.elapsedMs,12.5);
  assert.equal(selected.searchAudit.timeoutStatus,'completed');
  assert.equal(selected.searchAudit.rolloutPaths.length,32);
  assert.equal(selected.searchAudit.rolloutPaths[0].actions[0].seat,1);
  assert.deepEqual(selected.searchAudit.seatActionTransitions,[0,32]);
  assert.equal(Object.hasOwn(providerContext,'state'),false);

  const mismatchedBudget=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'selected',intent:{kind:'pass'},
      audit:{
        frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
        ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
        applicabilityEnvelopeId:'flittle-basic-psychic-v1',
        iterations:32,completedIterations:32,maxPlies:4,
        maxDecisionMs:10000,seed:9,elapsedMs:20,
        timeoutStatus:'completed',rootActionCount:2
      }}),
    provider:context=>{context.runSearch();return {status:'selected'};}
  });
  assert.equal(mismatchedBudget.status,'abstained');
  assert.equal(mismatchedBudget.reason,'native-search-budget-mismatch');

  const elapsedOverBudget=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'selected',intent:{kind:'pass'},
      audit:{
        frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
        ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
        applicabilityEnvelopeId:'flittle-basic-psychic-v1',
        iterations:32,completedIterations:32,maxPlies:4,
        maxDecisionMs:250,seed:9,elapsedMs:250,
        timeoutStatus:'completed',rootActionCount:2
      }}),
    provider:context=>{context.runSearch();return {status:'selected'};}
  });
  assert.equal(elapsedOverBudget.status,'abstained');
  assert.equal(elapsedOverBudget.reason,'native-search-budget-mismatch');

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
        applicabilityEnvelopeId:'pilot',
        iterations:32,completedIterations:32,maxPlies:4,
        maxDecisionMs:250,seed:9,elapsedMs:12.5,
        timeoutStatus:'completed',cPuct:1.4,
        maxActionTransitions:1,seatActionTransitions:[0,32],
        rolloutPaths:Array.from({length:32},(_,iteration)=>({
          iteration,actions:[{seat:1,actionKey:'PASS_TURN'}]
        })),rootActionCount:2,selectedActionKey:'PASS_TURN'}}),
    provider:context=>{context.runSearch();return {status:'selected'};}
  });
  assert.equal(unsupported.status,'abstained');
  assert.equal(unsupported.reason,
    'native-search-intent-outside-bounded-vocabulary');

  const outsideFlittleEnvelope=invokeActorRootIntentProvider({
    state,actorSeat:1,view,catalog,rootOptions:{rootIntentBudget:budget},
    capabilityFactory:()=>()=>({status:'selected',
      intent:{kind:'bench-basic',handIndex:0,benchIndex:0},
      audit:{frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
        ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
        applicabilityEnvelopeId:'flittle-basic-psychic-v1',
        iterations:32,completedIterations:32,maxPlies:4,
        maxDecisionMs:250,seed:9,elapsedMs:12.5,
        timeoutStatus:'completed'}}),
    provider:context=>{context.runSearch();return {status:'selected'};}
  });
  assert.equal(outsideFlittleEnvelope.status,'abstained');
  assert.equal(outsideFlittleEnvelope.reason,'intent-outside-flittle-envelope');
});

test('MCTS selected action key is mandatory and bound to the sanitized intent',()=>{
  const state={privateOpponentHand:['not-for-provider']};
  const view=Object.freeze({...base(),actorSeat:1});
  const budget={iterations:32,maxPlies:4,maxDecisionMs:250,seed:9};
  const invoke=(selectedActionKey,providerIntent={kind:'pass'})=>{
    const audit={
      frontierComplete:true,
      bothSeatKnowledgeLedgersVerified:true,
      ownerLedgerInInformationSetKey:true,
      promptResolutionActorScoped:true,
      applicabilityEnvelopeId:'flittle-basic-psychic-v1',
      iterations:32,completedIterations:32,maxPlies:4,
      maxDecisionMs:250,seed:9,elapsedMs:12.5,
      timeoutStatus:'completed'
    };
    if(selectedActionKey!==null)audit.selectedActionKey=selectedActionKey;
    return invokeActorRootIntentProvider({
      rootIntentActionKey:rootIntentActionKeyForTest,
      state,actorSeat:1,view,catalog,
      rootOptions:{rootIntentBudget:budget},
      capabilityFactory:()=>()=>({
        status:'selected',intent:{kind:'pass'},audit
      }),
      provider:context=>{
        context.runSearch();
        return {status:'selected',intent:providerIntent};
      }
    });
  };

  assert.equal(invoke('PASS_TURN').status,'selected');
  const missingKey=invoke(null);
  assert.equal(missingKey.status,'abstained');
  assert.equal(missingKey.reason,'native-search-action-key-unbound');

  const mismatchedKey=invoke('ATTACK_ACTION:Ram');
  assert.equal(mismatchedKey.status,'abstained');
  assert.equal(mismatchedKey.reason,'native-search-action-key-intent-mismatch');

  const mismatchedIntent=invoke('PASS_TURN',{kind:'attack',attackName:'Ram'});
  assert.equal(mismatchedIntent.status,'abstained');
  assert.equal(mismatchedIntent.reason,'native-search-intent-binding-mismatch');
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
  view.ownHand=['Psychic Energy SVE'];
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
    rootIntentActionKey:rootIntentActionKeyForTest,
    GamePhase:{PLAYER_TURN:2,FINISHED:7},
    observe:()=>Object.freeze(view),getCatalog:()=>catalog,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction,PassTurnAction},
    createRootSearchCapability:context=>{
      assert.equal(context.actorSeat,0);
      return ()=>({status:'selected',
        intent:{kind:'pass'},
        audit:{frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
          ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
          applicabilityEnvelopeId:'flittle-basic-psychic-v1',
          iterations:32,completedIterations:32,maxPlies:4,
          maxDecisionMs:250,seed:9,elapsedMs:12.5,
          timeoutStatus:'completed',cPuct:1.4,
          maxActionTransitions:1,seatActionTransitions:[32,0],
          rolloutPaths:Array.from({length:32},(_,iteration)=>({
            iteration,actions:[{seat:0,actionKey:'PASS_TURN'}]
          })),rootActionCount:2,selectedActionKey:'PASS_TURN'}});
    },
    rootIntentProvider:context=>{
      assert.equal(context.actorSeat,0);
      assert.equal(Object.hasOwn(context,'state'),false);
      context.runSearch();
      return {status:'selected',intent:{kind:'pass'}};
    }
  });
  assert.ok(result.result instanceof PassTurnAction,
    'MCTS typed intent must reach the existing native action switch');
  assert.equal(result.audit.rootIntentProvider.attempts,1);
  assert.equal(result.audit.rootIntentProvider.selected,1);
  assert.equal(result.audit.rootIntentProvider.abstained,0);
  assert.equal(result.audit.rootIntentProvider.lastIntentKind,'pass');
  assert.equal(result.audit.rootIntentProvider.lastSearchAudit.frontierComplete,true);
  assert.equal(result.audit.rootIntentProvider.lastSearchAudit.maxDecisionMs,250);
  assert.equal(result.audit.rootIntentProvider.lastSearchAudit.maxPlies,4);
  assert.equal(result.audit.rootIntentProvider.lastSearchAudit.timeoutStatus,'completed');
  assert.equal(result.audit.rootIntentProvider.lastSearchAudit.rolloutPaths[0].actions[0].seat,0);
  assert.deepEqual(result.audit.rootIntentProvider.lastSearchAudit.seatActionTransitions,[32,0]);
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
  assert.equal(roleRun.candidateAudit.peerRoleDispatchEnabled,true);
  assert.equal(roleRun.opponentAudit.peerRoleDispatchEnabled,false);
  assert.equal(roleRun.candidateAudit.ownerDecisionCalls,1);
  assert.equal(roleRun.opponentAudit.ownerDecisionCalls,1);
  assert.equal(roleRun.candidateAudit.peerRoleDelegations,1);
  assert.equal(roleRun.opponentAudit.peerRoleDelegations,0);
  assert.equal(roleRun.candidateAudit.nonOwnerSeatBypassCalls,0);
  assert.equal(roleRun.opponentAudit.nonOwnerSeatBypassCalls,0);
  assert.equal(roleRun.actorOnlyBoundary.schema,'aichi-actor-only-execution-boundary-v2');
  assert.equal(roleRun.actorOnlyBoundary.valid,true);
  assert.equal(roleRun.candidateAudit.selectedRootDecisions,1);
  assert.equal(roleRun.opponentAudit.selectedRootDecisions,1);
  assert.ok(observedSeats.includes(0)&&observedSeats.includes(1),
    'both roles must use the same common observer binding');

  // Mirror the exact same role contract with candidate and opponent
  // physical seats swapped. Role identity must not depend on seat numbering.
  const swappedObservedSeats=[];
  const swappedDeps={
    ...sharedDeps,
    observe:(state,seat)=>{
      swappedObservedSeats.push(seat);
      return Object.freeze({... (seat===1?candidateView:opponentView),actorSeat:seat});
    }
  };
  const swappedRoleRun=withCandidateOpponentPolicyRoles(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.state.activePlayer=1;
    const candidateAction=new SimpleTacticsAi(20).decodeNextAction(store.state);
    store.state.activePlayer=0;
    const opponentAction=new SimpleTacticsAi(10).decodeNextAction(store.state);
    return {candidateAction,opponentAction};
  },{
    candidateSeat:1,opponentSeat:0,commonDeps:swappedDeps
  });
  assert.deepEqual(swappedRoleRun.roleSeatMap,{candidate:1,opponent:0});
  assert.ok(swappedRoleRun.result.candidateAction instanceof PlayCardAction);
  assert.ok(swappedRoleRun.result.opponentAction instanceof PlayCardAction);
  assert.equal(swappedRoleRun.result.candidateAction.target.player,0,
    'physical seat 1 candidate still uses actor-relative BOTTOM_PLAYER');
  assert.equal(swappedRoleRun.result.opponentAction.target.player,0,
    'physical seat 0 opponent still uses actor-relative BOTTOM_PLAYER');
  assert.equal(swappedRoleRun.candidateAudit.policyOwnerSeat,1);
  assert.equal(swappedRoleRun.opponentAudit.policyOwnerSeat,0);
  assert.equal(swappedRoleRun.candidateAudit.peerRoleDispatchEnabled,true);
  assert.equal(swappedRoleRun.opponentAudit.peerRoleDispatchEnabled,false);
  assert.equal(swappedRoleRun.candidateAudit.ownerDecisionCalls,1);
  assert.equal(swappedRoleRun.opponentAudit.ownerDecisionCalls,1);
  assert.equal(swappedRoleRun.candidateAudit.peerRoleDelegations,1);
  assert.equal(swappedRoleRun.opponentAudit.peerRoleDelegations,0);
  assert.equal(swappedRoleRun.candidateAudit.nonOwnerSeatBypassCalls,0);
  assert.equal(swappedRoleRun.opponentAudit.nonOwnerSeatBypassCalls,0);
  assert.equal(swappedRoleRun.actorOnlyBoundary.schema,'aichi-actor-only-execution-boundary-v2');
  assert.equal(swappedRoleRun.actorOnlyBoundary.valid,true);
  assert.equal(swappedRoleRun.candidateAudit.selectedRootDecisions,1);
  assert.equal(swappedRoleRun.opponentAudit.selectedRootDecisions,1);
  assert.ok(swappedObservedSeats.includes(0)&&swappedObservedSeats.includes(1),
    'both swapped roles must use the same common observer binding');

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
    candidateSeat:0,opponentSeat:1,commonDeps:sharedDeps,
    candidatePolicyOptions:{rootIntentActionKey:rootIntentActionKeyForTest}
  }),/may not override shared runtime binding rootIntentActionKey/);
  assert.throws(()=>withCandidateOpponentPolicyRoles(()=>null,{
    candidateSeat:0,opponentSeat:1,
    commonDeps:{...sharedDeps,rootIntentProvider:()=>({status:'abstained'})}
  }),/must be supplied together/);
  const providerDeps={...sharedDeps,
    rootIntentProvider:()=>({status:'abstained'}),
    createRootSearchCapability:()=>()=>({status:'abstained'}),
    rootIntentActionKey:rootIntentActionKeyForTest
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


test('candidate-only post-Timeless Max Geist root uses public extra-turn and Apex receipts',()=>{
  const {
    VERSION:postTimelessVersion,
    opponentActiveHasUnmodelledDamageModifier,
    choosePostTimelessMaxGeistRetreat
  }=require('../simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs');
  const psychic='Psychic Energy SVE';
  const postTimelessCatalog={...catalog,
    ruleboxPokemonPrintings:new Set([
      'Arceus & Dialga & Palkia GX CEC','Latias ex SSP',
      'Synthetic Radiant','Synthetic Prism Star','Synthetic BREAK',
      'Synthetic Radiant Crossover','Synthetic Psychic-weak VMAX'
    ]),
    onePrizeRuleboxPokemonPrintings:new Set([
      'Synthetic Radiant','Synthetic Prism Star','Synthetic BREAK',
      'Synthetic Radiant Crossover'
    ]),
    threePrizePokemonPrintings:new Set([
      'Arceus & Dialga & Palkia GX CEC','Synthetic Psychic-weak VMAX'
    ]),
    dragonPokemonPrintings:new Set(['Dratini SIT 129','Arceus & Dialga & Palkia GX CEC'])};
  const restrictions={
    cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
    blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
    onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
    attackCostIncreaseWhileActive:0
  };
  const latias={
    printing:'Latias ex SSP',hp:210,damage:0,energies:[],attacks:[],
    abilities:['Skyliner'],abilityDetails:[{name:'Skyliner',text:'Your Basic Pokémon have no Retreat Cost.'}],
    tools:[],publicRestrictions:{},specialConditions:[],
    printed:{stage:'Basic',types:['Psychic'],resistance:[]}
  };
  const clefairy={
    printing:"Lillie's Clefairy ex JTG",hp:190,damage:0,energies:[],attacks:[],
    abilities:['Fairy Zone'],abilityDetails:[{name:'Fairy Zone',text:'The Weakness of each of your opponent\'s Dragon Pokémon in play is now Psychic.'}],
    tools:[],publicRestrictions:{},specialConditions:[],
    printed:{stage:'Basic',types:['Psychic'],resistance:[]}
  };
  const vmax={
    printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:0,
    energies:[psychic,psychic,psychic],
    attacks:[{name:'Max Geist',cost:[9,9,9],damage:null,damageCalculation:{kind:'max-geist'}}],
    abilities:[],abilityDetails:[],tools:[],publicRestrictions:{...restrictions},
    specialConditions:[],printed:{stage:'VMAX',types:['Psychic'],resistance:[]}
  };
  const active={
    printing:'Mimikyu GRI',hp:70,damage:0,energies:[psychic,psychic],
    attacks:[{name:'Copycat',cost:[5,9],damage:null}],
    abilities:[],abilityDetails:[],tools:[],
    publicRestrictions:{cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
      blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
      onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
      attackCostIncreaseWhileActive:0,cannotRetreatNextTurn:false,
      cannotRetreatWhileActive:false},
    specialConditions:[],printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],weakness:[],resistance:[]}
  };
  const target={
    printing:'Dratini SIT 129',hp:70,damage:0,energies:[],attacks:[],
    abilities:[],abilityDetails:[],tools:[],publicRestrictions:{},
    specialConditions:[],printed:{stage:'Basic',types:[11],weakness:[],resistance:[]}
  };
  const view={
    decisionKind:'owner-root',actorSeat:0,globalTurn:8,ownHand:[],
    ownTurnResources:{extraTurnActive:true,retreatedTurn:7,
      energyPlayedTurn:7,energyPlayLocked:false,pokemonPlayLocked:false},
    ownPublic:{
      prizeCount:1,active,bench:[latias,clefairy,vmax],discard:['Dialga-GX UPR'],
      stadium:[],
      publicTurnRestrictions:{gxUsed:true,attackLockTurnsRemaining:0,
        attackMaxEnergyTurnsRemaining:0,attackMaxEnergy:null,
        attackCostIncreaseNextTurn:0,attackCostIncreaseWhileActive:0,
        stadiumAndToolHaveNoEffectTurnsRemaining:0}
    },
    opponentPublic:{prizeCount:6,active:target,bench:[],stadium:[]},
    publicEventReceipt:{
      actorSeat:0,turn:8,opponentLastTurnTurn:7,
      opponentLastTurnAttacks:[{turn:7,sourcePrinting:'Regidrago VSTAR SIT',
        attackName:'Apex Dragon',gxAttack:false,copycatAttack:false}]
    }
  };

  const intent=choosePostTimelessMaxGeistRetreat(view,postTimelessCatalog,{ownerSeat:0});
  assert.equal(intent.source,postTimelessVersion);
  assert.equal(intent.kind,'skyliner-free-retreat');
  assert.equal(intent.benchIndex,2);
  assert.equal(intent.attackName,'Max Geist');
  assert.equal(intent.projectedPrintedDamage,160);
  assert.equal(intent.projectedDamage,320);
  assert.equal(intent.fairyZoneMultiplier,2);
  assert.equal(intent.targetRemainingHp,70);
  assert.equal(intent.projectedPrizeCount,1);
  assert.equal(intent.projectedTerminalWin,true);

  const integrated=chooseActorRootIntent(view,postTimelessCatalog,{
    mimikyuApexFundedPromotion:true,
    mimikyuTimelessMaxGeistRetreatRoot:true,
    mimikyuTimelessMaxGeistRetreatRootOwnerSeat:0
  });
  assert.equal(integrated.source,postTimelessVersion,
    'the Agent34 actor-only chooser must select the candidate-only follow-up');

  const defaultIntent=chooseActorRootIntent(view,postTimelessCatalog,{});
  assert.notEqual(defaultIntent?.source,postTimelessVersion,
    'the new Max Geist branch is opt-in; existing default Copycat policy may still act');
  assert.equal(choosePostTimelessMaxGeistRetreat(view,postTimelessCatalog,{ownerSeat:1}),null,
    'the proposal cannot cross the candidate-seat boundary');

  const wobbuffet={
    printing:'Wobbuffet PHF',hp:110,damage:0,tools:[],
    abilities:['Bide Barricade'],
    abilityDetails:[{name:'Bide Barricade',text:"If this Pokémon is your Active Pokémon, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities (except for Psychic Pokémon)."}],
    publicRestrictions:{},specialConditions:[],
    printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],weakness:[],resistance:[]}
  };
  const wobbuffetActiveView={
    ...view,opponentPublic:{...view.opponentPublic,active:wobbuffet}
  };
  assert.ok(choosePostTimelessMaxGeistRetreat(
    wobbuffetActiveView,postTimelessCatalog,{ownerSeat:0}),
    'Psychic Latias ex Skyliner is exempt from Active Wobbuffet Bide Barricade');
  const wobbuffetBenchedView={
    ...view,opponentPublic:{...view.opponentPublic,bench:[wobbuffet]}
  };
  assert.ok(choosePostTimelessMaxGeistRetreat(
    wobbuffetBenchedView,postTimelessCatalog,{ownerSeat:0}),
    'Bide Barricade only applies while Wobbuffet is Active');

  const withRadiant={
    ...view,
    ownPublic:{...view.ownPublic,discard:['Dialga-GX UPR','Radiant Eternatus CRZ']}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(withRadiant,postTimelessCatalog,{ownerSeat:0}),null,
    'when Power Beam also KOs, retain the safer one-Prize Mimikyu Active');

  const nonterminalView={
    ...view,ownPublic:{...view.ownPublic,prizeCount:6}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    nonterminalView,postTimelessCatalog,{ownerSeat:0}),null,
    'never expose a three-Prize VMAX for a nonterminal Max Geist KO without a response model');
  const nonterminalWithRadiantUnavailable={
    ...nonterminalView,
    ownPublic:{...nonterminalView.ownPublic,
      active:{...active,energies:[]},
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    nonterminalWithRadiantUnavailable,postTimelessCatalog,{ownerSeat:0}),null,
    'the nonterminal liability guard applies even when the Power Beam competitor is unavailable');

  const onePsychicMimikyu={...active,energies:[psychic]};
  const onePsychicNoValley={
    ...view,
    ownPublic:{...view.ownPublic,active:onePsychicMimikyu,
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']}
  };
  const noValleyCopycat=choosePostTimelessMaxGeistRetreat(
    onePsychicNoValley,postTimelessCatalog,{ownerSeat:0});
  assert.ok(noValleyCopycat,
    'the already-completed prior Copycat does not require a current two-Energy recheck');
  assert.equal(noValleyCopycat.competingPowerBeamAvailable,false,
    'one Psychic cannot pay the current Copycat cost without Dimension Valley');
  const onePsychicWithValley={
    ...onePsychicNoValley,
    ownPublic:{...onePsychicNoValley.ownPublic,
      stadium:['Dimension Valley PHF 93']}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    onePsychicWithValley,postTimelessCatalog,{ownerSeat:0}),null,
    'Dimension Valley makes one Psychic sufficient for the current Power Beam Copycat competitor');

  const hqTwoEnergyMimikyu={...active,energies:[psychic,psychic]};
  const hqTwoEnergyView={
    ...view,
    ownPublic:{...view.ownPublic,active:hqTwoEnergyMimikyu,
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ'],
      stadium:['Pokémon League Headquarters SV3 192']}
  };
  const hqTwoEnergyIntent=choosePostTimelessMaxGeistRetreat(
    hqTwoEnergyView,postTimelessCatalog,{ownerSeat:0});
  assert.ok(hqTwoEnergyIntent,
    'Headquarters makes the Basic Mimikyu Copycat competitor require three Energy');
  assert.equal(hqTwoEnergyIntent.competingPowerBeamAvailable,false,
    'two Psychic Energy cannot pay Copycat under Pokémon League Headquarters');
  const hqThreeEnergyView={
    ...hqTwoEnergyView,
    ownPublic:{...hqTwoEnergyView.ownPublic,
      active:{...active,energies:[psychic,psychic,psychic]}}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    hqThreeEnergyView,postTimelessCatalog,{ownerSeat:0}),null,
    'three Psychic Energy pay Copycat under Headquarters, so its terminal Power Beam KO vetoes Max Geist');

  const hqUnderfundedVmax={...vmax,energies:[psychic,psychic]};
  const headquartersDoesNotDiscountVmax={
    ...view,
    ownPublic:{...view.ownPublic,active:{...active,energies:[]},
      bench:[latias,clefairy,hqUnderfundedVmax],
      stadium:['Pokémon League Headquarters SV3 192']}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    headquartersDoesNotDiscountVmax,postTimelessCatalog,{ownerSeat:0}),null,
    'Pokémon League Headquarters applies to Basic Mimikyu, not Shadow Rider VMAX Max Geist');
  const conflictingCostStadiums={
    ...view,
    ownPublic:{...view.ownPublic,stadium:['Dimension Valley PHF 93']},
    opponentPublic:{...view.opponentPublic,
      stadium:['Pokémon League Headquarters SV3 192']}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    conflictingCostStadiums,postTimelessCatalog,{ownerSeat:0}),null,
    'mutually exclusive cost-modifying Stadiums in the public view fail closed');

  const opponentLatias={
    ...target,printing:'Latias ex SSP',hp:210,damage:0,
    printed:{stage:'Basic',types:[5],subtypes:['Basic','ex'],
      weakness:[{type:catalog.basicEnergyTypes.Darkness,value:2}],resistance:[]}
  };
  const sevenPsychicVmax={...vmax,
    energies:[psychic,psychic,psychic,psychic,psychic]};
  const withRadiantLatias={
    ...view,
    ownPublic:{...view.ownPublic,prizeCount:6,
      bench:[latias,clefairy,sevenPsychicVmax],
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']},
    opponentPublic:{...view.opponentPublic,active:opponentLatias}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    withRadiantLatias,postTimelessCatalog,{ownerSeat:0}),null,
    'a unique 220-vs-200 KO is not enough to expose the three-Prize VMAX when the opponent can still respond');

  const terminalWithRadiantLatias={
    ...withRadiantLatias,
    ownPublic:{...withRadiantLatias.ownPublic,prizeCount:2}
  };
  const terminalCrossover=choosePostTimelessMaxGeistRetreat(
    terminalWithRadiantLatias,postTimelessCatalog,{ownerSeat:0});
  assert.ok(terminalCrossover,
    'Max Geist may replace Power Beam when its unique KO immediately wins the game');
  assert.equal(terminalCrossover.projectedPrintedDamage,220);
  assert.equal(terminalCrossover.projectedDamage,220);
  assert.equal(terminalCrossover.competingPowerBeamAvailable,true);
  assert.equal(terminalCrossover.competingPowerBeamDamage,200);
  assert.equal(terminalCrossover.competingPowerBeamWouldKo,false);
  assert.equal(terminalCrossover.projectedPrizeCount,2);
  assert.equal(terminalCrossover.projectedTerminalWin,true);
  assert.equal(terminalCrossover.retainedBasicPsychicEnergyCount,7);
  assert.equal(terminalCrossover.routeComparison,'max-geist-unique-terminal-ko');

  const sixPsychicVmax={...vmax,energies:[psychic,psychic,psychic,psychic]};
  const sixEnergyNoCrossover={
    ...withRadiantLatias,
    ownPublic:{...withRadiantLatias.ownPublic,
      bench:[latias,clefairy,sixPsychicVmax],prizeCount:2}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    sixEnergyNoCrossover,postTimelessCatalog,{ownerSeat:0}),null,
    'at six Psychic Energy, Max Geist is 190 and cannot beat Power Beam 200');

  const withoutExtraTurn={
    ...view,ownTurnResources:{...view.ownTurnResources,extraTurnActive:false}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(withoutExtraTurn,postTimelessCatalog,{ownerSeat:0}),null);

  const noApex={
    ...view,publicEventReceipt:{...view.publicEventReceipt,
      opponentLastTurnAttacks:[{turn:7,sourcePrinting:'Regidrago VSTAR SIT',
        attackName:'Dragon Energy',gxAttack:false,copycatAttack:false}]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(noApex,postTimelessCatalog,{ownerSeat:0}),null);

  const noImmediateKo={
    ...view,opponentPublic:{...view.opponentPublic,
      active:{...target,hp:400}}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(noImmediateKo,postTimelessCatalog,{ownerSeat:0}),null);

  const latiasMissing={
    ...view,ownPublic:{...view.ownPublic,bench:[clefairy,vmax]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(latiasMissing,postTimelessCatalog,{ownerSeat:0}),null);

  const cannotRetreatView={
    ...view,ownPublic:{...view.ownPublic,
      active:{...view.ownPublic.active,publicRestrictions:{cannotRetreat:true}}}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    cannotRetreatView,postTimelessCatalog,{ownerSeat:0}),null,
    'generic public cannotRetreat restriction blocks the Skyliner line');

  const underfundedVmax={...vmax,energies:[psychic,psychic]};
  const underfunded={
    ...view,ownPublic:{...view.ownPublic,bench:[latias,clefairy,underfundedVmax]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(underfunded,postTimelessCatalog,{ownerSeat:0}),null,
    'Max Geist requires all three Colorless Energy units to be payable');

  const sameRegidrago={
    ...view,opponentPublic:{...view.opponentPublic,
      active:{...target,printing:'Regidrago VSTAR SIT',hp:280}}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(sameRegidrago,postTimelessCatalog,{ownerSeat:0}),null);

  const adpTarget={...target,printing:'Arceus & Dialga & Palkia GX CEC',hp:280,
    printed:{stage:'Basic',types:[11],subtypes:[],weakness:[],resistance:[]}};
  const adpIntent=choosePostTimelessMaxGeistRetreat({
    ...view,ownPublic:{...view.ownPublic,prizeCount:3},
    opponentPublic:{...view.opponentPublic,active:adpTarget}
  },postTimelessCatalog,{ownerSeat:0});
  assert.equal(adpIntent.projectedDamage,320);
  assert.equal(adpIntent.projectedPrizeCount,3,
    'the public prize projection must retain Tag Team three-prize value');

  const psychicWeakTarget={
    ...target,printing:'Synthetic Psychic-weak non-Dragon target',hp:300,damage:0,
    printed:{stage:'Basic',types:[6],
      weakness:[{type:catalog.basicEnergyTypes.Psychic,value:null}],resistance:[]}
  };
  const printedPsychicWeakView={
    ...view,
    ownPublic:{...view.ownPublic,bench:[latias,vmax]},
    opponentPublic:{...view.opponentPublic,active:psychicWeakTarget}
  };
  const printedPsychicWeakIntent=choosePostTimelessMaxGeistRetreat(
    printedPsychicWeakView,postTimelessCatalog,{ownerSeat:0});
  assert.ok(printedPsychicWeakIntent,
    'printed Psychic Weakness must be applied even without Fairy Zone or a Dragon target');
  assert.equal(printedPsychicWeakIntent.fairyZoneActive,false);
  assert.equal(printedPsychicWeakIntent.fairyZoneMultiplier,1);
  assert.equal(printedPsychicWeakIntent.weaknessMultiplier,2);
  assert.equal(printedPsychicWeakIntent.projectedDamage,320);

  const psychicWeakVmaxTarget={
    ...psychicWeakTarget,printing:'Synthetic Psychic-weak VMAX',hp:410,
    printed:{stage:'VMAX',types:[6],subtypes:[],
      weakness:[{type:catalog.basicEnergyTypes.Psychic,value:null}],resistance:[]}
  };
  const printedPsychicWeakCrossoverView={
    ...view,
    ownPublic:{...view.ownPublic,prizeCount:3,
      bench:[latias,sevenPsychicVmax],
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']},
    opponentPublic:{...view.opponentPublic,active:psychicWeakVmaxTarget}
  };
  const printedPsychicWeakCrossover=choosePostTimelessMaxGeistRetreat(
    printedPsychicWeakCrossoverView,postTimelessCatalog,{ownerSeat:0});
  assert.ok(printedPsychicWeakCrossover,
    'printed Psychic Weakness must be used in the Power Beam/Max Geist terminal crossover');
  assert.equal(printedPsychicWeakCrossover.weaknessMultiplier,2);
  assert.equal(printedPsychicWeakCrossover.projectedPrintedDamage,220);
  assert.equal(printedPsychicWeakCrossover.projectedDamage,440);
  assert.equal(printedPsychicWeakCrossover.competingPowerBeamDamage,400);
  assert.equal(printedPsychicWeakCrossover.competingPowerBeamWouldKo,false);
  assert.equal(printedPsychicWeakCrossover.projectedPrizeCount,3);
  assert.equal(printedPsychicWeakCrossover.projectedTerminalWin,true);
  assert.equal(printedPsychicWeakCrossover.routeComparison,
    'max-geist-unique-terminal-ko');

  const onePrizeRuleboxCatalog={...postTimelessCatalog};
  for(const printing of [
    'Synthetic Radiant','Synthetic Prism Star','Synthetic BREAK'
  ]){
    const onePrizeTarget={
      ...target,printing,hp:100,damage:0,
      printed:{stage:'Basic',types:[6],subtypes:[],weakness:[],resistance:[]}
    };
    const onePrizeView={
      ...view,
      ownPublic:{...view.ownPublic,prizeCount:1,
        bench:[latias,vmax],discard:['Dialga-GX UPR']},
      opponentPublic:{...view.opponentPublic,active:onePrizeTarget}
    };
    const onePrizeIntent=choosePostTimelessMaxGeistRetreat(
      onePrizeView,onePrizeRuleboxCatalog,{ownerSeat:0});
    assert.ok(onePrizeIntent);
    assert.equal(onePrizeIntent.projectedPrizeCount,1,
      printing+' yields one Prize despite having a Rule Box');
    assert.equal(onePrizeIntent.projectedTerminalWin,true);
  }

  const radiantCrossoverTarget={
    ...target,printing:'Synthetic Radiant Crossover',hp:210,damage:0,
    printed:{stage:'Basic',types:[6],subtypes:[],
      weakness:[],resistance:[]}
  };
  const radiantCrossoverView={
    ...view,
    ownPublic:{...view.ownPublic,prizeCount:2,
      bench:[latias,sevenPsychicVmax],
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']},
    opponentPublic:{...view.opponentPublic,active:radiantCrossoverTarget}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    radiantCrossoverView,onePrizeRuleboxCatalog,{ownerSeat:0}),null,
    'a unique one-Prize Radiant KO is not terminal with two Prizes remaining');

  for(const side of ['ownPublic','opponentPublic']){
    const wondrousLabyrinthView={
      ...view,
      [side]:{...view[side],stadium:['Wondrous Labyrinth Prism Star TEU']}
    };
    assert.equal(choosePostTimelessMaxGeistRetreat(
      wondrousLabyrinthView,postTimelessCatalog,{ownerSeat:0}),null,
      'actor-observation Stadium arrays must expose Wondrous Labyrinth on either side');
  }
  const unknownStadiumView={
    ...view,
    opponentPublic:{...view.opponentPublic,stadium:null}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    unknownStadiumView,postTimelessCatalog,{ownerSeat:0}),null,
    'a missing public Stadium array cannot certify that Max Geist cost is payable');

  const twoEnergyVmax={...vmax,energies:[psychic,psychic]};
  const threeEnergyMimikyu={...active,energies:[psychic,psychic,psychic]};
  const twoEnergyWithoutDiscount={
    ...view,
    ownPublic:{...view.ownPublic,active:threeEnergyMimikyu,
      bench:[latias,clefairy,twoEnergyVmax]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    twoEnergyWithoutDiscount,postTimelessCatalog,{ownerSeat:0}),null,
    'two attached Energy cannot pay printed Max Geist without Dimension Valley');
  for(const side of ['ownPublic','opponentPublic']){
    const dimensionValleyView={
      ...twoEnergyWithoutDiscount,
      [side]:{...twoEnergyWithoutDiscount[side],
        stadium:['Dimension Valley PHF 93']}
    };
    const discounted=choosePostTimelessMaxGeistRetreat(
      dimensionValleyView,postTimelessCatalog,{ownerSeat:0});
    assert.ok(discounted,
      'Dimension Valley discounts Max Geist whether stored in either public Stadium zone');
    assert.equal(discounted.projectedPrintedDamage,160,
      'the retreat preserves all five Basic Psychic Energy on the board');
    assert.equal(discounted.projectedDamage,320,
      'Fairy Zone doubles the discounted Max Geist route against a Dragon');
  }

  const psychicResistantTarget={
    ...target,printing:'Synthetic Psychic-resistant target',hp:100,damage:0,
    printed:{stage:'Basic',types:[6],weakness:[],
      resistance:[{type:catalog.basicEnergyTypes.Psychic,value:20}]}
  };
  assert.equal(opponentActiveHasUnmodelledDamageModifier(
    psychicResistantTarget,postTimelessCatalog),true,
    'numeric Twinleaf Psychic resistance must be recognized as an unmodelled damage modifier');
  const psychicResistanceView={
    ...view,
    ownPublic:{...view.ownPublic,bench:[latias,vmax]},
    opponentPublic:{...view.opponentPublic,active:psychicResistantTarget}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    psychicResistanceView,postTimelessCatalog,{ownerSeat:0}),null);

  const unmodelledWeaknessAbilities=[
    {printing:'Aegislash XY5 100',name:'Miracle Guard',
      text:'Each of your Pokémon has no Weakness.'},
    {printing:'Leavanny BW11 12',name:'Leaf Tailor',
      text:'Each of your Pokémon that has any Energy attached to it has no Weakness.'},
    {printing:'Vileplume BW7 3',name:'Allergy Panic',
      text:"Apply Weakness for each Pokémon (both yours and your opponent's) as ×4 instead."}
  ];
  for(const entry of unmodelledWeaknessAbilities){
    const abilityBearer={
      ...target,printing:entry.printing,abilities:[entry.name],
      abilityDetails:[{name:entry.name,text:entry.text}]
    };
    const weaknessModifierView={
      ...view,
      opponentPublic:{
        ...view.opponentPublic,
        active:entry.name==='Leaf Tailor'?{...target,energies:[psychic]}:target,
        bench:[abilityBearer]
      }
    };
    assert.equal(choosePostTimelessMaxGeistRetreat(
      weaknessModifierView,postTimelessCatalog,{ownerSeat:0}),null,
      entry.name+' is an unmodelled public Weakness modifier and must fail closed');
  }

  const vileplumeBus={
    ...target,printing:'Vileplume BUS 6',hp:140,
    abilities:['Disgusting Pollen'],
    abilityDetails:[{name:'Disgusting Pollen',
      text:"As long as this Pokémon is your Active Pokémon, your opponent's Basic Pokémon can't attack."}]
  };
  const busPowerBeamView={
    ...view,
    ownPublic:{...view.ownPublic,
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']},
    opponentPublic:{...view.opponentPublic,active:vileplumeBus}
  };
  const busIntent=choosePostTimelessMaxGeistRetreat(
    busPowerBeamView,postTimelessCatalog,{ownerSeat:0});
  assert.ok(busIntent,
    'Active Vileplume BUS Disgusting Pollen blocks Basic Mimikyu Copycat, not the promoted VMAX');
  assert.equal(busIntent.competingPowerBeamAvailable,false);
  assert.equal(busIntent.routeComparison,'max-geist-only-known-route');

  const vileplumeAor={
    ...target,printing:'Vileplume AOR 3',
    abilities:['Irritating Pollen'],
    abilityDetails:[{name:'Irritating Pollen',
      text:"Each player can't play any Item cards from his or her hand."}]
  };
  const aorPowerBeamView={
    ...busPowerBeamView,
    opponentPublic:{...busPowerBeamView.opponentPublic,active:vileplumeAor}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    aorPowerBeamView,postTimelessCatalog,{ownerSeat:0}),null,
    'AOR Vileplume Item lock does not disable Copycat, so a payable terminal Power Beam remains preferable');

  const opponentFairyZone={
    ...target,printing:"Lillie's Clefairy ex JTG",
    abilities:['Fairy Zone'],
    abilityDetails:[{name:'Fairy Zone',
      text:"The Weakness of each of your opponent's Dragon Pokémon in play is now Psychic."}]
  };
  const candidateDialga={
    ...target,printing:'Dialga-GX UPR',
    abilities:[],abilityDetails:[],energies:[],tools:[],attacks:[],
    printed:{stage:'Basic',types:['Dragon'],subtypes:['Basic','GX'],
      weakness:[],resistance:[]}
  };
  const opponentFairyZoneView={
    ...view,
    ownPublic:{...view.ownPublic,
      bench:[latias,clefairy,vmax,candidateDialga]},
    opponentPublic:{...view.opponentPublic,bench:[opponentFairyZone]}
  };
  assert.ok(choosePostTimelessMaxGeistRetreat(
    opponentFairyZoneView,postTimelessCatalog,{ownerSeat:0}),
    'opponent Fairy Zone changes the candidate Dragon board, not the opponent Active target used for outgoing damage');
  assert.equal(choosePostTimelessMaxGeistRetreat({
    ...opponentFairyZoneView,
    opponentPublic:{...opponentFairyZoneView.opponentPublic,bench:[{
      ...opponentFairyZone,abilityDetails:[{name:'Fairy Zone',text:null}]
    }]}
  },postTimelessCatalog,{ownerSeat:0}),null,
  'the directional Fairy Zone exemption requires the exact public Ability text');

  const swayingCradily={
    ...target,printing:'Cradily SM12 11',
    abilities:['Swaying Strangle'],
    abilityDetails:[{name:'Swaying Strangle',
      text:"Your opponent's Pokémon that are affected by Special Conditions can't retreat."}]
  };
  const statusMimikyu={...active,specialConditions:['BURNED']};
  const swayingRetreatView={
    ...view,
    ownPublic:{...view.ownPublic,active:statusMimikyu},
    opponentPublic:{...view.opponentPublic,bench:[swayingCradily]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    swayingRetreatView,postTimelessCatalog,{ownerSeat:0}),null,
    'Cradily SM12 blocks retreat of a status-affected Mimikyu even when it is Benched');
  assert.ok(choosePostTimelessMaxGeistRetreat({
    ...view,opponentPublic:{...view.opponentPublic,bench:[swayingCradily]}
  },postTimelessCatalog,{ownerSeat:0}),
  'Cradily SM12 does not block a retreating Pokémon with no Special Condition');

  const suctionCradily={
    ...target,printing:'Cradily EX2 3',
    abilities:['Super Suction Cups'],
    abilityDetails:[{name:'Super Suction Cups',
      text:"As long as Cradily is your Active Pokémon, your opponent's Pokémon can't retreat."}]
  };
  assert.equal(choosePostTimelessMaxGeistRetreat({
    ...view,opponentPublic:{...view.opponentPublic,active:suctionCradily}
  },postTimelessCatalog,{ownerSeat:0}),null,
  'Cradily EX2 active retreat lock is distinct from the conditional SM12 ability');

  const poisonBarrierDragalge={
    ...target,printing:'Dragalge XY2 71',
    abilities:['Poison Barrier'],
    abilityDetails:[{name:'Poison Barrier',
      text:"Your opponent's Poisoned Pokémon can't retreat."}]
  };
  const poisonedMimikyu={...active,specialConditions:['POISONED']};
  assert.equal(choosePostTimelessMaxGeistRetreat({
    ...view,
    ownPublic:{...view.ownPublic,active:poisonedMimikyu},
    opponentPublic:{...view.opponentPublic,bench:[poisonBarrierDragalge]}
  },postTimelessCatalog,{ownerSeat:0}),null,
  'Dragalge Poison Barrier blocks a Poisoned Mimikyu retreat');

  const frigidRoomVanilluxe={
    ...target,printing:'Vanilluxe SV4 45',
    abilities:['Frigid Room'],
    abilityDetails:[{name:'Frigid Room',
      text:"Your opponent's Pokémon that have 40 HP or less remaining can't attack."}]
  };
  const fragileVmax={...vmax,damage:280};
  assert.equal(choosePostTimelessMaxGeistRetreat({
    ...view,
    ownPublic:{...view.ownPublic,bench:[latias,clefairy,fragileVmax]},
    opponentPublic:{...view.opponentPublic,bench:[frigidRoomVanilluxe]}
  },postTimelessCatalog,{ownerSeat:0}),null,
  'Vanilluxe Frigid Room blocks Max Geist when the promoted VMAX has 40 HP remaining');

  const fragileMimikyu={...active,damage:30,energies:[psychic,psychic]};
  const frigidCopycatView={
    ...view,
    ownPublic:{...view.ownPublic,active:fragileMimikyu,
      bench:[latias,clefairy,vmax],
      discard:['Dialga-GX UPR','Radiant Eternatus CRZ']},
    opponentPublic:{...view.opponentPublic,bench:[frigidRoomVanilluxe]}
  };
  const frigidIntent=choosePostTimelessMaxGeistRetreat(
    frigidCopycatView,postTimelessCatalog,{ownerSeat:0});
  assert.ok(frigidIntent);
  assert.equal(frigidIntent.competingPowerBeamAvailable,false,
    'Frigid Room blocks the 40-HP Mimikyu Copycat but not the healthy VMAX Max Geist');

  const unknownOpponentAbility={
    ...vileplumeBus,abilityDetails:undefined
  };
  assert.equal(choosePostTimelessMaxGeistRetreat({
    ...busPowerBeamView,
    opponentPublic:{...busPowerBeamView.opponentPublic,active:unknownOpponentAbility}
  },postTimelessCatalog,{ownerSeat:0}),null,
  'unknown opponent Ability text cannot certify a Basic attacker lock or Copycat legality');

  const unsupportedStadiumView={
    ...view,
    ownPublic:{...view.ownPublic,stadium:['Parallel City BKT 145']}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    unsupportedStadiumView,postTimelessCatalog,{ownerSeat:0}),null,
    'an unmodeled Stadium must not be treated as inert');

  const missingSuppressionEpoch={
    ...view,
    ownPublic:{...view.ownPublic,publicTurnRestrictions:{
      ...view.ownPublic.publicTurnRestrictions,
      stadiumAndToolHaveNoEffectTurnsRemaining:undefined
    }}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    missingSuppressionEpoch,postTimelessCatalog,{ownerSeat:0}),null,
    'a missing public Stadium-suppression epoch cannot certify attack cost');

  const suppressedValley={
    ...twoEnergyWithoutDiscount,
    ownPublic:{...twoEnergyWithoutDiscount.ownPublic,
      stadium:['Dimension Valley PHF 93'],
      publicTurnRestrictions:{
        ...twoEnergyWithoutDiscount.ownPublic.publicTurnRestrictions,
        stadiumAndToolHaveNoEffectTurnsRemaining:1
      }}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    suppressedValley,postTimelessCatalog,{ownerSeat:0}),null,
    'Shiftry-style suppression disables Dimension Valley discount for the acting player');

  const suppressedHeadquarters={
    ...hqTwoEnergyView,
    ownPublic:{...hqTwoEnergyView.ownPublic,
      publicTurnRestrictions:{
        ...hqTwoEnergyView.ownPublic.publicTurnRestrictions,
        stadiumAndToolHaveNoEffectTurnsRemaining:1
      }}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    suppressedHeadquarters,postTimelessCatalog,{ownerSeat:0}),null,
    'suppression also disables Headquarters surcharge, exposing the payable Power Beam competitor');

  const newMoonLunatone={
    printing:'Lunatone OBF 92',abilities:['New Moon'],
    abilityDetails:[{name:'New Moon',
      text:'If you have Solrock in play, prevent all effects of any Stadium done to your Pokémon in play.'}],
    tools:[],energies:[],attacks:[],publicRestrictions:{},specialConditions:[],
    printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],weakness:[],resistance:[]}
  };
  const newMoonSolrock={
    printing:'Solrock CES 62',abilities:[],abilityDetails:[],
    tools:[],energies:[],attacks:[],publicRestrictions:{},specialConditions:[],
    printed:{stage:'Basic',types:['Fighting'],subtypes:['Basic'],weakness:[],resistance:[]}
  };
  const newMoonValley={
    ...twoEnergyWithoutDiscount,
    ownPublic:{...twoEnergyWithoutDiscount.ownPublic,
      stadium:['Dimension Valley PHF 93'],
      bench:[latias,clefairy,twoEnergyVmax,newMoonLunatone,newMoonSolrock]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    newMoonValley,postTimelessCatalog,{ownerSeat:0}),null,
    'Lunatone New Moon plus Solrock suppresses Dimension Valley for the candidate VMAX');

  const newMoonHeadquarters={
    ...hqTwoEnergyView,
    ownPublic:{...hqTwoEnergyView.ownPublic,
      bench:[latias,clefairy,vmax,newMoonLunatone,newMoonSolrock]}
  };
  assert.equal(choosePostTimelessMaxGeistRetreat(
    newMoonHeadquarters,postTimelessCatalog,{ownerSeat:0}),null,
    'New Moon suppresses Headquarters surcharge on Mimikyu and reveals the terminal Power Beam route');
});


test('post-Timeless Mimikyu prompt selects the strongest public non-GX Dragon payload',()=>{
  const {
    VERSION:powerBeamVersion,
    knownDamage,
    chooseNativeMimikyuPostTimelessPowerBeamPrompt
  }=require('../simulation/twinleaf/2026-11/agent8-mimikyu-post-timeless-powerbeam-prompt.cjs');
  const powerBeam={name:'Power Beam',damage:200,gxAttack:false};
  const radiant={fullName:'Radiant Eternatus CRZ',attacks:[powerBeam]};
  const dialga={fullName:'Dialga-GX UPR',attacks:[
    {name:'Overclock',damage:null,text:'Search your deck for Energy cards.'},
    {name:'Shred',damage:80,gxAttack:false},
    {name:'Timeless-GX',damage:150,gxAttack:true}
  ]};
  const owner={
    id:0,active:{getPokemonCard:()=>({fullName:'Mimikyu GRI'})},
    usedGX:true,usedTurnSkip:true,discard:{cards:[dialga,radiant]}
  };
  const opponent={id:1};
  const state={activePlayer:0,turn:8,players:[owner,opponent]};
  const tracker={
    getCopycatChoices:id=>id===1?[{turn:7,
      sourceCardFullName:'Regidrago VSTAR SIT',attackName:'Apex Dragon',
      gxAttack:false}]:[],
    getPreviousTurnSnapshot:id=>id===1?{turn:7}:null
  };
  class ChooseAttackPrompt {
    constructor(){
      this.playerId=owner.id;
      this.cards=[dialga,radiant];
      this.validate=attack=>attack===powerBeam||
        dialga.attacks.includes(attack);
    }
  }
  const prompt=new ChooseAttackPrompt();
  const selected=chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    state,0,prompt,tracker);
  assert.equal(selected,powerBeam,
    'the exact validated Power Beam Attack object should be returned');
  assert.equal(selected.damage,200);
  assert.equal(powerBeamVersion,'agent8-mimikyu-post-timeless-powerbeam-prompt-v1');

  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    {...state,players:[{...owner,usedTurnSkip:false},opponent]},
    0,prompt,tracker),null,'no bonus turn means no post-Timeless prompt');
  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    {...state,players:[{...owner,usedGX:false},opponent]},
    0,prompt,tracker),null,'an unspent GX must remain with Timeless selection');
  const nonApex={...tracker,getCopycatChoices:()=>[{
    turn:7,sourceCardFullName:'Regidrago VSTAR SIT',
    attackName:'Dragon Energy',gxAttack:false
  }]};
  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    state,0,prompt,nonApex),null);
  const stronger={...dialga,attacks:[...dialga.attacks,
    {name:'Greater Dragon Blast',damage:220,gxAttack:false}]};
  const strongerPrompt=new ChooseAttackPrompt();
  strongerPrompt.cards=[stronger,radiant];
  strongerPrompt.validate=()=>true;
  const strongerOwner={...owner,discard:{cards:[stronger,radiant]}};
  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    {...state,players:[strongerOwner,opponent]},0,strongerPrompt,tracker),null,
    'do not select Power Beam when a stronger legal non-GX payload exists');
  const unknown={name:'Variable Dragon Attack',damage:null,
    damageCalculation:{kind:'variable'},text:'This attack does damage based on Energy.'};
  const unknownPrompt=new ChooseAttackPrompt();
  unknownPrompt.cards=[{...dialga,attacks:[unknown]},radiant];
  unknownPrompt.validate=()=>true;
  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    {...state,players:[{...owner,discard:{cards:[unknownPrompt.cards[0],radiant]}},opponent]},
    0,unknownPrompt,tracker),null,
    'unknown variable damage must fail closed');

  assert.equal(knownDamage({damage:'150+'}),null,
    'a printed plus suffix is not an exact damage total');
  assert.equal(knownDamage({damage:150,damageCalculation:{kind:'variable'}}),null,
    'a dynamic damage calculation overrides a numeric base field');

  const plusAttack={name:'Variable Dragon Attack',damage:'150+',gxAttack:false};
  const plusPrompt=new ChooseAttackPrompt();
  const plusDonor={...dialga,attacks:[plusAttack]};
  plusPrompt.cards=[plusDonor,radiant];
  plusPrompt.validate=()=>true;
  const plusOwner={...owner,discard:{cards:[plusDonor,radiant]}};
  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    {...state,players:[plusOwner,opponent]},0,plusPrompt,tracker),null,
    'a 150+ attack may exceed Power Beam and must force abstention');

  const calculatedAttack={name:'Variable Dragon Attack',damage:150,
    damageCalculation:{kind:'variable'},gxAttack:false};
  const calculatedPrompt=new ChooseAttackPrompt();
  const calculatedDonor={...dialga,attacks:[calculatedAttack]};
  calculatedPrompt.cards=[calculatedDonor,radiant];
  calculatedPrompt.validate=()=>true;
  const calculatedOwner={...owner,discard:{cards:[calculatedDonor,radiant]}};
  assert.equal(chooseNativeMimikyuPostTimelessPowerBeamPrompt(
    {...state,players:[calculatedOwner,opponent]},0,calculatedPrompt,tracker),null,
    'a numeric base with a dynamic calculation must force abstention');
});

test('bilateral setup prompts stay inside the owner-scoped actor-only role boundary',()=>{
  const GamePhase={SETUP:1,PLAYER_TURN:2,FINISHED:7};
  const GameMessage={
    CHOOSE_STARTING_POKEMONS:'CHOOSE_STARTING_POKEMONS',
    GO_FIRST:'GO_FIRST'
  };
  const Stage={BASIC:0,STAGE_1:1};
  const CardTag={PLAY_DURING_SETUP:'PLAY_DURING_SETUP'};
  const makeCard=(fullName,stage,tags=[])=>({fullName,stage,tags});
  const candidate={
    id:101,
    hand:{cards:[
      makeCard('Candidate Basic A',Stage.BASIC),
      makeCard('Candidate Evolution',Stage.STAGE_1),
      makeCard('Candidate Basic B',Stage.BASIC)
    ]}
  };
  const opponent={
    id:202,
    hand:{cards:[makeCard('Opponent Basic',Stage.BASIC)]}
  };
  for(const owner of [candidate,opponent]){
    Object.defineProperty(owner,'deck',{get(){
      throw new Error('setup policy must not inspect either hidden deck');
    }});
  }
  class ChooseCardsPrompt{
    constructor(id,owner){
      this.id=id;this.playerId=owner.id;
      this.message=GameMessage.CHOOSE_STARTING_POKEMONS;
      this.cards=owner.hand;this.result=undefined;
      this.options={min:1,max:6,blocked:[],allowCancel:false};
    }
    validate(selection){
      return Array.isArray(selection)&&
        selection.length>=this.options.min&&
        selection.length<=this.options.max&&
        selection.every(card=>this.cards.cards.includes(card)&&
          (card.stage===Stage.BASIC||
            card.tags.includes(CardTag.PLAY_DURING_SETUP))&&
          !this.options.blocked.includes(this.cards.cards.indexOf(card)));
    }
  }
  class ConfirmPrompt{
    constructor(id,playerId){
      this.id=id;this.playerId=playerId;
      this.message=GameMessage.GO_FIRST;this.result=undefined;
    }
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class AddPlayerAction{}
  class Store{
    constructor(){
      this.state={players:[candidate,opponent],activePlayer:0,
        turn:0,phase:GamePhase.SETUP,prompts:[]};
    }
    dispatch(action){
      if(action instanceof ResolvePromptAction){
        const prompt=this.state.prompts.find(item=>item.id===action.id);
        assert.ok(prompt,'native Store receives the exact pending prompt');
        prompt.result=action.result;
        this.state.prompts=this.state.prompts.filter(item=>item!==prompt);
      }
      return true;
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return 'UNSAFE_NATIVE_PROMPT_FALLBACK';}
  }
  const setupPromptTypes={ChooseCardsPrompt,ConfirmPrompt,GameMessage,Stage,CardTag};
  const commonDeps={
    SimpleTacticsAi,Store,GamePhase,setupPromptTypes,
    promptActions:{ResolvePromptAction},
    observe:()=>base(),getCatalog:()=>catalog,getNativeTrainerCatalog:()=>({}),
    cardActions:{PlayCardAction:class{},
      PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
      SlotType:{ACTIVE:1,BENCH:2}},
    gameActions:{AttackAction:class{},PassTurnAction:class{}}
  };
  const roles=withCandidateOpponentPolicyRoles(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());

    const candidateStart=new ChooseCardsPrompt(1,candidate);
    store.state.prompts=[candidateStart];
    const candidateStartAction=new SimpleTacticsAi(candidate.id)
      .decodeNextAction(store.state);
    assert.ok(candidateStartAction instanceof ResolvePromptAction);
    assert.deepEqual(candidateStartAction.result.map(card=>card.fullName),
      ['Candidate Basic A','Candidate Basic B']);
    store.dispatch(candidateStartAction);

    const opponentStart=new ChooseCardsPrompt(2,opponent);
    store.state.prompts=[opponentStart];
    const opponentStartAction=new SimpleTacticsAi(opponent.id)
      .decodeNextAction(store.state);
    assert.ok(opponentStartAction instanceof ResolvePromptAction);
    assert.deepEqual(opponentStartAction.result.map(card=>card.fullName),
      ['Opponent Basic']);
    store.dispatch(opponentStartAction);

    const goFirst=new ConfirmPrompt(3,candidate.id);
    store.state.prompts=[goFirst];
    const goFirstAction=new SimpleTacticsAi(candidate.id)
      .decodeNextAction(store.state);
    assert.ok(goFirstAction instanceof ResolvePromptAction);
    assert.equal(goFirstAction.result,false,
      'GO_FIRST reproduces Twinleaf ConfirmPromptResolver default');
    store.dispatch(goFirstAction);

    return {candidateStartAction,opponentStartAction,goFirstAction};
  },{
    candidateSeat:0,opponentSeat:1,commonDeps
  });

  assert.equal(roles.actorOnlyBoundary.valid,true,
    roles.actorOnlyBoundary.failures.join(','));
  assert.deepEqual(roles.actorOnlyBoundary.failures,[]);
  assert.equal(roles.candidateAudit.setupStartingBasicPromptsHandled,1);
  assert.deepEqual(roles.candidateAudit.setupStartingBasicPromptsBySeat,[1,0]);
  assert.equal(roles.candidateAudit.setupGoFirstPromptsHandled,1);
  assert.deepEqual(roles.candidateAudit.setupGoFirstPromptsBySeat,[1,0]);
  assert.equal(roles.opponentAudit.setupStartingBasicPromptsHandled,1);
  assert.deepEqual(roles.opponentAudit.setupStartingBasicPromptsBySeat,[0,1]);
  assert.equal(roles.opponentAudit.setupGoFirstPromptsHandled,0);
  assert.equal(roles.candidateAudit.unsupportedPromptFallbacks,0);
  assert.equal(roles.opponentAudit.unsupportedPromptFallbacks,0);
  assert.equal(roles.candidateAudit.nonOwnerSeatBypassCalls,0);
  assert.equal(roles.opponentAudit.nonOwnerSeatBypassCalls,0);
  assert.equal(roles.candidateAudit.peerRoleDelegations,1);
  assert.equal(roles.opponentAudit.ownerDecisionCalls,1);
  assert.equal(roles.candidateAudit.setupPromptActionsSubmitted,2);
  assert.equal(roles.opponentAudit.setupPromptActionsSubmitted,1);
  assert.ok(roles.candidateAudit.setupPromptDecisions.every(
    receipt=>receipt.nativeDispatch==='dispatch-returned'));
  assert.ok(roles.opponentAudit.setupPromptDecisions.every(
    receipt=>receipt.nativeDispatch==='dispatch-returned'));
});
