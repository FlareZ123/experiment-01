'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerMandatoryShowCards:withCards}=
  require('../simulation/twinleaf/agent50-owner-mandatory-showcards.cjs');

class FakeAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'native-unsupported'};}
}
class ShowCardsPrompt{
  constructor(id,message='ORDINARY'){
    this.playerId=id;
    this.message=message;
    this.options={allowCancel:false};
    this.id=44;
    this.result=undefined;
    Object.defineProperty(this,'cards',{get(){
      throw Error('Forbidden private prompt cards read');
    }});
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
const modules={
  'simple-bot/simple-tactics-ai':{SimpleTacticsAi:FakeAi},
  'game/store/prompts/show-cards-prompt':{ShowCardsPrompt},
  'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
  'game/game-message':{GameMessage:{
    SETUP_OPPONENT_NO_BASIC:'SETUP_OPPONENT_NO_BASIC'
  }},
  'game/store/state/state':{GamePhase:{PLAYER_TURN:2}}
};
const engine=key=>modules[key];
function state(seat,prompt,turn=1,phase=2){
  const player=id=>{
    const obj={id};
    for(const hidden of ['hand','deck','prizes']){
      Object.defineProperty(obj,hidden,{get(){
        throw Error('Forbidden '+hidden+' read for player '+id);
      }});
    }
    return obj;
  };
  return {players:[player(101),player(202)],
    prompts:[prompt],activePlayer:seat,turn,phase};
}
test('both seats: mandatory ShowCards acknowledgement never reads concealed zones',()=>{
  for(const seat of [0,1]){
    const id=seat===0?101:202;
    const p=new ShowCardsPrompt(id);
    const s=state(seat,p);
    const original=FakeAi.prototype.decodeNextAction;
    const observed=withCards(()=>
      new FakeAi(id).decodeNextAction(s),{engine});
    assert.equal(observed.result.constructor,ResolvePromptAction);
    assert.equal(observed.result.result,true);
    assert.equal(observed.audit.accepted,1);
    assert.equal(observed.audit.events[0].seat,seat);
    assert.strictEqual(FakeAi.prototype.decodeNextAction,original);
  }
});
test('wrong owner, setup phase, optional and opponent-mulligan message delegate',()=>{
  for(const spec of [
    {id:101,owner:202},
    {id:101,owner:101,phase:1},
    {id:101,owner:101,optional:true},
    {id:101,owner:101,message:'SETUP_OPPONENT_NO_BASIC'}
  ]){
    const p=new ShowCardsPrompt(spec.owner,spec.message??'ORDINARY');
    if(spec.optional)p.options.allowCancel=true;
    const s=state(0,p,1,spec.phase??2);
    const observed=withCards(()=>
      new FakeAi(spec.id).decodeNextAction(s),{engine});
    assert.deepEqual(observed.result,{kind:'native-unsupported'});
    assert.equal(observed.audit.accepted,0);
  }
});
