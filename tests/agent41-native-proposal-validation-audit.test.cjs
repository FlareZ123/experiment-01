'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeProposalValidationAudit}=
  require('../simulation/twinleaf/agent41-native-proposal-validation-audit.cjs');

function fixture(){
  class PlaySupporterTactic{
    useTactic(state,owner){
      owner.supporterTurn=state.turn;
      Math.random();
      return {handIndex:0};
    }
  }
  class SimpleTacticsAi{
    isValidAction(state,action){
      return state.accept!==false&&action.handIndex===0;
    }
    decodeNextAction(state){
      const action=new PlaySupporterTactic().useTactic(
        state,state.players[state.activePlayer]);
      return this.isValidAction(state,action)?action:null;
    }
  }
  const state={activePlayer:0,turn:2,
    players:[{id:101,supporterTurn:0,
      hand:{cards:[{fullName:'Lillie CEC'}]}}]};
  return {SimpleTacticsAi,PlaySupporterTactic,state};
}

test('canonical read-only decision observer captures accepted proposal and restores hooks',()=>{
  const {SimpleTacticsAi,PlaySupporterTactic,state}=fixture();
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const originalValid=SimpleTacticsAi.prototype.isValidAction;
  const originalTactic=PlaySupporterTactic.prototype.useTactic;
  const originalRandom=Math.random;
  const observed=withNativeProposalValidationAudit(
    ()=>new SimpleTacticsAi().decodeNextAction(state),
    {SimpleTacticsAi,PlaySupporterTactic,tapeOrdinal:1});
  assert.equal(observed.result.handIndex,0);
  assert.equal(observed.audit.decisionsObserved,1);
  assert.equal(observed.audit.proposalObservations,1);
  assert.equal(observed.audit.rejectedValidations,0);
  assert.equal(observed.audit.boundedStoredDecisions[0].rngDraws,1);
  assert.equal(observed.audit.boundedStoredDecisions[0].rngTape.length,1);
  assert.equal(observed.audit.boundedStoredDecisions[0].validations[0].accepted,true);
  assert.equal(observed.audit.informationSetCertified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(SimpleTacticsAi.prototype.isValidAction,originalValid);
  assert.strictEqual(PlaySupporterTactic.prototype.useTactic,originalTactic);
  assert.strictEqual(Math.random,originalRandom);
});

test('rejected native validation is preserved without a fabricated Store root',()=>{
  const {SimpleTacticsAi,PlaySupporterTactic,state}=fixture();
  state.accept=false;
  const observed=withNativeProposalValidationAudit(
    ()=>new SimpleTacticsAi().decodeNextAction(state),
    {SimpleTacticsAi,PlaySupporterTactic});
  assert.equal(observed.result,null);
  assert.equal(observed.audit.rejectedValidations,1);
  assert.equal(observed.audit.rejectedValidationsLinkedToMutatedQuota,1);
  assert.equal(observed.audit.boundedStoredDecisions[0].selected,null);
  assert.equal(observed.audit.competitiveGameQualified,false);
});

test('restores original bot and tactic even if a native decision throws',()=>{
  const {SimpleTacticsAi,PlaySupporterTactic,state}=fixture();
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const originalValid=SimpleTacticsAi.prototype.isValidAction;
  const originalTactic=PlaySupporterTactic.prototype.useTactic;
  assert.throws(()=>withNativeProposalValidationAudit(
    ()=>{new SimpleTacticsAi().decodeNextAction(state);
      throw new Error('selected native test failure');},
    {SimpleTacticsAi,PlaySupporterTactic,tapeOrdinal:1}),
  /selected native test failure/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(SimpleTacticsAi.prototype.isValidAction,originalValid);
  assert.strictEqual(PlaySupporterTactic.prototype.useTactic,originalTactic);
});
