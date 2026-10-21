'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const VERSION='agent8-canonical-quickball-paired-development-v1';

/**
 * Compare the same canonical Store/decks/physical deals with one actor
 * Quick Ball root flag changed. This is a historical policy experiment.
 * @param {object} off Four original-Store rows, Quick Ball option disabled.
 * @param {object} on Matching rows, Quick Ball option enabled.
 * @returns {object} Failure-inclusive exact-origin comparison.
 */
function compareQuickBallPair(off,on){
  for(const key of [
    'schema','sourceRegistration','enginePin','candidatePolicy',
    'actorOnlyCompositionOptIn','actorOnlyOwnerSingleSearchOptIn',
    'actorHandDiscardOptIn','actorChoosePokemonOptIn',
    'actorNativeFallbackAttributionOptIn','actorOnlyCompositionVersion',
    'paperSupporterQuotaOptIn','mandatoryOptionFallbackBothSeats',
    'enforceSelectOptionLegalityBothSeats','nativePressureWindowsOptIn'
  ])assert.deepEqual(off[key],on[key],'Unrelated policy flag drift: '+key);
  assert.equal(off.actorOnlyCompositionOptIn,true);
  assert.equal(off.attempted,4);
  assert.equal(on.attempted,4);
  assert.equal(off.rows.length,4);
  assert.equal(on.rows.length,4);
  assert.equal(off.competitiveQualifiedGames,0);
  assert.equal(on.competitiveQualifiedGames,0);
  const rows=off.rows.map((a,i)=>{
    const b=on.rows[i];
    assert.deepEqual(a.trial,b.trial,'Physical trial ID/seed drift at '+i);
    for(const key of [
      'sourceSeat','candidateSeat','actualStarterSeat','verifiedFirstTurn',
      'sourceActuallyFirst','sourceDealFingerprint','sourceFirstOwnHandSha256'
    ])assert.deepEqual(a[key],b[key],'Original deal or starter drift: '+key);
    assert.ok(a.sourceDealFingerprint);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    const original=a.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const modified=b.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    assert.ok(original&&modified,'Missing actor Store audit at '+a.trial.id);
    assert.equal(original.quickBallRootOptIn,false);
    assert.equal(modified.quickBallRootOptIn,true);
    assert.equal(original.typedIntentCounts?.['play-quick-ball']??0,0);
    const roots=(modified.nativeRootAcceptances??[])
      .filter(row=>row.kind==='play-quick-ball');
    for(const root of roots){
      assert.ok(['Quick Ball SSH','Quick Ball FST'].includes(root.intent.printing));
      assert.equal(root.accepted,true,'Quick Ball root rejected');
      assert.equal(root.nativePhysicalEffect,'confirmed-public-effect',
        'Quick Ball native physical spend unconfirmed');
    }
    const quick=modified.typedIntentCounts?.['play-quick-ball']??0;
    assert.ok(quick>=roots.length,'Bounded root ledger disagrees with count');
    const hand=(b.actorOnlyDecisionCoverage.detailedComponentAudits.handDiscard
      ?.selections??[]).slice();
    const deck=(b.actorOnlyDecisionCoverage.detailedComponentAudits.ownerSearch
      ?.boundedSelections??[]).slice();
    let pairedSearches=0;
    for(const root of roots){
      const h=hand.findIndex(x=>x.seat===root.seat&&x.turn===root.globalTurn);
      const d=deck.findIndex(x=>x.seat===root.seat&&
        x.turn===root.globalTurn&&x.source==='own-deck');
      if(h>=0&&d>=0){
        hand.splice(h,1);
        deck.splice(d,1);
        pairedSearches++;
      }
    }
    const outcome=row=>({
      actionCount:row.actionCount,finished:row.finished,winner:row.winner,
      endReason:row.endReason,finalPrizes:row.finalPrizes,
      rootActionLedgerSha256:row.rootActionLedgerSha256,
      candidateFollowupStatus:row.candidateFollowupStatus??null,
      error:row.error??null
    });
    return {
      id:a.trial.id,seed:a.trial.seed,sourceDeal:a.sourceDealFingerprint,
      actualStarterSeat:a.actualStarterSeat,
      off:outcome(a),on:outcome(b),
      onQuickBallRootIntents:quick,
      onBoundedPhysicalQuickBallSpends:roots.length,
      onBoundedMatchedDiscardSearchPrompts:pairedSearches,
      changedRootLedger:a.rootActionLedgerSha256!==b.rootActionLedgerSha256,
      qualifiedCompetitiveGame:false
    };
  });
  return {
    version:VERSION,enginePin:off.enginePin,changedOnly:'AGENT8_ACTOR_QUICK_BALL_DEV',
    pairedArms:4,sourceDealAndActualStartParity:true,
    observedQuickBallRootIntents:rows.reduce((n,r)=>n+r.onQuickBallRootIntents,0),
    observedPhysicalSpends:rows.reduce((n,r)=>n+r.onBoundedPhysicalQuickBallSpends,0),
    observedMatchedDiscardSearches:rows.reduce((n,r)=>
      n+r.onBoundedMatchedDiscardSearchPrompts,0),
    changedRootLedgerArms:rows.filter(r=>r.changedRootLedger).length,
    rows,competitiveQualifiedGames:0,
    limitation:'Retrospective source seeds, censored arms and native unqualified bot. Divergent action paths do not preserve later RNG consumption. Not a paper win-rate estimate.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,4,'Supply off/on canonical JSON reports');
  const off=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const on=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(compareQuickBallPair(off,on),null,2)+'\n');
}
module.exports={VERSION,compareQuickBallPair};
