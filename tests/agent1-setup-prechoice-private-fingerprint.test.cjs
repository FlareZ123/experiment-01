'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withSetupPrechoicePrivateFingerprint}=require(
  '../simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs'
);

function mockNative(){
  class AddPlayerAction{}
  class ChooseCardsPrompt{
    constructor(owner){
      this.playerId=owner.id;
      this.cards=owner.hand;
      this.options={min:1,max:1};
      this.message='CHOOSE_STARTING_POKEMONS';
      this.result=undefined;
    }
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(){return 'real-native-dispatched';}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return 'native-policy-choice';}
  }
  const exportMap={
    'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
    'game/store/store':{Store},
    'game/store/actions/add-player-action':{AddPlayerAction},
    'game/store/prompts/choose-cards-prompt':{ChooseCardsPrompt},
    'game/game-message':{GameMessage:{
      CHOOSE_STARTING_POKEMONS:'CHOOSE_STARTING_POKEMONS'
    }},
    'game/store/state/state':{GamePhase:{SETUP:1}}
  };
  const engine=name=>{
    assert.ok(Object.prototype.hasOwnProperty.call(exportMap,name),name);
    return exportMap[name];
  };
  const owner=(id,seed)=>({
    id,hand:{cards:Array.from({length:7},(_,j)=>({
      fullName:'SECRET_HAND_'+seed+'_'+j
    }))},
    deck:{cards:Array.from({length:53},(_,j)=>({
      fullName:'SECRET_DECK_'+seed+'_'+j
    }))},
    prizes:[]
  });
  return {engine,owner,Store,SimpleTacticsAi,
    AddPlayerAction,ChooseCardsPrompt};
}

test('first genuine owner setup prompt captures hashed private prechoice hand+deck once per seat/store',()=>{
  const n=mockNative(),events=[];
  const out=withSetupPrechoicePrivateFingerprint(()=>{
    for(let game=0;game<2;game++){
      const people=[n.owner(101,'source-'+game),
        n.owner(202,'candidate-'+game)];
      const state={players:people,turn:0,phase:1,prompts:[]};
      const store=new n.Store(state);
      store.dispatch(new n.AddPlayerAction());
      for(let seat=0;seat<2;seat++){
        state.prompts=[new n.ChooseCardsPrompt(people[seat])];
        const ai=new n.SimpleTacticsAi(people[seat].id);
        events.push(ai.decodeNextAction(state));
        // A second evaluation on same owner prompt is not a new deal.
        events.push(ai.decodeNextAction(state));
        state.prompts=[];
      }
    }
    return 99;
  },{engine:n.engine});
  assert.equal(out.result,99);
  assert.equal(events.length,8);
  assert.ok(events.every(s=>s==='native-policy-choice'));
  assert.equal(out.audit.exactNativeStoreRootsRecorded,2);
  assert.equal(out.audit.firstOwnerSetupInputsObserved,4);
  assert.equal(out.audit.duplicateOwnerPromptsOmitted,4);
  assert.deepEqual(out.audit.events.map(x=>[
    x.nativeStoreOrdinal,x.physicalOwnerSeat
  ]),[[1,0],[1,1],[2,0],[2,1]]);
  for(const e of out.audit.events){
    assert.equal(e.firstBeforeAnyOwnerSetupChoice,true);
    assert.equal(e.ownerHandCount,7);
    assert.equal(e.ownerDeckCount,53);
    assert.equal(e.ownerPrizeCount,0);
    assert.equal(e.globalTurnAtCapture,0);
    assert.match(e.opaquePhysicalPrechoiceInputSha256,/^[0-9a-f]{64}$/);
  }
  const printed=JSON.stringify(out.audit);
  assert.ok(!printed.includes('SECRET_HAND'));
  assert.ok(!printed.includes('SECRET_DECK'));
  assert.equal(out.audit.policyChoiceActionsIssued,0);
  assert.equal(out.audit.qualifiesMatchedCompetitiveGames,false);
});

test('same physical pre-choice input is stable under distinct downstream setup choices',()=>{
  const n=mockNative();
  const observed=[];
  for(const treatment of ['all-basics','hold-entry-support']){
    const receipt=withSetupPrechoicePrivateFingerprint(()=>{
      const players=[n.owner(101,'same-source'),n.owner(202,'same-candidate')];
      const state={turn:0,phase:1,prompts:[],players};
      const store=new n.Store(state);
      store.dispatch(new n.AddPlayerAction());
      for(let seat=0;seat<2;seat++){
        state.prompts=[new n.ChooseCardsPrompt(players[seat])];
        new n.SimpleTacticsAi(players[seat].id).decodeNextAction(state);
      }
      if(treatment==='all-basics')
        players[0].hand.cards.shift();
      else
        players[0].hand.cards.pop();
      return treatment;
    },{engine:n.engine});
    observed.push(receipt.audit.events.map(e=>
      e.opaquePhysicalPrechoiceInputSha256));
  }
  assert.deepEqual(observed[0],observed[1],
    'A setup-policy intervention must not redefine its own pretreatment baseline');
});

test('detached speculative non-Store state never contributes to physical provenance',()=>{
  const n=mockNative();
  const receipt=withSetupPrechoicePrivateFingerprint(()=>{
    const source=n.owner(101,'actual');
    const state={turn:0,phase:1,players:[source],prompts:[]};
    const store=new n.Store(state);
    store.dispatch(new n.AddPlayerAction());
    const shadow={...state,prompts:[new n.ChooseCardsPrompt(source)]};
    new n.SimpleTacticsAi(101).decodeNextAction(shadow);
    assert.equal(n.SimpleTacticsAi.prototype.decodeNextAction.name,'decode');
    state.prompts=[new n.ChooseCardsPrompt(source)];
    new n.SimpleTacticsAi(101).decodeNextAction(state);
    return true;
  },{engine:n.engine});
  assert.equal(receipt.audit.firstOwnerSetupInputsObserved,1);
  assert.equal(receipt.audit.exactNativeStoreRootsRecorded,1);
});
