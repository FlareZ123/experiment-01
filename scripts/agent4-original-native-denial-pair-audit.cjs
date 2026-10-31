'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {firstActionDifference}=
  require('./agent7-same-root-pass-attack-pair.cjs');
const VERSION='agent4-original-native-rank6-two-supporter-causal-fork-v1';

/**
 * Strictly pair identical original physical deals and the FIRST accepted
 * native root discrepancy. Do not convert a later engine winner into a
 * qualified game result.
 * @param {object} control Full original Plumeria-after-Pass report.
 * @param {object} fork Original Store Flare source-one-root fork report.
 */
function compareOriginalDenialFork(control,fork){
  assert.equal(control.mode,'plumeria');
  assert.equal(fork.mode,'flare');
  assert.equal(control.frameGitBlob,fork.frameGitBlob);
  assert.equal(control.report.enginePin,fork.report.enginePin);
  assert.equal(control.report.rows.length,2);
  assert.equal(fork.report.rows.length,2);
  const rows=[];
  for(let i=0;i<2;i++){
    const a=control.report.rows[i],b=fork.report.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    for(const k of ['sourceDeckFingerprint','candidateDeckFingerprint',
      'fullPhysicalDealFingerprint','sourceDealFingerprint',
      'verifiedFirstTurn','actualStarterSeat','sourceSeat','candidateSeat'])
      assert.deepEqual(a[k],b[k],k+' changed before first action');
    assert.equal(a.verifiedFirstTurn,true);
    assert.equal(a.sourceSeat,1);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    const previous=a.rootActionLedger??[];
    const next=b.rootActionLedger??[];
    assert.ok(previous.length>0&&next.length>0);
    const n=firstActionDifference(previous,next);
    const old=n<0?null:previous[n];
    const newer=n<0?null:next[n];
    const proof=b.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.ownerPlumeriaAfterPass?.agent4PhysicalFlareFork??null;
    assert.ok(proof,'No opt-in original Store physical fork audit');
    assert.equal(proof.competitiveQualified,false);
    const payment=a.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.ownerPlumeriaAfterPass?.physicallyAcceptedOwnerPayments?.find(p=>
        p.seat===1&&p.turn===15);
    assert.ok(payment&&payment.acceptedByOriginalStore,
      'Original Plumeria must physically settle its two-card payment');
    assert.equal(payment.payment.length,2);
    assert.equal(new Set(payment.payment.map(p=>p.handIndex)).size,2);
    const originalObservedHand=proof.costedOwnerObservation?.ownerHand??[];
    for(const paid of payment.payment){
      assert.ok(paid.handIndex>=0);
      assert.equal(originalObservedHand[paid.handIndex],paid.printing);
    }

    if(n>=0){
      assert.equal(old.turnBefore,15);
      assert.equal(newer.turnBefore,15);
      assert.equal(old.playerSlot,1);
      assert.equal(newer.playerSlot,1);
      assert.equal(old.action,'PlayCardAction');
      assert.equal(newer.action,'PlayCardAction');
      assert.equal(old.card,'Plumeria');
      assert.equal(newer.card,'Team Flare Grunt');
      assert.equal(proof.selectedFlareForks,1);
      assert.equal(proof.acceptedFlareForks,1);
      assert.equal(proof.settledFlareEnergyRemovals,1);
      assert.ok(proof.physicalSettlement);
    }else{
      assert.equal(proof.selectedFlareForks,0);
      assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
    }
    const nextOpponent=newer?next.slice(n+1).find(x=>
      x.playerSlot===0&&x.turnBefore>15&&
      x.action!=='ResolvePromptAction')??null:null;
    rows.push({id:a.trial.id,
      firstDifferenceIndex:n,
      actionPrefixPreserved:n<0?previous.length:n,
      originalAction:old,flareAction:newer,
      nativeFork:proof,
      originalPlumeriaPhysicalPayment:payment.payment,
      originalPaymentConsumedHeldFlare:payment.payment.some(p=>
        p.printing==='Team Flare Grunt XY'),
      nextOpposingOwnerRoot:nextOpponent,
      unchangedPhysicalStart:a.fullPhysicalDealFingerprint,
      sourceDeckIdentity:a.sourceDeckFingerprint,
      oldOutcome:{finished:a.finished,status:a.status??null,
        winner:a.winner,endReason:a.endReason,actions:a.actionCount},
      newOutcome:{finished:b.finished,status:b.status??null,
        winner:b.winner,endReason:b.endReason,actions:b.actionCount},
      controlAcceptedRootSha256:a.rootActionLedgerSha256,
      alternateAcceptedRootSha256:b.rootActionLedgerSha256});
  }
  assert.ok(rows.some(r=>r.firstDifferenceIndex>=0),
    'No native Store source Plumeria -> Flare selection occurred');
  return {version:VERSION,sourceOriginalRank:6,sourceSeat:1,
    firstCandidateSeed:2906058002,globalTargetTurn:15,
    nativeForkAndFollowThrough:true,
    fullPhysicalConservationUnverified:true,
    competitiveQualifiedGames:0,winRateCertified:false,
    rows};
}
module.exports={VERSION,compareOriginalDenialFork};
if(require.main===module){
  assert.equal(process.argv.length,4);
  const parse=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  process.stdout.write(JSON.stringify(compareOriginalDenialFork(
    parse(process.argv[2]),parse(process.argv[3])),null,2)+'\n');
}
