'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseEnergyMixAttachment,withMewEnergyMixOwnerPrompt}=
  require('../../simulation/twinleaf/2026-11/agent26-mew-energy-mix-owner-prompt.cjs');

const enums={PlayerType:{BOTTOM_PLAYER:2},SlotType:{ACTIVE:1,BENCH:2},
  SuperType:{ENERGY:3}};
const energy=fullName=>({name:'Double Colorless Energy',
  fullName,superType:enums.SuperType.ENERGY});
const pokemon=fullName=>({
  cards:[{fullName}],energies:{cards:[]},
  getPokemonCard(){return this.cards[0];}
});
const player=(seat)=>{
  const mew=pokemon('Mew V FST'),vmax=pokemon('Mew VMAX FST');
  return {id:101+seat,deck:{cards:[energy('Double Colorless Energy SUM'),
    energy('Double Colorless Energy SUM'),{fullName:'Trainer A',name:'Trainer'}]},
    active:vmax,bench:[pokemon('Crobat V DAA'),mew,
      pokemon('Dedenne GX UNB'),pokemon('Clefairy ex JTG')]};
};
class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseAttackPrompt {
  constructor(ownerId){this.id=91;this.playerId=ownerId;
    this.result=undefined;}
}
class AttachEnergyPrompt {
  constructor(owner){
    this.id=92;this.playerId=owner.id;this.result=undefined;
    this.cardList=owner.deck;this.playerType=2;
    this.slots=[1,2];this.options={min:0,max:1,
      blockedTo:[{player:2,slot:2,index:0},
        {player:2,slot:2,index:2},{player:2,slot:2,index:3}]};
  }
  validate(selection){
    if(Array.isArray(selection)&&selection.length===0){
      return this.options.min===0&&!this.cardList.cards.some(
        card=>card.superType===enums.SuperType.ENERGY);
    }
    return Array.isArray(selection)&&selection.length===1&&
      this.cardList.cards.includes(selection[0].card)&&
      selection[0].to.player===2&&
      selection[0].to.slot===2&&selection[0].to.index===1;
  }
}
class Store {
  constructor(seat){
    this.state={players:[player(0),player(1)],activePlayer:seat,
      phase:3,turn:31,prompts:[]};
  }
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const s=this.state,prompt=s.prompts.find(p=>p.id===action.id);
      assert.ok(prompt);
      prompt.result=action.result;
      if(prompt instanceof ChooseAttackPrompt){
        s.prompts.push(new AttachEnergyPrompt(s.players[s.activePlayer]));
      }else if(prompt instanceof AttachEnergyPrompt){
        for(const {card,to} of action.result){
          const actor=s.players[s.activePlayer];
          actor.deck.cards.splice(actor.deck.cards.indexOf(card),1);
          actor.bench[to.index].energies.cards.push(card);
        }
      }
    }
    return true;
  }
}
class Ai {
  constructor(id){this.client={id};}
  decodeNextAction(){return 'native-fallback';}
}

for(const seat of [0,1]){
  test('accepted copied Energy Mix source physically attaches exact owner Energy seat '+seat,()=>{
    const {result,audit}=withMewEnergyMixOwnerPrompt(()=>{
      const store=new Store(seat),owner=store.state.players[seat];
      store.dispatch(new AddPlayerAction());
      store.state.prompts.push(new ChooseAttackPrompt(owner.id));
      store.dispatch(new ResolvePromptAction(91,{name:'Energy Mix'}));
      const ai=new Ai(owner.id),action=ai.decodeNextAction(store.state);
      assert.equal(action.constructor.name,'ResolvePromptAction');
      assert.equal(action.id,92);
      assert.equal(action.result.length,1);
      assert.strictEqual(action.result[0].card,owner.deck.cards[0]);
      assert.deepEqual(action.result[0].to,{player:2,slot:2,index:1});
      store.dispatch(action);
      assert.equal(owner.bench[1].energies.cards.length,1);
      assert.equal(owner.deck.cards.length,2);
      return {sourceSeat:seat};
    },{Store,Ai,ResolvePromptAction,enums});
    assert.equal(result.sourceSeat,seat);
    assert.equal(audit.actualEnergyMixPrompts,1);
    assert.equal(audit.validatedOwnerSelections,1);
    assert.equal(audit.nativeAccepted,1);
    assert.equal(audit.physicalAttachmentsConfirmed,1);
    assert.equal(audit.receipts[0].exactPhysicalEnergyAttached,true);
    assert.equal(audit.paperQualifiedGames,0);
  });
}

test('unknown copied attack delegates untouched to native AI',()=>{
  const {result,audit}=withMewEnergyMixOwnerPrompt(()=>{
    const store=new Store(0),owner=store.state.players[0];
    store.dispatch(new AddPlayerAction());
    store.state.prompts.push(new ChooseAttackPrompt(owner.id));
    store.dispatch(new ResolvePromptAction(91,{name:'Techno Blast'}));
    return new Ai(owner.id).decodeNextAction(store.state);
  },{Store,Ai,ResolvePromptAction,enums});
  assert.equal(result,'native-fallback');
  assert.equal(audit.actualEnergyMixPrompts,0);
});

test('paper blockedTo and physical source-zone mismatch refuse attachment',()=>{
  const store=new Store(1),owner=store.state.players[1];
  const prompt=new AttachEnergyPrompt(owner);
  prompt.options.blockedTo.push({player:2,slot:2,index:1},
    {player:2,slot:1,index:0});
  assert.equal(chooseEnergyMixAttachment(store.state,prompt,owner.id,enums),null);
  prompt.options.blockedTo=prompt.options.blockedTo.slice(0,3);
  prompt.cardList=store.state.players[0].deck;
  assert.equal(chooseEnergyMixAttachment(store.state,prompt,owner.id,enums),null);
  assert.equal(chooseEnergyMixAttachment(store.state,prompt,
    store.state.players[0].id,enums),null);
});

test('an exhausted actual owner deck resolves the zero-minimum search without fabricating Energy',()=>{
  const store=new Store(0),owner=store.state.players[0];
  owner.deck.cards=[{fullName:'Trainer A',name:'Trainer'}];
  const prompt=new AttachEnergyPrompt(owner);
  const selection=chooseEnergyMixAttachment(
    store.state,prompt,owner.id,enums);
  assert.ok(selection);
  assert.equal(selection.emptySearch,true);
  assert.deepEqual(selection.proposed,[]);
  assert.equal(selection.card,null);
  assert.equal(selection.target,null);
  const result=withMewEnergyMixOwnerPrompt(()=>{
    store.dispatch(new AddPlayerAction());
    store.state.prompts.push(new ChooseAttackPrompt(owner.id));
    store.dispatch(new ResolvePromptAction(91,{name:'Energy Mix'}));
    const reply=new Ai(owner.id).decodeNextAction(store.state);
    assert.deepEqual(reply.result,[]);
    store.dispatch(reply);
    assert.equal(owner.deck.cards.length,1);
  },{Store,Ai,ResolvePromptAction,enums});
  assert.equal(result.audit.nativeEmptySearchResolutions,1);
  assert.equal(result.audit.nativeAccepted,1);
  assert.equal(result.audit.physicalAttachmentsConfirmed,0);
});
