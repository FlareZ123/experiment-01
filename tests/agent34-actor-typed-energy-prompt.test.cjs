'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {typedOwnerEnergyCandidates,withActorUnderworldPromptContinuation}=
  require('../simulation/twinleaf/agent34-actor-typed-energy-prompt.cjs');

const PSY=5,BASIC=0;
const vmx={printing:'Shadow Rider Calyrex VMAX CRE',printed:{types:[PSY]}};
const dialga={printing:'Dialga-GX UPR',printed:{types:[1]}};
const stageView=(bench=[vmx,dialga],hand=['Psychic Energy MEE'])=>({
  decisionKind:'owner-prompt',ownHand:hand,ownPublic:{bench}
});

test('owner-only typed Energy menu excludes off-type Bench and own-hand distractions',()=>{
  const view=stageView([vmx,dialga,vmx],
    ['Metal Energy MEE','Psychic Energy MEE','Psychic Energy SVE']);
  const rows=typedOwnerEnergyCandidates(view,{
    energyPrintingPrefix:'Psychic Energy ',requiredRecipientType:PSY,
    preferredBenchIndex:2});
  assert.deepEqual(rows,[
    {energyPrinting:'Psychic Energy MEE',benchIndex:2},
    {energyPrinting:'Psychic Energy MEE',benchIndex:0},
    {energyPrinting:'Psychic Energy SVE',benchIndex:2},
    {energyPrinting:'Psychic Energy SVE',benchIndex:0}
  ]);
});

test('no qualifying owner Energy or Bench target declines without inventing',()=>{
  assert.deepEqual(typedOwnerEnergyCandidates(stageView([dialga]),{
    energyPrintingPrefix:'Psychic Energy ',requiredRecipientType:PSY
  }),[]);
  assert.deepEqual(typedOwnerEnergyCandidates(stageView([vmx],['Metal Energy MEE']),{
    energyPrintingPrefix:'Psychic Energy ',requiredRecipientType:PSY
  }),[]);
});

class AddPlayerAction{}
class UseAbilityAction{
  constructor(clientId,abilityName,target){Object.assign(this,{clientId,abilityName,target});}
}
class ResolvePromptAction{
  constructor(id,result){Object.assign(this,{id,result});}
}
class FakeBot{
  constructor(id){this.client={id};}
  decodeNextAction(state){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(pending?.constructor.name==='WaitPrompt')
      return new ResolvePromptAction(pending.id,null);
    if(pending?.constructor.name==='AttachEnergyPrompt')
      return new ResolvePromptAction(pending.id,[{
        card:pending.cardList.cards[0],to:{player:2,slot:2,index:1}
      }]);
    return null;
  }
}
class WaitPrompt{constructor(id,playerId){Object.assign(this,{id,playerId});}}
class AttachEnergyPrompt{
  constructor(id,playerId,card){
    Object.assign(this,{id,playerId,cardList:{cards:[card]}});
  }
  validate(result){return Array.isArray(result)&&result.length===1&&
    this.cardList.cards.includes(result[0].card)&&
    result[0].to.player===2&&result[0].to.slot===2&&
    result[0].to.index===0;
  }
}
class FakeStore{
  constructor(seat=0){
    const e={fullName:'Psychic Energy MEE',name:'Psychic Energy',
      energyType:BASIC,provides:[PSY]};
    const mk=id=>({id,hand:{cards:[e]},bench:[
      {printing:vmx.printing,energies:{cards:[]}},
      {printing:dialga.printing,energies:{cards:[]}}],
      deck:{cards:[1,2,3,4]},prizes:[]});
    this.state={turn:8,phase:2,activePlayer:seat,
      players:[mk(101),mk(202)],prompts:[]};
    this.pendingId=1;
    this.eventCount=0;
  }
  dispatch(action){
    const state=this.state,owner=state.players[state.activePlayer];
    this.eventCount++;
    if(action instanceof AddPlayerAction)return true;
    if(action instanceof UseAbilityAction){
      assert.equal(action.clientId,owner.id);
      assert.equal(action.abilityName,'Underworld Door');
      state.prompts=[new WaitPrompt(this.pendingId++,owner.id)];
      return true;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=state.prompts.find(p=>p.id===action.id&&p.result===undefined);
      assert.ok(prompt);
      if(prompt instanceof WaitPrompt){
        prompt.result=null;
        state.prompts=[new AttachEnergyPrompt(this.pendingId++,owner.id,
          owner.hand.cards[0])];
        return true;
      }
      if(prompt instanceof AttachEnergyPrompt){
        if(!prompt.validate(action.result))throw new Error('INVALID_PROMPT_RESULT');
        const {card,to}=action.result[0];
        owner.hand.cards.splice(owner.hand.cards.indexOf(card),1);
        owner.bench[to.index].energies.cards.push(card);
        owner.hand.cards.push(...owner.deck.cards.splice(0,2));
        prompt.result=action.result;
        state.prompts=[];
        return true;
      }
    }
    throw new Error('unknown action');
  }
}

function run(seat,invokeUnderworld=true){
  const descBot=Object.getOwnPropertyDescriptor(FakeBot.prototype,'decodeNextAction');
  const descStore=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const r=withActorUnderworldPromptContinuation(()=>{
    const store=new FakeStore(seat);
    store.dispatch(new AddPlayerAction());
    const owner=store.state.players[seat];
    const bot=new FakeBot(owner.id);
    if(invokeUnderworld)
      store.dispatch(new UseAbilityAction(owner.id,'Underworld Door',
        {player:2,slot:2,index:0}));
    else store.state.prompts=[new AttachEnergyPrompt(100,owner.id,
      owner.hand.cards[0])];
    if(invokeUnderworld){
      const wait=bot.decodeNextAction(store.state);
      store.dispatch(wait);
    }
    const action=bot.decodeNextAction(store.state);
    let accepted=false;
    try{store.dispatch(action);accepted=true;}
    catch(error){assert.match(error.message,/INVALID_PROMPT_RESULT/);}
    return {accepted,owner,action};
  },{SimpleTacticsAi:FakeBot,Store:FakeStore,
    ResolvePromptAction,types:{PlayerType:{BOTTOM_PLAYER:2},
      SlotType:{BENCH:2},CardType:{PSYCHIC:PSY},EnergyType:{BASIC}},
    observe:()=>stageView()});
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeBot.prototype,
    'decodeNextAction'),descBot);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,
    'dispatch'),descStore);
  return r;
}

for(const seat of [0,1])test('real Store-like root -> Wait -> typed prompt, seat '+seat,()=>{
  const {result,audit}=run(seat);
  assert.equal(result.accepted,true);
  assert.equal(result.owner.bench[0].energies.cards.length,1);
  assert.equal(result.owner.deck.cards.length,2);
  assert.equal(result.owner.hand.cards.length,2);
  assert.equal(audit.sourceUnderworldRootsAccepted,1);
  assert.equal(audit.sourcePromptNativeAccepted,1);
  assert.equal(audit.sourcePromptProposals,1);
  assert.equal(audit.sourcePromptNativeRejected,0);
  assert.equal(audit.competitiveGameQualified,false);
});

test('without the accepted Underworld source root, unrelated native prompt delegates',()=>{
  const {result,audit}=run(0,false);
  assert.equal(result.accepted,false);
  assert.equal(audit.sourcePromptProposals,0);
  assert.equal(audit.sourceMatchedEnergyPrompts,0);
});
