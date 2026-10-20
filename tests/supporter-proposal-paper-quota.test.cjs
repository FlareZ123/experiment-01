'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerVisibleSupporterQuotaProposals}=
  require('../simulation/twinleaf/supporter-proposal-paper-quota.cjs');

const SUPPORTER=7;
class PlaySupporterTactic {
  useTactic(state,owner) {
    if(owner.supporterTurn>=state.turn)return undefined;
    owner.supporterTurn=state.turn;
    return {name:'PlayCardAction',candidate:'Sidney'};
  }
}
function board(turn,quota){
  const owner={id:202,supporterTurn:quota,hand:{cards:[
    {fullName:'Sidney FST 241',trainerType:SUPPORTER},
    {fullName:'Battle VIP Pass FST',trainerType:2}
  ]}};
  return {state:{turn,players:[{id:101},owner]},owner};
}

test('original turn-number tactic erroneously proposes after one native Supporter',()=>{
  const {state,owner}=board(14,1);
  assert.equal(new PlaySupporterTactic().useTactic(state,owner)?.candidate,
    'Sidney');
});

test('owner-visible wrapper suppresses ordinary second proposal without mutation',()=>{
  const original=PlaySupporterTactic.prototype.useTactic;
  const {state,owner}=board(14,1);
  const a=withOwnerVisibleSupporterQuotaProposals(
    PlaySupporterTactic,SUPPORTER,()=>{
      const proposal=new PlaySupporterTactic().useTactic(state,owner);
      assert.equal(proposal,undefined);
      return 'original action remained absent';
    });
  assert.equal(a.result,'original action remained absent');
  assert.equal(a.suppressionCount,1);
  assert.equal(a.suppressedCalls[0].globalTurn,14);
  assert.equal(a.suppressedCalls[0].priorSupporterCount,1);
  assert.deepEqual(a.suppressedCalls[0].ownerHeldSupporters,
    ['Sidney FST 241']);
  assert.equal(owner.supporterTurn,1);
  assert.strictEqual(PlaySupporterTactic.prototype.useTactic,original);
});

test('first Supporter proposal is unchanged in a fresh owner turn',()=>{
  const {state,owner}=board(14,0);
  const a=withOwnerVisibleSupporterQuotaProposals(
    PlaySupporterTactic,SUPPORTER,
    ()=>new PlaySupporterTactic().useTactic(state,owner));
  assert.equal(a.result?.candidate,'Sidney');
  assert.equal(a.suppressionCount,0);
  assert.equal(owner.supporterTurn,14);
});

test('the same wrapper applies across both physical seats',()=>{
  const x=board(4,1);
  x.state.players.reverse();
  const observed=withOwnerVisibleSupporterQuotaProposals(
    PlaySupporterTactic,SUPPORTER,
    ()=>new PlaySupporterTactic().useTactic(x.state,x.owner));
  assert.equal(observed.suppressedCalls[0].seat,0);
});

test('explicit printed extra-Supporter permission can be admitted independently',()=>{
  const {state,owner}=board(14,1);
  const observed=withOwnerVisibleSupporterQuotaProposals(
    PlaySupporterTactic,SUPPORTER,
    ()=>new PlaySupporterTactic().useTactic(state,owner),{
      allowAdditionalSupporter:({owner:actual})=>actual===owner
    });
  assert.equal(observed.result?.candidate,'Sidney');
  assert.equal(observed.suppressionCount,0);
});

test('prototype restores even if child operation rejects a root',()=>{
  const original=PlaySupporterTactic.prototype.useTactic;
  assert.throws(()=>withOwnerVisibleSupporterQuotaProposals(
    PlaySupporterTactic,SUPPORTER,()=>{
      throw new Error('simulated native failure');
    }),/simulated native failure/);
  assert.strictEqual(PlaySupporterTactic.prototype.useTactic,original);
});
