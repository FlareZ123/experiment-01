'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const SCHEMA='agent25-32-original-source-lillie-native-mechanism-contrast-v1';

/**
 * All-attempts comparison of the exact originally preregistered 32 Store games.
 * It preserves source-deal discrepancies, root action/prompt divergences,
 * censored games, and first actual opponent root following a Lillie play.
 * Printed draw settlement must be attested by the separate Agent24 observer.
 *
 * @param {object} original Read-only original 32-scene control.
 * @param {object} treatment Same fixed 32 seeds, experimental Lillie selector.
 * @returns {object} Historical mechanic test, not win-rate inference.
 */
function contrast(original,treatment){
  const a=original.developmentResult,b=treatment.developmentResult;
  for(const x of [original,treatment]){
    assert.equal(x.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
    assert.equal(x.summary.attempts,32);
  }
  assert.equal(original.registrationBlob,treatment.registrationBlob);
  assert.equal(a.enginePin,b.enginePin);
  assert.equal(a.attempted,32);
  assert.equal(b.attempted,32);
  assert.equal(a.competitiveQualifiedGames,0);
  assert.equal(b.competitiveQualifiedGames,0);
  const full=treatment.agent25NativeLillieDrawSettlement;
  assert.equal(full?.readOnly,true);
  const originals=new Map(a.rows.map(row=>[row.trial.id,row]));
  assert.equal(originals.size,32);
  const ids=new Set();
  const firstDifferent=(x,y)=>{
    for(let i=0;i<Math.max(x.length,y.length);i++){
      if(JSON.stringify(x[i]??null)!==JSON.stringify(y[i]??null))
        return {index:i,control:x[i]??null,treatment:y[i]??null};
    }
    return null;
  };
  const rows=b.rows.map(row=>{
    const id=row.trial.id,control=originals.get(id);
    assert.ok(control,'No source control for treatment');
    assert.ok(!ids.has(id),'Duplicate treatment id');
    ids.add(id);
    const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const before=control.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    if(audit)assert.equal(audit.lowHandLillieRootOptIn,true);
    if(before)assert.equal(before.lowHandLillieRootOptIn,false);
    const actions=audit?.nativeRootAcceptances??[];
    const firstIndex=actions.findIndex(entry=>
      entry.kind==='play-lowhand-lillie'&&entry.accepted===true);
    const firstAccepted=firstIndex===-1?null:actions[firstIndex];
    const reply=firstAccepted===null?null:actions.slice(firstIndex+1)
      .find(entry=>entry.seat===1-firstAccepted.seat&&
        entry.globalTurn>firstAccepted.globalTurn)??null;
    return {
      id,rank:row.trial.rank,candidate:row.trial.candidateId,
      controlSourceDeal:control.sourceDealFingerprint??null,
      treatmentSourceDeal:row.sourceDealFingerprint??null,
      sameSourceDeal:control.sourceDealFingerprint!==undefined&&
        control.sourceDealFingerprint===row.sourceDealFingerprint,
      sameFirstPlayer:control.actualStarterSeat!==undefined&&
        control.actualStarterSeat===row.actualStarterSeat,
      controlStatus:control.status??(control.finished===true?'terminal':'censored'),
      treatmentStatus:row.status??(row.finished===true?'terminal':'censored'),
      controlWinner:control.finished===true?control.winner:null,
      treatmentWinner:row.finished===true?row.winner:null,
      originalRootActions:control.rootActionCount??null,
      treatmentRootActions:row.rootActionCount??null,
      sameRootActionLedgerSha256:control.rootActionLedgerSha256===row.rootActionLedgerSha256,
      firstLedgerDivergence:firstDifferent(control.rootActionLedger??[],
        row.rootActionLedger??[]),
      proposed:audit?.typedIntentCounts?.['play-lowhand-lillie']??0,
      accepted:actions.filter(entry=>entry.kind==='play-lowhand-lillie'&&
        entry.accepted===true).length,
      nativePublicConfirmed:audit?.nativePhysicalConfirmedByIntent?.['play-lowhand-lillie']??0,
      firstAccepted: firstAccepted?{
        turn:firstAccepted.globalTurn,
        actorSeat:firstAccepted.seat,
        printing:firstAccepted.intent?.printing??null,
        physicalEffect:firstAccepted.nativePhysicalEffect??null,
        supporterQuotaBefore:firstAccepted.before?.supporterQuota??null,
        supporterQuotaAfter:firstAccepted.after?.supporterQuota??null
      }:null,
      firstOpponentNativeRoot:reply?{
        turn:reply.globalTurn,actorSeat:reply.seat,
        kind:reply.kind,accepted:reply.accepted,
        physicalEffect:reply.nativePhysicalEffect??null
      }:null,
      controlError:control.error??null,
      treatmentError:row.error??null,
      competitiveQualified:false
    };
  });
  assert.equal(ids.size,32);
  return {
    schema:SCHEMA,registeredTrials:32,
    identicalSourceDeals:rows.filter(x=>x.sameSourceDeal).length,
    identicalFirstPlayers:rows.filter(x=>x.sameFirstPlayer).length,
    ledgerIdentical:rows.filter(x=>x.sameRootActionLedgerSha256).length,
    totalProposed:rows.reduce((n,x)=>n+x.proposed,0),
    nativeAccepted:rows.reduce((n,x)=>n+x.accepted,0),
    nativePublicConfirmed:rows.reduce((n,x)=>n+x.nativePublicConfirmed,0),
    printedDrawSupportRoots:full.supportRoots,
    printedDrawConfirmed:full.printedDrawConfirmed,
    unresolvedNativeDraws:full.unresolved,
    nextOpposingNativeRoots:rows.filter(x=>x.firstOpponentNativeRoot!==null).length,
    competitiveQualifiedGames:0,
    inference:'Same historical frozen source deals; evidence of native legal mechanism and opponent responses only, no independent trial or competitive win-rate estimate',
    rows
  };
}
if(require.main===module){
  const [controlPath,treatmentPath]=process.argv.slice(2);
  assert.ok(controlPath&&treatmentPath,'Supply original and treated 32 raw JSONs');
  process.stdout.write(JSON.stringify(contrast(
    JSON.parse(fs.readFileSync(controlPath,'utf8')),
    JSON.parse(fs.readFileSync(treatmentPath,'utf8'))),null,2)+'\n');
}
module.exports={SCHEMA,contrast};
