'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent,withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/**
 * A rank11-like public, one-Psychic paid attack against a co-held,
 * resource-payable Quick Ball; no opponent private fields or deck identities.
 * @param {boolean} funded
 * @returns {object} Detached owner root, input to the existing chooser.
 */
function actorView(funded=true){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:8,
    ownHand:['Quick Ball FST','Switch SVI','Switch SVI'],
    ownTurnResources:{itemPlayLocked:false,pokemonPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      energyPlayedTurn:8},
    ownPublic:{
      active:{name:'Absol',printing:'Absol TEU',
        energies:funded?['Psychic Energy MEE']:[],
        attacks:[{name:'Psychic',cost:[5],gxAttack:false}],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],deckCount:20,stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },opponentPublic:{stadium:[]}
  };
}
const QUICK={kind:'play-quick-ball',handIndex:0,printing:'Quick Ball FST'};
const ATTACK={kind:'attack',attackName:'Psychic'};

test('source attack preference corrects actual conflict while old default stays Quick Ball',()=>{
  const view=actorView();
  assert.deepEqual(chooseActorRootIntent(view,catalog,{quickBallRoot:true}),QUICK);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{
    quickBallRoot:true,quickBallPayableAttackPriority:true
  }),ATTACK);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{
    quickBallRoot:false,quickBallPayableAttackPriority:true
  }),ATTACK);
});

test('unfunded or blocked attack retains owner-visible Quick Ball opportunity',()=>{
  const unfunded=actorView(false);
  assert.deepEqual(chooseActorRootIntent(unfunded,catalog,{
    quickBallRoot:true,quickBallPayableAttackPriority:true
  }),QUICK);
  const asleep=actorView();
  asleep.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP];
  assert.deepEqual(chooseActorRootIntent(asleep,catalog,{
    quickBallRoot:true,quickBallPayableAttackPriority:true
  }),QUICK);
  const locked=actorView();
  locked.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.deepEqual(chooseActorRootIntent(locked,catalog,{
    quickBallRoot:true,quickBallPayableAttackPriority:true
  }),QUICK);
});

test('unsupported Quick Ball still chooses native-supported paid attack',()=>{
  const view=actorView();
  view.ownPublic.bench=Array.from({length:5},()=>({name:'Occupied'}));
  assert.deepEqual(chooseActorRootIntent(view,catalog,{
    quickBallRoot:true,quickBallPayableAttackPriority:true
  }),ATTACK);
});

test('source-only hook alters genuine owner root on either physical seat and leaves candidate unchanged',()=>{
  for(const sourceSeat of [0,1]){
    class AddPlayerAction{}
    class PlayCardAction{
      constructor(ownerId,handIndex){this.ownerId=ownerId;this.handIndex=handIndex;}
    }
    class AttackAction{
      constructor(ownerId,name){this.ownerId=ownerId;this.name=name;}
    }
    class PassTurnAction{
      constructor(ownerId){this.ownerId=ownerId;}
    }
    class Store{
      constructor(){
        const empty=()=>({getPokemonCard:()=>null,cards:[],damage:0,
          specialConditions:[],energies:{cards:[]},tools:[]});
        const player=id=>({id,active:empty(),
          bench:Array.from({length:5},empty),
          hand:{cards:[]},deck:{cards:[]},prizes:[],
          stadium:{cards:[]},discard:{cards:[]},
          lostzone:{cards:[]},supporter:{cards:[]}});
        this.state={
          turn:8,phase:2,prompts:[],activePlayer:sourceSeat,
          players:[player(10),player(11)]
        };
      }
      dispatch(){return true;}
    }
    class SimpleTacticsAi{
      constructor(id){this.client={id};}
      decodeNextAction(){throw Error('Hidden-state fallback forbidden');}
    }
    const options={
      quickBallRoot:true,quickBallRootOwnerSeat:sourceSeat,
      quickBallPayableAttackPriority:true
    };
    const prior=SimpleTacticsAi.prototype.decodeNextAction;
    const result=withActorOnlyRootPolicy(()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      const sourceAction=new SimpleTacticsAi(10+sourceSeat)
        .decodeNextAction(store.state);
      assert.ok(sourceAction instanceof AttackAction);
      assert.equal(sourceAction.name,'Psychic');
      store.dispatch(sourceAction);
      store.state.activePlayer=1-sourceSeat;
      const candidateAction=new SimpleTacticsAi(11-sourceSeat)
        .decodeNextAction(store.state);
      assert.ok(candidateAction instanceof AttackAction,
        'Candidate has no source Quick Ball entitlement');
      assert.equal(candidateAction.name,'Psychic');
      return {sourceAction,candidateAction};
    },{
      SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
      observe:(state,seat)=>({...actorView(),actorSeat:seat}),
      getCatalog:()=>catalog,
      cardActions:{PlayCardAction,PlayerType:{ANY:0,BOTTOM_PLAYER:0},
        SlotType:{BOARD:0}},
      gameActions:{AttackAction,PassTurnAction}
    });
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,prior);
    assert.equal(result.audit.quickBallPayableAttackPriorityOptIn,true);
    assert.equal(result.audit.selectedRootDecisions,2);
    assert.equal(result.audit.rejectedActorRoots,0);
    assert.equal(result.audit.competitiveGameQualified,false);
  }
});
