'use strict';

const assert=require('node:assert/strict');
const {runStewardSelectedIssue25V4}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {TARGET}=
  require('./agent7-shadowmist-original48-hammer-aba.cjs');

const VERSION='agent7-rank6-native-plumeria-payment-alternative-48root-v1';
const FLAGS=[
  'AGENT29_HAMMER_AFTER_PASS_DEV',
  'AGENT7_PLUMERIA_PRESERVE_MAIL_DEV',
  'AGENT4_NATIVE_PAYMENT_RECEIPT_DEV'
];

/**
 * Native same-deal original-eight diagnostic. In BOTH arms Plumeria is chosen
 * after an authentic Pass; the only treatment is which two *physical* owner
 * hand cards are paid at the authentic mandatory prompt. No result is a
 * competitive game, and all capped/error originals remain in the denominator.
 *
 * @param {{execute?:Function,development?:Function}} [deps] Test seams.
 * @returns {object} Evidence from unchanged registered physical openings.
 */
function runOriginalPlumeriaPaymentPair(deps={}){
  const execute=deps.execute??runStewardSelectedIssue25V4;
  const development=deps.development??runDevelopment;
  assert.equal(typeof execute,'function');
  assert.equal(typeof development,'function');
  const saved=FLAGS.map(name=>({
    name,had:Object.hasOwn(process.env,name),value:process.env[name]
  }));
  const run=alternative=>{
    process.env.AGENT29_HAMMER_AFTER_PASS_DEV='false';
    process.env.AGENT7_PLUMERIA_PRESERVE_MAIL_DEV=
      alternative?'true':'false';
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    return execute({runner:options=>development({
      ...options,actorPlumeriaAfterPass:true
    })});
  };
  let baseline,treatment;
  try{
    baseline=run(false);
    treatment=run(true);
  }finally{
    for(const row of saved){
      if(row.had)process.env[row.name]=row.value;
      else delete process.env[row.name];
    }
  }
  const a=baseline?.rawDevelopment?.rows;
  const b=treatment?.rawDevelopment?.rows;
  assert.ok(Array.isArray(a)&&Array.isArray(b));
  assert.equal(a.length,8);
  assert.equal(b.length,8);
  const lookup=new Map(a.map(row=>[row.trial.id,row]));
  assert.equal(lookup.size,8);
  const perTrial=b.map(current=>{
    const before=lookup.get(current.trial.id);
    assert.ok(before);
    assert.equal(before.sourceDealFingerprint,current.sourceDealFingerprint);
    assert.equal(before.fullPhysicalDealFingerprint,
      current.fullPhysicalDealFingerprint);
    assert.equal(before.actualStarterSeat,current.actualStarterSeat);
    const audit=row=>row.actorOnlyDecisionCoverage?.
      detailedComponentAudits?.ownerPlumeriaAfterPass??null;
    const receipts=row=>(audit(row)?.physicallyAcceptedOwnerPayments??[])
      .map(r=>({
        seat:r.seat,turn:r.turn,
        acceptedByOriginalStore:r.acceptedByOriginalStore,
        payment:r.payment.map(card=>({
          handIndex:card.handIndex,printing:card.printing
        }))
      }));
    const roots=row=>row.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??[];
    const x=roots(before),y=roots(current);
    let prefix=0;
    for(;prefix<Math.min(x.length,y.length);prefix++){
      if(['playerSlot','turnBefore','action','card','attack',
        'pendingPrompt'].some(key=>
          (x[prefix][key]??null)!==(y[prefix][key]??null)))break;
    }
    return {
      id:current.trial.id,
      sourceSeat:current.sourceSeat??
        current.nativeAbortProvenance?.sourceSeat??null,
      fullPhysicalDealFingerprint:current.fullPhysicalDealFingerprint,
      sourceDealFingerprint:current.sourceDealFingerprint,
      starterSeat:current.actualStarterSeat,
      controlStatus:before.status??'unqualified',
      treatmentStatus:current.status??'unqualified',
      controlFinished:before.finished??false,
      treatmentFinished:current.finished??false,
      controlRoots:x.length,treatmentRoots:y.length,
      publicRootCommonPrefix:prefix,
      controlPlumeriaNativeAccepted:audit(before)?.acceptedPlumeria??0,
      treatmentPlumeriaNativeAccepted:audit(current)?.acceptedPlumeria??0,
      controlSettledEnergyDiscards:audit(before)?.settledEnergyDiscards??0,
      treatmentSettledEnergyDiscards:audit(current)?.settledEnergyDiscards??0,
      controlUnresolvedPromptChains:audit(before)?.unresolvedChains??null,
      treatmentUnresolvedPromptChains:audit(current)?.unresolvedChains??null,
      controlPrintedPayments:receipts(before),
      treatmentPrintedPayments:receipts(current)
    };
  });
  assert.equal(new Set(perTrial.map(x=>x.id)).size,8);
  const target=perTrial.find(row=>row.id===TARGET);
  assert.ok(target);
  return {
    version:VERSION,targetTrial:TARGET,target,
    paired:perTrial,
    registeredOriginalArmsPerCondition:8,
    nativeRootLimit:48,
    paymentOnlyPolicyTreatment:true,
    exactSamePhysicalOpeningPerPair:true,
    originalPrintedSixtiesUnchanged:true,
    fixedCandidate60Unchanged:true,
    originalControlsPreserved:true,
    competitiveGamesQualified:0,paperWinRate:null
  };
}

module.exports={VERSION,FLAGS,runOriginalPlumeriaPaymentPair};
