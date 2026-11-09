'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyShuffleSupporterAfterPass}=
  require('../../simulation/twinleaf/agent2-actor-only-shuffle-supporter-after-pass.cjs');
const {chooseDeckoutRescue}=
  require('../../simulation/twinleaf/2026-11/agent17-deckout-rescue-selector.cjs');

class AddPlayerAction{constructor(id){this.id=id;}}
class AttackAction{constructor(id){this.id=id;}}
class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new AttackAction(this.client.id);}
}
class Store{
  constructor(){
    this.state={turn:65,activePlayer:0,prompts:[],
      players:[makePlayer(101),makePlayer(202)]};
  }
  dispatch(action){
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.id);
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      assert.ok(card);
      owner.supporterTurn++;
    }
    return true;
  }
}
function makePlayer(id){
  return {id,hand:{cards:['Iono PAL',...Array(6).fill('Psychic Energy MEE')]
    .map(fullName=>({fullName}))},supporterTurn:0};
}
function observe(state,seat){
  const owner=state.players[seat];
  return {
    decisionKind:'owner-root',globalTurn:state.turn,
    ownHand:owner.hand.cards.map(c=>c.fullName),
    ownPublic:{active:{name:'Shadow Rider Calyrex VMAX'},
      deckCount:1,prizeCount:4,resolvingSupporter:[],
      publicTurnRestrictions:{}},
    ownTurnResources:{supporterPlayedTurn:owner.supporterTurn,
      supporterPlayLocked:false}
  };
}
const deps={SimpleTacticsAi,Store,observe,choose:chooseDeckoutRescue,
  cardActions:{PlayCardAction,PlayerType:{ANY:1},SlotType:{BOARD:2}}};

test('pre-attack rescue plays physically held Iono, then permits attack',()=>{
  const store=new Store(),previous=SimpleTacticsAi.prototype.decodeNextAction;
  const observed=withActorOnlyShuffleSupporterAfterPass(()=>{
    store.dispatch(new AddPlayerAction(101));
    const bot=new SimpleTacticsAi(101);
    const proposed=bot.decodeNextAction(store.state);
    assert.ok(proposed instanceof PlayCardAction);
    assert.equal(proposed.handIndex,0);
    store.dispatch(proposed);
    const next=bot.decodeNextAction(store.state);
    assert.ok(next instanceof AttackAction);
    return 'done';
  },{...deps,interceptAttack:true});
  assert.equal(observed.result,'done');
  assert.equal(observed.audit.attackRootsObserved,2);
  assert.equal(observed.audit.passRootsObserved,0);
  assert.equal(observed.audit.acceptedRoots,1);
  assert.equal(observed.audit.nativeRootOutcomes[0].family,'iono');
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,previous);
});
test('default after-Pass adapter preserves a preceding AttackAction',()=>{
  const store=new Store();
  const observed=withActorOnlyShuffleSupporterAfterPass(()=>{
    store.dispatch(new AddPlayerAction(101));
    return new SimpleTacticsAi(101).decodeNextAction(store.state);
  },deps);
  assert.ok(observed.result instanceof AttackAction);
  assert.equal(observed.audit.attackRootsObserved,0);
  assert.equal(observed.audit.acceptedRoots,0);
});
test('same owner policy can activate for either physical seat',()=>{
  const store=new Store();
  store.state.activePlayer=1;
  const observed=withActorOnlyShuffleSupporterAfterPass(()=>{
    store.dispatch(new AddPlayerAction(202));
    const action=new SimpleTacticsAi(202).decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    store.dispatch(action);
    return action.id;
  },{...deps,interceptAttack:true});
  assert.equal(observed.result,202);
  assert.equal(observed.audit.acceptedRoots,1);
  assert.equal(observed.audit.nativeRootOutcomes[0].seat,1);
});
test('a non-real detached speculative state leaves its attack unchanged',()=>{
  const store=new Store();
  const observed=withActorOnlyShuffleSupporterAfterPass(()=>{
    store.dispatch(new AddPlayerAction(101));
    const speculative={...store.state};
    return new SimpleTacticsAi(101).decodeNextAction(speculative);
  },{...deps,interceptAttack:true});
  assert.ok(observed.result instanceof AttackAction);
  assert.equal(observed.audit.speculativeFallbacks,1);
  assert.equal(observed.audit.attemptedRoots,0);
});
