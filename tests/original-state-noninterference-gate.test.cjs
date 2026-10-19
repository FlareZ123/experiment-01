'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {installOriginalStateNoninterferenceGate}=
  require('../simulation/twinleaf/original-state-noninterference-gate.cjs');

test('unchanged live State allows the identical result and restores bot',()=>{
  class FakeBot {
    constructor(id){this.client={id};}
    decodeNextAction(state){return {kind:'attack',turn:state.turn};}
  }
  const before=FakeBot.prototype.decodeNextAction;
  const gate=installOriginalStateNoninterferenceGate(FakeBot);
  assert.deepEqual(new FakeBot(101).decodeNextAction({turn:4,board:{hp:200}}),
    {kind:'attack',turn:4});
  assert.deepEqual(gate.report,{calls:1,violations:[]});
  gate.restore();
  assert.strictEqual(FakeBot.prototype.decodeNextAction,before);
});

test('fail closed on original State property changes and retain path-only witness',()=>{
  class FakeBot {
    constructor(){this.client={id:202};}
    decodeNextAction(state){state.board[0].movedToActiveThisTurn=true;return 'pass';}
  }
  const gate=installOriginalStateNoninterferenceGate(FakeBot);
  const root={turn:3,board:[{movedToActiveThisTurn:false}]};
  assert.throws(()=>new FakeBot().decodeNextAction(root),
    /Original Store State changed during bot decision/);
  assert.equal(gate.report.calls,1);
  assert.deepEqual(gate.report.violations[0].changedGraph.examples,
    [{kind:'scalar-value',path:'state.board.0.movedToActiveThisTurn'}]);
  assert.equal(gate.report.violations[0].playerId,202);
  gate.restore();
});

test('read-only audit returns action and distinguishes changes from policy success',()=>{
  class FakeBot {
    decodeNextAction(state){state.counter+=1;return {kind:'attach'};}
  }
  const gate=installOriginalStateNoninterferenceGate(FakeBot,
    {failOnMutation:false});
  const root={turn:1,counter:0};
  assert.deepEqual(new FakeBot().decodeNextAction(root),{kind:'attach'});
  assert.equal(gate.report.violations[0].changedGraph.changedFields,1);
  gate.restore();
});

test('original policy exception survives even if its State was mutated',()=>{
  const sentinel=new Error('legitimate bot error');
  class FakeBot {
    decodeNextAction(state){state.counter=2;throw sentinel;}
  }
  const gate=installOriginalStateNoninterferenceGate(FakeBot);
  try {
    assert.throws(()=>new FakeBot().decodeNextAction({turn:7,counter:1}),
      error=>error===sentinel);
    assert.equal(gate.report.violations.length,1);
  } finally {gate.restore();}
});

test('hook rejects out-of-order restoration',()=>{
  class FakeBot {decodeNextAction(){return null;}}
  const gate=installOriginalStateNoninterferenceGate(FakeBot);
  const outer=()=>null;
  FakeBot.prototype.decodeNextAction=outer;
  assert.throws(()=>gate.restore(),/lost hook ownership/);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,outer);
});
