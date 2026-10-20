'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {installNativeSupporterProposalValidationTrace:install}=require('../simulation/twinleaf/native-supporter-proposal-validation-observer.cjs');
const state=()=>({turn:4,activePlayer:0,players:[{id:101,supporterTurn:0,hand:{cards:[{fullName:'Cynthia & Caitlin CEC'}]}}]});
test('rejected native-style quota proposal is linked to validation and records original RNG',()=>{
  class Tactic{useTactic(s,p){p.supporterTurn=s.turn;Math.random();return {handIndex:0,allowed:false};}}
  class Bot{decodeNextAction(s){Math.random();const a=new Tactic().useTactic(s,s.players[0]);return this.isValidAction(s,a)?a:{kind:'fallback'};}
    isValidAction(_s,a){return a.allowed;}}
  const original=Bot.prototype.decodeNextAction,trace=install(Bot,Tactic);
  try{
    assert.equal(new Bot().decodeNextAction(state()).kind,'fallback');
    const r=trace.report,d=r.boundedStoredDecisions[0];
    assert.equal(r.decisionsObserved,1);
    assert.equal(r.proposalQuotaMutations,1);
    assert.equal(r.rejectedValidationsLinkedToMutatedQuota,1);
    assert.equal(d.rngDraws,2);
    assert.equal(d.supporterTurnAtExit,4);
    assert.equal(d.validations[0].linkedProposalQuotaMutated,true);
    assert.equal(d.proposals[0].action.ownerHeldPrinting,'Cynthia & Caitlin CEC');
  }finally{trace.restore();}
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
test('accepted proposal and bounded trace have no spurious reject',()=>{
  class Tactic{useTactic(){return {handIndex:0,allowed:true};}}
  class Bot{decodeNextAction(s){const a=new Tactic().useTactic(s,s.players[0]);this.isValidAction(s,a);return a;}isValidAction(_s,a){return a.allowed;}}
  const trace=install(Bot,Tactic,{maxDecisions:1});
  try{
    new Bot().decodeNextAction(state());new Bot().decodeNextAction(state());
    assert.equal(trace.report.proposalQuotaMutations,0);
    assert.equal(trace.report.rejectedValidations,0);
    assert.equal(trace.report.droppedDecisions,1);
  }finally{trace.restore();}
});
test('bot exception preserves original random source and propagates error',()=>{
  const sentinel=new Error('native failure');
  class Tactic{useTactic(){return null;}}
  class Bot{decodeNextAction(){Math.random();throw sentinel;}isValidAction(){return false;}}
  const saved=Math.random,trace=install(Bot,Tactic);
  try{
    assert.throws(()=>new Bot().decodeNextAction(state()),e=>e===sentinel);
    assert.strictEqual(Math.random,saved);
    assert.equal(trace.report.boundedStoredDecisions[0].errorName,'Error');
  }finally{trace.restore();}
});
