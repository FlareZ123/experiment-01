'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  SETTLEMENT_CODE,withOwnerProtectedMultiBasicStore:withProtected
}=require('../simulation/twinleaf/agent50-owner-protected-multibasic-store.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(owner,min){
    this.id=91;this.playerId=owner.id;this.result=undefined;
    this.message='CHOOSE_STARTING_POKEMONS';this.cards=owner.hand;
    this.options={min,max:6,blocked:[],allowCancel:false};
  }
  validate(cards){
    return Array.isArray(cards)&&
      cards.length>=this.options.min&&cards.length<=6&&
      cards.every(card=>this.cards.cards.includes(card)&&card.stage==='Basic');
  }
}
class Store{
  constructor(state,mode){this.state=state;this.mode=mode;}
  dispatch(action){
    if(!(action instanceof ResolvePromptAction))return this.state;
    const p=this.state.prompts[0];
    if(this.mode==='silent')return this.state;
    if(this.mode==='removed-unsettled'){
      this.state.prompts=[];
      return this.state;
    }
    if(this.mode==='mutate-answer'){
      if(action.result.length)action.result.splice(0,1);
      else action.result.push(this.state.players.find(x=>x.id===p.playerId).hand.cards[0]);
      p.result=action.result;
      return this.state;
    }
    p.result=action.result;
    if(this.mode!=='result-only'){
      const owner=this.state.players.find(x=>x.id===p.playerId);
      if(p.options.min===1){
        owner.active.cards=[action.result[0]];
        owner.bench[0].cards=[action.result[1]];
        if(this.mode!=='duplicate-hand')
          owner.hand.cards=owner.hand.cards.filter(c=>!action.result.includes(c));
      }
    }
    if(this.mode==='resolved-removed')this.state.prompts=[];
    return this.state;
  }
}
class Bot{
  constructor(id){this.client={id};this.rawCalls=0;}
  decodeNextAction(state){this.rawCalls++;return state.unseenOppHand;}
}
const Stage={BASIC:'Basic'},CardTag={PLAY_DURING_SETUP:'play-during-setup'};
function fixture(seat,min,mode){
  const basicA={fullName:'Regidrago V SIT',stage:'Basic'};
  const basicB={fullName:'Voltorb ROS',stage:'Basic'};
  const trigger={fullName:'Dedenne-GX UNB',stage:'Basic',powers:[
    {text:'When you play this Pokémon from your hand onto your Bench during your turn, draw 6 cards.'}
  ]};
  const owner={id:seat===0?'A':'B',
    hand:{cards:[basicA,trigger,basicB]},
    active:{cards:min===0?[{fullName:'already Active'}]:[]},
    bench:Array.from({length:5},()=>({cards:[]}))};
  const other={id:seat===0?'B':'A',hand:{cards:[]},active:{cards:[]},
    bench:[]};
  const players=seat===0?[owner,other]:[other,owner];
  const state={phase:1,turn:0,players,unseenOppHand:['hidden'],
    prompts:[new ChooseCardsPrompt(owner,min)]};
  return {bot:new Bot(owner.id),store:new Store(state,mode),owner,
    basicA,basicB,trigger};
}
function run(seat,min,mode){
  const f=fixture(seat,min,mode);
  const deps={SimpleTacticsAi:Bot,Store,ResolvePromptAction,
    Stage,CardTag};
  const result=withProtected(()=>{
    f.store.dispatch(new AddPlayerAction());
    const action=f.bot.decodeNextAction(f.store.state);
    assert.ok(action instanceof ResolvePromptAction);
    f.store.dispatch(action);
    return action.result;
  },deps);
  return {...f,result};
}

test('native-like both-seat initial and min0 bonus positive resolved prompts',()=>{
  for(const seat of [0,1])for(const min of [0,1]){
    const x=run(seat,min,'resolved-removed');
    assert.equal(x.result.audit.selected,1);
    assert.equal(x.result.audit.accepted,1);
    assert.equal(x.result.audit.settled,1);
    assert.equal(x.result.audit.unsettled,0);
    assert.equal(x.result.audit.physicalVerificationFailed,0);
    assert.equal(x.bot.rawCalls,0);
    assert.equal(x.owner.hand.cards.includes(x.trigger),true);
    assert.deepEqual(x.store.state.prompts,[]);
    if(min===1){
      assert.deepEqual(x.owner.active.cards,[x.basicA]);
      assert.deepEqual(x.owner.bench[0].cards,[x.basicB]);
      assert.equal(x.owner.hand.cards.includes(x.basicA),false);
      assert.equal(x.owner.hand.cards.includes(x.basicB),false);
    }else{
      assert.equal(x.result.audit.bonusAccepted,1);
      assert.deepEqual(x.result.result,[]);
    }
  }
});

test('both-seat initial and min0 bonus silent and missing prompt are not accepted',()=>{
  for(const seat of [0,1])for(const min of [0,1])
    for(const mode of ['silent','removed-unsettled','mutate-answer']){
      const f=fixture(seat,min,mode);
      assert.throws(()=>withProtected(()=>{
        f.store.dispatch(new AddPlayerAction());
        const action=f.bot.decodeNextAction(f.store.state);
        f.store.dispatch(action);
      },{SimpleTacticsAi:Bot,Store,ResolvePromptAction,Stage,CardTag}),
      error=>{
        assert.equal(error.code,SETTLEMENT_CODE);
        const a=error.ownerProtectedMultiBasicStoreAudit;
        assert.equal(a.selected,1);
        assert.equal(a.accepted,0);
        assert.equal(a.settled,0);
        assert.equal(a.unsettled,1);
        assert.equal(a.returnedWithoutThrow,1);
        assert.equal(a.rejected,0);
        return true;
      });
      assert.equal(f.bot.rawCalls,0);
    }
});

test('both-seat defined prompt answer without physical transfer remains unaccepted',()=>{
  for(const seat of [0,1])for(const mode of ['result-only','duplicate-hand']){
    const f=fixture(seat,1,mode);
    assert.throws(()=>withProtected(()=>{
      f.store.dispatch(new AddPlayerAction());
      const action=f.bot.decodeNextAction(f.store.state);
      f.store.dispatch(action);
    },{SimpleTacticsAi:Bot,Store,ResolvePromptAction,Stage,CardTag}),
    error=>{
      assert.equal(error.name,'AssertionError');
      const a=error.ownerProtectedMultiBasicStoreAudit;
      assert.equal(a.selected,1);
      assert.equal(a.settled,1);
      assert.equal(a.accepted,0);
      assert.equal(a.physicalVerificationFailed,1);
      assert.equal(a.missingPhysicalPlacements,1);
      return true;
    });
  }
});
