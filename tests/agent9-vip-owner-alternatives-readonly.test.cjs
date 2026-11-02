'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerVipAlternativesReceipt,MSG,VIP}=require(
  '../simulation/twinleaf/agent9-vip-owner-alternatives-readonly.cjs');

class AddPlayerAction {}
class PlayCardAction {
  constructor(playerId,handIndex){this.playerId=playerId;this.handIndex=handIndex;}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt {
  constructor(id,playerId,cards){
    this.id=id;this.playerId=playerId;this.cards=cards;
    this.message=MSG;this.result=undefined;
  }
  validate(selected){
    return selected.length<=2&&selected.every(c=>
      this.cards.cards.includes(c)&&c.stage===2);
  }
}
class FakeStore {
  constructor(){
    const cards=[
      {name:'Mew V',fullName:'Mew V FST',stage:2},
      {name:'Crobat V',fullName:'Crobat V DAA',stage:2},
      ...Array.from({length:4},()=>({
        name:'Genesect V',fullName:'Genesect V FST',stage:2})),
      {name:'Mew VMAX',fullName:'Mew VMAX FST',stage:3}
    ];
    this.state={turn:1,players:[{
      id:42,hand:{cards:[{fullName:VIP}]},deck:{cards},
      bench:Array.from({length:5},()=>({cards:[]}))
    }],prompts:[]};
  }
  dispatch(action){
    const player=this.state.players[0];
    if(action instanceof PlayCardAction){
      assert.equal(player.hand.cards[action.handIndex].fullName,VIP);
      player.hand.cards.splice(action.handIndex,1);
      this.state.prompts.push(new ChooseCardsPrompt(5,42,player.deck));
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(x=>x.id===action.id);
      assert.ok(prompt.validate(action.result));
      for(const card of action.result){
        const index=player.deck.cards.indexOf(card);
        player.deck.cards.splice(index,1);
        player.bench.find(x=>x.cards.length===0).cards.push(card);
      }
      prompt.result=action.result;
    }
    return this.state;
  }
}

test('read-only original owner deck alternatives are logged only after accepted VIP',()=>{
  const before=FakeStore.prototype.dispatch;
  const out=withOwnerVipAlternativesReceipt(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(42,0));
    const selected=store.state.players[0].deck.cards.slice(0,2);
    store.dispatch(new ResolvePromptAction(5,selected));
    return selected.map(c=>c.fullName);
  },{Store:FakeStore});
  assert.deepEqual(out.result,['Mew V FST','Crobat V DAA']);
  assert.equal(FakeStore.prototype.dispatch,before);
  assert.equal(out.audit.acceptedVipRoots,1);
  assert.equal(out.audit.ownerVipDeckPromptsAccepted,1);
  assert.equal(out.audit.ownerVipDeckPromptsRejected,0);
  const r=out.audit.rows[0];
  assert.equal(r.nativeChosenValid,true);
  assert.equal(r.nativeAccepted,true);
  assert.equal(r.benchPlacementConfirmed,true);
  assert.equal(r.eligibleTotalBasics,6);
  assert.deepEqual(r.availableNamedPrintings,{
    'Mew V FST':1,'Genesect V FST':4,
    'Crobat V DAA':1,'Dedenne GX UNB':0
  });
  assert.deepEqual(r.selected,['Mew V FST','Crobat V DAA']);
});

test('absent native owner VIP confirmation produces no owner-deck probe',()=>{
  const out=withOwnerVipAlternativesReceipt(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    const owner=store.state.players[0];
    owner.deck.cards.splice(0,1);
    return owner.deck.cards.length;
  },{Store:FakeStore});
  assert.equal(out.audit.acceptedVipRoots,0);
  assert.equal(out.audit.ownerVipDeckPromptsProposed,0);
  assert.deepEqual(out.audit.rows,[]);
});
