'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  createWonderTagRegisteredActorWitness,VERSION,PREFIX
}=require('../simulation/twinleaf/agent1-wondertag-registered-actor-witness.cjs');

/** Create a real callback stack without any vendor modules or secret cards. */
function fixture(){
  let witness;
  class FakeAi{
    constructor(id){this.client={id};}
    decodeNextAction(state){
      return witness.selectSupporterIndex({globalTurn:state.turn,
        choices:[{name:'hidden-card-never-recorded'}]});
    }
  }
  const originalDecode=FakeAi.prototype.decodeNextAction;
  const players=[{id:401},{id:902}];
  const headless={runMatch(options){
    const ai=new FakeAi(options.actorId);
    return ai.decodeNextAction({players,turn:options.turn??2});
  }};
  const originalRun=headless.runMatch;
  witness=createWonderTagRegisteredActorWitness({
    headless,SimpleTacticsAi:FakeAi
  });
  return {witness,headless,FakeAi,originalDecode,originalRun};
}

test('registered native trial and physical actor seat are captured with no hidden Supporter identities',()=>{
  const x=fixture();
  const result=x.witness.run(()=>
    x.headless.runMatch({label:PREFIX+'11:103:B:champion-reference',
      actorId:401}));
  assert.equal(result,0);
  assert.equal(x.witness.audit.version,VERSION);
  assert.equal(x.witness.audit.observedSearchDecisionCount,1);
  assert.deepEqual(x.witness.audit.decisions,[{
    id:'11:103:B:champion-reference',actorSeat:0,
    globalTurn:2,answerCardinality:1,ownerDeckPrintingsOmitted:true
  }]);
  assert.equal(JSON.stringify(x.witness.audit).includes('hidden-card'),false);
  assert.strictEqual(x.headless.runMatch,x.originalRun);
  assert.strictEqual(x.FakeAi.prototype.decodeNextAction,x.originalDecode);
});

test('registered source seat B and legal empty Supporter search are distinguished',()=>{
  const x=fixture();
  // The printed prompt genuinely offered zero eligible Supporters.
  x.FakeAi.prototype.decodeNextAction=function(state){
    return x.witness.selectSupporterIndex({globalTurn:state.turn,choices:[]});
  };
  const result=x.witness.run(()=>
    x.headless.runMatch({label:PREFIX+'6:100:A:champion-reference',
      actorId:902,turn:5}));
  assert.equal(result,-1);
  assert.equal(x.witness.audit.decisions[0].actorSeat,1);
  assert.equal(x.witness.audit.decisions[0].answerCardinality,0);
  assert.strictEqual(x.headless.runMatch,x.originalRun);
});

test('reject unregistered native Store label and restore hooks after failure',()=>{
  const x=fixture();
  assert.throws(()=>x.witness.run(()=>
    x.headless.runMatch({label:'unregistered',actorId:401})),
    /Unregistered native Store label/);
  assert.equal(x.witness.audit.observedSearchDecisionCount,0);
  assert.strictEqual(x.headless.runMatch,x.originalRun);
  assert.strictEqual(x.FakeAi.prototype.decodeNextAction,x.originalDecode);
});

test('reject owner search invoked without a native actor decoder',()=>{
  const x=fixture();
  assert.throws(()=>x.witness.selectSupporterIndex({
    globalTurn:1,choices:[]}));
  assert.throws(()=>x.witness.run(()=>
    x.witness.selectSupporterIndex({globalTurn:1,choices:[]})),
    /outside registered native trial/);
  assert.strictEqual(x.headless.runMatch,x.originalRun);
});
