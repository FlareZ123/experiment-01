'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withUnderworldPhysicalSettlementWitness}=
  require('../simulation/twinleaf/agent34-underworld-physical-settlement-witness.cjs');
const PSY='Psychic Energy MEE';
const vmax={fullName:'Shadow Rider Calyrex VMAX CRE',cardType:[5]};
const trev={fullName:'Trevenant & Dusknoir-GX SMP',cardType:[5]};
const wrong={fullName:'Lightning Recipient',cardType:[4]};
const energy=()=>({fullName:PSY});
const slot=(card=null,energies=[])=>({
  cards:card?[card]:[],energies:{cards:energies},
  getPokemonCard(){return this.cards[0]??null;}
});
class AddPlayerAction{}
class UseAbilityAction{
  constructor(clientId,name,target){Object.assign(this,{clientId,name,target});}
}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class AttachEnergyPrompt{
  constructor(id,playerId){Object.assign(this,{id,playerId});}
}
class WaitPrompt{
  constructor(id,playerId){Object.assign(this,{id,playerId});}
}

/** @param {object} [opts] @returns {object} */
function trial(opts={}){
  const used=new Set(opts.alreadyUsed?[vmax]:[]);
  const owner={
    id:10,active:slot(),bench:[
      slot(vmax),
      slot(opts.wrongType?wrong:trev,
        opts.alreadyAttached?[energy()]:[]),
      slot(),slot(),slot()],
    hand:{cards:[energy()]},
    deck:{cards:Array.from({length:opts.shortDeck?1:2},
      (_,i)=>({fullName:'Hidden own draw '+i}))},
    marker:{
      hasMarker:(name,card)=>name==='UNDERWORLD_DOOR_MARKER'&&
        used.has(card),
      addMarker:(name,card)=>used.add(card)
    }
  };
  class Store{
    constructor(){
      this.state={players:[owner,{id:20}],prompts:[],turn:4};
    }
    dispatch(action){
      if(action instanceof UseAbilityAction){
        this.state.prompts.push(opts.deferred?
          new WaitPrompt(6,owner.id):new AttachEnergyPrompt(7,owner.id));
      }
      if(action instanceof ResolvePromptAction){
        const prompt=this.state.prompts.find(p=>p.id===action.id);
        prompt.result=[];
        if(opts.deferred&&action.id===6){
          this.state.prompts.push(new AttachEnergyPrompt(7,owner.id));
          return true;
        }
        if(opts.reject)throw new Error('INVALID_PROMPT_RESULT');
        if(!opts.cancel){
          const target=owner.bench[1];
          target.energies.cards.push(owner.hand.cards.shift());
          const cards=owner.deck.cards.splice(0,2);
          owner.hand.cards.push(...cards);
          owner.marker.addMarker('UNDERWORLD_DOOR_MARKER',vmax);
        }
      }
      return true;
    }
  }
  const original=Store.prototype.dispatch;
  const wrapped=withUnderworldPhysicalSettlementWitness(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new UseAbilityAction(10,'Underworld Door',{
      player:2,slot:2,index:0
    }));
    if(opts.deferred)store.dispatch(new ResolvePromptAction(6));
    let rejectedError=null;
    try{
      store.dispatch(new ResolvePromptAction(7,opts.reject?[{
        card:owner.hand.cards[0],
        to:{player:2,slot:2,index:1}
      }]:null));
    }catch(error){rejectedError=error.message;}
    return {store,owner,rejectedError};
  },{
    Store,psychicType:5,
    cardActions:{PlayerType:{BOTTOM_PLAYER:2},
      SlotType:{ACTIVE:1,BENCH:2}}
  });
  assert.strictEqual(Store.prototype.dispatch,original);
  return wrapped;
}
test('native Store prompt physically adds one Psychic Energy and draws two',()=>{
  const result=trial();
  assert.equal(result.audit.abilityPromptsOpened,1);
  assert.equal(result.audit.acceptedNativePromptResolutions,1);
  assert.equal(result.audit.confirmedCompleteEffects,1);
  const e=result.audit.events[0];
  assert.equal(e.fullPhysicalEffect,true);
  assert.equal(e.ownHandBefore,1);
  assert.equal(e.ownHandAfter,2);
  assert.equal(e.ownDeckBefore,2);
  assert.equal(e.ownDeckAfter,0);
  assert.equal(e.sourceMarkerBefore,false);
  assert.equal(e.sourceMarkerAfter,true);
  assert.deepEqual(e.physicalBenchChanges,[{
    index:1,recipient:'Trevenant & Dusknoir-GX SMP',energy:PSY
  }]);
});
test('WaitPrompt defers a genuine Underworld AttachEnergyPrompt yet still settles',()=>{
  const result=trial({deferred:true});
  assert.equal(result.audit.abilityPromptsOpened,1);
  assert.equal(result.audit.acceptedNativePromptResolutions,1);
  assert.equal(result.audit.confirmedCompleteEffects,1);
  assert.equal(result.audit.events[0].promptId,7);
});
test('preexisting identical Psychic Energy still attests one extra card',()=>{
  const result=trial({alreadyAttached:true});
  assert.equal(result.audit.confirmedCompleteEffects,1);
  assert.equal(result.result.owner.bench[1].energies.cards.length,2);
});
test('native strict rejection records only the acting owner invalid recipient',()=>{
  const result=trial({reject:true,wrongType:true});
  assert.equal(result.result.rejectedError,'INVALID_PROMPT_RESULT');
  assert.equal(result.audit.abilityPromptsOpened,1);
  assert.equal(result.audit.acceptedNativePromptResolutions,0);
  assert.equal(result.audit.rejectedNativeAttachEnergyPrompts,1);
  const event=result.audit.rejected[0];
  assert.equal(event.nativePromptRejected,true);
  assert.equal(event.offeredAssignmentCount,1);
  assert.equal(event.attempted[0].toOwnBench,true);
  assert.equal(event.attempted[0].printedPsychic,false);
  assert.equal(event.attempted[0].ownerVisibleRecipient,'Lightning Recipient');
  assert.equal(event.attempted[0].offeredEnergyPrinting,PSY);
});
test('native cancellation, short draw, used marker and off-type targets fail closed',()=>{
  for(const opts of [
    {cancel:true},{shortDeck:true},{alreadyUsed:true},{wrongType:true}
  ]){
    const result=trial(opts);
    assert.equal(result.audit.acceptedNativePromptResolutions,1);
    assert.equal(result.audit.confirmedCompleteEffects,0,
      'No invalid case can receive a complete source Ability witness');
  }
});
