'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runCanonicalVipIssue25V11,ENV,nativeVipOutcome}=
  require('../simulation/evaluation/agent16-issue25-canonical-vip-v11.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

function syntheticLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}

test('scope inner native VIP flag over unchanged eight original trial IDs',()=>{
  const original=process.env[ENV];
  let observedFlag=null,registered=null;
  const used=runCanonicalVipIssue25V11({
    layers:syntheticLayers(),
    attackLayer:next=>({result:next(),audit:{printedLayers:true}}),
    runner:options=>{
      observedFlag=process.env[ENV];
      registered=options.registeredTrials;
      return {
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'synthetic-development-only',
          sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          finished:false,rootActionLedger:[],
          actorOnlyDecisionCoverage:{
            detailedComponentAudits:{ownerVipAfterPass:{
              originalPassRoots:1,acceptedItems:1,acceptedSearches:1,
              bySeat:{0:{items:1},1:{items:0}}
            }}
          }
        }))
      };
    }
  });
  assert.equal(observedFlag,'true');
  assert.equal(process.env[ENV],original);
  assert.equal(registered.length,8);
  assert.equal(used.diagnostic.registered.length,8);
  assert.equal(used.diagnostic.nativeOwnerVipAuditsReturned,8);
  assert.equal(used.diagnostic.observedCanonicalPassFallthroughRoots,8);
  assert.equal(used.diagnostic.observedAcceptedVipItems,8);
  assert.equal(used.diagnostic.observedAcceptedVipSearches,8);
  assert.equal(used.manifest.selectedInnerCanonicalOwnerVip,true);
  assert.equal(used.manifest.releaseQualified,false);
  assert.equal(used.diagnostic.competitiveGamesQualified,0);
});

test('scope preserves a preexisting caller environment value',()=>{
  const old=process.env[ENV];
  process.env[ENV]='false';
  try{
    runCanonicalVipIssue25V11({
      layers:syntheticLayers(),
      attackLayer:next=>({result:next(),audit:{}}),
      runner:options=>({
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'synthetic-capped',
          sourceSeat:trial.candidateSlot==='A'?1:0,
          finished:false,rootActionLedger:[]
        }))
      })
    });
    assert.equal(process.env[ENV],'false');
  }finally{
    if(old===undefined)delete process.env[ENV];
    else process.env[ENV]=old;
  }
});

test('native source VIP summary never publishes owner-private hand details',()=>{
  const row={
    trial:{id:'rank:repeat:slot:contender'},
    rootActionLedger:[{},{}],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{ownerVipAfterPass:{
      originalPassRoots:2,
      acceptedItems:1,acceptedSearches:1,bySeat:{0:{items:1}},
      selectedBasics:2,nativeBenchConfirmed:1,
      examples:[{kind:'vip-search',accepted:true,
        seat:0,turn:1,printings:['Duskull SFA','Crobat V DAA'],
        nativeBenchConfirmed:true,benchBefore:1,benchAfter:3,
        deckBefore:46,deckAfter:44}],
      privateHand:['Darkness Energy','Battle VIP Pass'],
      passOpportunities:[{heldVip:true,ownerHandContents:['secret']}]
    }}}
  };
  const out=nativeVipOutcome(row);
  assert.equal(out.policyRecorded,true);
  assert.equal(out.acceptedItems,1);
  assert.equal(out.selectedBasicCopies,2);
  assert.equal(out.confirmedNonemptySearches,1);
  assert.deepEqual(out.publicBenchTransitions[0].publiclyBenchedPrintings,
    ['Duskull SFA','Crobat V DAA']);
  assert.equal(out.rootActionCount,2);
  assert.equal(JSON.stringify(out).includes('secret'),false);
  assert.equal(JSON.stringify(out).includes('Darkness Energy'),false);
  assert.equal(nativeVipOutcome({}).policyRecorded,false);
  assert.equal(nativeVipOutcome({}).acceptedItems,null);
});
