'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActualGuzmaHalaK1Custody,HALA}=
  require('../simulation/twinleaf/agent45-actual-ghala-k1-custody.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
const name=fullName=>({fullName});
function fixture(){
  const cards=['Thunder Mountain Prism Star LOT',
    'Double Colorless Energy SUM','Handheld Fan TWM'].map(name);
  const supporter=name(HALA);
  const owner={id:1,hand:{cards:[supporter]},
    deck:{cards:[...cards]},supporter:{cards:[]}};
  const other={id:2,hand:{cards:[]},deck:{cards:[]},supporter:{cards:[]}};
  const state={turn:2,players:[owner,other],prompts:[]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return true;
      if(action instanceof PlayCardAction){
        const player=state.players.find(p=>p.id===action.id);
        const card=player.hand.cards.splice(action.handIndex,1)[0];
        player.supporter.cards.push(card);
        state.prompts.push({id:9,playerId:player.id,cards:player.deck,
          message:'CHOOSE_CARD_TO_HAND',result:undefined,
          constructor:{name:'ChooseCardsPrompt'}});
        return true;
      }
      if(action instanceof ResolvePromptAction){
        const prompt=state.prompts.find(p=>p.id===action.id);
        if(!prompt)throw Error('unknown prompt');
        const player=state.players.find(p=>p.id===prompt.playerId);
        if(action.result.some(card=>!player.deck.cards.includes(card)))
          throw Error('not actual owner-deck card');
        for(const card of action.result){
          player.deck.cards.splice(player.deck.cards.indexOf(card),1);
          player.hand.cards.push(card);
        }
        prompt.result=action.result;
        return true;
      }
      throw Error('unknown action');
    }
  }
  return {Store,state,owner,other,cards};
}
test('real Store G&H source prompt records exactly three physical printings',()=>{
  const f=fixture();
  const before=Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch');
  const x=withActualGuzmaHalaK1Custody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(f.owner.id,0));
    store.dispatch(new ResolvePromptAction(9,f.cards));
    return 7;
  },{Store:f.Store,trialId:'6:101:B:champion-reference'});
  assert.equal(x.result,7);
  assert.equal(x.audit.actualStores,1);
  assert.equal(x.audit.acceptedGuzmaHalaOwnerRoots.length,1);
  assert.deepEqual(x.audit.nativeOwnDeckSearchResults[0].selectedPrintedCards,
    f.cards.map(c=>c.fullName));
  assert.equal(x.audit.nativeOwnDeckSearchResults[0].selectedOriginallyInOwnDeck,true);
  assert.equal(x.audit.nativeOwnDeckSearchResults[0].samePhysicalCardsMovedToOwnHand,true);
  assert.equal(x.audit.nativeOwnDeckSearchResults[0].StoreDispatchOrdinal,3);
  assert.strictEqual(Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch').value,
    before.value);
});
test('speculative Store does not introduce a second native K1 search',()=>{
  const f=fixture();
  const result=withActualGuzmaHalaK1Custody(()=>{
    const live=new f.Store(),fake=new f.Store();
    live.dispatch(new AddPlayerAction());
    fake.dispatch(new PlayCardAction(f.owner.id,0));
    fake.dispatch(new ResolvePromptAction(9,f.cards));
  },{Store:f.Store});
  assert.equal(result.audit.acceptedGuzmaHalaOwnerRoots.length,0);
  assert.equal(result.audit.nativeOwnDeckSearchResults.length,0);
});
test('owner-deck prompt may not be relabelled from other player deck',()=>{
  const f=fixture();
  const result=withActualGuzmaHalaK1Custody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(f.owner.id,0));
    f.state.prompts[0].cards=f.other.deck;
    // No resolution: the mismatch alone never records K1.
  },{Store:f.Store});
  assert.equal(result.audit.nativeOwnDeckSearchResults.length,0);
});
test('native prompt resolution failure is not mistaken for custody',()=>{
  const f=fixture();
  const old=Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch').value;
  assert.throws(()=>withActualGuzmaHalaK1Custody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(f.owner.id,0));
    store.dispatch(new ResolvePromptAction(9,[name('Impossible Card')]));
  },{Store:f.Store}),/not actual owner-deck card/);
  assert.strictEqual(f.Store.prototype.dispatch,old);
});
test('without a real G&H root, a deck search is ignored',()=>{
  const f=fixture();
  const result=withActualGuzmaHalaK1Custody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    f.state.prompts.push({id:9,playerId:1,cards:f.owner.deck,
      message:'CHOOSE_CARD_TO_HAND',result:undefined,
      constructor:{name:'ChooseCardsPrompt'}});
    store.dispatch(new ResolvePromptAction(9,f.cards));
  },{Store:f.Store});
  assert.equal(result.audit.nativeOwnDeckSearchResults.length,0);
});
test('printed search names remain unqualified for competitive game evidence',()=>{
  const f=fixture();
  const result=withActualGuzmaHalaK1Custody(()=>{}, {Store:f.Store});
  assert.equal(result.audit.qualifiedCompetitiveGames,0);
  assert.equal(result.audit.selectedOrMutatedActions,false);
  assert.equal(result.audit.opponentConcealedZoneRead,false);
  assert.equal(result.audit.unopenedOwnerDeckRead,false);
});
