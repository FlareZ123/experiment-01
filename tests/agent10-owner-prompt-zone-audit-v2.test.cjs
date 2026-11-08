'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withOwnerPromptZoneAudit
}=require('../simulation/twinleaf/agent10-owner-prompt-zone-audit-v2.cjs');

class FakeStore{
  constructor(state){this.state=state;this.nextPromptId=0;}
  prompt(state,promptArgument){
    const prompts=Array.isArray(promptArgument)?promptArgument:[promptArgument];
    for(const prompt of prompts){
      prompt.id=String(++this.nextPromptId);
      if(prompt.promptControllerId!=null)prompt.playerId=prompt.promptControllerId;
      else if(prompt.player?.id!=null)prompt.playerId=prompt.player.id;
      if(prompt.perspectivePlayerId==null)
        prompt.perspectivePlayerId=prompt.player?.id??prompt.playerId;
      state.prompts.push(prompt);
    }
    return state;
  }
}
class FakeChooseCardsPrompt{
  constructor(player,cards,message,options,identity={}){
    this.id=0;
    this.player=player;
    this.playerId=player.id;
    this.promptControllerId=identity.controllerId??null;
    this.perspectivePlayerId=identity.perspectiveId??player.id;
    this.cards=cards;
    this.message=message;
    this.options=options;
  }
}

test('discard zone audit classifies prompt arrays without serializing offered card identities',()=>{
  class CardList{constructor(cards){this.cards=cards;}}
  const owner={id:10},opponent={id:20};
  const state={
    turn:54,phase:3,activePlayer:1,
    players:[owner,opponent],prompts:[]
  };
  const store=new FakeStore(state);
  let classifierOwnerSeat=null;
  let classifierCalls=0;
  const promptZoneMatches=(seenState,prompt,superType,ownerSeatOverride)=>{
    classifierCalls++;
    classifierOwnerSeat=ownerSeatOverride;
    assert.equal(seenState,state);
    assert.equal(prompt.message,42);
    assert.deepEqual(superType,{POKEMON:1});
    return {
      matches:[
        {
          zone:'owner-hand',match:'subset',visibility:'hidden',
          eligibleSubzone:null,subzoneReferenceMatch:false,eligibleCount:9
        }
      ],
      offeredCount:9,
      eligibleSubzone:null,
      filterSuperType:'POKEMON',
      filterMatchesEnergySubzone:false,
      offeredPrintings:['Secret Card Identity']
    };
  };
  const originalPrompt=FakeStore.prototype.prompt;
  const sourceOriginProof={sourcePrinting:'Galarian Stunfisk SSH',
    sourceAbility:'Snap Trap',promptIdAfterStore:'1',
    sourceCard:{name:'Hidden source object'},player:{id:20}};
  const discard=new FakeChooseCardsPrompt(opponent,
    new CardList([{fullName:'Secret Card Identity'}]),42,
    {min:1,max:1,allowCancel:false,isSecret:false},
    {controllerId:String(owner.id),perspectiveId:String(opponent.id)});
  const unrelated=new FakeChooseCardsPrompt(owner,[],43,{min:0,max:1});
  const {result,audit}=withOwnerPromptZoneAudit(()=>
    store.prompt(state,[discard,unrelated]),{
      Store:FakeStore,
      ChooseCardsPrompt:FakeChooseCardsPrompt,
      GameMessage:{CHOOSE_CARD_TO_DISCARD:42},
      SuperType:{POKEMON:1},
      promptZoneMatches,
      getSourceOriginForPrompt:()=>sourceOriginProof
    });

  assert.equal(result,state);
  assert.equal(audit.version,VERSION);
  assert.equal(audit.promptCount,1);
  assert.equal(audit.events.length,1);
  assert.equal(classifierCalls,1);
  assert.equal(classifierOwnerSeat,1);
  const event=audit.events[0];
  assert.equal(event.promptId,'1');
  assert.equal(event.promptIdBeforeStore,'0');
  assert.equal(event.promptGroupLength,2);
  assert.equal(event.promptIndexInGroup,0);
  assert.equal(event.promptPlayerSeat,1);
  assert.equal(event.controllerSeat,0);
  assert.equal(event.perspectiveSeat,1);
  assert.equal(event.message,'CHOOSE_CARD_TO_DISCARD');
  assert.equal(event.min,1);
  assert.equal(event.max,1);
  assert.equal(event.selectableCount,null);
  assert.equal(event.filterSuperType,'POKEMON');
  assert.deepEqual(event.sourceOrigin,{sourcePrinting:'Galarian Stunfisk SSH',
    sourceAbility:'Snap Trap',promptIdAfterStore:'1'});
  assert.notEqual(event.sourceOrigin,sourceOriginProof);
  sourceOriginProof.promptIdAfterStore='changed';
  sourceOriginProof.sourceCard.name='mutated';
  assert.equal(event.sourceOrigin.promptIdAfterStore,'1');
  assert.equal(Object.prototype.hasOwnProperty.call(event.sourceOrigin,'sourceCard'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(event.sourceOrigin,'player'),false);
  assert.equal(event.zoneMatches[0].zone,'owner-hand');
  assert.equal(event.zoneMatches[0].visibility,'hidden');
  assert.equal(event.zoneMatches[0].eligibleCount,null);
  assert.equal(Object.prototype.hasOwnProperty.call(event,'offeredPrintings'),false);
  assert.equal(JSON.stringify(audit).includes('Secret Card Identity'),false);
  assert.equal(FakeStore.prototype.prompt,originalPrompt);
});

test('zone classifier errors are recorded without changing the native prompt result',()=>{
  const owner={id:7};
  const state={turn:2,phase:1,activePlayer:0,players:[owner],prompts:[]};
  const store=new FakeStore(state);
  const originalPrompt=FakeStore.prototype.prompt;
  const {result,audit}=withOwnerPromptZoneAudit(()=>
    store.prompt(state,new FakeChooseCardsPrompt(owner,[],42,{min:1,max:1})),{
      Store:FakeStore,
      ChooseCardsPrompt:FakeChooseCardsPrompt,
      GameMessage:{CHOOSE_CARD_TO_DISCARD:42},
      SuperType:{POKEMON:1},
      promptZoneMatches:()=>{throw Object.assign(new Error('private detail'),{code:'ZONE_AUDIT_FAILED'});},
      getSourceOriginForPrompt:()=>null
    });
  assert.equal(result,state);
  assert.equal(audit.events.length,1);
  assert.deepEqual(audit.events[0].zoneAuditError,{
    name:'Error',code:'ZONE_AUDIT_FAILED'
  });
  assert.equal(JSON.stringify(audit).includes('private detail'),false);
  assert.equal(FakeStore.prototype.prompt,originalPrompt);
});
