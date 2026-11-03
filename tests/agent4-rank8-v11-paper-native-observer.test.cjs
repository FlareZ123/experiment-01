'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withSourceBoxPaymentObserver,POSITIVE_INDICES}=
  require('../simulation/evaluation/agent4-rank8-legacy-box-v11-paper-native.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,owner,message='CHOOSE_CARD_TO_DISCARD'){
    this.id=id;this.result=undefined;this.playerId=owner.id;
    this.cards=owner.hand;
    this.sourceCard={fullName:'Secret Box TWM'};
    this.message=message;
  }
}
class Store{
  constructor(players){this.state={players,prompts:[]};this.calls=0;}
  dispatch(action){
    this.calls++;
    if(action instanceof AddPlayerAction)return true;
    const p=this.state.prompts.find(x=>
      x.id===action.id&&x.result===undefined);
    if(p){
      p.result=action.result;
      if(this.applyPhysicalSearch&&p.message==='CHOOSE_CARD_TO_HAND'){
        const owner=this.state.players.find(x=>x.id===p.playerId);
        for(const card of action.result){
          const index=owner.deck.cards.indexOf(card);
          if(index>=0){owner.deck.cards.splice(index,1);owner.hand.cards.push(card);}
        }
      }
      if(this.applyPhysicalPayment&&p.message==='CHOOSE_CARD_TO_DISCARD'){
        const owner=this.state.players.find(x=>x.id===p.playerId);
        for(const card of action.result){
          const index=owner.hand.cards.indexOf(card);
          if(index>=0){owner.hand.cards.splice(index,1);owner.discard.cards.push(card);}
        }
      }
    }
    return true;
  }
}
function fixture(){
  const players=[0,1].map(id=>({id,hand:{cards:[]},discard:{cards:[]},deck:{cards:[]}}));
  const store=new Store(players);
  return {players,store};
}
test('three retrospective source opportunities are fixed and independent of new outcomes',()=>{
  assert.deepEqual([...POSITIVE_INDICES],[683,694,756]);
});
test('read-only source payment observer sees original native zero payment without veto',()=>{
  for(const seat of [0,1]){
    const {store,players}=fixture();
    const source=players[seat];
    const prompt=new ChooseCardsPrompt(10,source);
    store.state.prompts.push(prompt);
    const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
    const observed=withSourceBoxPaymentObserver(Store,seat,()=>{
      store.dispatch(new AddPlayerAction());
      return store.dispatch(new ResolvePromptAction(10,[]));
    });
    assert.equal(observed.result,true);
    assert.equal(prompt.result.length,0);
    assert.equal(observed.audit.liveStores,1);
    assert.equal(observed.audit.sourceOwnedPrompts,1);
    assert.equal(observed.audit.paperInvalidNativeAccepted,1);
    assert.equal(observed.audit.sourceAccepted,1);
    assert.equal(observed.audit.observations[0].paperNegativeReason,
      'SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS');
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      Store.prototype,'dispatch'),before);
  }
});
test('physical valid 3-card payment observed, unrelated search and other player remain separate',()=>{
  const {store,players}=fixture(),source=players[1];
  const trio=[{name:'secret 1'},{name:'secret 2'},{name:'secret 3'}];
  source.hand.cards.push(...trio);
  const p=new ChooseCardsPrompt(11,source);
  const s=new ChooseCardsPrompt(12,source,'CHOOSE_CARD_TO_HAND');
  store.state.prompts.push(p,s);
  const observed=withSourceBoxPaymentObserver(Store,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(12,[]));
    return store.dispatch(new ResolvePromptAction(11,trio));
  });
  assert.equal(observed.result,true);
  assert.equal(observed.audit.sourceOwnedPrompts,1);
  assert.equal(observed.audit.otherPrompts,0);
  assert.equal(observed.audit.sourceAccepted,1);
  assert.equal(observed.audit.paperInvalidNativeAccepted,0);
  assert.equal(observed.audit.observations[0].physicalPaymentValid,true);
  assert.equal(JSON.stringify(observed.audit).includes('secret 1'),false);
});
test('foreign prompt zones and auxiliary clones are ignored',()=>{
  const {store,players}=fixture(),source=players[0];
  source.hand.cards.push({},{},{});
  const aux=new Store(players);
  const p=new ChooseCardsPrompt(33,source);
  aux.state.prompts.push(p);
  const observed=withSourceBoxPaymentObserver(Store,0,()=>{
    store.dispatch(new AddPlayerAction());
    aux.dispatch(new ResolvePromptAction(33,[]));
  });
  assert.equal(observed.audit.sourceOwnedPrompts,0);
  assert.equal(observed.audit.paperInvalidNativeAccepted,0);
});
test('native Store hook restored when underlying game throws',()=>{
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.throws(()=>withSourceBoxPaymentObserver(Store,0,()=>{
    throw Error('expected simulated native abort');
  }),/expected simulated native abort/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),before);
});

test('physical three-card transfer is counted only when all three cards move to owner discard',()=>{
  for(const seat of [0,1]){
    const {store,players}=fixture();
    const trio=Array.from({length:3},(_,i)=>({id:i+1}));
    const source=players[seat];
    source.hand.cards.push(...trio);
    store.applyPhysicalPayment=true;
    store.state.prompts.push(new ChooseCardsPrompt(16,source));
    const observed=withSourceBoxPaymentObserver(Store,seat,()=>{
      store.dispatch(new AddPlayerAction());
      return store.dispatch(new ResolvePromptAction(16,trio));
    });
    assert.equal(observed.audit.paidPhysicalThreeCardReceipts,1);
    assert.equal(observed.audit.unverifiedPhysicalCustody,0);
    assert.equal(observed.audit.observations[0].paidPhysicalCards,3);
    assert.equal(observed.audit.observations[0].physicalCustodyStatus,
      'PAID_THREE_PHYSICAL_CARDS');
    assert.equal(source.hand.cards.length,0);
    assert.equal(source.discard.cards.length,3);
  }
});

test('accepted resolution without a physical transfer remains unverified',()=>{
  const {store,players}=fixture();
  const trio=[{id:1},{id:2},{id:3}];
  players[0].hand.cards.push(...trio);
  store.state.prompts.push(new ChooseCardsPrompt(18,players[0]));
  const observed=withSourceBoxPaymentObserver(Store,0,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(18,trio));
  });
  assert.equal(observed.audit.sourceAccepted,1);
  assert.equal(observed.audit.paidPhysicalThreeCardReceipts,0);
  assert.equal(observed.audit.unverifiedPhysicalCustody,1);
  assert.equal(observed.audit.observations[0].physicalCustodyStatus,'UNVERIFIED');
});

test('source-owned native Secret Box search verifies each real owner-deck to hand transfer',()=>{
  for(const seat of [0,1]){
    const {store,players}=fixture();
    const owner=players[seat];
    const selected=[{fullName:'Boost Shake EVS'},{fullName:'Float Stone BKT'}];
    owner.deck.cards.push(...selected);
    const p=new ChooseCardsPrompt(21,owner,'CHOOSE_CARD_TO_HAND');
    p.cards=owner.deck;
    store.state.prompts.push(p);
    store.applyPhysicalSearch=true;
    const observed=withSourceBoxPaymentObserver(Store,seat,()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new ResolvePromptAction(21,selected));
    });
    assert.equal(observed.audit.sourceOwnedPrompts,0);
    assert.equal(observed.audit.sourceSearchPrompts,1);
    assert.equal(observed.audit.sourceSearchAcquisitions,1);
    assert.equal(observed.audit.sourceSearchObservations[0].ownerDeckPrompt,true);
    assert.equal(observed.audit.sourceSearchObservations[0].physicalAcquiredCount,2);
    assert.deepEqual(observed.audit.sourceSearchObservations[0].selectedPrintings,
      ['Boost Shake EVS','Float Stone BKT']);
  }
});

test('native accepted search without physical acquisition remains unverified',()=>{
  const {store,players}=fixture();
  const owner=players[1],card={fullName:'Boost Shake EVS'};
  owner.deck.cards.push(card);
  const p=new ChooseCardsPrompt(22,owner,'CHOOSE_CARD_TO_HAND');
  p.cards=owner.deck;
  store.state.prompts.push(p);
  const observed=withSourceBoxPaymentObserver(Store,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(22,[card]));
  });
  assert.equal(observed.audit.sourceSearchPrompts,1);
  assert.equal(observed.audit.sourceSearchAcquisitions,0);
  assert.equal(observed.audit.sourceSearchObservations[0].physicalAcquisitionStatus,'UNVERIFIED');
});

class AttackAction{
  constructor(name){this.name=name;}
}
test('read-only public opponent attack receipt only follows paid actual source Box',()=>{
  for(const sourceSeat of [0,1]){
    const {store,players}=fixture();
    const source=players[sourceSeat],opponent=players[1-sourceSeat];
    const publicSlot=(fullName,damage,energies=[],tools=[])=>({
      damage,hp:300,
      energies:{cards:energies.map(fullName=>({fullName}))},
      tools:tools.map(fullName=>({fullName})),
      getPokemonCard:()=>({fullName,name:fullName.split(' ').at(0)})
    });
    source.active=publicSlot('Mega Absol ex MEG',0);
    source.bench=[publicSlot('Garbodor LTR',0,[],['Float Stone BKT'])];
    source.bench[0].getPokemonCard=()=>({fullName:'Garbodor LTR',name:'Garbodor'});
    opponent.active=publicSlot('Lillie\\'s Clefairy ex JTG',0,
      ['Psychic Energy MEE','Psychic Energy MEE']);
    opponent.bench=[];
    for(const player of players)player.prizes=[{cards:[{}]},{cards:[{}]}];
    store.state.activePlayer=1-sourceSeat;
    store.state.turn=3;
    const pay=[{id:1},{id:2},{id:3}];
    source.hand.cards.push(...pay);
    store.applyPhysicalPayment=true;
    store.state.prompts.push(new ChooseCardsPrompt(31,source));
    const observed=withSourceBoxPaymentObserver(Store,sourceSeat,()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new ResolvePromptAction(31,pay));
      store.dispatch(new AttackAction('Full Moon Rondo'));
    });
    assert.equal(observed.audit.sourceAccepted,1);
    assert.equal(observed.audit.opponentPublicAttackReceipts.length,1);
    const reply=observed.audit.opponentPublicAttackReceipts[0];
    assert.equal(reply.declaredAttack,'Full Moon Rondo');
    assert.equal(reply.before.turn,3);
    assert.equal(reply.before.sourceActive.pokemon,'Mega Absol ex MEG');
    assert.equal(reply.before.toolGarbodorBoard[0].pokemon,'Garbodor LTR');
    assert.deepEqual(reply.before.toolGarbodorBoard[0].toolPrintings,
      ['Float Stone BKT']);
    assert.deepEqual(reply.before.opponentActive.energyPrintings,
      ['Psychic Energy MEE','Psychic Energy MEE']);
    assert.equal(reply.nativeError,null);
  }
});
