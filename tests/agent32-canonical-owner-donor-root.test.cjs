'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {MEWTWO}=require('../simulation/twinleaf/new-moon-compressor-payload-policy.cjs');
const {withCanonicalOwnerDonorRoot}=require(
  '../simulation/twinleaf/agent32-canonical-owner-donor-root.cjs');

/** @returns {object} Minimal known owner/card text without concealed identities. */
function fixture(){
  const owner={
    id:101,hand:{cards:[{name:'Battle Compressor',fullName:'Battle Compressor PHF'}]},
    active:{getPokemonCard:()=>({fullName:MEWTWO})},
    bench:[],deck:{cards:[{fullName:'unobserved'}]},
    discard:{cards:[]},cannotPlayItemCards:false
  };
  const other={id:202,hand:{cards:[{fullName:'secret1'}]},
    deck:{cards:[{fullName:'secret2'}]}};
  return {state:{players:[owner,other],turn:31,phase:3,activePlayer:0,
    prompts:[]},owner,other};
}

/** @returns {object} Pinned-shaped injected Store classes. */
function classes(state){
  class FakeAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {kind:'native-fallback'};}
  }
  class FakeStore{
    constructor(){this.state=state;this.accepted=[];}
    dispatch(action){this.accepted.push(action);return action;}
  }
  class FakePlayCardAction{
    constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
  }
  const store=new FakeStore();
  return {store,FakeAi,FakeStore,FakePlayCardAction,
    dependencies:{SimpleTacticsAi:FakeAi,Store:FakeStore,
      GamePhase:{PLAYER_TURN:3},PlayCardAction:FakePlayCardAction,
      PlayerType:{ANY:2},SlotType:{BOARD:3},liveStore:store}};
}

test('real owner root can take held Compressor after the archived early gate',()=>{
  const {state}=fixture();
  const {store,FakeAi,dependencies}=classes(state);
  const originalAi=FakeAi.prototype.decodeNextAction;
  const selected=withCanonicalOwnerDonorRoot(()=>{
    const action=new FakeAi(101).decodeNextAction(state);
    assert.ok(action instanceof dependencies.PlayCardAction);
    assert.equal(action.id,101);
    assert.equal(action.handIndex,0);
    assert.deepEqual(action.target,{player:2,slot:3,index:0});
    store.dispatch(action);
    return action;
  },{seat:0,setup:{maxGlobalTurn:Number.POSITIVE_INFINITY}},dependencies);
  assert.ok(selected.result instanceof dependencies.PlayCardAction);
  assert.equal(selected.audit.chosenRoots,1);
  assert.equal(selected.audit.dispatchAccepted,1);
  assert.equal(selected.audit.dispatchRejected,0);
  assert.deepEqual(selected.audit.chosenTurns,[31]);
  assert.equal(FakeAi.prototype.decodeNextAction,originalAi,
    'Policy must be reversible after the native game finishes');
});

test('native opponent, prompt and ineligible owner decisions remain delegated',()=>{
  const {state,owner}=fixture();
  const {FakeAi,dependencies}=classes(state);
  const selected=withCanonicalOwnerDonorRoot(()=>{
    const opponent=new FakeAi(202).decodeNextAction(state);
    assert.equal(opponent.kind,'native-fallback');
    state.prompts.push({result:undefined});
    assert.equal(new FakeAi(101).decodeNextAction(state).kind,'native-fallback');
    state.prompts=[];
    owner.cannotPlayItemCards=true;
    assert.equal(new FakeAi(101).decodeNextAction(state).kind,'native-fallback');
    return 1;
  },{seat:0,setup:{maxGlobalTurn:Number.POSITIVE_INFINITY}},dependencies);
  assert.equal(selected.audit.chosenRoots,0);
  assert.equal(selected.audit.dispatchAccepted,0);
});

test('owner and opponent hidden deck identities do not change root proposal',()=>{
  const {state,owner,other}=fixture();
  const {FakeAi,dependencies}=classes(state);
  const decision=()=>withCanonicalOwnerDonorRoot(
    ()=>new FakeAi(101).decodeNextAction(state),
    {seat:0,setup:{maxGlobalTurn:Number.POSITIVE_INFINITY}},dependencies);
  const first=decision();
  owner.deck.cards=[{fullName:'different concealed card'}];
  other.hand.cards=[{fullName:'other concealed card'}];
  other.deck.cards=[{fullName:'new concealed order'}];
  const second=decision();
  assert.deepEqual(
    [first.result.id,first.result.handIndex,first.result.target],
    [second.result.id,second.result.handIndex,second.result.target]);
  assert.equal(first.audit.realOwnerDeckReadBeforePrompt,false);
  assert.equal(second.audit.realOwnerDeckReadBeforePrompt,false);
});
