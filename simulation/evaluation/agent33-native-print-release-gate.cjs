'use strict';
const assert=require('node:assert/strict');

const SHA256=/^[0-9a-f]{64}$/;
const validHash=value=>typeof value==='string'&&SHA256.test(value);
const STATUS=new Set(['executed','skipped-unsupported-print','failed']);

/**
 * Audits a precommitted, full-60, two-seat native print/effect witness panel.
 * All receipts are external assertions until the pinned Store transcript and
 * CardManager registry are independently verified. Reviewable is never a game
 * win or paper-rules certificate.
 * @param {object} plan Immutable prospective set of source/candidate prints.
 * @param {object} archive Postgame native test and Store receipt archive.
 * @returns {object} Strict, attempt-complete developmental release diagnostic.
 */
function auditNativePrintRelease(plan,archive){
  assert.equal(plan?.schema,'aichi-exact-native-print-release-plan-v1');
  assert.equal(archive?.schema,'aichi-exact-native-print-release-archive-v1');
  assert.ok(validHash(plan.registrationId));
  assert.equal(archive.registrationId,plan.registrationId);
  assert.ok(/^[0-9a-f]{40}$/.test(plan.enginePin));
  assert.ok(/^[0-9a-f]{40}$/.test(plan.researchRevision));
  assert.equal(archive.enginePin,plan.enginePin);
  assert.equal(archive.researchRevision,plan.researchRevision);
  assert.ok(Array.isArray(plan.fixtures)&&plan.fixtures.length>0);
  assert.ok(Array.isArray(archive.rows));
  const fixtures=new Map();
  for(const f of plan.fixtures){
    assert.ok(typeof f.id==='string'&&f.id.length>0);
    assert.ok(!fixtures.has(f.id),'Duplicate fixture ID');
    assert.ok(Number.isSafeInteger(f.rank)&&f.rank>=1&&f.rank<=32);
    assert.ok(typeof f.candidateId==='string'&&f.candidateId.length>0);
    for(const side of ['source','candidate']){
      assert.ok(validHash(f[side+'DeckSha256']));
      const printed=f[side+'Prints'];
      assert.ok(Array.isArray(printed)&&printed.length>0);
      const names=new Set();
      let count=0;
      for(const card of printed){
        assert.ok(typeof card.printing==='string'&&card.printing.length>0);
        assert.ok(Number.isSafeInteger(card.count)&&card.count>=1&&card.count<=60);
        assert.ok(!names.has(card.printing),'Duplicate physical printing');
        names.add(card.printing);
        count+=card.count;
      }
      assert.equal(count,60,'Each frozen printed deck must have sixty cards');
    }
    assert.ok(Array.isArray(f.requiredEffects)&&f.requiredEffects.length>0);
    assert.ok(f.requiredEffects.every(e=>
      typeof e.id==='string'&&e.id.length>0&&
      (e.actor==='source'||e.actor==='candidate')));
    assert.equal(new Set(f.requiredEffects.map(e=>e.id)).size,
      f.requiredEffects.length,'Duplicate required effect ID');
    fixtures.set(f.id,f);
  }
  const observations=new Map();
  for(const row of archive.rows){
    assert.ok(fixtures.has(row.id),'Unregistered fixture attempt');
    assert.ok(row.seat===0||row.seat===1);
    const key=row.id+':'+row.seat;
    assert.ok(!observations.has(key),'Duplicate native attempt');
    const frozen=fixtures.get(row.id);
    assert.equal(row.sourceDeckSha256,frozen.sourceDeckSha256);
    assert.equal(row.candidateDeckSha256,frozen.candidateDeckSha256);
    assert.ok(STATUS.has(row.testStatus),'Unknown native execution status');
    assert.equal(typeof row.ciSucceeded,'boolean');
    assert.ok(validHash(row.rootLedgerSha256),
      'An exact native Store ledger digest is required for each seat');
    observations.set(key,row);
  }
  const diagnostics=[];
  for(const f of plan.fixtures){
    for(const seat of [0,1]){
      const row=observations.get(f.id+':'+seat);
      const vetoes=[];
      if(!row){
        diagnostics.push({id:f.id,rank:f.rank,candidateId:f.candidateId,
          seat,ciSucceeded:null,testStatus:'missing',nativeEffectReviewable:false,
          vetoes:['missing-registered-attempt']});
        continue;
      }
      if(!row.ciSucceeded)vetoes.push('ci-failed');
      if(row.testStatus!=='executed')vetoes.push(
        row.testStatus==='skipped-unsupported-print'?
          'test-skipped-unsupported-print':'native-test-failed');
      const registry=Array.isArray(row.nativeRegistry)?row.nativeRegistry:[];
      const seen=new Set();
      for(const card of registry){
        assert.ok(typeof card.printing==='string'&&card.printing.length>0);
        assert.ok(!seen.has(card.printing),'Duplicate CardManager printing');
        seen.add(card.printing);
        assert.ok(['exact-registered','alias','unsupported'].includes(card.status));
      }
      const requiredPrints=new Set([
        ...f.sourcePrints.map(x=>x.printing),
        ...f.candidatePrints.map(x=>x.printing)
      ]);
      for(const card of registry){
        assert.ok(requiredPrints.has(card.printing),
          'Native registry entry outside frozen physical decks');
      }
      const byPrinting=new Map(registry.map(x=>[x.printing,x.status]));
      const missing=[...requiredPrints].filter(p=>!byPrinting.has(p));
      const proxied=[...requiredPrints].filter(p=>byPrinting.get(p)==='alias');
      const unsupported=[...requiredPrints].filter(p=>
        byPrinting.get(p)==='unsupported');
      if(missing.length)vetoes.push('unobserved-cardmanager-printing');
      if(proxied.length)vetoes.push('native-print-proxy-unqualified');
      if(unsupported.length)vetoes.push('unsupported-exact-native-printing');
      const effects=Array.isArray(row.effects)?row.effects:[];
      const byEffect=new Map();
      for(const effect of effects){
        assert.ok(!byEffect.has(effect.id),'Duplicate effect receipt');
        assert.ok(f.requiredEffects.some(req=>req.id===effect.id),
          'Effect receipt outside preregistered panel');
        byEffect.set(effect.id,effect);
      }
      for(const requirement of f.requiredEffects){
        const id=requirement.id;
        const e=byEffect.get(id);
        const expectedActor=requirement.actor==='candidate'?seat:1-seat;
        const settled=e?.nativeStoreAccepted===true&&
          e?.nativeEffectSettled===true&&
          e?.actorSeat===expectedActor&&
          e?.opponentContinuationActorSeat===1-expectedActor&&
          Number.isSafeInteger(e?.rootOrdinal)&&e.rootOrdinal>=0&&
          Number.isSafeInteger(e?.completionOrdinal)&&
          e.completionOrdinal>=e.rootOrdinal&&
          Number.isSafeInteger(e?.opponentContinuationOrdinal)&&
          e.opponentContinuationOrdinal>e.completionOrdinal&&
          e?.rootLedgerSha256===row.rootLedgerSha256&&
          validHash(e?.effectReceiptSha256);
        if(!settled)vetoes.push('native-effect-unsettled:'+id);
      }
      // The same required native effect can be witnessed on either physical
      // seat but an omitted seat is an explicit failure of the bilateral panel.
      diagnostics.push({id:f.id,rank:f.rank,candidateId:f.candidateId,
        seat,ciSucceeded:row.ciSucceeded,testStatus:row.testStatus,
        nativeEffectReviewable:vetoes.length===0,
        missingPrintings:missing,proxiedPrintings:proxied,
        unsupportedPrintings:unsupported,vetoes});
    }
  }
  const ranks=new Set(plan.fixtures.map(x=>x.rank));
  const candidates=new Set(plan.fixtures.map(x=>x.candidateId));
  const fixedDecks=new Set(plan.fixtures.map(x=>x.candidateDeckSha256));
  // A repeated rank or changed physical candidate 60 cannot impersonate the
  // actual 32 distinct final-place opponents and one fixed candidate 60.
  const fullField=plan.fixtures.length===32&&ranks.size===32&&
    [...Array(32)].every((_,i)=>ranks.has(i+1))&&
    candidates.size===1&&fixedDecks.size===1;
  const allNativeReviewable=diagnostics.every(d=>d.nativeEffectReviewable);
  return {
    schema:'aichi-exact-native-print-release-verdict-v1',
    registeredPhysicalSeatAttempts:plan.fixtures.length*2,
    observedPhysicalSeatAttempts:observations.size,
    allRegisteredAttemptsPreserved:observations.size===plan.fixtures.length*2,
    fullAichi32FixedCandidatePanel:fullField,
    nativeEffectWitnessPreflight:allNativeReviewable&&fullField?
      'FULL-FIELD-NATIVE-WITNESS-REVIEWABLE':
      allNativeReviewable?'PARTIAL-PANEL-NATIVE-WITNESS-REVIEWABLE':
      'HOLD-UNSUPPORTED-OR-INCOMPLETE',
    rows:diagnostics,
    paperEquivalent:false,hiddenPolicyInformationSafe:false,
    tournamentClockCertified:false,competitiveGameQualified:false,
    caveat:'Native print and Store receipts are producer assertions until '+
      'independently verified. Reviewable never certifies competitive games.'
  };
}
module.exports={auditNativePrintRelease};
