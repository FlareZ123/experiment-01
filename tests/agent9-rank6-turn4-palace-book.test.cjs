'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {palaceBookOpportunity,withSourceTurn4PalaceBook,
  ITEM,THORNS,DCE,THUNDER,TARGET}=
  require('../simulation/twinleaf/agent9-rank6-turn4-palace-book-hook.cjs');

function makeView(override={}){
  return {...{
    decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:[ITEM],
    ownPublic:{deckCount:9,active:{printing:THORNS,energies:[]},
      bench:[{printing:THORNS,energies:[DCE]}],stadium:[THUNDER],
      publicTurnRestrictions:{itemPlayLocked:false}},
    opponentPublic:{bench:[{printing:'Latias ex SV7a'}],stadium:[]},
    ownTurnResources:{itemPlayLocked:false}
  },...override};
}

test('detached paper screening vetoes wrong owner, locks, fewer than three deck cards and missing card',()=>{
  assert.equal(palaceBookOpportunity(makeView()).ok,true);
  assert.equal(palaceBookOpportunity(makeView({actorSeat:1})).ok,false);
  assert.equal(palaceBookOpportunity(makeView({ownHand:[]})).ok,false);
  assert.equal(palaceBookOpportunity(makeView({
    ownPublic:{...makeView().ownPublic,deckCount:2}})).ok,false);
  assert.equal(palaceBookOpportunity(makeView({
    ownTurnResources:{itemPlayLocked:true}})).ok,false);
});

function fixture(){
  class AddPlayerAction{}
  class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
  class PlayCardAction{constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction(this.client.id);}
  }
  const palace={fullName:ITEM};
  const deck=[{fullName:'A'},{fullName:'B'},{fullName:'Guzma BUS'},
    {fullName:'C'},{fullName:'D'}];
  const owner={id:101,hand:{cards:[palace]},deck:{cards:deck.slice()},
    discard:{cards:[]}};
  const opponent={id:102,get hand(){throw Error('OPPONENT_HIDDEN_READ');},
    get deck(){throw Error('OPPONENT_HIDDEN_DECK_READ');}};
  const state={players:[owner,opponent],activePlayer:0,turn:4,prompts:[]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return this.state;
      if(action instanceof PlayCardAction){
        assert.equal(action.handIndex,0);
        const p=owner.hand.cards.splice(action.handIndex,1)[0];
        owner.discard.cards.push(p);
        owner.hand.cards.push(...owner.deck.cards.splice(0,3));
        this.state.turn=5;
        this.state.activePlayer=1;
        return this.state;
      }
      if(action instanceof PassTurnAction){
        this.state.turn=5;this.state.activePlayer=1;return this.state;
      }
      throw new Error('UNEXPECTED_NATIVE');
    }
  }
  return {AddPlayerAction,PassTurnAction,PlayCardAction,
    SimpleTacticsAi,Store,state,owner,palace};
}

test('genuine owner Pass becomes exactly one physically paid Book and three draws; original prototypes restored',()=>{
  const f=fixture(),store=new f.Store(),ai=new f.SimpleTacticsAi(101);
  const oldAi=f.SimpleTacticsAi.prototype.decodeNextAction;
  const oldStore=f.Store.prototype.dispatch;
  const observed=withSourceTurn4PalaceBook(()=>{
    store.dispatch(new f.AddPlayerAction());
    const chosen=ai.decodeNextAction(f.state);
    assert.equal(chosen.constructor.name,'PlayCardAction');
    store.dispatch(chosen);
    return f.state.turn;
  },{trialId:TARGET,Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    PlayCardAction:f.PlayCardAction,PlayerType:{ANY:0},
    SlotType:{BOARD:0},observe:()=>makeView()});
  assert.equal(observed.result,5);
  assert.equal(observed.audit.eligibleBookOffers,1);
  assert.equal(observed.audit.nativeAcceptedBookRoot,1);
  assert.equal(observed.audit.physicalBookSettlement.threeCardDrawPhysicallyObserved,true);
  assert.equal(observed.audit.physicalBookSettlement.nativeImmediateEndTurn,true);
  assert.equal(observed.audit.physicalBookSettlement.deckBefore,5);
  assert.equal(observed.audit.physicalBookSettlement.deckAfter,2);
  assert.equal(f.owner.discard.cards.includes(f.palace),true);
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,oldAi);
  assert.strictEqual(f.Store.prototype.dispatch,oldStore);
});

test('missing Palace Book must preserve exactly the original Pass',()=>{
  const f=fixture(),store=new f.Store(),ai=new f.SimpleTacticsAi(101);
  const out=withSourceTurn4PalaceBook(()=>{
    store.dispatch(new f.AddPlayerAction());
    return ai.decodeNextAction(f.state).constructor.name;
  },{trialId:TARGET,Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    PlayCardAction:f.PlayCardAction,PlayerType:{ANY:0},
    SlotType:{BOARD:0},observe:()=>makeView({ownHand:[]})});
  assert.equal(out.result,'PassTurnAction');
  assert.equal(out.audit.nativeAcceptedBookRoot,0);
});

test('native errors propagate and reversible hooks restore',()=>{
  const f=fixture(),store=new f.Store(),ai=new f.SimpleTacticsAi(101);
  const oldAi=f.SimpleTacticsAi.prototype.decodeNextAction;
  const oldStore=f.Store.prototype.dispatch;
  assert.throws(()=>withSourceTurn4PalaceBook(()=>{
    store.dispatch(new f.AddPlayerAction());
    ai.decodeNextAction(f.state);
    throw new Error('NATIVE_ABORT');
  },{trialId:TARGET,Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    PlayCardAction:f.PlayCardAction,PlayerType:{ANY:0},
    SlotType:{BOARD:0},observe:()=>makeView()}),error=>{
    assert.match(error.message,/NATIVE_ABORT/);
    assert.equal(error.agent9Turn4PalaceBookAudit.eligibleBookOffers,1);
    return true;
  });
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,oldAi);
  assert.strictEqual(f.Store.prototype.dispatch,oldStore);
});
