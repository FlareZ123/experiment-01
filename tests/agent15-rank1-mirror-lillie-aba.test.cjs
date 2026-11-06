'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOriginalRank1HeldLillie,runOriginalRank1HeldLillieABA,
  TARGET,LILLIE}=require('../simulation/twinleaf/agent15-rank1-mirror-lillie-aba.cjs');

class PassTurnAction {}
class PlayCardAction {
  constructor(clientId,index,target){Object.assign(this,{clientId,index,target});}
}
class Tactics {
  decodeNextAction(){return new PassTurnAction();}
}
const deps={SimpleTacticsAi:Tactics,PlayCardAction,
  PlayerType:{ANY:'any'},SlotType:{BOARD:'board'}};
const state=(turn=20)=>({activePlayer:0,turn,prompts:[],
  players:[{id:7,supporterTurn:0,cannotPlaySupporterCards:false,
    hand:{cards:[{fullName:'Float Stone BKT'},{fullName:LILLIE}]}},
    {id:8,hand:{cards:[{fullName:'Secret Box'}]}}]});

test('owner-only postchoice Pass becomes typed Lillie with available Supporter quota',()=>{
  const before=Tactics.prototype.decodeNextAction;
  const s=state();
  const r=withOriginalRank1HeldLillie(()=>{
    const a=new Tactics().decodeNextAction(s);
    assert.ok(a instanceof PlayCardAction);
    assert.deepEqual([a.clientId,a.index,a.target],
      [7,1,{player:'any',slot:'board',index:0}]);
    return true;
  },deps);
  assert.equal(r.result,true);
  assert.equal(r.audit.actualTypedProposals,1);
  assert.equal(r.audit.sourceSupporterQuotaAvailable,1);
  assert.equal(r.audit.opponentPrivateRead,false);
  assert.strictEqual(Tactics.prototype.decodeNextAction,before);
});

test('other turn, other seat, spent Supporter, missing card and pending prompt are excluded',()=>{
  const r=withOriginalRank1HeldLillie(()=>{
    for(const s of [
      state(18),
      {...state(),activePlayer:1},
      Object.assign(state(),{prompts:[{id:1}]}),
      (()=>{const s=state();s.players[0].supporterTurn=20;return s;})(),
      (()=>{const s=state();s.players[0].cannotPlaySupporterCards=true;return s;})(),
      (()=>{const s=state();s.players[0].hand.cards.pop();return s;})()
    ]) assert.ok(new Tactics().decodeNextAction(s) instanceof PassTurnAction);
  },deps);
  assert.equal(r.audit.actualTypedProposals,0);
});

test('exceptions restore exactly prior bot decoder',()=>{
  const before=Tactics.prototype.decodeNextAction;
  assert.throws(()=>withOriginalRank1HeldLillie(()=>{
    throw Error('expected');
  },deps),/expected/);
  assert.strictEqual(Tactics.prototype.decodeNextAction,before);
});

test('one matched source target receives B treatment among three frozen-phase replays',()=>{
  const entries=[TARGET,'6:210:B:champion-reference'];
  const headless={runMatch:req=>({label:req.label})};
  const run=()=>({rawDevelopment:{rows:entries.map(id=>
    headless.runMatch({label:'agent41-bilateral-v2-common-policy-development-'+id}))}});
  let calls=0;
  const r=runOriginalRank1HeldLillieABA({headless,runner:run,
    treatment:fn=>{calls++;return {result:fn(),audit:{proposal:1}};}});
  assert.deepEqual(r.phases.map(x=>x.phase),['A','B','A-repeat']);
  assert.equal(calls,1);
  assert.deepEqual(r.phases.map(x=>x.execution.rawDevelopment.rows.length),[2,2,2]);
  assert.equal(r.phases[1].audit.proposal,1);
});
