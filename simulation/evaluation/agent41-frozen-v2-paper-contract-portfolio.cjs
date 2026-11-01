'use strict';

const assert=require('node:assert/strict');
const {runV2,profile}=require('./agent41-frozen-bilateral-development-v2.cjs');
const {VERSION,withPaperPromptContractPortfolio}=
  require('../twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

const SCHEMA='agent41-frozen-v2-paper-contract-portfolio-v1';
const PREFIX='agent41-bilateral-v2-common-policy-development-';

/**
 * A new, explicitly unqualified observer/guard treatment of the previously
 * frozen 32 original physical deals. The v2 source/manifest preflight stays
 * unchanged; the out-of-profile Store boundary is recorded separately.
 *
 * @param {{headless?:object,portfolio?:Function,run?:Function,deps?:object}} [opts]
 * @returns {object} Every original attempted arm plus independent prompt audit.
 */
function runFrozenV2PaperPortfolio(opts={}){
  const headless=opts.headless??require('../twinleaf/headless.cjs');
  const original=Object.getOwnPropertyDescriptor(headless,'runMatch');
  assert.equal(typeof original?.value,'function');
  let currentTrial=null;
  const observedTrials=[];
  function runMatch(request,...args){
    assert.equal(currentTrial,null,'Overlapping original Store games');
    assert.ok(typeof request.label==='string'&&request.label.startsWith(PREFIX),
      'Unexpected runMatch outside the frozen original-development trials');
    currentTrial=request.label.slice(PREFIX.length);
    observedTrials.push(currentTrial);
    try{return original.value.call(this,request,...args);}
    finally{currentTrial=null;}
  }
  Object.defineProperty(headless,'runMatch',{...original,value:runMatch});
  let witnessed;
  try{
    const run=opts.run??runV2;
    const portfolio=opts.portfolio??withPaperPromptContractPortfolio;
    witnessed=portfolio(run,{...opts.deps,
      requireLiveStore:true,currentTrialId:()=>currentTrial});
  }finally{
    assert.strictEqual(headless.runMatch,runMatch);
    Object.defineProperty(headless,'runMatch',original);
  }
  const native=witnessed.result;
  const rows=Array.isArray(native.rows)?native.rows:[];
  const counts=rows.map(row=>{
    const id=row.trial?.id??null;
    const expected=Array.isArray(row.rootActionLedger)?
      row.rootActionLedger.filter(x=>x.action==='ResolvePromptAction').length:null;
    const audit=witnessed.audit.byTrial?.[id]??null;
    return {id,rootLedgerNativePrompts:expected,
      boundaryAcceptedNativePrompts:audit?.nativeAccepted??null,
      boundaryAttemptedNativePrompts:audit?.attempted??null,
      status:expected!==null&&audit?.nativeAccepted===expected?
        'COUNT_MATCH':'UNMATCHED_OR_MISSING'};
  });
  const liveStoreCoverage=witnessed.audit.liveStoreRequired===true&&
    witnessed.audit.liveSourceTrialCount===profile.scheduledNativeArms&&
    witnessed.audit.preLivePromptAttempts===0;
  const allCountsMatched=rows.length===profile.scheduledNativeArms&&
    counts.every(x=>x.status==='COUNT_MATCH')&&liveStoreCoverage&&
    observedTrials.length===profile.scheduledNativeArms&&
    new Set(observedTrials).size===profile.scheduledNativeArms;
  return {
    schema:SCHEMA,parentFrozenV2Profile:profile.schema,
    parentFrozenV2SourceClosure:profile.sourceClosureSha256,
    status:'guarded-original-store-development-no-competitive-qualification',
    portfolioVersion:VERSION,
    installedOutsideFrozenV2AttestedSourceClosure:true,
    fullSourceClosureQualified:false,
    observedRunMatchTrialOrder:observedTrials,
    nativeTrialPromptCountBinding:{allCountsMatched,liveStoreCoverage,
      auxiliaryPromptAttempts:witnessed.audit.auxiliaryPromptAttempts??null,
      preLivePromptAttempts:witnessed.audit.preLivePromptAttempts??null,
      counts},
    paperPromptPortfolio:witnessed.audit,
    native,
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'Only covered prompt predicates can be paper verified. All unverified prompts and the two-seat policy, source-closure, full paper rules and 25-minute event clock remain release vetoes.'
  };
}

if(require.main===module){
  const result=runFrozenV2PaperPortfolio();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.native.attemptedComplete||
    !result.nativeTrialPromptCountBinding.allCountsMatched)
    process.exitCode=1;
}
module.exports={SCHEMA,runFrozenV2PaperPortfolio};
