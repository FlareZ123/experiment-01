'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseVipBeforeAttack,withActorVipBeforeAttack}=require('../simulation/twinleaf/agent10-battle-vip-before-attack.cjs');
const {PRINTING,PROMPT_MESSAGE}=require('../simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs');
const view=(turn=2,hand=[PRINTING])=>({
  decisionKind:'owner-root',globalTurn:turn,ownHand:hand,
  ownTurnResources:{itemPlayLocked:false},
  ownPublic:{deckCount:10,bench:[null,null,null],
    publicTurnRestrictions:{itemPlayLocked:false}}
});
test('owned Item before Attack is the only first-turn opportunity',()=>{
  assert.equal(chooseVipBeforeAttack(view(),'AttackAction',false)?.printing,PRINTING);
  assert.equal(chooseVipBeforeAttack(view(),'PassTurnAction',false),null);
  assert.equal(chooseVipBeforeAttack(view(),'AttackAction',true),null);
  assert.equal(chooseVipBeforeAttack(view(3),'AttackAction',false),null);
  assert.equal(chooseVipBeforeAttack(view(2,[]),'AttackAction',false),null);
  const locked=view();locked.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseVipBeforeAttack(locked,'AttackAction',false),null);
  const full=view();full.ownPublic.bench=[{name:'A'},{name:'B'},{name:'C'}];
  assert.equal(chooseVipBeforeAttack(full,'AttackAction',false),null);
});
test('native-shaped first Item and owner-deck prompt physically place Basics before same attack',()=>{
  const cards=['Mega Absol ex M1L','Toedscool PAR'].map(fullName=>({
    fullName,name:fullName.split(' ').slice(0,-1).join(' '),superType:0,stage:2}));
  const own={id:88,hand:{cards:[{fullName:PRINTING}]},
    deck:{cards:[...cards]},bench:Array.from({length:5},()=>({cards:[]}))};
  const state={phase:2,turn:2,activePlayer:0,
    players:[own,{id:89}],prompts:[]};
  class AddPlayerAction{}
  class AttackAction{constructor(){this.name='Thunder Wave';}}
  class PlayCardAction{constructor(id,index){this.playerId=id;this.handIndex=index;}}
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class ChooseCardsPrompt{constructor(){
    this.id=51;this.playerId=own.id;this.message=PROMPT_MESSAGE;this.cards=own.deck;
  }validate(selection){
    return selection.length<=2&&selection.every(card=>own.deck.cards.includes(card));}}
  class SimpleTacticsAi{constructor(){this.client={id:88};}decodeNextAction(){
    return new AttackAction();}}
  class Store{constructor(){this.state=state;}dispatch(action){
    if(action instanceof PlayCardAction){
      assert.equal(own.hand.cards[action.handIndex].fullName,PRINTING);
      own.hand.cards.splice(action.handIndex,1);
      state.prompts=[new ChooseCardsPrompt()];
    }else if(action instanceof ResolvePromptAction){
      assert.equal(state.prompts[0].validate(action.result),true);
      for(const card of action.result){
        own.deck.cards.splice(own.deck.cards.indexOf(card),1);
        own.bench.find(slot=>!slot.cards.length).cards.push(card);
      }
      state.prompts=[];
    }
  }}
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const observe=()=>state.prompts.length?{
    decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
    ownPublic:{active:{name:'Voltorb'},bench:[null,null,null,null,null]}}:view();
  const {audit}=withActorVipBeforeAttack(()=>{
    const store=new Store(),ai=new SimpleTacticsAi();
    store.dispatch(new AddPlayerAction());
    const item=ai.decodeNextAction(state);
    assert.ok(item instanceof PlayCardAction);
    store.dispatch(item);
    const search=ai.decodeNextAction(state);
    assert.ok(search instanceof ResolvePromptAction);
    store.dispatch(search);
    assert.ok(ai.decodeNextAction(state) instanceof AttackAction);
  },{SimpleTacticsAi,Store,cardActions:{PlayCardAction,
    PlayerType:{ANY:0},SlotType:{BOARD:0}},ResolvePromptAction,
    types:{Stage:{BASIC:2},SuperType:{POKEMON:0}},
    GamePhase:{PLAYER_TURN:2},observe});
  assert.equal(audit.acceptedItems,1);
  assert.equal(audit.acceptedSearches,1);
  assert.equal(audit.physicallyConfirmedBenchSearches,1);
  assert.equal(audit.unresolvedSearches,0);
  assert.equal(own.bench.filter(slot=>slot.cards.length>0).length,2);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});
