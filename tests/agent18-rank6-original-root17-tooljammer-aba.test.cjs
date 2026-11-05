'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  DEFAULT_REG,selectSourceTool,withOriginalSourceToolFork
}=require('../simulation/evaluation/agent18-rank6-original-root17-tooljammer-aba.cjs');

const view=()=>({
  actorSeat:DEFAULT_REG.sourceSeat,globalTurn:DEFAULT_REG.sourceTurn,
  decisionKind:'owner-root',
  ownHand:['Tag Call CEC','Tool Jammer BST','Sidney FST 241'],
  ownTurnResources:{toolPlayLocked:false},
  ownPublic:{publicTurnRestrictions:{toolPlayLocked:false},
    active:{tools:[]}}
});
test('real original source prechoice hand and open active tool slot qualify',()=>{
  const v=view();const old=JSON.stringify(v);
  assert.equal(selectSourceTool(v,DEFAULT_REG),1);
  assert.equal(JSON.stringify(v),old);
});
test('owner seat, global turn and pending prompts are strict prerequisites',()=>{
  for(const key of ['actorSeat','globalTurn','decisionKind']){
    const v=view();v[key]=key==='decisionKind'?'owner-prompt':5;
    assert.equal(selectSourceTool(v,DEFAULT_REG),null,key);
  }
});
test('tool lock, occupied Active and absent card decline',()=>{
  for(const update of [
    v=>{v.ownTurnResources.toolPlayLocked=true;},
    v=>{v.ownPublic.publicTurnRestrictions.toolPlayLocked=true;},
    v=>{v.ownPublic.active.tools=['Float Stone BKT'];},
    v=>{v.ownHand=['Tag Call CEC'];}
  ]){
    const v=view();update(v);
    assert.equal(selectSourceTool(v,DEFAULT_REG),null);
  }
});

class PassTurnAction{}
class PlayCardAction{
  constructor(clientId,handIndex,target){
    this.clientId=clientId;this.handIndex=handIndex;this.target=target;
  }
}
class Bot{
  constructor(client){this.client=client;}
  decodeNextAction(){return new PassTurnAction();}
}
const types={PlayerType:{BOTTOM_PLAYER:'bottom'},
  SlotType:{ACTIVE:'active'}};
function scope({label=DEFAULT_REG.selectedOriginalId,throwInRun=false,
  chosenView=view()}={}){
  const source={id:'source-owner',
    hand:{cards:chosenView.ownHand.map(fullName=>({fullName}))}};
  const state={turn:DEFAULT_REG.sourceTurn,activePlayer:DEFAULT_REG.sourceSeat,
    players:[source,{id:'opponent'}],prompts:[]};
  const original=()=>{if(throwInRun)throw Error('test-failure');
    return new Bot({id:'source-owner'}).decodeNextAction(state);};
  const headless={runMatch:original};
  const dependencies={headless,SimpleTacticsAi:Bot,PlayCardAction,
    ...types,registration:DEFAULT_REG,observe:()=>chosenView};
  return {headless,original,dependencies,call:()=>headless.runMatch({label})};
}
test('actual selected Pass is replaced by a typed owner Active Tool action',()=>{
  const s=scope();
  const result=withOriginalSourceToolFork(()=>s.call(),s.dependencies);
  assert.ok(result.result instanceof PlayCardAction);
  assert.equal(result.result.clientId,'source-owner');
  assert.equal(result.result.handIndex,1);
  assert.deepEqual(result.result.target,
    {player:'bottom',slot:'active',index:0});
  assert.equal(result.audit.rootSubstitutions,1);
  assert.equal(result.audit.physicalOwnerHandVerified,true);
  assert.equal(s.headless.runMatch,s.original);
});
test('non-target original and public lock remain untouched',()=>{
  const other=scope({label:'11:102:A:champion-reference'});
  const a=withOriginalSourceToolFork(()=>other.call(),other.dependencies);
  assert.ok(a.result instanceof PassTurnAction);
  assert.equal(a.audit.nonSourceMatchCalls,1);
  const v=view();v.ownTurnResources.toolPlayLocked=true;
  const locked=scope({chosenView:v});
  const b=withOriginalSourceToolFork(()=>locked.call(),locked.dependencies);
  assert.ok(b.result instanceof PassTurnAction);
  assert.equal(b.audit.rootSubstitutions,0);
});
test('native wrapper restores original bot and match on exceptional exit',()=>{
  const s=scope({throwInRun:true});
  const prior=Bot.prototype.decodeNextAction;
  assert.throws(()=>withOriginalSourceToolFork(()=>s.call(),s.dependencies),
    /test-failure/);
  assert.strictEqual(s.headless.runMatch,s.original);
  assert.strictEqual(Bot.prototype.decodeNextAction,prior);
});
