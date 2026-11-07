'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {withFirstBlockedPromptContract}=
  require('../simulation/twinleaf/agent2-first-blocked-prompt-contract.cjs');

class ChooseCardsPrompt{
  constructor(ownerId,cards){
    this.playerId=ownerId;
    this.message='CHOOSE_STARTING_POKEMONS';
    this.id=77;
    this.result=undefined;
    this.options={min:1,max:6,allowCancel:false,blocked:[2,3]};
    this.cards={cards};
  }
}
class Bot{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'native-default';}
}

test('first blocked ChooseCards prompt exposes only owner-safe contract metadata',()=>{
  const cards=new Proxy([],{
    get(target,key){
      if(key==='length')return 7;
      throw new Error('concealed card identity read');
    }
  });
  const prompt=new ChooseCardsPrompt(101,cards);
  const state={turn:0,phase:1,players:[{id:101},{id:202}],
    prompts:[prompt]};
  const original=Bot.prototype.decodeNextAction;
  assert.throws(()=>guard(()=>withFirstBlockedPromptContract(()=>
    new Bot(101).decodeNextAction(state),{
      engine:()=>({SimpleTacticsAi:Bot})
    }),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    const contract=error.agent2FirstBlockedPromptContract;
    assert.equal(contract.schema,'agent2-first-blocked-prompt-contract-v1');
    assert.equal(contract.actorSeat,0);
    assert.equal(contract.promptOwnerSeat,0);
    assert.equal(contract.turn,0);
    assert.equal(contract.phase,1);
    assert.equal(contract.promptType,'ChooseCardsPrompt');
    assert.equal(contract.promptMessage,'CHOOSE_STARTING_POKEMONS');
    assert.equal(contract.responseShape,'number[]|null');
    assert.deepEqual(contract.options,{
      min:1,max:6,allowCancel:false,blockedCount:2
    });
    assert.equal(contract.ownerVisiblePromptCardCount,7);
    assert.equal(contract.sourceEvent,
      'setup-reducer.alternativeSetupSinglePlayer.choose-starting-pokemon');
    assert.equal(contract.quarantineCode,CODE);
    assert.equal(contract.hiddenCardIdentitiesIncluded,false);
    assert.equal(JSON.stringify(contract).includes('concealed'),false);
    assert.equal(error.nativeRawStateFallbackQuarantine.records[0].promptType,
      'ChooseCardsPrompt');
    return true;
  });
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});

test('non-owner prompt does not expose its options or card count',()=>{
  const cards=new Proxy([],{
    get(){throw new Error('non-owner card data read');}
  });
  const prompt=new ChooseCardsPrompt(202,cards);
  const state={turn:0,phase:1,players:[{id:101},{id:202}],
    prompts:[prompt]};
  assert.throws(()=>guard(()=>withFirstBlockedPromptContract(()=>
    new Bot(101).decodeNextAction(state),{
      engine:()=>({SimpleTacticsAi:Bot})
    }),{SimpleTacticsAi:Bot}),error=>{
    const contract=error.agent2FirstBlockedPromptContract;
    assert.equal(contract.actorSeat,0);
    assert.equal(contract.promptOwnerSeat,null);
    assert.equal(contract.promptType,null);
    assert.equal(contract.options,null);
    assert.equal(contract.ownerVisiblePromptCardCount,null);
    return true;
  });
});
