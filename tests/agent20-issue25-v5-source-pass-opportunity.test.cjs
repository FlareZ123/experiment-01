'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  REGISTRATION,withRegisteredSourcePassSnapshots,
  joinRegisteredPassOpportunities
}=require('../simulation/evaluation/agent20-issue25-v5-source-pass-opportunity.cjs');

const digest=x=>createHash('sha256').update(JSON.stringify(x))
  .digest('hex');

test('owner-only observer selects actual registered source Pass and restores native wrappers',()=>{
  class FakeAi{
    constructor(id){this.client={id};}
    decodeNextAction(){
      return {constructor:{name:'PassTurnAction'}};
    }
  }
  const originalDecode=FakeAi.prototype.decodeNextAction;
  const caught=[];
  const headless={runMatch(request){
    const sourceSeat=request.label.endsWith('6:source')?0:1;
    const state={
      turn:sourceSeat===0?2:8,activePlayer:sourceSeat,
      players:[{id:100},{id:101}],prompts:[],
      opponentPrivateHand:['secret-never-consulted']
    };
    const observed=new FakeAi(state.players[sourceSeat].id)
      .decodeNextAction(state);
    caught.push(observed.constructor.name);
    return request.label;
  }};
  const originalMatch=headless.runMatch;
  const registration={roots:[
    {id:'6:source',sourceSeat:0,turn:2},
    {id:'11:source',sourceSeat:1,turn:8}
  ]};
  const output=withRegisteredSourcePassSnapshots(()=>{
    headless.runMatch({label:'test-6:source'});
    headless.runMatch({label:'test-11:source'});
    return 7;
  },{
    headless,SimpleTacticsAi:FakeAi,registration,
    observe:(state,seat)=>Object.freeze({
      actorSeat:seat,globalTurn:state.turn,decisionKind:'owner-root',
      ownHand:['Energy'],ownPublic:{active:'public'},
      opponentPublic:{handCount:5}
    })
  });
  assert.equal(output.result,7);
  assert.deepEqual(caught,['PassTurnAction','PassTurnAction']);
  assert.equal(output.audit.cases.length,2);
  assert.deepEqual(output.audit.cases.map(x=>x.selectedPassCount),[1,1]);
  assert.strictEqual(headless.runMatch,originalMatch);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,originalDecode);
  assert.deepEqual(Object.keys(output.audit.cases[0].captured[0].ownerVisibleBeforeChoice),
    ['actorSeat','globalTurn','decisionKind','ownHand','ownPublic','opponentPublic']);
});

test('registered join preserves unknown paper eligibility and refuses fabricated Store tape',()=>{
  const rows=REGISTRATION.roots.map(target=>{
    const roots=Array.from({length:target.passRootOrdinal+1},(_,ordinal)=>({
      actionOrdinal:ordinal,
      action:ordinal===target.passRootOrdinal?'PassTurnAction':'ResolvePromptAction',
      playerSlot:target.sourceSeat,turnBefore:target.turn
    }));
    return {id:target.id,sourceDealFingerprint:target.sourceDealFingerprint,
      fullPhysicalDealFingerprint:target.fullPhysicalDealFingerprint,
      rootActionLedger:roots,status:'returned-unqualified',
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        ownerGenericTrainerFrontier:{roots:[{
          seat:target.sourceSeat,turn:target.turn,
          chosen:{action:'PassTurnAction'},dispatch:'native-accepted',
          ownerPaperNecessity:{rows:[
            {handIndex:0,printing:'Battle VIP Pass FST',
              paperPlayable:false,
              necessaryBlockers:['printed-temporal:expired']},
            {handIndex:1,printing:'Quick Ball SSH',
              paperPlayable:null,necessaryBlockers:[]}
          ]}
        }]}
      }}
    };
  });
  const others=Array.from({length:6},(_,index)=>({
    id:'other-'+index,rootActionLedger:[],status:'returned-unqualified'
  }));
  const snapshots={originalRegisteredTargets:REGISTRATION.roots.map(r=>r.id),
    cases:REGISTRATION.roots.map(r=>({id:r.id,selectedPassCount:1,
      captured:[{ownerVisibleBeforeChoice:{
        actorSeat:r.sourceSeat,globalTurn:r.turn,decisionKind:'owner-root',
        ownHand:['Battle VIP Pass FST','Quick Ball SSH']
      }}]}))
  };
  const result=joinRegisteredPassOpportunities(
    {rawDevelopment:{rows:[...rows,...others]}},snapshots);
  assert.equal(result.qualifiedGames,0);
  assert.equal(result.paperPayableAlternative,'unverified');
  assert.equal(result.snapshotsAndNecessaryScreensPresent,true);
  assert.equal(result.fullRootTapeParityAtBothAnchors,false);
  assert.deepEqual(result.opportunities.map(r=>r.paperNecessaryRejectedTrainerCopies),
    [1,1]);
  assert.deepEqual(result.opportunities.map(r=>r.unresolvedHeldTrainerCopies),
    [1,1]);
  assert.ok(result.opportunities.every(r=>
    r.independentPaperPayableAlternativeVerified===false));
  assert.notEqual(digest(rows[0].rootActionLedger),
    REGISTRATION.roots[0].originalAcceptedRootLedgerSha256);
});
