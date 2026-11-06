'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {THRESHOLD,withConservativeOwnerFilch}=
  require('../simulation/twinleaf/agent1-conservative-owner-filch.cjs');

class AttackAction{
  constructor(name){this.name=name;}
}
class PassTurnAction{
  constructor(playerId){this.playerId=playerId;}
}

/** @param {number} seat @param {number} remaining */
function fixture(seat,remaining){
  class MockAI{
    decodeNextAction(){return new AttackAction('Filch');}
  }
  const players=[0,1].map(id=>({
    id:id+100,
    active:{getPokemonCard:()=>({name:'Mimikyu'})},
    deck:{cards:Array(id===seat?remaining:50).fill({})}
  }));
  return {MockAI,state:{activePlayer:seat,players,
    turn:37,prompts:[]}};
}

test('both physical owner seats use their own deck count before conservative pass',()=>{
  for(const seat of [0,1]){
    const {MockAI,state}=fixture(seat,THRESHOLD);
    const old=MockAI.prototype.decodeNextAction;
    const observed=withConservativeOwnerFilch(()=>
      new MockAI().decodeNextAction(state),{
        SimpleTacticsAi:MockAI,PassTurnAction
      });
    assert.ok(observed.result instanceof PassTurnAction);
    assert.equal(observed.result.playerId,state.players[seat].id);
    assert.equal(observed.audit.proposedPrintedOwnerFilch,1);
    assert.equal(observed.audit.selectedOwnerPasses,1);
    assert.equal(observed.audit.acceptedOriginalFilch,0);
    assert.deepEqual(observed.audit.replacementEvents,[{
      globalTurn:37,ownerSeat:seat,ownDeckRemaining:24,
      originalAction:'AttackAction',originalAttack:'Filch',
      replacement:'PassTurnAction'
    }]);
    assert.strictEqual(MockAI.prototype.decodeNextAction,old);
  }
});

test('one card above threshold retains native selected Filch',()=>{
  const {MockAI,state}=fixture(1,THRESHOLD+1);
  const result=withConservativeOwnerFilch(()=>
    new MockAI().decodeNextAction(state),{
      SimpleTacticsAi:MockAI,PassTurnAction
    });
  assert.equal(result.result.name,'Filch');
  assert.equal(result.audit.acceptedOriginalFilch,1);
  assert.equal(result.audit.selectedOwnerPasses,0);
});

test('pending native prompt remains under original policy',()=>{
  const {MockAI,state}=fixture(0,0);
  state.prompts=[{result:undefined}];
  const result=withConservativeOwnerFilch(()=>
    new MockAI().decodeNextAction(state),{
      SimpleTacticsAi:MockAI,PassTurnAction
    });
  assert.equal(result.result.name,'Filch');
  assert.equal(result.audit.proposedPrintedOwnerFilch,0);
});

test('the policy never changes non-Mimikyu attacks or unrelated native actions',()=>{
  const {MockAI,state}=fixture(0,0);
  state.players[0].active.getPokemonCard=()=>({name:'Girafarig'});
  const r=withConservativeOwnerFilch(()=>
    new MockAI().decodeNextAction(state),{
      SimpleTacticsAi:MockAI,PassTurnAction
    });
  assert.equal(r.result.name,'Filch');
  assert.equal(r.audit.proposedPrintedOwnerFilch,0);
  MockAI.prototype.decodeNextAction=function(){return new AttackAction('Full Moon Rondo');};
  const another=withConservativeOwnerFilch(()=>
    new MockAI().decodeNextAction(state),{
      SimpleTacticsAi:MockAI,PassTurnAction
    });
  assert.equal(another.result.name,'Full Moon Rondo');
  assert.equal(another.audit.selectedOwnerPasses,0);
});

test('original bot function is restored after match failure',()=>{
  const {MockAI}=fixture(1,3);
  const old=MockAI.prototype.decodeNextAction;
  const cause=Error('the native Store rejected this action');
  assert.throws(()=>withConservativeOwnerFilch(()=>{throw cause;},{
    SimpleTacticsAi:MockAI,PassTurnAction
  }),e=>e===cause);
  assert.strictEqual(MockAI.prototype.decodeNextAction,old);
  assert.equal(cause.ownerConservativeFilchAudit.selectedOwnerPasses,0);
  assert.equal(cause.ownerConservativeFilchAudit.ownerOnly,true);
});
