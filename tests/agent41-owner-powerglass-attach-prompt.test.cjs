'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerPowerglassAttachInput,chooseOwnerPowerglassAttach,
  withOwnerPowerglassAttachPrompt}=
  require('../simulation/twinleaf/agent41-owner-powerglass-attach-prompt.cjs');

const TYPES={basicEnergyType:0,bottomPlayer:2,activeSlot:1};

/** @param {0|1} seat */
function fixture(seat=0){
  const basic={fullName:'Psychic Energy MEE',name:'Psychic Energy',
    energyType:0};
  const special={fullName:'Double Colorless Energy SUM',
    name:'Double Colorless Energy',energyType:1};
  const owner={
    id:100+seat,active:{energies:{cards:[]},
      tools:[{fullName:'Powerglass SFA'}]},
    discard:{cards:[special,basic],filter:()=>[special,basic]}
  };
  const other={id:200+seat,active:{energies:{cards:[]},tools:[]},
    discard:{cards:[],filter:()=>[]}};
  class AttachEnergyPrompt{
    constructor(){
      this.id=70+seat;this.playerId=owner.id;
      this.cardList=owner.discard;this.playerType=2;
      this.slots=[1];this.filter={};
      this.result=undefined;
      this.options={min:0,max:1,blocked:[],blockedTo:[],
        allowCancel:true};
    }
    getPerspectivePlayerId(){return owner.id;}
    validate(result){
      return Array.isArray(result)&&result.length===1&&
        result[0].card===basic&&result[0].to.player===2&&
        result[0].to.slot===1&&result[0].to.index===0;
    }
  }
  const pending=new AttachEnergyPrompt();
  const state={turn:42,activePlayer:seat,players:seat===0?
    [owner,other]:[other,owner],prompts:[pending]};
  const observe=(s,actualSeat)=>{
    assert.strictEqual(s,state);
    assert.equal(actualSeat,seat);
    return Object.freeze({
      decisionKind:'owner-prompt',globalTurn:s.turn,
      ownPublic:{
        active:{printing:'Mewtwo & Mew-GX UNM',
          tools:['Powerglass SFA'],energies:[]},
        discard:owner.discard.cards.map(x=>x.fullName)
      },
      opponentPublic:{active:{printing:'unrelated'}}
    });
  };
  return {state,owner,other,pending,basic,special,observe,seat};
}

test('detached actor sees only public discard and chooses physical Basic Psychic',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const input=ownerPowerglassAttachInput(
      f.state,seat,TYPES,f.observe);
    assert.equal(input.prompt.sourceZone,'own-public-discard');
    assert.deepEqual(input.prompt.offered.map(x=>x.eligible),[false,true]);
    assert.deepEqual(chooseOwnerPowerglassAttach(input),{
      sourceIndex:1,target:{player:2,slot:1,index:0}
    });
    const altered=fixture(seat);
    altered.other.secretHand=['completely different private card'];
    altered.other.prizes=['hidden'];
    assert.deepEqual(chooseOwnerPowerglassAttach(
      ownerPowerglassAttachInput(altered.state,seat,TYPES,
        altered.observe)),chooseOwnerPowerglassAttach(input));
  }
});

test('spent, blocked, wrong-zone and wrong-Tool prompts delegate',()=>{
  const f=fixture();
  f.pending.options.blocked=[1];
  assert.equal(chooseOwnerPowerglassAttach(
    ownerPowerglassAttachInput(f.state,0,TYPES,f.observe)),null);
  f.pending.options.blocked=[];
  f.pending.options.blockedTo=[{player:2,slot:1,index:0}];
  assert.equal(ownerPowerglassAttachInput(f.state,0,TYPES,f.observe),null);
  f.pending.options.blockedTo=[];
  f.pending.cardList={cards:[f.basic],filter:()=>[f.basic]};
  assert.equal(ownerPowerglassAttachInput(f.state,0,TYPES,f.observe),null);
  f.pending.cardList=f.owner.discard;
  f.pending.playerId=f.other.id;
  assert.equal(ownerPowerglassAttachInput(f.state,0,TYPES,f.observe),null);
  f.pending.playerId=f.owner.id;
  const wrongTool=()=>({decisionKind:'owner-prompt',globalTurn:42,
    ownPublic:{active:{printing:'Mewtwo & Mew-GX UNM',
      tools:[]}}});
  assert.equal(ownerPowerglassAttachInput(
    f.state,0,TYPES,wrongTool),null);
});

test('native-root hook selects, dispatches, physically attaches, and restores in both seats',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {delegated:true};}
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof ResolvePromptAction){
        const p=this.state.prompts.find(q=>q.id===action.id);
        if(!p.validate(action.result))throw Error('invalid fake native assign');
        const owner=this.state.players.find(q=>q.id===p.playerId);
        const card=action.result[0].card;
        owner.discard.cards.splice(owner.discard.cards.indexOf(card),1);
        owner.active.energies.cards.push(card);
        p.result=action.result;
      }
      return this.state;
    }
  }
  const beforeBot=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeStore=Store.prototype.dispatch;
  for(const seat of [0,1]){
    const f=fixture(seat);
    const run=withOwnerPowerglassAttachPrompt(()=>{
      const store=new Store(f.state);
      store.dispatch(new AddPlayerAction());
      const choice=new SimpleTacticsAi(f.owner.id)
        .decodeNextAction(store.state);
      assert.ok(choice instanceof ResolvePromptAction);
      assert.equal(choice.result[0].card,f.basic);
      store.dispatch(choice);
      assert.ok(f.owner.active.energies.cards.includes(f.basic));
      assert.ok(!f.owner.discard.cards.includes(f.basic));
      assert.equal(f.pending.result.length,1);
      return 'native-mock-settled';
    },{
      Store,SimpleTacticsAi,ResolvePromptAction,types:TYPES,
      observe:f.observe,
      validate:(state,action)=>assert.equal(
        state.prompts[0].validate(action.result),true)
    });
    assert.equal(run.result,'native-mock-settled');
    assert.equal(run.audit.selected,1);
    assert.equal(run.audit.accepted,1);
    assert.equal(run.audit.confirmedPhysicalBasicAttachments,1);
    assert.equal(run.audit.rejected,0);
    assert.equal(run.audit.competitiveGameQualified,false);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeBot);
    assert.strictEqual(Store.prototype.dispatch,beforeStore);
  }
});

test('unsupported native prompt delegates without an earned attachment',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {delegated:true};}
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(){return this.state;}
  }
  const f=fixture(0);
  f.pending.options.blocked=[1];
  const run=withOwnerPowerglassAttachPrompt(()=>{
    const store=new Store(f.state);
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(f.owner.id).decodeNextAction(store.state);
    assert.deepEqual(action,{delegated:true});
    return action;
  },{Store,SimpleTacticsAi,ResolvePromptAction,types:TYPES,
    observe:f.observe});
  assert.equal(run.audit.selected,0);
  assert.equal(run.audit.unsupportedPrompts,1);
  assert.equal(run.audit.accepted,0);
});
